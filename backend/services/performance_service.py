"""
MEDISTOCK AI - Model Performance & Transparency Service
Retrieves actual evaluation metrics, residual stats, and feature importances from training artifacts.
"""

import os
import json
from typing import Dict, Any

def get_model_performance() -> Dict[str, Any]:
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
    metrics_path = os.path.join(data_dir, "metrics.json")
    
    if not os.path.exists(metrics_path):
        return {"error": "Model evaluation metrics not found. Run training pipeline first."}
        
    with open(metrics_path, "r") as f:
        metrics = json.load(f)
        
    return metrics
