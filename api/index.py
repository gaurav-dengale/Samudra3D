import sys
import os

# Ensure the root and backend directory are in Python module search path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, ".."))
backend_dir = os.path.join(parent_dir, "backend")

for path in [parent_dir, backend_dir]:
    if path not in sys.path:
        sys.path.insert(0, path)

from backend.main import app

# Vercel Serverless Python looks for `app` in `api/index.py`
