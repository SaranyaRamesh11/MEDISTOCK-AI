"""
MEDISTOCK AI - Forecast Route
"""

from fastapi import APIRouter, HTTPException
from models.schemas import MedicineForecastResponse
from services.forecast_service import get_medicine_forecast

router = APIRouter(tags=["Forecast"])

@router.get("/forecast/{medicine}", response_model=MedicineForecastResponse)
@router.get("/api/forecast/{medicine}", response_model=MedicineForecastResponse)
async def get_forecast(medicine: str):
    try:
        data = get_medicine_forecast(medicine)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate forecast for {medicine}: {str(e)}")
