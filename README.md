# MEDISTOCK AI — AI-Powered Hospital Inventory Forecasting Platform

> **"Predict demand. Prevent shortages. Optimize hospital inventory."**

MediStock AI is an enterprise-grade hospital inventory forecasting and automated replenishment intelligence platform designed for clinical supply chains, hospital pharmacies, and healthcare administrators.

---

## 🏥 Problem Statement & Solution

Hospital pharmacies face severe supply chain vulnerabilities:
1. **Unpredictable Demand Surges**: Epidemic peaks, weather-driven morbidity, and trauma spikes cause stockouts of life-critical medicines.
2. **Lead Time Delays**: Extended supplier lead times mean reorders placed too late result in critical care disruptions.
3. **Overstocking vs Stockouts**: Overstocking risks expiration waste, while stockouts compromise patient safety.

**MediStock AI** solves this by uniting **Machine Learning Demand Prediction** with **Deterministic Supply Chain Safety Stock Logic** and **Clinical AI Briefings**.

---

## 🚀 Key Features & Modules

### 1. 📊 Executive Dashboard
- **6 Real-time KPIs**: Total Medicines (20 Formulary SKUs), Total Current Stock, Predicted Demand (+14.2%), Low Stock Items, Reorder Queue, Inventory Risk Index (0–100).
- **Interactive Multi-Horizon Chart**: Historical usage vs ML forecasted demand with 95% confidence intervals and safety-stock thresholds.
- **Formulary Health Distribution**: Real-time breakdown of Healthy, Monitor, High Risk, and Critical stockout states.
- **Top Demand Medicines & Replenishment Queue**: Priority-sorted items needing immediate purchase order generation.

### 2. 🔮 Clinical Demand Forecasting Simulator (`/forecast`)
- **Live ML Inference**: Interactive sliders for Patient Census, Emergency Admissions, Current Stock, Daily Usage, Season, Holiday/Weekend, and Supplier Lead Time.
- **Supply Chain Metrics**: Computes **Stock Gap**, **Stock Coverage (Days)**, **Lead Time Demand**, and **Recommended PO Quantity**.
- **Multi-Factor Risk Score (0–100)**: Transparent, explainable risk indicator categorized into Healthy, Monitor, High Risk, and Critical.
- **AI Clinical Briefing**: Contextual clinical summary explaining the exact reason for demand spikes and recommended procurement interventions.
- **Forward Depletion Simulation**: 7-day projected inventory trajectory.

### 3. 📦 Inventory Intelligence Hub (`/inventory`)
- **Full 20-Med Formulary**: Searchable, filterable by therapeutic category (Antibiotics, Analgesics, Antidiabetics, Cardiovascular, etc.) and risk level.
- **Multi-Column Sorting**: Sort by Risk Score, Current Stock, Predicted Demand, Days of Coverage, or Lead Time.
- **Coverage Progress Bars**: Visual indicator of remaining days of supply compared against supplier lead times.
- **CSV Export**: One-click download of the complete operational formulary state.

### 4. 📈 Visual Analytics & Correlations (`/analytics`)
- **Seasonal Demand Dynamics**: Winter vs Spring vs Summer vs Autumn consumption trends.
- **Therapeutic Category Breakdown**: Donut chart visualizing formulary distribution.
- **Emergency Case Sensitivity**: Direct visualization showing the +68% demand surge during emergency trauma spikes.
- **Patient Census vs Consumption Scatter**: 100 sample points demonstrating operational correlation.

### 5. 💡 Smart AI Recommendations (`/recommendations`)
- **Clinical Priority Queue**: Sorted by urgency and risk severity.
- **Financial Procurement Budgeting**: Calculates unit cost and total purchase order budget required.
- **One-Click PO Approval**: Interactive simulation to approve purchase orders.

### 6. 🧠 ML Model Performance & Transparency (`/performance`)
- **Selected Production Model**: **Linear Regression** (selected for instant sub-millisecond inference and high mathematical interpretability).
- **Benchmark Model**: **Random Forest Regression** (100 Trees, max depth 12).
- **Genuine Empirical Metrics (2,000 Hold-out Test Records)**:
  - Linear Regression: $R^2 = 0.9057$, $\text{MAE} = 12.701$, $\text{RMSE} = 18.006$, $\text{MAPE} = 8.10\%$
  - Random Forest: $R^2 = 0.9525$, $\text{MAE} = 9.566$, $\text{RMSE} = 12.782$, $\text{MAPE} = 5.94\%$
- **Feature Importance Ranking**: Gini / MDI importance bar chart.

### 7. 🚨 Operational Alerts Center (`/alerts`)
- Real-time surveillance of critical stockouts, emergency surge impacts, and supplier delivery delays.

---

## 📐 Machine Learning & Supply Chain Logic

### Feature Space (13 Input Features)
1. `Medicine`: Clinical medicine name (e.g. Paracetamol 500mg, Ceftriaxone 1g Inj)
2. `Category`: Therapeutic classification (e.g. Antibiotics, Analgesics, Cardiovascular)
3. `Current_Stock`: Physical units currently in hospital pharmacy
4. `Daily_Usage`: Baseline daily consumption rate
5. `Patient_Count`: In-patient and out-patient census
6. `Emergency_Cases`: Emergency department trauma/acute admissions
7. `Season`: Winter, Spring, Summer, Autumn
8. `Holiday`: 1 if holiday/weekend, 0 otherwise
9. `Supplier_Lead_Time`: Supplier replenishment fulfillment time (in days)
10. `Stock_Coverage_Ratio`: $\frac{\text{Current Stock}}{\max(\text{Daily Usage}, 1.0)}$
11. `Lead_Time_Demand`: $\text{Daily Usage} \times \text{Supplier Lead Time}$
12. `Emergency_Ratio`: $\frac{\text{Emergency Cases}}{\text{Patient Count}}$
13. `Seasonal_Factor`: Seasonal multiplier based on disease epidemiology

### Supply Chain Formulations
- **Stock Gap**: $\text{Stock Gap} = \text{Current Stock} - \text{Predicted Demand}$
- **Stock Coverage**: $\text{Stock Coverage (Days)} = \frac{\text{Current Stock}}{\max(\text{Daily Usage}, 0.1)}$
- **Lead-Time Demand**: $\text{Lead Time Demand} = \text{Daily Usage} \times \text{Supplier Lead Time}$
- **Safety Stock**: $\text{Safety Stock} = \max\left(15, 1.65 \times \sqrt{\text{Lead Time}} \times (\text{Daily Usage} \times 0.22) + \text{Emergency Cases} \times 0.8\right)$
- **Required Stock**: $\text{Required Stock} = \text{Predicted Demand} + \text{Safety Stock}$
- **Reorder Quantity**: $\text{Reorder Quantity} = \max(0, \text{Required Stock} - \text{Current Stock})$

### Multi-Factor Risk Score (0–100)
$$\text{Risk Score} = \text{Shortage Penalty (0–40)} + \text{Coverage Deficit (0–30)} + \text{Emergency Volatility (0–18)} + \text{Lead Time Risk (0–12)}$$
- `0 – 30`: **Healthy** (Adequate safety buffer)
- `31 – 60`: **Monitor** (Stable consumption)
- `61 – 80`: **High Risk** (Approaching lead-time threshold)
- `81 – 100`: **Critical** (Imminent stockout)

---

## 🛠️ Tech Stack

- **Backend**: Python 3.13, FastAPI, Pydantic v2, Scikit-Learn, Pandas, NumPy, Joblib, Uvicorn, Google GenAI SDK
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, Axios
- **Architecture**: Modular REST API with strict request validation and zero fake predictions.

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js v18+ and npm

### 2. Start the Backend API
```powershell
# Navigate to backend directory
cd c:\Projects\mlpbl\backend

# (Optional) Verify dataset & train models if needed:
python ml/dataset_generator.py
python ml/train.py

# Launch FastAPI server
python main.py
```
*API will run at:* `http://127.0.0.1:8000`  
*Swagger Documentation:* `http://127.0.0.1:8000/docs`

### 3. Start the Frontend
```powershell
# In a new terminal, navigate to frontend directory
cd c:\Projects\mlpbl\frontend

# Install dependencies (already installed)
npm install

# Start Vite dev server
npm run dev
```
*Frontend will run at:* `http://localhost:3000` (or `http://localhost:5173`)

---

## 📋 REST API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health and ML model pipeline status |
| `POST` | `/api/predict` | Live ML inference + Supply chain risk & reorder calculation |
| `GET` | `/api/medicines` | Catalog of 20 formulary medicines and metadata |
| `GET` | `/api/inventory` | Searchable, filterable inventory table |
| `GET` | `/api/forecast/{medicine}` | Historical time-series + 7-day future demand forecast |
| `GET` | `/api/analytics` | 10k dataset statistical aggregations and correlations |
| `GET` | `/api/recommendations` | Smart replenishment recommendations and budget analysis |
| `GET` | `/api/model-performance` | Actual ML test set evaluation metrics ($R^2$, MAE, RMSE) |
| `GET` | `/api/alerts` | Real-time clinical stockout and supply chain alerts |

---

## 🎯 Demo Presentation Flow (For Evaluators & Reviewers)

1. **Dashboard Overview**:
   - Highlight the 6 real KPI cards and explain how demand prediction prevents clinical stockouts.
   - Point out the interactive **Demand Forecast Chart** showing historical vs predicted vs safety stock envelope.
2. **Demo Presets (One-Click Scenarios)**:
   - Click **"Winter Flu Surge (Paracetamol)"** in the top bar.
   - Notice how the simulator instantly loads the winter infection scenario, runs live ML inference, and alerts of a 1.4-day stockout risk with an immediate reorder recommendation.
   - Click **"ICU Critical Antibiotic Shortage (Ceftriaxone)"** to show trauma emergency surges and 7-day supplier delay impacts.
3. **Forecasting Simulator**:
   - Move the **Emergency Cases** slider from 15 to 65.
   - Observe how the ML predicted demand immediately recalculates, the Stock Gap turns negative, and the AI explanation generates a tailored clinical briefing.
4. **Inventory Table**:
   - Filter by "Critical" or search "Amoxicillin". Show the inline coverage bars and CSV export.
5. **Analytics & Correlations**:
   - Showcase the empirical +57% Emergency Case correlation and Winter peak dynamics.
6. **Model Performance**:
   - Demonstrate the ML rigour: Linear Regression ($R^2 = 0.9057$) vs Random Forest ($R^2 = 0.9525$), actual MAE/RMSE metrics on 2,000 hold-out test samples, and feature importance rankings.
