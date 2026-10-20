"""
MEDISTOCK AI - Model Performance Route
"""

from fastapi import APIRouter
from services.performance_service import get_model_performance

router = APIRouter(tags=["Model Performance"])

@router.get("/model-performance")
@router.get("/api/model-performance")
async def get_performance():
    return get_model_performance()
