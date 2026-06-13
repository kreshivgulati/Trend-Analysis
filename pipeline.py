import json
import re
import os
import sys
import numpy as np
import pandas as pd
import joblib
import xgboost as xgb
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# -------------------------------------------------------------
# STEP 1 — DATA LOADING & PREPROCESSING
# -------------------------------------------------------------
print("STEP 1 — DATA LOADING & PREPROCESSING")

topic_map = {
    # AI & Machine Learning
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

    # Systems & Networks
    "Edge Computing":              ["cs.NI", "cs.DC", "cs.SY", "cs.AR"],
    "Distributed Systems":         ["cs.DC", "cs.NI", "cs.OS"],
    "Network Optimization":        ["cs.NI", "cs.SY", "math.OC"],
    "MLSys / ML Systems":          ["cs.LG", "cs.DC", "cs.AR", "cs.PF", "cs.MS", "stat.ML"],
    "Resource Allocation":         ["cs.NI", "cs.SY", "cs.DC", "cs.PF"],
    "Cloud Computing":             ["cs.DC", "cs.NI", "cs.AR"],
    "Autonomous Systems":          ["cs.RO", "cs.SY", "cs.AI"],

    # Security & Privacy
    "Cybersecurity":               ["cs.CR", "cs.NI"],
    "Differential Privacy":        ["cs.CR", "cs.LG", "stat.ML"],
    "Adversarial ML":              ["cs.LG", "cs.CR", "cs.CV"],

    # Other CS
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

# Collect all category codes of interest for initial filtering
target_cats = set()
for cats in topic_map.values():
    target_cats.update(cats)

if not os.path.exists("data.json"):
    print("Error: data.json not found in the current directory.")
    sys.exit(1)

records = []
processed_count = 0

with open("data.json", "r", encoding="utf-8") as f:
    for line in f:
        processed_count += 1
        if processed_count % 100000 == 0:
            print(f"Loaded {processed_count} records...")
        try:
            item = json.loads(line)
            
            # Initial fast filtering of categories
            cats_str = item.get("categories", "")
            if not cats_str:
                continue
            paper_cats = cats_str.split()
            if not any(cat in target_cats for cat in paper_cats):
                continue
                
            versions = item.get("versions")
            if not versions or not isinstance(versions, list) or len(versions) == 0:
                continue
                
            created_str = versions[0].get("created")
            if not created_str:
                continue
                
            # Regex search for 4-digit years between 2000 and 2024
            match = re.search(r"\b(19\d{2}|20\d{2})\b", created_str)
            if not match:
                continue
            year = int(match.group(1))
            
            if 2000 <= year <= 2024:
                records.append({
                    "id": item.get("id"),
                    "year": year,
                    "categories": cats_str,
                    "title": item.get("title"),
                    "abstract": item.get("abstract")
                })
        except Exception:
            pass

print(f"Data loading complete. Total records processed: {processed_count:,}. Records kept (years 2000-2024): {len(records):,}.")
year_counts = pd.Series([r["year"] for r in records]).value_counts().sort_index()
print("Records per year:")
for y, c in year_counts.items():
    print(f"  {y}: {c}")

# -------------------------------------------------------------
# STEP 2 — TOPIC MAPPING
# -------------------------------------------------------------
print("\nSTEP 2 — TOPIC MAPPING")

def assign_topics(categories_str):
    if not categories_str:
        return []
    
    # arXiv format: "cs.LG cs.AI stat.ML"
    cats = categories_str.strip().split()
    primary_cat = cats[0]    # first category is most important
    
    matched = []
    for topic, topic_cats in topic_map.items():
        # Primary category match = strong signal
        if primary_cat in topic_cats:
            matched.append((topic, 2))   # weight 2
        # Secondary category match = weak signal  
        elif any(c in topic_cats for c in cats[1:]):
            matched.append((topic, 1))   # weight 1
    
    # Return topics sorted by weight
    matched.sort(key=lambda x: x[1], reverse=True)
    return [t for t, w in matched]

mapped_records = []
for rec in records:
    topics = assign_topics(rec["categories"])
    for topic in topics:
        mapped_records.append({
            "paper_id": rec["id"],
            "year": rec["year"],
            "topic": topic
        })

df_mapped = pd.DataFrame(mapped_records)
print(f"Mapped DataFrame built. Shape: {df_mapped.shape}")

# -------------------------------------------------------------
# STEP 3 — FEATURE ENGINEERING
# -------------------------------------------------------------
print("\nSTEP 3 — FEATURE ENGINEERING")

# Group by topic and year to count papers
grouped = df_mapped.groupby(["topic", "year"]).size().reset_index(name="papers_count")

# Create a MultiIndex of all topics and years from 2000 to 2024
all_topics = list(topic_map.keys())
all_years = list(range(2000, 2025))
idx = pd.MultiIndex.from_product([all_topics, all_years], names=["topic", "year"])
features_df = grouped.set_index(["topic", "year"]).reindex(idx, fill_value=0).reset_index()

# Sort by topic and year to ensure proper rolling and shift operations
features_df = features_df.sort_values(by=["topic", "year"]).reset_index(drop=True)

# 1. papers_count (reindexed above)
# 2. citation_proxy: sum of (2024 - year + 1) for each paper
features_df["citation_proxy"] = features_df["papers_count"] * (2024 - features_df["year"] + 1)

# Helper function to compute growth rate safely
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

# 3. pub_growth_rate
features_df["pub_growth_rate"] = features_df.groupby("topic")["papers_count"].transform(compute_growth_rate)

# 4. citation_growth_rate
features_df["citation_growth_rate"] = features_df.groupby("topic")["citation_proxy"].transform(compute_growth_rate)

# 5. rolling_avg_3yr: 3-year rolling average of papers_count
features_df["rolling_avg_3yr"] = features_df.groupby("topic")["papers_count"].transform(
    lambda x: x.rolling(window=3, min_periods=1).mean()
)

# 6. momentum: papers_count[year] / rolling_avg_3yr
with np.errstate(divide='ignore', invalid='ignore'):
    features_df["momentum"] = np.where(
        (features_df["rolling_avg_3yr"] == 0) | np.isnan(features_df["rolling_avg_3yr"]),
        0.0,
        features_df["papers_count"] / features_df["rolling_avg_3yr"]
    )

# Only compute trend score for years with at least 10 papers
features_df = features_df[features_df["papers_count"] >= 10].reset_index(drop=True)

print(f"Feature engineering completed. Shape: {features_df.shape}")

# -------------------------------------------------------------
# STEP 4 — TREND SCORE
# -------------------------------------------------------------
print("\nSTEP 4 — TREND SCORE")

def compute_trend_score(df):
    """
    Score based on MOMENTUM and ACCELERATION,
    not absolute paper count.
    Big fields with slowing growth score lower.
    Small fields with fast growth score higher.
    """
    # Sort for correct rolling calculations
    df = df.sort_values(['topic', 'year']).copy()
    
    # Growth rate: how fast is this topic growing THIS year
    df['pub_growth'] = df.groupby('topic')['papers_count']\
        .pct_change().fillna(0)
    
    # Acceleration: is growth speeding up or slowing down
    df['acceleration'] = df.groupby('topic')['pub_growth']\
        .diff().fillna(0)
    
    # Momentum: current vs 3yr average
    df['rolling_3yr'] = df.groupby('topic')['papers_count']\
        .transform(lambda x: x.rolling(3, min_periods=1).mean())
    df['momentum'] = (df['papers_count'] / df['rolling_3yr'])\
        .fillna(1)
    
    # Citation proxy: older papers cited more
    df['citation_proxy'] = df.apply(
        lambda r: r['papers_count'] * (2023 - r['year'] + 1),
        axis=1
    )
    
    # Recency bonus: recent years matter more
    df['recency_weight'] = (df['year'] - df['year'].min()) / \
        (df['year'].max() - df['year'].min())
    
    # Normalize each component to 0-1
    from sklearn.preprocessing import MinMaxScaler
    
    components = {
        'pub_growth':     0.30,   # growth rate
        'acceleration':   0.20,   # speeding up?
        'momentum':       0.20,   # above average?
        'citation_proxy': 0.15,   # citation weight
        'recency_weight': 0.15,   # recent activity
    }
    
    for col in components:
        vals = df[col].values.reshape(-1, 1)
        df[col + '_norm'] = MinMaxScaler((0,1))\
            .fit_transform(vals).flatten()
    
    # Weighted score
    df['trend_score'] = sum(
        df[col + '_norm'] * w
        for col, w in components.items()
    ) * 100
    
    # Final spread to 15-90 range
    df['trend_score'] = MinMaxScaler((15, 90))\
        .fit_transform(df[['trend_score']]).flatten()
    
    return df

features_df = compute_trend_score(features_df)
scaler = MinMaxScaler()
print("Trend Score calculated successfully.")

# -------------------------------------------------------------
# STEP 5 — MODEL TRAINING
# -------------------------------------------------------------
print("\nSTEP 5 — MODEL TRAINING")

train_df = features_df.copy()
train_df = train_df.sort_values(['topic', 'year'])

train_df['next_growth'] = train_df.groupby('topic')\
    ['pub_growth'].shift(-1)

train_df['next_score'] = train_df.groupby('topic')\
    ['trend_score'].shift(-1)

# Use next_score as target but clip to prevent extremes
train_df['target'] = train_df['next_score'].clip(
    lower=train_df['trend_score'] * 0.7,   # max 30% drop
    upper=train_df['trend_score'] * 1.5    # max 50% rise
)

train_df = train_df.dropna(subset=['target'])

print(f"Target range: {train_df['target'].min():.1f}"
      f" to {train_df['target'].max():.1f}")
print(f"Target mean:  {train_df['target'].mean():.1f}")

feature_cols = ["papers_count", "citation_proxy", "pub_growth_rate", "citation_growth_rate", "rolling_avg_3yr", "momentum", "year"]
X = train_df[feature_cols]
y = train_df["target"]

# Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = xgb.XGBRegressor(
    n_estimators=300,
    learning_rate=0.03,
    max_depth=3,          # shallower = less overfitting
    subsample=0.7,
    colsample_bytree=0.7,
    min_child_weight=5,   # prevents learning from tiny groups
    gamma=0.1,            # regularization
    reg_alpha=0.1,        # L1
    reg_lambda=1.0,       # L2
    random_state=42
)
model.fit(X_train, y_train)

# Metrics
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f"Train/Test Split: 80/20")
print(f"MAE: {mae:.4f}")
print(f"RMSE: {rmse:.4f}")
print(f"R² score: {r2:.4f}")

# Save the model and MinMaxScaler
joblib.dump(model, "trend_model.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(features_df, "topic_features.pkl")
print("Model saved as trend_model.pkl")
print("MinMaxScaler saved as scaler.pkl")
print("Features DataFrame saved as topic_features.pkl")

# Save to backend/ as well
backend_dir = "backend"
if os.path.exists(backend_dir):
    joblib.dump(model, os.path.join(backend_dir, "trend_model.pkl"))
    joblib.dump(scaler, os.path.join(backend_dir, "scaler.pkl"))
    joblib.dump(features_df, os.path.join(backend_dir, "topic_features.pkl"))
    print("Saved files to backend/ as well.")

import joblib
topic_year_df = features_df
joblib.dump(topic_year_df, "topic_features.pkl")
if os.path.exists(backend_dir):
    joblib.dump(topic_year_df, os.path.join(backend_dir, "topic_features.pkl"))
print("All pkl files saved successfully.")

# -------------------------------------------------------------
# STEP 6 — PREDICTION FUNCTION
# -------------------------------------------------------------
def predict_topic(topic_name: str):
    # 1. Lookup topic in topic_map (case-insensitive, partial match)
    topic_clean = topic_name.lower().strip()
    matches = [t for t in topic_map.keys() if topic_clean in t.lower()]
    
    if not matches:
        print(f"Error: Topic '{topic_name}' not found.")
        return
        
    matched_topic = matches[0]
    if len(matches) > 1:
         print(f"Multiple matches found: {matches}. Using '{matched_topic}'.")
    
    # 2. Get the most recent year's feature row (usually 2024)
    topic_data = features_df[features_df["topic"] == matched_topic]
    if topic_data.empty:
        print(f"Error: No data available for topic '{matched_topic}'.")
        return
        
    recent_row = topic_data.sort_values(by="year").iloc[-1]
    recent_year = recent_row["year"]
    last_actual = recent_row["trend_score"]
    
    # 3. Predict next year's trend_score using the saved model
    try:
        loaded_model = joblib.load("trend_model.pkl")
    except Exception as e:
        print(f"Error loading model: {e}")
        return
        
    X_pred = pd.DataFrame([recent_row[feature_cols]])
    predicted = float(loaded_model.predict(X_pred)[0])
    
    # 4. Compute expected growth % = (predicted - last_actual) / last_actual * 100
    if last_actual == 0:
        growth_pct = 0.0
    else:
        growth_pct = (predicted - last_actual) / last_actual * 100
        
    # 5. Assign future_potential label
    if predicted >= 80:
        potential = "Very High"
    elif predicted >= 60:
        potential = "High"
    elif predicted >= 40:
        potential = "Moderate"
    else:
        potential = "Low"
        
    # 6. Print results
    growth_sign = "+" if growth_pct >= 0 else ""
    print(f"\nPredicted Trend Score: {predicted:.1f}")
    print(f"Expected Growth: {growth_sign}{growth_pct:.1f}%")
    print(f"Future Potential: {potential}")

# -------------------------------------------------------------
# STEP 7 — INTERACTIVE LOOP
# -------------------------------------------------------------
if __name__ == "__main__":
    predict_topic("MLSys / ML Systems")
