"""
MEDISTOCK AI - Machine Learning Training Pipeline
Trains Linear Regression (Selected Model) and Random Forest Regression on 10k Hospital Records.
Computes genuine test metrics, feature importances, and exports production pipeline artifacts.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score, mean_absolute_percentage_error

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from utils.constants import FEATURE_COLUMNS, TARGET_COLUMN

CATEGORICAL_FEATURES = ["Medicine", "Category", "Season"]
NUMERICAL_FEATURES = [
    "Current_Stock",
    "Daily_Usage",
    "Patient_Count",
    "Emergency_Cases",
    "Holiday",
    "Supplier_Lead_Time",
    "Stock_Coverage_Ratio",
    "Lead_Time_Demand",
    "Emergency_Ratio",
    "Seasonal_Factor"
]

def train_and_evaluate():
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
    csv_path = os.path.join(data_dir, "hospital_inventory_10k.csv")
    
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}. Run dataset_generator.py first.")
        
    print(f"Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    print(f"Dataset shape: {df.shape}")
    
    # Feature columns check
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]
    
    # Train / Test split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"Train samples: {len(X_train)}, Test samples: {len(X_test)}")
    
    # Build Preprocessing Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES),
            ("num", StandardScaler(), NUMERICAL_FEATURES)
        ]
    )
    
    print("Fitting preprocessor...")
    X_train_transformed = preprocessor.fit_transform(X_train)
    X_test_transformed = preprocessor.transform(X_test)
    
    # Get transformed feature names
    cat_encoder = preprocessor.named_transformers_["cat"]
    cat_feature_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES))
    all_feature_names = cat_feature_names + NUMERICAL_FEATURES
    
    # 1. Train Linear Regression (Selected Primary Model)
    print("Training Linear Regression...")
    lin_reg = LinearRegression()
    lin_reg.fit(X_train_transformed, y_train)
    y_pred_lin = lin_reg.predict(X_test_transformed)
    
    mae_lin = float(mean_absolute_error(y_test, y_pred_lin))
    rmse_lin = float(root_mean_squared_error(y_test, y_pred_lin))
    r2_lin = float(r2_score(y_test, y_pred_lin))
    mape_lin = float(mean_absolute_percentage_error(y_test, y_pred_lin))
    
    print(f"Linear Regression -> MAE: {mae_lin:.3f}, RMSE: {rmse_lin:.3f}, R2: {r2_lin:.4f}, MAPE: {mape_lin:.4f}")
    
    # 2. Train Random Forest Regression
    print("Training Random Forest Regression...")
    rf_reg = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    rf_reg.fit(X_train_transformed, y_train)
    y_pred_rf = rf_reg.predict(X_test_transformed)
    
    mae_rf = float(mean_absolute_error(y_test, y_pred_rf))
    rmse_rf = float(root_mean_squared_error(y_test, y_pred_rf))
    r2_rf = float(r2_score(y_test, y_pred_rf))
    mape_rf = float(mean_absolute_percentage_error(y_test, y_pred_rf))
    
    print(f"Random Forest -> MAE: {mae_rf:.3f}, RMSE: {rmse_rf:.3f}, R2: {r2_rf:.4f}, MAPE: {mape_rf:.4f}")
    
    # Feature Importances extraction
    rf_importances = rf_reg.feature_importances_
    lin_coefs = np.abs(lin_reg.coef_)
    
    # Aggregate importances for top features
    feature_importance_list = []
    for name, imp, coef in zip(all_feature_names, rf_importances, lin_coefs):
        clean_name = name.replace("Medicine_", "Med: ").replace("Category_", "Cat: ").replace("Season_", "Season: ")
        feature_importance_list.append({
            "feature": clean_name,
            "raw_feature": name,
            "rf_importance": round(float(imp) * 100, 2),
            "linear_weight": round(float(coef), 2)
        })
    
    feature_importance_list.sort(key=lambda x: x["rf_importance"], reverse=True)
    top_feature_importances = feature_importance_list[:15]
    
    # Residual and error distribution
    residuals_lin = (y_test - y_pred_lin).values
    error_stats = {
        "mean_residual": round(float(np.mean(residuals_lin)), 3),
        "std_residual": round(float(np.std(residuals_lin)), 3),
        "max_error": round(float(np.max(np.abs(residuals_lin))), 3),
        "sample_actuals": [int(x) for x in y_test.iloc[:20].values],
        "sample_preds_lin": [round(float(x), 1) for x in y_pred_lin[:20]],
        "sample_preds_rf": [round(float(x), 1) for x in y_pred_rf[:20]]
    }
    
    metrics = {
        "dataset_summary": {
            "total_records": len(df),
            "train_records": len(X_train),
            "test_records": len(X_test),
            "features_count": len(FEATURE_COLUMNS),
            "target_variable": TARGET_COLUMN
        },
        "selected_model": "Linear Regression",
        "selection_rationale": "Linear Regression provides highly explainable coefficients, rapid sub-millisecond inference for hospital real-time queries, and optimal empirical convergence without overfitting on clinical census inputs.",
        "models": {
            "Linear Regression": {
                "name": "Linear Regression",
                "mae": round(mae_lin, 3),
                "rmse": round(rmse_lin, 3),
                "r2_score": round(r2_lin, 4),
                "mape": round(mape_lin * 100, 2),
                "status": "Selected (Primary Production Model)"
            },
            "Random Forest Regression": {
                "name": "Random Forest Regression",
                "mae": round(mae_rf, 3),
                "rmse": round(rmse_rf, 3),
                "r2_score": round(r2_rf, 4),
                "mape": round(mape_rf * 100, 2),
                "status": "Benchmark Comparison Model"
            }
        },
        "top_features": top_feature_importances,
        "error_stats": error_stats
    }
    
    # Save artifacts
    joblib.dump(preprocessor, os.path.join(data_dir, "preprocessor.joblib"))
    joblib.dump(lin_reg, os.path.join(data_dir, "model_linear.joblib"))
    joblib.dump(rf_reg, os.path.join(data_dir, "model_rf.joblib"))
    
    metrics_path = os.path.join(data_dir, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
        
    print(f"Artifacts saved successfully in {data_dir}")
    print("Training complete.")

if __name__ == "__main__":
    train_and_evaluate()
