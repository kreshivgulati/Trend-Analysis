import json
import re
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error

topic_map = {
    "Generative AI":               ["cs.LG", "cs.AI", "cs.CV", "cs.NE"],
    "Natural Language Processing": ["cs.CL", "cs.IR", "cs.AI"],
    "Computer Vision":             ["cs.CV", "cs.LG", "cs.GR"],
    "Reinforcement Learning":      ["cs.LG", "cs.AI", "cs.SY", "stat.ML"],
    "Explainable AI":              ["cs.AI", "cs.LG", "cs.HC"],
    "Federated Learning":          ["cs.LG", "cs.DC", "cs.CR", "stat.ML"],
    "Deep Learning":               ["cs.LG", "cs.NE", "stat.ML"],
    "Graph Neural Networks":       ["cs.LG", "cs.SI", "cs.NE"],
    "Transfer Learning":           ["cs.LG", "cs.CV", "cs.CL"],
    "AutoML":                      ["cs.LG", "stat.ML", "cs.AI"],
    "Edge Computing":              ["cs.NI", "cs.DC", "cs.SY", "cs.AR"],
    "Distributed Systems":         ["cs.DC", "cs.NI", "cs.OS"],
    "Network Optimization":        ["cs.NI", "cs.SY", "math.OC"],
    "MLSys / ML Systems":          ["cs.LG", "cs.DC", "cs.AR", "cs.PF", "cs.MS", "stat.ML"],
    "Resource Allocation":         ["cs.NI", "cs.SY", "cs.DC", "cs.PF"],
    "Cloud Computing":             ["cs.DC", "cs.NI", "cs.AR"],
    "Autonomous Systems":          ["cs.RO", "cs.SY", "cs.AI"],
    "Cybersecurity":               ["cs.CR", "cs.NI"],
    "Differential Privacy":        ["cs.CR", "cs.LG", "stat.ML"],
    "Adversarial ML":              ["cs.LG", "cs.CR", "cs.CV"],
    "Quantum Computing":           ["quant-ph", "cs.ET"],
    "Robotics":                    ["cs.RO", "cs.SY", "cs.AI"],
    "Bioinformatics":              ["cs.LG", "q-bio.GN", "q-bio.QM"],
    "Time Series Forecasting":     ["cs.LG", "stat.ML", "econ.EM"],
    "Optimization":                ["math.OC", "cs.LG", "stat.ML"],
    "Financial ML":                ["q-fin.CP", "q-fin.TR", "cs.LG"],
    "Human Computer Interaction":  ["cs.HC", "cs.AI", "cs.CY"],
    "Software Engineering":        ["cs.SE", "cs.PL", "cs.LG"],
    "Computer Architecture":       ["cs.AR", "cs.DC", "cs.OS"],
}

print("Loading data...")
records = []
with open("data.json", "r", encoding="utf-8") as f:
    for line in f:
        item = json.loads(line)
        cats_str = item.get("categories", "")
        if not cats_str:
            continue
        versions = item.get("versions", [])
        if not versions:
            continue
        created_str = versions[0].get("created", "")
        match = re.search(r"\b(20\d\d)\b", created_str)
        if not match:
            continue
        year = int(match.group(1))
        if year < 2000 or year > 2024:
            continue
        
        records.append({
            "id": item.get("id"),
            "year": year,
            "categories": cats_str
        })

print(f"Loaded {len(records)} records.")

def assign_topics_split(categories_str):
    if not categories_str:
        return []
    cats = categories_str.strip().split()
    primary_cat = cats[0]
    
    super_cats = {"cs.LG", "stat.ML", "cs.AI"}
    general_topics = {"Deep Learning", "AutoML", "Generative AI", "Reinforcement Learning", "Explainable AI"}
    
    matched = []
    for topic, topic_cats in topic_map.items():
        overlap = set(cats) & set(topic_cats)
        if not overlap:
            continue
        if overlap.issubset(super_cats):
            if topic not in general_topics:
                continue
        if primary_cat in topic_cats:
            matched.append((topic, 2))
        elif any(c in topic_cats for c in cats[1:]):
            matched.append((topic, 1))
            
    matched.sort(key=lambda x: x[1], reverse=True)
    return [t for t, w in matched]

print("Mapping topics...")
mapped_records = []
for rec in records:
    topics = assign_topics_split(rec["categories"])
    for t in topics:
        mapped_records.append({
            "paper_id": rec["id"],
            "year": rec["year"],
            "topic": t
        })

df_mapped = pd.DataFrame(mapped_records)

print("Engineering features...")
grouped = df_mapped.groupby(["topic", "year"]).size().reset_index(name="papers_count")
all_topics = list(topic_map.keys())
all_years = list(range(2000, 2025))
idx = pd.MultiIndex.from_product([all_topics, all_years], names=["topic", "year"])
features_df = grouped.set_index(["topic", "year"]).reindex(idx, fill_value=0).reset_index()
features_df = features_df.sort_values(by=["topic", "year"]).reset_index(drop=True)

features_df["citation_proxy"] = features_df["papers_count"] * (2024 - features_df["year"] + 1)

def compute_growth_rate(series):
    rates = [0.0]
    for i in range(1, len(series)):
        prev = series.iloc[i-1]
        curr = series.iloc[i]
        if prev == 0:
            rates.append(0.0)
        else:
            rates.append((curr - prev) / prev)
    return pd.Series(rates, index=series.index)

features_df["pub_growth_rate"] = features_df.groupby("topic")["papers_count"].transform(compute_growth_rate)
features_df["citation_growth_rate"] = features_df.groupby("topic")["citation_proxy"].transform(compute_growth_rate)
features_df["rolling_avg_3yr"] = features_df.groupby("topic")["papers_count"].transform(
    lambda x: x.rolling(window=3, min_periods=1).mean()
)

with np.errstate(divide='ignore', invalid='ignore'):
    features_df["momentum"] = np.where(
        (features_df["rolling_avg_3yr"] == 0) | np.isnan(features_df["rolling_avg_3yr"]),
        0.0,
        features_df["papers_count"] / features_df["rolling_avg_3yr"]
    )

features_df = features_df[features_df["papers_count"] >= 10].reset_index(drop=True)

scaler = MinMaxScaler()
components = ["papers_count", "citation_proxy", "pub_growth_rate", "citation_growth_rate", "momentum"]
scaled_components = scaler.fit_transform(features_df[components])

features_df["trend_score"] = (
    0.35 * scaled_components[:, 0] +
    0.25 * scaled_components[:, 1] +
    0.20 * scaled_components[:, 2] +
    0.10 * scaled_components[:, 3] +
    0.10 * scaled_components[:, 4]
) * 100

# Prepare model training targets
features_df["target_trend_score"] = features_df.groupby("topic")["trend_score"].shift(-1)

train_df = features_df.dropna(subset=["target_trend_score"])
X = train_df[components]
y = train_df["target_trend_score"]

model = xgb.XGBRegressor(objective="reg:squarederror", n_estimators=100, learning_rate=0.08, max_depth=5, random_state=42)
model.fit(X, y)

print("Predicting MLSys...")
mlsys_df = features_df[features_df["topic"] == "MLSys / ML Systems"]
print(mlsys_df.to_string())

recent_row = mlsys_df.sort_values(by="year").iloc[-1]
X_pred = pd.DataFrame([recent_row[components]])
predicted = float(model.predict(X_pred)[0])
last_actual = float(recent_row["trend_score"])
growth_pct = (predicted - last_actual) / last_actual * 100

print(f"\nMLSys Prediction for 2025:")
print(f"Actual 2024: {last_actual:.1f}")
print(f"Predicted 2025: {predicted:.1f}")
print(f"Expected Growth: {growth_pct:.1f}%")
