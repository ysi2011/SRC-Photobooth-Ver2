#!/usr/bin/env python3
"""
Raspberry Pi Photo Booth
------------------------
Native fullscreen app: pygame (display) + Picamera2 (camera) + gpiozero (button) + Pillow (layout).

Flow (state machine):
    IDLE -> COUNTDOWN -> capture -> (repeat COUNTDOWN until NUM_PHOTOS) -> process -> REVIEW -> IDLE

Controls:
    GPIO button (BUTTON_PIN)  or  SPACE / ENTER  -> start
    ESC or Q                                      -> quit

Run:
    python3 photobooth.py              # fullscreen (on the Pi)
    python3 photobooth.py --windowed   # windowed, handy for testing

If Picamera2 or gpiozero aren't available (e.g. on a laptop), it falls back to a
mock camera and keyboard-only input so you can test the whole flow anywhere.
"""

import math
import os
import random
import subprocess
import sys
import threading
import time
from datetime import datetime

import pygame
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps

# =============================== CONFIG ===============================
BUTTON_PIN = 17              # BCM numbering (physical pin 11). Wire button between this and GND.
NUM_PHOTOS = 4               # shots per session for the plain grid (templates set their own count)
COUNTDOWN_SECONDS = 3
REVIEW_SECONDS = 8           # how long the finished strip is shown
MIRROR_PREVIEW = True        # mirror the live view like a real mirror
MIRROR_PHOTOS = False        # mirror the saved photos too (text would read backwards)
PREVIEW_SIZE = (1280, 720)   # live preview resolution

OUTPUT_DIR = os.path.expanduser("~/photobooth")
RAW_DIR = os.path.join(OUTPUT_DIR, "raw")       # individual shots
STRIP_DIR = os.path.join(OUTPUT_DIR, "strips")  # finished layouts

EVENT_TEXT = "Photo Booth"   # footer text on the printed layout
STRIP_SIZE = (1800, 1200)    # 6x4 inch at 300 dpi
STRIP_MARGIN = 40
FOOTER_HEIGHT = 110
STRIP_BG = (255, 255, 255)
STRIP_TEXT = (30, 30, 30)

# Decorative templates, chosen on the start screen. Photos are dropped into each slot,
# under any stickers. Templates whose file is missing are skipped; if none are found,
# the plain grid layout above is used instead.
#   slots:       ((center_x, center_y), (width, height), tilt in degrees CCW), one per photo
#   clean_slot:  index of a slot no sticker overlaps, when every slot holds the same
#                placeholder art - stickers on the other slots are found by comparison
#   stickers:    polygons of stickers that overlap a slot (for templates with sample photos)
TEMPLATE_DIR = os.path.dirname(os.path.abspath(__file__))


def _box(x0, y0, x1, y1):
    """Straight slot from its corner coordinates."""
    return (((x0 + x1) // 2, (y0 + y1) // 2), (x1 - x0, y1 - y0), 0)


TEMPLATES = [
    {
        "file": "Red Vintage Couple Photo Booth Your Story.png",
        "slots": [((505, 467), (475, 386), 3.95),
                  ((534, 882), (475, 386), 3.95),
                  ((563, 1297), (475, 386), 3.95)],
        "clean_slot": 1,
    },
    {
        "file": "Beige and Black Best Friend Vintage Photostrip Bookmark.png",
        "slots": [_box(208, 6, 531, 440), _box(208, 446, 531, 880),
                  _box(208, 886, 531, 1320), _box(208, 1326, 531, 1766)],
        "stickers": [[(190, 1594), (215, 1600), (238, 1610), (246, 1620), (243, 1635),
                      (249, 1665), (256, 1687), (261, 1705), (267, 1722), (264, 1728),
                      (253, 1736), (228, 1744), (210, 1749), (190, 1753)]],  # camera
    },
    {
        "file": "Black and White Vintage Photo Booth Frame Bookmark.jpg",
        "slots": [_box(60, 191, 540, 613), _box(60, 635, 540, 1056),
                  _box(60, 1079, 540, 1500)],
    },
]

PRINT_ENABLED = False        # set True once CUPS + printer are set up
PRINTER_NAME = None          # None = default CUPS printer
# =====================================================================


# ------------------------------ Camera -------------------------------
class Camera:
    """Wraps Picamera2; falls back to a USB/laptop webcam (OpenCV), then a mock camera."""

    def __init__(self):
        self.picam2 = None
        self.webcam = None
        try:
            from picamera2 import Picamera2

            self.picam2 = Picamera2()
            self.preview_config = self.picam2.create_preview_configuration(
                main={"size": PREVIEW_SIZE, "format": "RGB888"}
            )
            self.still_config = self.picam2.create_still_configuration()
            self.picam2.configure(self.preview_config)
            self.picam2.start()
            print("[camera] Picamera2 started")
        except Exception as e:
            print(f"[camera] Picamera2 unavailable ({e}) - trying webcam")
            self.picam2 = None
            self._open_webcam()

    def _open_webcam(self):
        try:
            import cv2

            backend = cv2.CAP_DSHOW if sys.platform == "win32" else cv2.CAP_ANY
            cap = cv2.VideoCapture(0, backend)
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, PREVIEW_SIZE[0])
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, PREVIEW_SIZE[1])
            if not cap.isOpened() or not cap.read()[0]:
                raise RuntimeError("no frames from webcam")
            self.cv2 = cv2
            self.webcam = cap
            print("[camera] webcam started")
        except Exception as e:
            print(f"[camera] webcam unavailable ({e}) - using mock camera")

    def _webcam_rgb(self):
        ok, frame = self.webcam.read()
        if not ok:
            return None
        return self.cv2.cvtColor(frame, self.cv2.COLOR_BGR2RGB)

    @property
    def mock(self):
        return self.picam2 is None and self.webcam is None

    def preview_surface(self):
        """Return the current live frame as a pygame Surface."""
        if self.webcam:
            frame = self._webcam_rgb()
            if frame is not None:
                h, w = frame.shape[:2]
                return pygame.image.frombuffer(frame.tobytes(), (w, h), "RGB")
        if self.picam2 is None:
            t = time.time()
            surf = pygame.Surface(PREVIEW_SIZE)
            surf.fill((int(70 + 50 * math.sin(t)), 90, int(130 + 50 * math.cos(t))))
            return surf

        frame = self.picam2.capture_array()  # "RGB888" is actually B,G,R in memory
        frame = frame[:, :, ::-1]            # convert to R,G,B for pygame
        h, w = frame.shape[:2]
        return pygame.image.frombuffer(frame.tobytes(), (w, h), "RGB")

    def capture(self):
        """Take a full-resolution still and return it as a PIL Image."""
        if self.webcam:
            frame = self._webcam_rgb()
            if frame is not None:
                return Image.fromarray(frame)
        if self.picam2 is None:
            time.sleep(0.5)  # pretend capture takes a moment
            img = Image.new("RGB", (1920, 1080),
                            tuple(random.randint(40, 200) for _ in range(3)))
            ImageDraw.Draw(img).text((60, 60), datetime.now().strftime("%H:%M:%S"),
                                     fill="white", font=load_font(120))
            return img

        img = self.picam2.switch_mode_and_capture_image(self.still_config)
        return img.convert("RGB")

    def close(self):
        if self.webcam:
            self.webcam.release()
        if self.picam2:
            self.picam2.stop()
            self.picam2.close()


# ------------------------------ Button -------------------------------
class ButtonInput:
    """GPIO button (if available) + keyboard, both feeding one 'pressed' flag."""

    def __init__(self, pin):
        self._pressed = threading.Event()
        self.button = None
        try:
            from gpiozero import Button

            self.button = Button(pin, bounce_time=0.05)  # internal pull-up, so wire to GND
            self.button.when_pressed = lambda: self._pressed.set()
            print(f"[button] GPIO{pin} ready")
        except Exception as e:
            print(f"[button] GPIO unavailable ({e}) - keyboard only")

    def press(self):
        self._pressed.set()

    def consume(self):
        """True once per press."""
        if self._pressed.is_set():
            self._pressed.clear()
            return True
        return False

    def clear(self):
        self._pressed.clear()


# --------------------------- Image layout ----------------------------
def load_font(size):
    for path in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                 "DejaVuSans-Bold.ttf", "arial.ttf"):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def make_strip(photos):
    """Arrange photos in a grid on a printable canvas with a footer."""
    W, H = STRIP_SIZE
    m = STRIP_MARGIN
    n = len(photos)
    cols = 1 if n == 1 else 2
    rows = math.ceil(n / cols)
    cell_w = (W - m * (cols + 1)) // cols
    cell_h = (H - FOOTER_HEIGHT - m * (rows + 1)) // rows

    canvas = Image.new("RGB", (W, H), STRIP_BG)
    for i, photo in enumerate(photos):
        r, c = divmod(i, cols)
        fitted = ImageOps.fit(photo, (cell_w, cell_h), Image.LANCZOS)  # crop-to-fill
        canvas.paste(fitted, (m + c * (cell_w + m), m + r * (cell_h + m)))

    draw = ImageDraw.Draw(canvas)
    font = load_font(56)
    text = f"{EVENT_TEXT}  -  {datetime.now():%d %b %Y}"
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    tx = (W - (right - left)) // 2 - left
    ty = H - FOOTER_HEIGHT + (FOOTER_HEIGHT - (bottom - top)) // 2 - top - m // 2
    draw.text((tx, ty), text, fill=STRIP_TEXT, font=font)
    return canvas


def template_path(tpl):
    return os.path.join(TEMPLATE_DIR, tpl["file"])


def make_template_strip(photos, tpl):
    """Place photos into the template's slots, keeping stickers on top."""
    import numpy as np

    template = Image.open(template_path(tpl)).convert("RGB")
    px = np.asarray(template).astype(int)

    sticker = Image.new("L", template.size, 0)
    for poly in tpl.get("stickers", []):
        ImageDraw.Draw(sticker).polygon(poly, fill=255)
    sticker = sticker.filter(ImageFilter.MinFilter(5))   # pull hand-traced outlines in by 2px

    canvas = template.copy()
    for i, (photo, ((cx, cy), (w, h), angle)) in enumerate(zip(photos, tpl["slots"])):
        slot_sticker = sticker
        if "clean_slot" in tpl and i != tpl["clean_slot"]:
            # Every slot holds the same placeholder art, so whatever differs from the
            # clean slot (shifted onto this one) is a sticker that must stay on top.
            (ccx, ccy), _, _ = tpl["slots"][tpl["clean_slot"]]
            shifted = np.roll(px, (cy - ccy, cx - ccx), axis=(0, 1))
            diff = (np.abs(px - shifted).max(axis=2) > 30).astype(np.uint8) * 255
            slot_sticker = ImageChops.lighter(sticker, Image.fromarray(diff)
                   .filter(ImageFilter.MinFilter(9))     # drop specks + anti-aliasing seams
                   .filter(ImageFilter.MaxFilter(11)))   # regrow what that shaved off

        pad = 4 if angle else 0                          # tilted slots: cover the edge fringe
        fitted = ImageOps.fit(photo, (w + pad, h + pad), Image.LANCZOS)
        tilted = fitted.rotate(angle, resample=Image.BICUBIC, expand=True)
        slot = Image.new("L", fitted.size, 255).rotate(angle, resample=Image.BICUBIC, expand=True)
        layer = Image.new("RGB", canvas.size)
        mask = Image.new("L", canvas.size, 0)
        pos = (cx - tilted.width // 2, cy - tilted.height // 2)
        layer.paste(tilted, pos)
        mask.paste(slot, pos)
        mask = ImageChops.subtract(mask, slot_sticker)
        canvas = Image.composite(layer, canvas, mask)
    return canvas


def print_photo(path):
    cmd = ["lp"] + (["-d", PRINTER_NAME] if PRINTER_NAME else []) + [path]
    try:
        subprocess.Popen(cmd)  # non-blocking
        print(f"[print] sent {path}")
    except FileNotFoundError:
        print("[print] 'lp' not found - is CUPS installed?")


# ---------------------------- Photo booth ----------------------------
class PhotoBooth:
    def __init__(self, windowed=False):
        pygame.init()
        if windowed:
            self.screen = pygame.display.set_mode((1280, 720))
        else:
            self.screen = pygame.display.set_mode((0, 0), pygame.FULLSCREEN)
            pygame.mouse.set_visible(False)
        pygame.display.set_caption("Photo Booth")
        self.W, self.H = self.screen.get_size()
        self.clock = pygame.time.Clock()

        self.font_big = pygame.font.Font(None, int(self.H * 0.5))
        self.font_med = pygame.font.Font(None, int(self.H * 0.11))
        self.font_small = pygame.font.Font(None, int(self.H * 0.07))
        self.font_tiny = pygame.font.Font(None, int(self.H * 0.045))

        os.makedirs(RAW_DIR, exist_ok=True)
        os.makedirs(STRIP_DIR, exist_ok=True)

        self.camera = Camera()
        self.button = ButtonInput(BUTTON_PIN)

        self.templates = [t for t in TEMPLATES if os.path.exists(template_path(t))]
        print(f"[booth] {len(self.templates)} template(s) found")
        self.selected = 0
        self.template = None     # chosen for the current session; None = plain grid
        self.thumbs = self.load_thumbs()
        self.thumb_rects = []

        self.photos = []
        self.session_id = None
        self.result_surface = None
        self.set_state("IDLE")

    # ---- helpers ----
    def set_state(self, state):
        self.state = state
        self.state_start = time.time()

    def elapsed(self):
        return time.time() - self.state_start

    def fit_surface(self, surf):
        """Scale a surface to fit the screen, keeping aspect ratio."""
        sw, sh = surf.get_size()
        scale = min(self.W / sw, self.H / sh)
        return pygame.transform.scale(surf, (int(sw * scale), int(sh * scale)))

    def blit_centered(self, surf):
        self.screen.fill((0, 0, 0))
        self.screen.blit(surf, surf.get_rect(center=(self.W // 2, self.H // 2)))

    def draw_preview(self):
        surf = self.camera.preview_surface()
        if MIRROR_PREVIEW:
            surf = pygame.transform.flip(surf, True, False)
        self.blit_centered(self.fit_surface(surf))

    def draw_text(self, text, font, center, color=(255, 255, 255)):
        outline = font.render(text, True, (0, 0, 0))
        for dx, dy in ((-3, 0), (3, 0), (0, -3), (0, 3)):
            self.screen.blit(outline, outline.get_rect(center=(center[0] + dx, center[1] + dy)))
        label = font.render(text, True, color)
        self.screen.blit(label, label.get_rect(center=center))

    @property
    def num_photos(self):
        return len(self.template["slots"]) if self.template else NUM_PHOTOS

    # ---- template selection ----
    def load_thumbs(self):
        """Template previews, all the same height, shrunk further if the row is too wide."""
        gap = int(self.W * 0.04)
        thumbs = [pygame.image.load(template_path(t)).convert() for t in self.templates]
        target_h = self.H * 0.62
        total_w = sum(t.get_width() * target_h / t.get_height() for t in thumbs)
        total_w += gap * (len(thumbs) - 1)
        if total_w > self.W * 0.9:
            target_h *= self.W * 0.9 / total_w
        return [pygame.transform.smoothscale(
                    t, (int(t.get_width() * target_h / t.get_height()), int(target_h)))
                for t in thumbs]

    def draw_select(self):
        self.screen.fill((20, 16, 16))
        self.draw_text("Choose your template", self.font_small, (self.W // 2, int(self.H * 0.09)))

        gap = int(self.W * 0.04)
        x = (self.W - sum(t.get_width() for t in self.thumbs) - gap * (len(self.thumbs) - 1)) // 2
        top = int(self.H * 0.17)
        pulse = 0.5 + 0.5 * math.sin(time.time() * 3)
        self.thumb_rects = []
        for i, (thumb, tpl) in enumerate(zip(self.thumbs, self.templates)):
            rect = thumb.get_rect(topleft=(x, top))
            if i == self.selected:
                pygame.draw.rect(self.screen, (255, int(180 + 75 * pulse), 60),
                                 rect.inflate(16, 16), 6, border_radius=6)
            self.screen.blit(thumb, rect)
            color = (255, 255, 255) if i == self.selected else (150, 150, 150)
            self.draw_text(f"{len(tpl['slots'])} photos", self.font_tiny,
                           (rect.centerx, rect.bottom + int(self.H * 0.05)), color)
            self.thumb_rects.append(rect)
            x += thumb.get_width() + gap

        self.draw_text("Left / Right to choose  -  press the button to start",
                       self.font_tiny, (self.W // 2, int(self.H * 0.94)), (200, 200, 200))

    def handle_select_event(self, event):
        if event.type == pygame.KEYDOWN and event.key in (pygame.K_LEFT, pygame.K_RIGHT):
            step = -1 if event.key == pygame.K_LEFT else 1
            self.selected = (self.selected + step) % len(self.templates)
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            for i, rect in enumerate(self.thumb_rects):
                if rect.collidepoint(event.pos):  # tap a template = pick it and start
                    self.selected = i
                    self.button.press()

    # ---- session steps ----
    def start_session(self):
        self.template = self.templates[self.selected] if self.templates else None
        self.photos = []
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.set_state("COUNTDOWN")

    def take_photo(self):
        # White screen = visual "flash" (and a bit of extra light on faces)
        self.screen.fill((255, 255, 255))
        pygame.display.flip()

        img = self.camera.capture()
        if MIRROR_PHOTOS:
            img = ImageOps.mirror(img)
        n = len(self.photos) + 1
        img.save(os.path.join(RAW_DIR, f"{self.session_id}_{n}.jpg"), quality=95)
        self.photos.append(img)

        if len(self.photos) < self.num_photos:
            self.set_state("COUNTDOWN")
        else:
            self.process()

    def process(self):
        self.screen.fill((0, 0, 0))
        self.draw_text("Processing...", self.font_med, (self.W // 2, self.H // 2))
        pygame.display.flip()

        if self.template:
            strip = make_template_strip(self.photos, self.template)
        else:
            strip = make_strip(self.photos)
        path = os.path.join(STRIP_DIR, f"{self.session_id}.jpg")
        strip.save(path, quality=95)
        print(f"[booth] saved {path}")
        if PRINT_ENABLED:
            print_photo(path)

        self.result_surface = self.fit_surface(pygame.image.load(path).convert())
        self.set_state("REVIEW")
        self.button.clear()  # ignore presses made during the session

    def finish_session(self):
        self.photos = []
        self.result_surface = None
        self.button.clear()
        self.set_state("IDLE")

    # ---- per-frame logic ----
    def update(self):
        if self.state == "IDLE":
            if self.templates:
                self.draw_select()
            else:
                self.draw_preview()
                pulse = 0.5 + 0.5 * math.sin(time.time() * 3)
                self.draw_text("Press the button!", self.font_med,
                               (self.W // 2, int(self.H * 0.85)),
                               color=(255, int(180 + 75 * pulse), int(60 + 120 * pulse)))
            if self.button.consume():
                self.start_session()

        elif self.state == "COUNTDOWN":
            self.draw_preview()
            remaining = COUNTDOWN_SECONDS - self.elapsed()
            if remaining > 0:
                self.draw_text(str(math.ceil(remaining)), self.font_big,
                               (self.W // 2, self.H // 2))
                self.draw_text(f"Photo {len(self.photos) + 1} of {self.num_photos}",
                               self.font_small, (self.W // 2, int(self.H * 0.1)))
            else:
                self.take_photo()

        elif self.state == "REVIEW":
            self.blit_centered(self.result_surface)
            if self.elapsed() > REVIEW_SECONDS or self.button.consume():
                self.finish_session()

    def run(self):
        running = True
        try:
            while running:
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        running = False
                    elif event.type == pygame.KEYDOWN:
                        if event.key in (pygame.K_ESCAPE, pygame.K_q):
                            running = False
                        elif event.key in (pygame.K_SPACE, pygame.K_RETURN):
                            self.button.press()
                    if self.state == "IDLE" and self.templates:
                        self.handle_select_event(event)
                self.update()
                pygame.display.flip()
                self.clock.tick(30)
        finally:
            self.camera.close()
            pygame.quit()


if __name__ == "__main__":
    PhotoBooth(windowed="--windowed" in sys.argv).run()