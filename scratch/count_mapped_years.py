import json
import re
import pandas as pd
from collections import Counter

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

target_cats = set()
for cats in topic_map.values():
    target_cats.update(cats)

counts = Counter()
processed = 0

with open("data.json", "r", encoding="utf-8") as f:
    for line in f:
        processed += 1
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
            if 2000 <= year <= 2024:
                counts[year] += 1
        except Exception:
            pass

for year in sorted(counts.keys()):
    print(f"{year}: {counts[year]}")
