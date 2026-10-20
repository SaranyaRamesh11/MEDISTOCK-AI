"""
MEDISTOCK AI - Production FastAPI Entrypoint
Predict demand. Prevent shortages. Optimize hospital inventory.
"""

import os
import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add backend directory to python path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from routes.health import router as health_router
from routes.predict import router as predict_router
from routes.inventory import router as inventory_router
from routes.forecast import router as forecast_router
from routes.analytics import router as analytics_router
from routes.recommendations import router as recommendations_router
from routes.model_performance import router as model_perf_router
from routes.alerts import router as alerts_router

app = FastAPI(
    title="MediStock AI - Hospital Inventory Intelligence API",
    description="AI-Powered Hospital Inventory Forecasting, Stockout Prevention, and Reorder Recommendation Engine",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for all frontend origins (React / Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "path": request.url.path
        }
    )

# Include Routers
app.include_router(health_router)
app.include_router(predict_router)
app.include_router(inventory_router)
app.include_router(forecast_router)
app.include_router(analytics_router)
app.include_router(recommendations_router)
app.include_router(model_perf_router)
app.include_router(alerts_router)

@app.get("/")
async def root():
    return {
        "app": "MediStock AI",
        "tagline": "Predict demand. Prevent shortages. Optimize hospital inventory.",
        "status": "online",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
