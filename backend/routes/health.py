"""
MEDISTOCK AI - Health Route
"""

from fastapi import APIRouter
from datetime import datetime
from ml.predict_pipeline import pipeline

router = APIRouter(tags=["Health"])

@router.get("/health")
@router.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "MediStock AI - Hospital Inventory Forecasting Engine",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": {
            "linear_regression": pipeline.model_linear is not None,
            "random_forest": pipeline.model_rf is not None,
            "preprocessor": pipeline.preprocessor is not None
        },
        "version": "2.0.0-PROD"
    }
