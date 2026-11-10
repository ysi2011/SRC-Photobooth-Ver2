"""Local photobooth web server: python server.py  ->  http://localhost:8000
Serves ./web, saves finished photos into ~/photobooth/raw and ~/photobooth/strips (same as 1.py),
and emails the strip + the raw photos through the SMTP account in email_config.json."""
import base64, json, os, re, smtplib, ssl, webbrowser
from datetime import datetime
from email.message import EmailMessage
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.expanduser("~/photobooth")
CONFIG = os.path.join(ROOT, "email_config.json")   # not inside ./web, so it is never served
PORT = 8000


def decode(data_url):
    return base64.b64decode(data_url.split(",", 1)[1])


def send_email(to, strip, photos):
    if not os.path.exists(CONFIG):
        raise RuntimeError("Email isn't set up yet - fill in email_config.json (see email_config.example.json).")
    with open(CONFIG) as f:
        cfg = json.load(f)
    msg = EmailMessage()
    msg["Subject"] = cfg.get("subject", "Your photobooth photos")
    msg["From"] = f'{cfg.get("from_name", "Photobooth")} <{cfg["user"]}>'
    msg["To"] = to
    msg.set_content(cfg.get("body", "Thanks for stopping by the photobooth! Your strip and photos are attached."))
    msg.add_attachment(decode(strip), maintype="image", subtype="jpeg", filename="photobooth_strip.jpg")
    for i, p in enumerate(photos, 1):
        msg.add_attachment(decode(p), maintype="image", subtype="jpeg", filename=f"photo_{i}.jpg")
    host, port = cfg.get("host", "smtp.gmail.com"), int(cfg.get("port", 465))
    if port == 465:   # SSL from the start; port 587 (STARTTLS) hangs on some networks
        server = smtplib.SMTP_SSL(host, port, timeout=60, context=ssl.create_default_context())
    else:
        server = smtplib.SMTP(host, port, timeout=60)
        server.starttls()
    with server as s:
        s.ehlo()
        s.user, s.password = cfg["user"], cfg["password"]
        try:
            s.auth("PLAIN", s.auth_plain)   # PLAIN only; Gmail hangs up on smtplib's LOGIN fallback
        except smtplib.SMTPAuthenticationError:
            raise RuntimeError("Gmail rejected the saved login - run setup_email.bat again.")
        s.send_message(msg)


class Handler(SimpleHTTPRequestHandler):
    def reply(self, code, obj):
        out = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(out)))
        self.end_headers()
        self.wfile.write(out)

    def do_POST(self):
        if self.path not in ("/save", "/send"):
            return self.send_error(404)
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        if self.path == "/save":
            sid = datetime.now().strftime("%Y%m%d_%H%M%S")
            os.makedirs(os.path.join(OUT, "raw"), exist_ok=True)
            os.makedirs(os.path.join(OUT, "strips"), exist_ok=True)
            for i, p in enumerate(body["photos"], 1):
                with open(os.path.join(OUT, "raw", f"{sid}_{i}.jpg"), "wb") as f:
                    f.write(decode(p))
            with open(os.path.join(OUT, "strips", f"{sid}.jpg"), "wb") as f:
                f.write(decode(body["strip"]))
            return self.reply(200, {"dir": OUT})
        # /send
        to = body.get("email", "").strip()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", to):
            return self.reply(400, {"error": "That doesn't look like a valid email address."})
        try:
            send_email(to, body["strip"], body["photos"])
        except Exception as e:
            print("[email] failed:", e)
            return self.reply(500, {"error": str(e)})
        print(f"[email] sent to {to}")
        self.reply(200, {"ok": True})

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), partial(Handler, directory=os.path.join(ROOT, "web")))
    print(f"Photobooth running at http://localhost:{PORT}  (Ctrl+C to stop)")
    webbrowser.open(f"http://localhost:{PORT}")
    server.serve_forever()
