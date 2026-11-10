@echo off
cd /d "%~dp0"
python setup_email.py || py setup_email.py
