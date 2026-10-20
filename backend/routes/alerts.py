"""
MEDISTOCK AI - Clinical Alerts Center Route
Generates real-time operational alerts for stockouts, lead-time supply delays, and surge events.
"""

from fastapi import APIRouter
from datetime import datetime
from services.inventory_service import InventoryService

router = APIRouter(tags=["Alerts"])

@router.get("/alerts")
@router.get("/api/alerts")
async def get_alerts():
    inv_data = InventoryService.get_full_inventory()
    items = inv_data["items"]
    
    alerts = []
    alert_idx = 1
    
    for item in items:
        med = item["medicine"]
        risk = item["risk_level"]
        stock = item["current_stock"]
        demand = item["predicted_demand"]
        coverage = item["stock_coverage_days"]
        lead_time = item["supplier_lead_time"]
        reorder = item["reorder_quantity"]
        
        if risk == "Critical":
            alerts.append({
                "id": f"alt-{alert_idx:03d}",
                "severity": "CRITICAL",
                "medicine": med,
                "title": f"Critical Stockout Imminent ({coverage}d remaining)",
                "message": f"{med} on-hand stock ({stock} units) cannot sustain projected demand ({demand} units). Expected depletion within {coverage} days with a {lead_time}-day supplier lead time.",
                "timestamp": "Just now",
                "suggested_action": f"Issue immediate emergency purchase order for {reorder} units."
            })
            alert_idx += 1
        elif risk == "High Risk":
            alerts.append({
                "id": f"alt-{alert_idx:03d}",
                "severity": "HIGH",
                "medicine": med,
                "title": f"Stock Deficit Warning (Gap: {abs(item['stock_gap'])} units)",
                "message": f"Forecasted demand exceeds current inventory buffer. Reorder required to maintain safety stock levels.",
                "timestamp": "10m ago",
                "suggested_action": f"Queue reorder of {reorder} units in today's procurement cycle."
            })
            alert_idx += 1
        elif lead_time >= 7:
            alerts.append({
                "id": f"alt-{alert_idx:03d}",
                "severity": "INFO",
                "medicine": med,
                "title": f"Extended Supplier Lead Time ({lead_time} days)",
                "message": f"Supplier fulfillment for {med} requires {lead_time} days. Maintain higher baseline safety stock.",
                "timestamp": "1h ago",
                "suggested_action": "Review supplier SLA agreements."
            })
            alert_idx += 1
            
    return {
        "count": len(alerts),
        "alerts": alerts
    }
