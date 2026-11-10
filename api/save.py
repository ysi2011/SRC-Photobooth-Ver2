import json
from http.server import BaseHTTPRequestHandler

# The local server (server.py) saves a backup copy of every strip/photo set to
# ~/photobooth. Serverless functions have no persistent, writable filesystem
# (only an ephemeral /tmp that's wiped between invocations), so there's nowhere
# durable to put that backup here. This endpoint just acknowledges the request
# instead of pretending to save a file that would disappear immediately.
# To actually persist photos from the hosted version, wire this up to a real
# store (e.g. Vercel Blob) and write the decoded bytes there.


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        self.rfile.read(length)  # drain the body
        out = json.dumps({"ok": True, "saved": False}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(out)))
        self.end_headers()
        self.wfile.write(out)
