import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.database import engine, Base
import app.models

from app.api.routers import (
    cpse,
    matching,
    governance,
    canonical,
    erp_export,
    analytics,
    dataset,
    system,
    active_learning,
    arbitrage
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.RULE_VERSION,
    description="AI-Driven National Unified Material Master Platform for CPSEs (One Nation - One Material Code)"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cpse.router, prefix=settings.API_V1_STR)
app.include_router(matching.router, prefix=settings.API_V1_STR)
app.include_router(governance.router, prefix=settings.API_V1_STR)
app.include_router(canonical.router, prefix=settings.API_V1_STR)
app.include_router(erp_export.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(dataset.router, prefix=settings.API_V1_STR)
app.include_router(system.router, prefix=settings.API_V1_STR)
app.include_router(active_learning.router, prefix=settings.API_V1_STR)
app.include_router(arbitrage.router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "HEALTHY",
        "rule_version": settings.RULE_VERSION,
        "model_version": settings.MODEL_VERSION,
        "project": settings.PROJECT_NAME
    }

@app.get("/api/download/documentation", tags=["Documentation"])
def download_documentation():
    docx_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "NUMM_National_Unified_Material_Master_Documentation.docx"))
    if not os.path.exists(docx_path):
        docx_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "docs", "NUMM_National_Unified_Material_Master_Documentation.docx"))
    return FileResponse(
        docx_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename="NUMM_National_Unified_Material_Master_Documentation.docx"
    )

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import logging
    logging.getLogger("uvicorn.error").error(f"Global unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "ERROR",
            "error": True,
            "detail": str(exc),
            "path": str(request.url.path),
            "type": type(exc).__name__
        }
    )

# Static file serving: Check for production build in dist/
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "dist"))
assets_dir = os.path.join(dist_dir, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/", include_in_schema=False)
def serve_frontend_root():
    index_path = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "platform": settings.PROJECT_NAME,
        "status": "ONLINE",
        "api_docs": "/docs",
        "health": "/api/health",
        "note": "NUMM Backend active. Start Vite frontend on http://127.0.0.1:3000 or run npm run build to serve static assets."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
