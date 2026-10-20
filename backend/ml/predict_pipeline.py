"""
MEDISTOCK AI - Inference Prediction Pipeline
Loads trained artifacts and performs unified preprocessing and demand prediction.
"""

import os
import sys
import time
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from utils.constants import FEATURE_COLUMNS, MEDICINE_CATALOG

class PredictorPipeline:
    _instance = None
    
    def __init__(self):
        self.data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
        self.preprocessor_path = os.path.join(self.data_dir, "preprocessor.joblib")
        self.linear_model_path = os.path.join(self.data_dir, "model_linear.joblib")
        self.rf_model_path = os.path.join(self.data_dir, "model_rf.joblib")
        
        self.preprocessor = None
        self.model_linear = None
        self.model_rf = None
        self.load_artifacts()
        
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = PredictorPipeline()
        return cls._instance
        
    def load_artifacts(self):
        if not os.path.exists(self.preprocessor_path):
            raise FileNotFoundError("Preprocessor artifact not found. Please train models first.")
        self.preprocessor = joblib.load(self.preprocessor_path)
        self.model_linear = joblib.load(self.linear_model_path)
        if os.path.exists(self.rf_model_path):
            self.model_rf = joblib.load(self.rf_model_path)
            
    def compute_engineered_features(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates derived features identical to the training stage."""
        medicine_name = data.get("Medicine", "")
        category = data.get("Category", "")
        current_stock = float(data.get("Current_Stock", 0))
        daily_usage = float(data.get("Daily_Usage", 1))
        patient_count = float(data.get("Patient_Count", 300))
        emergency_cases = float(data.get("Emergency_Cases", 20))
        season = data.get("Season", "Winter")
        holiday = int(data.get("Holiday", 0))
        lead_time = float(data.get("Supplier_Lead_Time", 5))
        
        # Match catalog seasonal sensitivity
        med_meta = next((m for m in MEDICINE_CATALOG if m["name"] == medicine_name), None)
        if med_meta:
            if med_meta["seasonal_sensitivity"] == season:
                seasonal_factor = 1.35
            elif med_meta["seasonal_sensitivity"] != "None":
                seasonal_factor = 0.85
            else:
                seasonal_factor = 1.0
        else:
            seasonal_factor = 1.0
            
        stock_coverage_ratio = round(current_stock / max(daily_usage, 0.1), 2)
        lead_time_demand = round(daily_usage * lead_time, 2)
        emergency_ratio = round(emergency_cases / max(patient_count, 1.0), 4)
        
        return {
            "Medicine": medicine_name,
            "Category": category,
            "Current_Stock": current_stock,
            "Daily_Usage": daily_usage,
            "Patient_Count": patient_count,
            "Emergency_Cases": emergency_cases,
            "Season": season,
            "Holiday": holiday,
            "Supplier_Lead_Time": lead_time,
            "Stock_Coverage_Ratio": stock_coverage_ratio,
            "Lead_Time_Demand": lead_time_demand,
            "Emergency_Ratio": emergency_ratio,
            "Seasonal_Factor": seasonal_factor
        }

    def predict(self, input_dict: Dict[str, Any], model_type: str = "Linear Regression") -> Dict[str, Any]:
        start_time = time.perf_counter()
        
        # 1. Engineer features
        full_features = self.compute_engineered_features(input_dict)
        
        # 2. DataFrame with exact column order
        df_input = pd.DataFrame([full_features])[FEATURE_COLUMNS]
        
        # 3. Transform using fitted preprocessor
        X_trans = self.preprocessor.transform(df_input)
        
        # 4. Predict using selected model
        if model_type == "Random Forest" and self.model_rf is not None:
            raw_pred = self.model_rf.predict(X_trans)[0]
            used_model = "Random Forest Regression"
            std_err = 12.8
        else:
            raw_pred = self.model_linear.predict(X_trans)[0]
            used_model = "Linear Regression (Production Selected)"
            std_err = 18.0
            
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        predicted_demand = int(max(5, round(raw_pred)))
        
        # Prediction interval (95% confidence bounds)
        lower_bound = int(max(0, round(predicted_demand - 1.96 * std_err)))
        upper_bound = int(round(predicted_demand + 1.96 * std_err))
        
        return {
            "predicted_demand": predicted_demand,
            "confidence_interval": {
                "lower": lower_bound,
                "upper": upper_bound,
                "confidence_level": "95%"
            },
            "model_used": used_model,
            "latency_ms": latency_ms,
            "engineered_features": full_features
        }

# Singleton instance for fast caching
pipeline = PredictorPipeline.get_instance()
