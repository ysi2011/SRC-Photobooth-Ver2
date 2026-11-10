# Photobooth

A local photobooth web app. It takes a series of photos with your webcam, lets you pick a photostrip template and filters, saves the results to disk, and can email them to you.

## How it works

1. **Camera** – take a set of photos with the webcam.
2. **Templates** – choose a layout (4-photo strip, 3-photo strip, or A5 paper) and apply effects/filters.
3. **Email** – send the finished strip and the raw photos to an email address, or skip.

Finished photos are saved to `~/photobooth/raw` (individual shots) and `~/photobooth/strips` (finished strips), named by timestamp.

## Requirements

- Python 3
- A webcam and a modern browser (Chrome or Edge recommended)

No third-party Python packages are needed.

## Run it

```
python server.py
```

Or double-click `start_website.bat` on Windows. The site opens at <http://localhost:8000>. Press `Ctrl+C` to stop the server.

## Email setup (optional)

Emailing uses an SMTP account (Gmail by default).

1. Run `setup_email.bat` (or `python setup_email.py`), or copy `email_config.example.json` to `email_config.json` and fill it in.
2. For Gmail, use an [app password](https://support.google.com/accounts/answer/185833), not your normal password.

`email_config.json` holds your credentials and is listed in `.gitignore`, so it is never committed. It also lives outside `web/`, so the server never serves it.

## Project layout

| Path | Purpose |
| --- | --- |
| `server.py` | Local web server. Serves `web/`, saves photos, sends email. |
| `web/` | The front end: `index.html`, `style.css`, `app.js`, effects and filters. |
| `web/templates/` | Photostrip template images. |
| `1.py` | Original standalone version that saves to the same folders. |
| `setup_email.py` / `.bat` | Interactive email configuration. |
| `start_website.bat` | Windows launcher. |
| `email_config.example.json` | Example email config. |
