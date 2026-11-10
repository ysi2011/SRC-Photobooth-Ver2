"""One-time email setup: python setup_email.py
Asks for the Gmail account + App Password, tests the login, and writes email_config.json."""
import getpass, json, os, smtplib, ssl

ROOT = os.path.dirname(os.path.abspath(__file__))
print("Photobooth email setup\n")
print("You need a Gmail account with 2-Step Verification on, and an App Password:")
print("  https://myaccount.google.com/apppasswords   (16 letters, not your normal password)\n")

user = input("Gmail address to send FROM: ").strip()
password = getpass.getpass("App Password (typing is hidden): ").replace(" ", "")
name = input("Sender name [Sunway Robotics Club Photobooth]: ").strip() or "Sunway Robotics Club Photobooth"

print(f"\nGot {len(password)} characters for the App Password (it should be 16).")
print("Testing login...")
try:
    # port 465 (SSL from the start) works on networks that block/hang on 587
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=30, context=ssl.create_default_context()) as s:
        s.ehlo()
        s.user, s.password = user, password
        s.auth("PLAIN", s.auth_plain)   # PLAIN only: Gmail hangs up on the LOGIN fallback and hides the real error
except smtplib.SMTPAuthenticationError as e:
    print(f"\nGmail rejected the login ({e.smtp_code}): wrong address or App Password.")
    print("Make sure it's an App Password (not your normal password) created while signed in as this exact account,")
    print("and that 2-Step Verification is on for it. Nothing was saved.")
    input("\nPress Enter to close")
    raise SystemExit(1)
except Exception as e:
    print(f"\nLogin failed: {e}\nNothing was saved. Check the address and App Password and try again.")
    input("\nPress Enter to close")
    raise SystemExit(1)

cfg = {
    "host": "smtp.gmail.com", "port": 465, "user": user, "password": password,
    "from_name": name, "subject": "Your photobooth photos",
    "body": "Thanks for stopping by the photobooth! Your strip and photos are attached.",
}
with open(os.path.join(ROOT, "email_config.json"), "w") as f:
    json.dump(cfg, f, indent=2)
print("\nLogin works! Saved email_config.json. Restart the photobooth server and emails will send.")
input("\nPress Enter to close")
