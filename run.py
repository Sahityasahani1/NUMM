import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

import uvicorn

if __name__ == "__main__":
    print("==================================================================")
    print("  Ministry of Petroleum & Natural Gas - NUMM Platform (SIH26099)  ")
    print("       One Nation · One Material Code Governance Workbench        ")
    print("==================================================================")
    dist_dir = os.path.join(os.path.dirname(__file__), "dist")
    if os.path.exists(dist_dir):
        print("  * Modern React 18 UI Bundle: Active (dist/)")
    print("  * Server running at: http://127.0.0.1:8000")
    print("  * Interactive API Docs: http://127.0.0.1:8000/docs")
    print("  * Press Ctrl+C to stop.")
    print("==================================================================")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True, reload_dirs=[os.path.join(os.path.dirname(__file__), "backend")])
