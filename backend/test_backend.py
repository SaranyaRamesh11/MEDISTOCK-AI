"""
FastAPI Route Verification Script
"""

import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_all_endpoints():
    print("Testing /health ...")
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print("  -> Health OK:", r.json())
    
    print("\nTesting /api/medicines ...")
    r = client.get("/api/medicines")
    assert r.status_code == 200
    print(f"  -> Medicines count: {r.json()['count']}")
    
    print("\nTesting /api/inventory ...")
    r = client.get("/api/inventory")
    assert r.status_code == 200
    data = r.json()
    print(f"  -> Inventory items: {data['filtered_items']}, Low stock: {data['summary_stats']['low_stock_items']}")
    
    print("\nTesting /api/predict ...")
    sample_payload = {
        "medicine": "Paracetamol 500mg",
        "category": "Analgesics & Antipyretics",
        "current_stock": 250,
        "daily_usage": 180,
        "patient_count": 400,
        "emergency_cases": 35,
        "season": "Winter",
        "holiday": 0,
        "supplier_lead_time": 4,
        "model_type": "Linear Regression"
    }
    r = client.post("/api/predict", json=sample_payload)
    assert r.status_code == 200, f"Predict failed: {r.text}"
    p_data = r.json()
    print(f"  -> Predicted Demand: {p_data['predicted_demand']}, Stock Gap: {p_data['stock_gap']}, Risk: {p_data['risk_level']} ({p_data['risk_score']}/100), Reorder: {p_data['reorder_quantity']}")
    print(f"  -> AI Explanation: {p_data['ai_explanation']}")
    
    print("\nTesting /api/forecast/Paracetamol 500mg ...")
    r = client.get("/api/forecast/Paracetamol 500mg")
    assert r.status_code == 200
    print(f"  -> Forecast time points: {len(r.json()['time_series'])}")
    
    print("\nTesting /api/analytics ...")
    r = client.get("/api/analytics")
    assert r.status_code == 200
    print(f"  -> Analytics KPIs: {r.json()['kpis']}")
    
    print("\nTesting /api/recommendations ...")
    r = client.get("/api/recommendations")
    assert r.status_code == 200
    print(f"  -> Smart Recommendations count: {len(r.json()['recommendations'])}")
    
    print("\nTesting /api/model-performance ...")
    r = client.get("/api/model-performance")
    assert r.status_code == 200
    perf = r.json()
    print(f"  -> Selected Model: {perf['selected_model']}")
    print(f"  -> Linear Regression R2: {perf['models']['Linear Regression']['r2_score']}, MAE: {perf['models']['Linear Regression']['mae']}")
    print(f"  -> Random Forest R2: {perf['models']['Random Forest Regression']['r2_score']}, MAE: {perf['models']['Random Forest Regression']['mae']}")
    
    print("\nTesting /api/alerts ...")
    r = client.get("/api/alerts")
    assert r.status_code == 200
    print(f"  -> Alerts generated: {r.json()['count']}")
    
    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_all_endpoints()
