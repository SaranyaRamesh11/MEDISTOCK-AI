"""
MEDISTOCK AI - Clinical AI Recommendations Hub Service
Identifies critical shortages, computes financial replenishment budgets, and provides actionable clinical advisories.
"""

from typing import List, Dict, Any
from services.inventory_service import InventoryService
from services.ai_service import generate_ai_explanation

def get_smart_recommendations() -> Dict[str, Any]:
    inv_data = InventoryService.get_full_inventory()
    items = inv_data["items"]
    
    recommendations: List[Dict[str, Any]] = []
    total_reorder_budget = 0.0
    critical_interventions = 0
    high_priority_count = 0
    
    for item in items:
        # Include items that need reordering or have elevated risk
        if item["reorder_quantity"] > 0 or item["risk_score"] > 35.0:
            urgency = item["risk_level"]
            if urgency == "Critical":
                critical_interventions += 1
            elif urgency == "High Risk":
                high_priority_count += 1
                
            est_cost = round(item["reorder_quantity"] * item["unit_price"], 2)
            total_reorder_budget += est_cost
            
            ai_info = generate_ai_explanation(
                medicine=item["medicine"],
                category=item["category"],
                current_stock=item["current_stock"],
                predicted_demand=item["predicted_demand"],
                stock_gap=item["stock_gap"],
                stock_coverage_days=item["stock_coverage_days"],
                supplier_lead_time=item["supplier_lead_time"],
                reorder_quantity=item["reorder_quantity"],
                risk_level=item["risk_level"],
                risk_score=item["risk_score"]
            )
            
            stockout_days = round(item["stock_coverage_days"], 1)
            
            if item["risk_score"] >= 75.0:
                action_text = f"Trigger expedited PO for {item['reorder_quantity']} {item['unit']} immediately."
            elif item["risk_score"] >= 50.0:
                action_text = f"Approve purchase order for {item['reorder_quantity']} {item['unit']} within 24 hours."
            elif item["reorder_quantity"] > 0:
                action_text = f"Include {item['reorder_quantity']} {item['unit']} in weekly supplier replenishment batch."
            else:
                action_text = "Maintain standard safety stock monitoring."
                
            recommendations.append({
                "id": f"rec-{item['id']}",
                "medicine": item["medicine"],
                "category": item["category"],
                "urgency": urgency,
                "current_stock": item["current_stock"],
                "predicted_demand": item["predicted_demand"],
                "shortage_gap": item["stock_gap"],
                "reorder_quantity": item["reorder_quantity"],
                "unit": item["unit"],
                "unit_price": item["unit_price"],
                "estimated_cost": est_cost,
                "risk_score": item["risk_score"],
                "supplier_lead_time": item["supplier_lead_time"],
                "stockout_in_days": stockout_days,
                "ai_rationale": ai_info["summary"],
                "suggested_action": action_text
            })
            
    # Sort recommendations by risk score descending
    recommendations.sort(key=lambda x: x["risk_score"], reverse=True)
    
    summary = {
        "total_recommendations": len(recommendations),
        "critical_actions": critical_interventions,
        "high_priority_actions": high_priority_count,
        "estimated_procurement_budget": round(total_reorder_budget, 2)
    }
    
    return {
        "summary": summary,
        "recommendations": recommendations
    }
