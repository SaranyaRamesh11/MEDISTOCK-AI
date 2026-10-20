"""
MEDISTOCK AI - Inventory Intelligence & Business Logic Service
Calculates Stock Gap, Stock Coverage, Lead-Time Demand, Safety Stock, Reorder Quantity, and Multi-Factor Risk Scores.
"""

import math
import numpy as np
from typing import Dict, Any, List
from utils.constants import MEDICINE_CATALOG
from ml.predict_pipeline import pipeline

def calculate_inventory_metrics(
    medicine: str,
    category: str,
    current_stock: float,
    daily_usage: float,
    predicted_demand: float,
    supplier_lead_time: float,
    emergency_cases: float = 25.0,
    unit_price: float = 1.0
) -> Dict[str, Any]:
    """
    Computes all standard hospital supply chain metrics deterministically.
    """
    # 1. Stock Gap
    stock_gap = int(round(current_stock - predicted_demand))
    
    # 2. Stock Coverage (in days of supply)
    safe_daily_usage = max(daily_usage, 0.1)
    stock_coverage_days = round(current_stock / safe_daily_usage, 1)
    
    # 3. Expected demand during supplier lead time
    lead_time_demand = round(daily_usage * supplier_lead_time, 1)
    
    # 4. Clinically sound Safety Stock:
    # Buffer for demand variance during lead time + emergency admissions buffer
    z_score = 1.65  # 95% service cycle level
    demand_volatility = daily_usage * 0.20
    lead_time_uncertainty = math.sqrt(max(supplier_lead_time, 1.0))
    safety_stock_calc = (z_score * lead_time_uncertainty * demand_volatility) + (emergency_cases * 0.8)
    safety_stock = int(max(15, round(safety_stock_calc)))
    
    # 5. Required Stock & Reorder Quantity
    required_stock = int(round(predicted_demand + safety_stock))
    reorder_quantity = int(max(0, required_stock - current_stock))
    
    # 6. Multi-Factor Risk Score (0 - 100)
    # Component A: Demand Shortage Penalty (0 - 40 pts)
    if current_stock <= 0:
        shortage_score = 40.0
    elif current_stock < predicted_demand:
        shortage_score = (1.0 - (current_stock / max(predicted_demand, 1.0))) * 40.0
    else:
        shortage_score = 0.0
        
    # Component B: Stock Coverage vs Lead Time Risk (0 - 30 pts)
    # If days of stock < lead time, stockout before shipment arrival is inevitable
    if stock_coverage_days <= supplier_lead_time:
        coverage_deficit = 1.0 - (stock_coverage_days / max(supplier_lead_time, 1.0))
        coverage_score = 15.0 + (coverage_deficit * 15.0)
    elif stock_coverage_days < (supplier_lead_time * 1.5):
        coverage_score = 8.0
    else:
        coverage_score = 0.0
        
    # Component C: Emergency Admission Volatility (0 - 18 pts)
    emergency_score = min(18.0, (emergency_cases / 40.0) * 18.0)
    
    # Component D: Lead Time Vulnerability (0 - 12 pts)
    lead_time_score = min(12.0, (supplier_lead_time / 12.0) * 12.0)
    
    raw_risk = shortage_score + coverage_score + emergency_score + lead_time_score
    risk_score = round(float(np.clip(raw_risk, 0.0, 100.0)), 1)
    
    # Risk Classification
    if risk_score >= 75.0 or current_stock < (daily_usage * 2):
        risk_level = "Critical"
        status = "CRITICAL"
        reorder_action = "IMMEDIATE REORDER"
    elif risk_score >= 50.0 or stock_gap < 0:
        risk_level = "High Risk"
        status = "LOW"
        reorder_action = "REORDER SOON"
    elif risk_score >= 25.0:
        risk_level = "Monitor"
        status = "MONITOR"
        reorder_action = "MONITOR USAGE"
    else:
        risk_level = "Healthy"
        status = "HEALTHY"
        reorder_action = "ADEQUATELY STOCKED"

    return {
        "stock_gap": stock_gap,
        "stock_coverage_days": stock_coverage_days,
        "lead_time_demand": lead_time_demand,
        "safety_stock": safety_stock,
        "required_stock": required_stock,
        "reorder_quantity": reorder_quantity,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "status": status,
        "reorder_action": reorder_action,
        "estimated_reorder_cost": round(reorder_quantity * unit_price, 2)
    }

class InventoryService:
    @staticmethod
    def get_full_inventory(category_filter: str = None, risk_filter: str = None, search: str = None) -> Dict[str, Any]:
        """
        Generates live hospital inventory state by running ML predictions across catalog medicines.
        """
        items = []
        total_current_stock = 0
        total_predicted_demand = 0
        low_stock_count = 0
        reorder_count = 0
        critical_count = 0
        
        # Consistent current snapshot values based on realistic hospital operational states
        # Varied realistic stock profiles to showcase all clinical states (Healthy, Monitor, Low, Critical)
        stock_multipliers = [
            0.6, 2.5, 0.4, 3.8, 0.35, 4.2, 5.0, 1.2, 0.5, 0.25, 
            0.45, 2.2, 3.0, 1.1, 0.3, 2.0, 0.4, 0.2, 0.35, 4.5
        ]
        
        for idx, med in enumerate(MEDICINE_CATALOG):
            med_name = med["name"]
            med_cat = med["category"]
            daily_usage = med["base_daily_usage"]
            lead_time = med["default_lead_time"]
            unit_price = med["unit_price"]
            multiplier = stock_multipliers[idx % len(stock_multipliers)]
            current_stock = int(round(daily_usage * multiplier * lead_time))
            
            # Predict demand via ML pipeline
            pred_res = pipeline.predict({
                "Medicine": med_name,
                "Category": med_cat,
                "Current_Stock": current_stock,
                "Daily_Usage": daily_usage,
                "Patient_Count": 360,
                "Emergency_Cases": 28,
                "Season": "Winter",
                "Holiday": 0,
                "Supplier_Lead_Time": lead_time
            })
            
            predicted_demand = pred_res["predicted_demand"]
            
            metrics = calculate_inventory_metrics(
                medicine=med_name,
                category=med_cat,
                current_stock=current_stock,
                daily_usage=daily_usage,
                predicted_demand=predicted_demand,
                supplier_lead_time=lead_time,
                emergency_cases=28,
                unit_price=unit_price
            )
            
            item_data = {
                "id": f"med-{idx+1:03d}",
                "medicine": med_name,
                "category": med_cat,
                "unit": med["unit"],
                "unit_price": unit_price,
                "current_stock": current_stock,
                "daily_usage": float(daily_usage),
                "predicted_demand": predicted_demand,
                "stock_gap": metrics["stock_gap"],
                "stock_coverage_days": metrics["stock_coverage_days"],
                "supplier_lead_time": lead_time,
                "lead_time_demand": metrics["lead_time_demand"],
                "safety_stock": metrics["safety_stock"],
                "reorder_quantity": metrics["reorder_quantity"],
                "risk_score": metrics["risk_score"],
                "risk_level": metrics["risk_level"],
                "status": metrics["status"],
                "recommended_action": metrics["reorder_action"]
            }
            
            total_current_stock += current_stock
            total_predicted_demand += predicted_demand
            if metrics["status"] in ["LOW", "CRITICAL"]:
                low_stock_count += 1
            if metrics["reorder_quantity"] > 0:
                reorder_count += 1
            if metrics["status"] == "CRITICAL":
                critical_count += 1
                
            # Filter checks
            if category_filter and category_filter != "All" and med_cat != category_filter:
                continue
            if risk_filter and risk_filter != "All" and metrics["risk_level"] != risk_filter:
                continue
            if search:
                s = search.lower()
                if s not in med_name.lower() and s not in med_cat.lower():
                    continue
                    
            items.append(item_data)
            
        summary_stats = {
            "total_medicines": len(MEDICINE_CATALOG),
            "total_current_stock": total_current_stock,
            "total_predicted_demand": total_predicted_demand,
            "low_stock_items": low_stock_count,
            "reorder_required_count": reorder_count,
            "critical_stockouts": critical_count,
            "average_risk_score": round(sum(i["risk_score"] for i in items) / max(len(items), 1), 1)
        }
        
        return {
            "total_items": len(MEDICINE_CATALOG),
            "filtered_items": len(items),
            "summary_stats": summary_stats,
            "items": items
        }
