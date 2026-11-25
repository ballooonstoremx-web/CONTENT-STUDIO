#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -c 'import sys; assert sys.version_info >= (3, 12), "Python 3.12+ required"'
if [ ! -x .venv/bin/python ]; then python3 -m venv .venv; fi
.venv/bin/python -m pip install --disable-pip-version-check -r requirements.txt
.venv/bin/python scripts/studio.py doctor
.venv/bin/python -m unittest discover -s tests -v
