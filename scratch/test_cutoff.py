import json
import re
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

# Let's load the records once to make it fast
records = []
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

target_cats = set()
for cats in topic_map.values():
    target_cats.update(cats)

with open("data.json", "r", encoding="utf-8") as f:
    for line in f:
        try:
            item = json.loads(line)
            cats_str = item.get("categories", "")
            if not cats_str:
                continue
            paper_cats = cats_str.split()
            if not any(cat in target_cats for cat in paper_cats):
                continue
            versions = item.get("versions")
            if not versions:
                continue
            created_str = versions[0].get("created")
            if not created_str:
                continue
            match = re.search(r"\b(19\d{2}|20\d{2})\b", created_str)
            if not match:
                continue
            year = int(match.group(1))
            records.append((item.get("id"), year, cats_str))
        except Exception:
            pass

def run_experiment(max_year):
    print(f"\n--- Running Experiment for Max Year = {max_year} ---")
    filtered_records = [r for r in records if 2000 <= r[1] <= max_year]
    
    # Topic Mapping
    mapped = []
    for pid, year, cats_str in filtered_records:
        cats = cats_str.strip().split()
        primary_cat = cats[0]
        for topic, topic_cats in topic_map.items():
            if primary_cat in topic_cats:
                mapped.append((topic, year))
            elif any(c in topic_cats for c in cats[1:]):
                mapped.append((topic, year))
                
    df_mapped = pd.DataFrame(mapped, columns=["topic", "year"])
    
    # Feature Engineering
    grouped = df_mapped.groupby(["topic", "year"]).size().reset_index(name="papers_count")
    all_topics = list(topic_map.keys())
    all_years = list(range(2000, max_year + 1))
    idx = pd.MultiIndex.from_product([all_topics, all_years], names=["topic", "year"])
    features_df = grouped.set_index(["topic", "year"]).reindex(idx, fill_value=0).reset_index()
    features_df = features_df.sort_values(by=["topic", "year"]).reset_index(drop=True)
    
    features_df["citation_proxy"] = features_df["papers_count"] * (max_year - features_df["year"] + 1)
    
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
    
    features_df["target_trend_score"] = features_df.groupby("topic")["trend_score"].shift(-1)
    train_df = features_df.dropna(subset=["target_trend_score"]).copy()
    
    feature_cols = ["papers_count", "citation_proxy", "pub_growth_rate", "citation_growth_rate", "rolling_avg_3yr", "momentum", "year"]
    X = train_df[feature_cols]
    y = train_df["target_trend_score"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.05,
        random_state=42,
        objective="reg:squarederror"
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"MAE: {mae:.4f}")
    print(f"R2 score: {r2:.4f}")

run_experiment(2024)
run_experiment(2023)
run_experiment(2022)
