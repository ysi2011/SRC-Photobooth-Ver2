"""Vercel serverless function for POST /send.

Credentials come from environment variables (set them with `vercel env add`,
or in the Vercel dashboard under Project Settings -> Environment Variables),
never from a committed config file:

  EMAIL_HOST        default smtp.gmail.com
  EMAIL_PORT        default 465
  EMAIL_USER        required - the sending mailbox
  EMAIL_PASSWORD    required - an app password, not the account password
  EMAIL_FROM_NAME   default "Photobooth"
  EMAIL_SUBJECT     default "Your photobooth photos"
  EMAIL_BODY        default "Thanks for stopping by the photobooth! Your strip and photos are attached."
"""
import base64
import json
import os
import re
import smtplib
import ssl
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler


def decode(data_url):
    return base64.b64decode(data_url.split(",", 1)[1])


def send_email(to, strip, photos):
    user = os.environ.get("EMAIL_USER")
    password = os.environ.get("EMAIL_PASSWORD")
    if not user or not password:
        raise RuntimeError("Email isn't set up yet. Add EMAIL_USER and EMAIL_PASSWORD in the Vercel project's environment variables.")

    msg = EmailMessage()
    msg["Subject"] = os.environ.get("EMAIL_SUBJECT", "Your photobooth photos")
    msg["From"] = f'{os.environ.get("EMAIL_FROM_NAME", "Photobooth")} <{user}>'
    msg["To"] = to
    msg.set_content(os.environ.get("EMAIL_BODY", "Thanks for stopping by the photobooth! Your strip and photos are attached."))
    msg.add_attachment(decode(strip), maintype="image", subtype="jpeg", filename="photobooth_strip.jpg")
    for i, p in enumerate(photos, 1):
        msg.add_attachment(decode(p), maintype="image", subtype="jpeg", filename=f"photo_{i}.jpg")

    host = os.environ.get("EMAIL_HOST", "smtp.gmail.com")
    port = int(os.environ.get("EMAIL_PORT", "465"))
    if port == 465:
        server = smtplib.SMTP_SSL(host, port, timeout=25, context=ssl.create_default_context())
    else:
        server = smtplib.SMTP(host, port, timeout=25)
        server.starttls()
    with server as s:
        s.ehlo()
        s.user, s.password = user, password
        try:
            s.auth("PLAIN", s.auth_plain)
        except smtplib.SMTPAuthenticationError:
            raise RuntimeError("The mail provider rejected EMAIL_USER/EMAIL_PASSWORD. Double-check the app password.")
        s.send_message(msg)


class handler(BaseHTTPRequestHandler):
    def reply(self, code, obj):
        out = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(out)))
        self.end_headers()
        self.wfile.write(out)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length) or b"{}")
        to = body.get("email", "").strip()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", to):
            return self.reply(400, {"error": "That doesn't look like a valid email address."})
        try:
            send_email(to, body["strip"], body["photos"])
        except Exception as e:
            return self.reply(500, {"error": str(e)})
        self.reply(200, {"ok": True})
