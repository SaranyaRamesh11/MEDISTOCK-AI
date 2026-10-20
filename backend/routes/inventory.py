"""
MEDISTOCK AI - Inventory & Medicine Catalog Routes
"""

from fastapi import APIRouter, Query
from typing import Optional
from models.schemas import InventoryListResponse
from services.inventory_service import InventoryService
from utils.constants import MEDICINE_CATALOG, CATEGORIES, SEASONS

router = APIRouter(tags=["Inventory"])

@router.get("/inventory", response_model=InventoryListResponse)
@router.get("/api/inventory", response_model=InventoryListResponse)
async def get_inventory(
    category: Optional[str] = Query(None, description="Filter by clinical category"),
    risk: Optional[str] = Query(None, description="Filter by risk level (Healthy, Monitor, High Risk, Critical)"),
    search: Optional[str] = Query(None, description="Search medicine name or category")
):
    result = InventoryService.get_full_inventory(
        category_filter=category,
        risk_filter=risk,
        search=search
    )
    return result

@router.get("/medicines")
@router.get("/api/medicines")
async def get_medicines_catalog():
    return {
        "count": len(MEDICINE_CATALOG),
        "medicines": MEDICINE_CATALOG,
        "categories": CATEGORIES,
        "seasons": SEASONS
    }
