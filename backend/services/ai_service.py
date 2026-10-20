"""
MEDISTOCK AI - Clinical AI Explanation Layer
Interprets numerical ML demand forecasts into clinical inventory briefings.
Supports Gemini API with high-precision deterministic clinical fallbacks.
"""

import os
import json
from typing import Dict, Any

def generate_ai_explanation(
    medicine: str,
    category: str,
    current_stock: int,
    predicted_demand: int,
    stock_gap: int,
    stock_coverage_days: float,
    supplier_lead_time: float,
    reorder_quantity: int,
    risk_level: str,
    risk_score: float,
    season: str = "Winter",
    emergency_cases: int = 25
) -> Dict[str, str]:
    """
    Produces concise, medically-grounded explanations.
    """
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    
    # Try Gemini LLM if API Key is configured
    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            prompt = (
                f"You are the Chief Hospital Pharmacist & Supply Chain AI for MEDISTOCK AI. "
                f"Explain this inventory forecast concisely in 2 sentences:\n"
                f"Medicine: {medicine} ({category})\n"
                f"Current Stock: {current_stock} units\n"
                f"ML Predicted Demand: {predicted_demand} units\n"
                f"Stock Gap: {stock_gap} units\n"
                f"Stock Coverage: {stock_coverage_days} days\n"
                f"Supplier Lead Time: {supplier_lead_time} days\n"
                f"Recommended Reorder: {reorder_quantity} units\n"
                f"Risk Level: {risk_level} (Score {risk_score}/100)\n"
                f"Season: {season}, Emergency Cases: {emergency_cases}\n\n"
                f"Return a direct clinical inventory briefing explaining the risk and reorder necessity without fluff."
            )
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            if response and response.text:
                return {
                    "summary": response.text.strip(),
                    "source": "Gemini-2.5-Flash (Live AI)"
                }
        except Exception as e:
            # Fall back cleanly to deterministic clinical engine on network/key errors
            pass

    # Deterministic Clinical Intelligence Engine (Robust, zero-latency fallback)
    if risk_level == "Critical":
        summary = (
            f"CRITICAL SHORTAGE WARNING: {medicine} has only {stock_coverage_days} days of stock remaining "
            f"against a projected demand of {predicted_demand} units. With a {supplier_lead_time}-day supplier lead time, "
            f"stockout is projected within {stock_coverage_days} days. Immediate expedited replenishment of "
            f"{reorder_quantity} units is mandatory to avert clinical care disruptions."
        )
        justification = f"Stock deficit of {abs(stock_gap)} units plus lead-time buffer during {season} peak."
    elif risk_level == "High Risk":
        summary = (
            f"HIGH RISK ALERT: {medicine} demand is forecasted to reach {predicted_demand} units, creating a "
            f"stock gap of {abs(stock_gap)} units. Current inventory covers {stock_coverage_days} days while supplier "
            f"fulfillment requires {supplier_lead_time} days. Recommend reordering {reorder_quantity} units promptly."
        )
        justification = f"Projected patient volume and {emergency_cases} daily emergency cases require safety stock replenishment."
    elif risk_level == "Monitor":
        summary = (
            f"MONITORING ADVISORY: {medicine} stock level ({current_stock} units) is currently stable but nearing "
            f"the safety reorder threshold under {season} conditions. Stock coverage is {stock_coverage_days} days. "
            f"Monitor daily consumption trends."
        )
        justification = f"Inventory is sufficient for near-term demand ({predicted_demand} units) with moderate buffer."
    else:
        summary = (
            f"OPTIMAL INVENTORY: {medicine} is securely stocked with {current_stock} units, providing "
            f"{stock_coverage_days} days of coverage against an estimated demand of {predicted_demand} units. "
            f"No immediate procurement order is necessary."
        )
        justification = f"Current stock exceeds projected requirement and buffer by {stock_gap} units."

    return {
        "summary": summary,
        "justification": justification,
        "source": "MediStock Clinical Intelligence Engine"
    }
