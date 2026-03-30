

## Landslide Prediction Module

### Overview
Replace the placeholder page for `/simulation/landslide-prediction` with a full module that:
1. Lists all zone folders from `backend/landslide/` as selectable datasets
2. On selection, parses `predictions.csv` from that zone
3. Displays an interactive map, analytics cards, and a 7-day rainfall chart

### Data Architecture
The CSV files live in `backend/landslide/` as static assets. Since this is a client-side app, we need to:
- Create a manifest file (`backend/landslide/manifest.json`) listing available zone folders and their display names
- Import/fetch the CSV files at runtime using Vite's static asset handling
- Move or alias `backend/landslide/` into `public/data/landslide/` so files are servable

### Files to Create/Modify

**1. `public/data/landslide/manifest.json`** (new)
Lists available datasets. When you add a new zone, just add an entry here.
```json
[
  { "id": "zone1-data", "name": "Zone 1", "folder": "zone1 data" }
]
```

**2. Copy CSV data to `public/data/landslide/zone1 data/`**
Copy `predictions.csv` (and optionally other CSVs) so they're fetchable from the browser.

**3. `src/pages/LandslidePrediction.tsx`** (new) — Main module page with two states:

**State A — Dataset Selection:**
- Header with back button to `/simulation`
- Grid of dataset cards read from `manifest.json`
- Each card shows zone name, click to load

**State B — Dashboard (after selecting a dataset):**
- **Map**: Embed a Leaflet map (using `react-leaflet`) centered on the lat/lon from predictions.csv, with markers for each data point colored by risk level
- **Risk Summary Cards**: Average risk %, soil moisture, slope, soil score, river distance, vegetation, crack scores — computed from predictions.csv
- **7-Day Rainfall Chart**: Bar/line chart using Recharts (already available) showing rain_day1 through rain_day7
- **Data Table**: Scrollable table of all prediction rows with risk highlighted

**4. `src/App.tsx`** — Update route for landslide prediction to use the new page instead of ModulePlaceholder

**5. Install `react-leaflet` + `leaflet`** for the interactive map

### Component Breakdown

```text
LandslidePrediction
├── Dataset Selector (grid of zone cards from manifest.json)
└── Dashboard (shown after dataset selected)
    ├── Back to dataset selector button
    ├── Map (react-leaflet, markers colored by risk_percent)
    ├── Stats Cards (avg risk, soil moisture, slope, etc.)
    ├── Rainfall Chart (Recharts BarChart, 7 days)
    └── Predictions Table (all rows, risk color-coded)
```

### How Adding New Zones Works
1. Add a new folder in `public/data/landslide/` (e.g., `zone2 data/`) with a `predictions.csv`
2. Add an entry to `manifest.json`
3. Everything auto-renders — the dashboard reads columns dynamically from the CSV

### Technical Details
- CSV parsing: use `papaparse` (lightweight CSV parser) or a simple fetch + split approach
- Map tiles: OpenStreetMap via Leaflet (free, no API key)
- Charts: Recharts (already in project via the chart.tsx component)
- All styling follows existing dark theme with cyan glow effects

