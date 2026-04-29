# AEGIS EYE (C2A Project)

## 📡 Platform Overview
**AEGIS EYE** is a comprehensive disaster management and response platform. It integrates satellite intelligence, drone-based computer vision, and predictive machine learning to provide first responders with a unified command and control interface for disaster mitigation and search-and-rescue.

---

## 🛠 Active Modules

### **1. Rescue Path Optimizer (v1.0 Stable)**
*   **Purpose:** Planning safe extraction routes in rugged mountain terrain.
*   **Logic:** Hybrid system using OSRM Foot Profile for road/trail tracking and a direct-line fail-safe for off-road segments.
*   **Control HUD:** Interactive "Draw Danger" mode to mark active threats, real-time distance/time telemetry, and safety audit scores.

### **2. Landslide Prediction Engine (Pre-Event Area Scans)**
*   **Framework:** Machine Learning analysis of high-fidelity area scans captured *before* a potential landslide event.
*   **Algorithm:** `RandomForestRegressor` (100 estimators) for continuous risk assessment.
*   **Predictive Data Points:**
    *   **In-Situ Monitoring:** Precipitation-over-time (7-day rainfall history), soil moisture, and ground instability (crack detection).
    *   **Geological Profiling:** Slope angle (max 45°), vegetation health, and soil score.
*   **Frontend Dashboard:** Gauges for risk probability and **Radar Analytics** to identify which factor (Soil vs. Rain vs. Slope) is the primary threat driver for a specific coordinate.

### **3. Flood Monitoring & Hydrological Analysis**
*   **Purpose:** Predicting water-level surges and flood-plain expansion during heavy rainfall.
*   **Hydrological Metrics:**
    *   **River Dynamics:** 7-day river level tracking and **River Trend** analysis (Rising vs. Stable vs. Falling).
    *   **Terrain Profile:** Elevation-based risk mapping and proximity-to-river distance analysis.
    *   **Environmental Flux:** Water spread trends and saturated soil moisture monitoring.
*   **Data Visualization:**
    *   **Zonal Manifests:** Dynamic loading of location-specific flood datasets.
    *   **Rainfall-to-River Correlation:** Interactive bar charts showing cumulative rainfall impact on local river surges.
    *   **Risk Zone Table:** Precise lat/long coordinates flagged for high "Flood Likely" probability.

### **4. Human Detection & Pose Analysis (Computer Vision)**
*   **Algorithm:** `Faster R-CNN` with a custom CNN backbone.
*   **Model:** Trained on the **C2A Dataset**, optimized for aerial human detection in complex disaster perimeters.
*   **Rescue HUD:** Real-time victim tally, **Thermal Simulation** maps for low-visibility search, and bounding-box coordinate tracking for pose and location identification.

---

## 📦 Technical Stack
*   **Frontend:** React (Vite), Tailwind CSS, Framer Motion (Animations), Recharts (Hydrological/Geological graphs).
*   **Mapping:** Leaflet & Esri ArcGIS Infrastructure.
*   **AI/ML:** PyTorch (CV), Scikit-Learn (Predictive Regressors), PapaParse (Predictive Data Handling).
*   **Navigation:** OSRM (Open Source Routing Machine).

---

## 🚀 Mission Status
The platform is currently in **Prototype Integration** phase.
*   **Rescue Path Optimizer:** Stable v1.0.
*   **Landslide & Flood Prediction:** Data-ready with AI regression models.
*   **Human Detection:** Fully integrated with live-camera drone simulation.
