"""
MEDISTOCK AI - Prediction Route
Handles live machine learning inference, inventory business logic calculation, and clinical briefings.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import PredictionRequest, PredictionResponse, ConfidenceInterval
from ml.predict_pipeline import pipeline
from services.inventory_service import calculate_inventory_metrics
from services.ai_service import generate_ai_explanation
from utils.constants import MEDICINE_CATALOG

router = APIRouter(tags=["Prediction"])

@router.post("/predict", response_model=PredictionResponse)
@router.post("/api/predict", response_model=PredictionResponse)
async def predict_demand(req: PredictionRequest):
    try:
        # Determine category if not explicitly provided
        category = req.category
        if not category:
            med_meta = next((m for m in MEDICINE_CATALOG if m["name"].lower() == req.medicine.lower()), None)
            category = med_meta["category"] if med_meta else "General Healthcare"
            
        unit_price = 1.0
        med_meta = next((m for m in MEDICINE_CATALOG if m["name"].lower() == req.medicine.lower()), None)
        if med_meta:
            unit_price = med_meta.get("unit_price", 1.0)
            
        # 1. ML Model Prediction
        inference_input = {
            "Medicine": req.medicine,
            "Category": category,
            "Current_Stock": req.current_stock,
            "Daily_Usage": req.daily_usage,
            "Patient_Count": req.patient_count,
            "Emergency_Cases": req.emergency_cases,
            "Season": req.season,
            "Holiday": req.holiday,
            "Supplier_Lead_Time": req.supplier_lead_time
        }
        
        pred_res = pipeline.predict(inference_input, model_type=req.model_type or "Linear Regression")
        predicted_demand = pred_res["predicted_demand"]
        ci_data = pred_res["confidence_interval"]
        
        # 2. Supply Chain & Risk Calculations
        metrics = calculate_inventory_metrics(
            medicine=req.medicine,
            category=category,
            current_stock=req.current_stock,
            daily_usage=req.daily_usage,
            predicted_demand=predicted_demand,
            supplier_lead_time=req.supplier_lead_time,
            emergency_cases=req.emergency_cases,
            unit_price=unit_price
        )
        
        # 3. Clinical AI Briefing
        ai_exp = generate_ai_explanation(
            medicine=req.medicine,
            category=category,
            current_stock=int(req.current_stock),
            predicted_demand=predicted_demand,
            stock_gap=metrics["stock_gap"],
            stock_coverage_days=metrics["stock_coverage_days"],
            supplier_lead_time=req.supplier_lead_time,
            reorder_quantity=metrics["reorder_quantity"],
            risk_level=metrics["risk_level"],
            risk_score=metrics["risk_score"],
            season=req.season,
            emergency_cases=req.emergency_cases
        )
        
        return PredictionResponse(
            medicine=req.medicine,
            category=category,
            current_stock=int(req.current_stock),
            daily_usage=float(req.daily_usage),
            predicted_demand=predicted_demand,
            confidence_interval=ConfidenceInterval(
                lower=ci_data["lower"],
                upper=ci_data["upper"],
                confidence_level=ci_data["confidence_level"]
            ),
            stock_gap=metrics["stock_gap"],
            stock_coverage_days=metrics["stock_coverage_days"],
            lead_time_demand=metrics["lead_time_demand"],
            safety_stock=metrics["safety_stock"],
            required_stock=metrics["required_stock"],
            reorder_quantity=metrics["reorder_quantity"],
            risk_score=metrics["risk_score"],
            risk_level=metrics["risk_level"],
            reorder_action=metrics["reorder_action"],
            ai_explanation=ai_exp["summary"],
            clinical_justification=ai_exp.get("justification", "Demand risk calculated by MediStock ML pipeline."),
            model_used=pred_res["model_used"],
            latency_ms=pred_res["latency_ms"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction inference failed: {str(e)}")
