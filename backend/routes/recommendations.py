"""
MEDISTOCK AI - Recommendations Route
"""

from fastapi import APIRouter
from services.recommendations_service import get_smart_recommendations

router = APIRouter(tags=["Recommendations"])

@router.get("/recommendations")
@router.get("/api/recommendations")
async def get_recommendations():
    return get_smart_recommendations()
