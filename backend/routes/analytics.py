"""
MEDISTOCK AI - Analytics Route
"""

from fastapi import APIRouter
from services.analytics_service import get_analytics_data

router = APIRouter(tags=["Analytics"])

@router.get("/analytics")
@router.get("/api/analytics")
async def get_analytics():
    return get_analytics_data()
