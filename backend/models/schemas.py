"""
MEDISTOCK AI - Pydantic Request & Response Schemas
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator

class PredictionRequest(BaseModel):
    medicine: str = Field(..., description="Name of the medicine (e.g. Paracetamol 500mg)")
    category: Optional[str] = Field(None, description="Clinical category (e.g. Analgesics, Antibiotics)")
    current_stock: float = Field(..., ge=0, description="Current hospital inventory on hand")
    daily_usage: float = Field(..., ge=0, description="Average daily consumption rate")
    patient_count: int = Field(350, ge=0, description="Daily in-patient and out-patient census")
    emergency_cases: int = Field(25, ge=0, description="Emergency department admissions")
    season: str = Field("Winter", description="Current season (Winter, Spring, Summer, Autumn)")
    holiday: int = Field(0, ge=0, le=1, description="Holiday / weekend indicator (1=Yes, 0=No)")
    supplier_lead_time: float = Field(5.0, ge=0.5, le=30.0, description="Supplier lead time in days")
    model_type: Optional[str] = Field("Linear Regression", description="Selected ML model")

    @field_validator("season")
    @classmethod
    def validate_season(cls, v: str) -> str:
        valid_seasons = ["Winter", "Spring", "Summer", "Autumn"]
        if v.capitalize() not in valid_seasons:
            return "Winter"
        return v.capitalize()

class ConfidenceInterval(BaseModel):
    lower: int
    upper: int
    confidence_level: str = "95%"

class PredictionResponse(BaseModel):
    medicine: str
    category: str
    current_stock: int
    daily_usage: float
    predicted_demand: int
    confidence_interval: ConfidenceInterval
    stock_gap: int
    stock_coverage_days: float
    lead_time_demand: float
    safety_stock: int
    required_stock: int
    reorder_quantity: int
    risk_score: float
    risk_level: str  # Healthy, Monitor, High Risk, Critical
    reorder_action: str
    ai_explanation: str
    clinical_justification: str
    model_used: str
    latency_ms: float

class InventoryItem(BaseModel):
    id: str
    medicine: str
    category: str
    unit: str
    unit_price: float
    current_stock: int
    daily_usage: float
    predicted_demand: int
    stock_gap: int
    stock_coverage_days: float
    supplier_lead_time: int
    lead_time_demand: float
    safety_stock: int
    reorder_quantity: int
    risk_score: float
    risk_level: str
    status: str
    recommended_action: str

class InventoryListResponse(BaseModel):
    total_items: int
    filtered_items: int
    summary_stats: Dict[str, Any]
    items: List[InventoryItem]

class RecommendationItem(BaseModel):
    id: str
    medicine: str
    category: str
    urgency: str  # Critical, High, Medium, Low
    current_stock: int
    predicted_demand: int
    shortage_gap: int
    reorder_quantity: int
    unit: str
    unit_price: float
    estimated_cost: float
    risk_score: float
    supplier_lead_time: int
    stockout_in_days: float
    ai_rationale: str
    suggested_action: str

class MetricDetail(BaseModel):
    name: str
    mae: float
    rmse: float
    r2_score: float
    mape: float
    status: str

class FeatureImportance(BaseModel):
    feature: str
    raw_feature: str
    rf_importance: float
    linear_weight: float

class ModelPerformanceResponse(BaseModel):
    dataset_summary: Dict[str, Any]
    selected_model: str
    selection_rationale: str
    models: Dict[str, MetricDetail]
    top_features: List[FeatureImportance]
    error_stats: Dict[str, Any]

class ForecastSeriesPoint(BaseModel):
    date: str
    historical_demand: Optional[int] = None
    predicted_demand: Optional[int] = None
    lower_bound: Optional[int] = None
    upper_bound: Optional[int] = None
    current_stock: Optional[int] = None
    safety_stock: Optional[int] = None

class MedicineForecastResponse(BaseModel):
    medicine: str
    category: str
    unit: str
    current_stock: int
    daily_usage: float
    supplier_lead_time: int
    predicted_demand: int
    reorder_quantity: int
    risk_level: str
    risk_score: float
    time_series: List[ForecastSeriesPoint]
    ai_summary: str

class AlertItem(BaseModel):
    id: str
    severity: str  # CRITICAL, HIGH, WARNING, INFO
    medicine: str
    title: str
    message: str
    timestamp: str
    suggested_action: str
