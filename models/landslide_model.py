import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

df = pd.read_csv("../data/final_dataset.csv")

# Features
X = df[[
    "rain_day1", "rain_day2", "rain_day3",
    "rain_day4", "rain_day5", "rain_day6", "rain_day7",
    "soil_moisture",
    "slope",
    "soil_score",
    "river_distance",
    "vegetation",
    "crack"
]]

# 🧠 Create continuous risk score (0–1)
df["risk_score"] = (
    0.3 * df["crack"] +
    0.3 * (1 - df["vegetation"]) +
    0.2 * (df["slope"] / 45) +
    0.2 * (df["soil_moisture"])
)

y = df["risk_score"]

# Train regressor
model = RandomForestRegressor(n_estimators=100)
model.fit(X, y)

# Save
os.makedirs("../models", exist_ok=True)
joblib.dump(model, "../models/model.pkl")

print("✅ Regression model trained!")