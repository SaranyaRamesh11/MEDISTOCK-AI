"""
MEDISTOCK AI - Analytics Aggregation Service
Extracts statistical distributions, correlations, and trend analytics directly from the 10k dataset.
"""

import os
import pandas as pd
import numpy as np
from typing import Dict, Any, List

def get_analytics_data() -> Dict[str, Any]:
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
    csv_path = os.path.join(data_dir, "hospital_inventory_10k.csv")
    
    if not os.path.exists(csv_path):
        return {"error": "Dataset not found"}
        
    df = pd.read_csv(csv_path)
    
    # 1. Seasonal Demand Trend
    seasonal_agg = df.groupby("Season")["Demand"].agg(["mean", "sum", "count"]).reindex(
        ["Winter", "Spring", "Summer", "Autumn"]
    ).fillna(0)
    
    seasonal_trend = [
        {"season": season, "avg_demand": round(float(seasonal_agg.loc[season, "mean"]), 1), "total_volume": int(seasonal_agg.loc[season, "sum"])}
        for season in ["Winter", "Spring", "Summer", "Autumn"]
    ]
    
    # 2. Medicine-wise Demand (Top 10)
    med_agg = df.groupby("Medicine").agg({
        "Demand": "mean",
        "Current_Stock": "mean",
        "Daily_Usage": "mean",
        "Emergency_Cases": "mean"
    }).reset_index()
    
    med_agg["avg_demand"] = med_agg["Demand"].round(1)
    med_agg["avg_stock"] = med_agg["Current_Stock"].round(1)
    med_agg_sorted = med_agg.sort_values(by="avg_demand", ascending=False)
    
    top_medicines = [
        {
            "medicine": row["Medicine"],
            "avg_demand": float(row["avg_demand"]),
            "avg_stock": float(row["avg_stock"]),
            "avg_daily_usage": round(float(row["Daily_Usage"]), 1)
        }
        for _, row in med_agg_sorted.head(10).iterrows()
    ]
    
    # 3. Category-wise Demand Breakdown
    cat_agg = df.groupby("Category").agg({
        "Demand": ["sum", "mean", "count"]
    }).reset_index()
    
    cat_agg.columns = ["category", "total_demand", "avg_demand", "records"]
    total_all_demand = cat_agg["total_demand"].sum()
    cat_agg["percentage"] = ((cat_agg["total_demand"] / total_all_demand) * 100).round(1)
    
    category_breakdown = [
        {
            "category": row["category"],
            "total_demand": int(row["total_demand"]),
            "avg_demand": round(float(row["avg_demand"]), 1),
            "percentage": float(row["percentage"])
        }
        for _, row in cat_agg.sort_values(by="total_demand", ascending=False).iterrows()
    ]
    
    # 4. Emergency Cases vs Demand Correlation Bins
    df["emergency_bin"] = pd.cut(
        df["Emergency_Cases"],
        bins=[0, 15, 30, 45, 60, 100],
        labels=["Low (0-15)", "Moderate (16-30)", "Elevated (31-45)", "High (46-60)", "Surge (60+)"]
    )
    emerg_corr = df.groupby("emergency_bin", observed=True)["Demand"].mean().reset_index()
    emergency_correlation = [
        {"tier": str(row["emergency_bin"]), "avg_demand": round(float(row["Demand"]), 1)}
        for _, row in emerg_corr.iterrows()
    ]
    
    # 5. Patient Count vs Demand Scatter Sample (100 representative points)
    sample_df = df.sample(n=min(100, len(df)), random_state=42)
    patient_vs_demand = [
        {
            "patient_count": int(row["Patient_Count"]),
            "demand": int(row["Demand"]),
            "medicine": str(row["Medicine"]),
            "category": str(row["Category"])
        }
        for _, row in sample_df.iterrows()
    ]
    
    # 6. Overall Summary Metrics
    analytics_kpis = {
        "dataset_records": len(df),
        "overall_avg_demand": round(float(df["Demand"].mean()), 1),
        "max_single_day_demand": int(df["Demand"].max()),
        "min_single_day_demand": int(df["Demand"].min()),
        "correlation_patient_demand": round(float(df["Patient_Count"].corr(df["Demand"])), 3),
        "correlation_emergency_demand": round(float(df["Emergency_Cases"].corr(df["Demand"])), 3),
    }
    
    return {
        "kpis": analytics_kpis,
        "seasonal_trend": seasonal_trend,
        "top_medicines": top_medicines,
        "category_breakdown": category_breakdown,
        "emergency_correlation": emergency_correlation,
        "patient_vs_demand": patient_vs_demand
    }
