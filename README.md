# AEGIS EYE (C2A Platform)
### *Advanced Disaster Management & Predictive Intelligence System*

## 📝 About
**AEGIS EYE** is an end-to-end disaster intelligence platform designed to maximize the efficacy of search-and-rescue (SAR) missions. By combining real-time aerial computer vision with predictive geological modeling, the system provides a unified command-and-control interface that transforms raw drone telemetry into actionable life-saving intelligence.

---

## 📡 Platform Capabilities

### 1. **Rescue Path Optimizer**
A hybrid routing engine optimized for rugged, high-altitude terrain where traditional GPS navigation often fails.
*   **Live Routing:** Integrates OSRM Foot Profiles with direct-line fail-safes for off-road segments.
*   **Dynamic Danger Marking:** Real-time HUD allows operators to mark "Danger Zones" (e.g., active fires, unstable ground) which the router immediately bypasses.
*   **Telemetry Analytics:** Provides instant distance/time metrics and safety audit scores for every planned route.

### 2. **Landslide Susceptibility Intelligence**
A predictive engine that monitors geological instability using multi-factor sensor fusion.
*   **Predictive Modeling:** Utilizes a `RandomForestRegressor` (100 estimators) trained on high-fidelity area scans and historical geological data.
*   **Real-Time Data Points:** Fuses precipitation history, soil moisture levels, NDVI (vegetation health), and slope analysis.
*   **Risk Visualization:** Dynamic heatmaps and Radar Analytics identify the primary driver (Soil vs. Rain vs. Slope) for risk at any specific coordinate.

### 3. **Hydrological & Flood Monitoring**
Real-time analysis of river dynamics and terrain vulnerability to predict water-level surges.
*   **Trend Analysis:** Tracks 7-day river trends (Rising vs. Stable vs. Falling) to forecast flood-plain expansion.
*   **Rainfall-to-River Correlation:** Visualizes cumulative rainfall impact on local river surges using interactive hydrological charts.
*   **Risk Zone Manifest:** Generates precise coordinate manifest for high-probability flood zones.

### 4. **Aerial Computer Vision (Human Detection)**
Advanced computer vision suite optimized for drone-based search and rescue.
*   **Detection Engine:** Powered by `Faster R-CNN` with a custom CNN backbone, optimized for detecting victims in complex debris perimeters.
*   **Thermal Simulation:** Integrated thermal mapping for low-visibility environments.
*   **Rescue HUD:** Real-time victim tally, bounding-box tracking, and pose analysis to identify high-priority rescue targets.

---

## 🛠 Technical Architecture
*   **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Recharts.
*   **Mapping:** Leaflet Infrastructure with Esri ArcGIS integration.
*   **AI/ML Core:** PyTorch (Computer Vision), Scikit-Learn (Predictive Regressors).
*   **Navigation:** OSRM (Open Source Routing Machine).

---

## 🚀 Getting Started

### Data Processing & ML Engine
The intelligence core handles data ingestion and model serving.
1.  **Ingest Data:** `python backend/generate_data.py`
2.  **Train Intelligence Core:** `python backend/train_model.py`
3.  **Serve Predictions:** `python backend/predict.py`

### Live Dashboard
To launch the integrated command-and-control interface:
```bash
npm install
npm run dev
```

---
**Status:** Operational Prototype v1.2 | **Region Focus:** Uttarakhand / Himalayan Corridor
