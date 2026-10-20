"""
Dataset Generator for MEDISTOCK AI
Generates a realistic 10,000-record synthetic dataset representing daily hospital inventory,
patient census, seasonal peaks, emergency spikes, supplier logistics, and actual demand.
"""

import os
import sys
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from utils.constants import MEDICINE_CATALOG, SEASONS

def generate_hospital_dataset(n_records: int = 10000, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)
    
    start_date = datetime(2024, 1, 1)
    date_range = [start_date + timedelta(days=int(i)) for i in range(500)]
    
    records = []
    
    # Generate balanced records across medicines and dates
    records_per_med = n_records // len(MEDICINE_CATALOG)
    remainder = n_records % len(MEDICINE_CATALOG)
    
    season_map = {
        12: "Winter", 1: "Winter", 2: "Winter",
        3: "Spring", 4: "Spring", 5: "Spring",
        6: "Summer", 7: "Summer", 8: "Summer",
        9: "Autumn", 10: "Autumn", 11: "Autumn"
    }

    # Common holidays (approximate calendar distribution)
    holiday_days = {
        (1, 1), (1, 26), (3, 25), (5, 1), (8, 15), (10, 2), (10, 24), (11, 12), (12, 25)
    }

    for med_idx, med in enumerate(MEDICINE_CATALOG):
        count = records_per_med + (1 if med_idx < remainder else 0)
        
        # Sample dates
        sampled_dates = np.random.choice(date_range, size=count, replace=True)
        sampled_dates.sort()
        
        for dt in sampled_dates:
            dt_obj = pd.to_datetime(dt)
            month = dt_obj.month
            season = season_map[month]
            is_holiday = 1 if (month, dt_obj.day) in holiday_days or dt_obj.weekday() in [5, 6] else 0
            
            # Base patient census (mean ~350, std ~60)
            patient_count = int(np.clip(np.random.normal(360, 55), 180, 600))
            
            # Emergency admissions (mean ~25, std ~12)
            emergency_base = 25 + (10 if is_holiday else 0)
            emergency_cases = int(np.clip(np.random.normal(emergency_base, 10), 5, 85))
            
            # Supplier lead time (days) with logistic variation
            lead_time = int(np.clip(np.random.poisson(med["default_lead_time"]), 1, 18))
            
            # Base daily usage
            base_usage = med["base_daily_usage"]
            
            # Seasonal factor for this medicine
            seasonal_factor = 1.0
            if med["seasonal_sensitivity"] == season:
                seasonal_factor = 1.35 + np.random.uniform(0.05, 0.25)
            elif med["seasonal_sensitivity"] != "None":
                seasonal_factor = 0.85 + np.random.uniform(-0.05, 0.10)
            else:
                seasonal_factor = 1.0 + np.random.uniform(-0.08, 0.08)
                
            # Emergency multiplier
            emergency_effect = (emergency_cases / 25.0) * (med["emergency_sensitivity"] - 1.0)
            
            # Patient volume multiplier
            patient_multiplier = patient_count / 350.0
            
            # Daily usage on this specific date
            usage_noise = np.random.normal(1.0, 0.08)
            daily_usage = int(np.clip(base_usage * patient_multiplier * usage_noise, 10, 500))
            
            # Target Demand calculation (ground truth demand with realistic physical factors)
            demand_calc = (
                daily_usage * seasonal_factor * (1.0 + emergency_effect * 0.4)
                + (emergency_cases * med["emergency_sensitivity"] * 1.5)
                + (15 if is_holiday else 0)
                + np.random.normal(0, base_usage * 0.05)
            )
            demand = int(np.clip(round(demand_calc), 15, 950))
            
            # Hospital stock levels simulate realistic stock cycles (e.g. 1 to 14 days of supply)
            stock_days = np.random.exponential(scale=5.5) + 0.8
            current_stock = int(np.clip(daily_usage * stock_days + np.random.normal(0, 20), 0, 3500))
            
            # Feature engineering
            stock_coverage_ratio = round(current_stock / max(daily_usage, 1.0), 2)
            lead_time_demand = round(daily_usage * lead_time, 2)
            emergency_ratio = round(emergency_cases / max(patient_count, 1.0), 4)
            
            records.append({
                "Date": dt_obj.strftime("%Y-%m-%d"),
                "Medicine": med["name"],
                "Category": med["category"],
                "Current_Stock": current_stock,
                "Daily_Usage": daily_usage,
                "Patient_Count": patient_count,
                "Emergency_Cases": emergency_cases,
                "Season": season,
                "Holiday": is_holiday,
                "Supplier_Lead_Time": lead_time,
                "Stock_Coverage_Ratio": stock_coverage_ratio,
                "Lead_Time_Demand": lead_time_demand,
                "Emergency_Ratio": emergency_ratio,
                "Seasonal_Factor": round(seasonal_factor, 3),
                "Demand": demand
            })

    df = pd.DataFrame(records)
    # Shuffle dataset
    df = df.sample(frac=1.0, random_state=random_seed).reset_index(drop=True)
    return df

if __name__ == "__main__":
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
    os.makedirs(output_dir, exist_ok=True)
    csv_path = os.path.join(output_dir, "hospital_inventory_10k.csv")
    
    print(f"Generating 10,000 hospital inventory records...")
    df = generate_hospital_dataset(10000)
    df.to_csv(csv_path, index=False)
    print(f"Dataset generated successfully at: {csv_path}")
    print(f"Total rows: {len(df)}, Total columns: {len(df.columns)}")
    print(df.head(3))
