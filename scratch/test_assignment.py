import json
import re

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

# Load the actual data for year 2024
records_2024 = []
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
        match = re.search(r"\b2024\b", created_str)
        if match:
            records_2024.append(cats_str)

print(f"Total 2024 records: {len(records_2024)}")

# Strategy A: Return all matches (the user's code as written in the prompt)
def assign_all(cats_str):
    cats = cats_str.strip().split()
    primary_cat = cats[0]
    matched = []
    for topic, topic_cats in topic_map.items():
        if primary_cat in topic_cats:
            matched.append((topic, 2))
        elif any(c in topic_cats for c in cats[1:]):
            matched.append((topic, 1))
    return [t for t, w in matched]

# Strategy B: Only return highest weight matches
def assign_highest_weight(cats_str):
    cats = cats_str.strip().split()
    primary_cat = cats[0]
    matched = []
    for topic, topic_cats in topic_map.items():
        if primary_cat in topic_cats:
            matched.append((topic, 2))
        elif any(c in topic_cats for c in cats[1:]):
            matched.append((topic, 1))
    if not matched:
        return []
    max_w = max(w for t, w in matched)
    return [t for t, w in matched if w == max_w]

# Strategy C: Only return primary matches (weight 2)
def assign_primary_only(cats_str):
    cats = cats_str.strip().split()
    primary_cat = cats[0]
    matched = []
    for topic, topic_cats in topic_map.items():
        if primary_cat in topic_cats:
            matched.append((topic, 2))
    return [t for t, w in matched]

# Strategy D: Only return the single best match (highest weight, break ties)
def assign_single_best(cats_str):
    cats = cats_str.strip().split()
    primary_cat = cats[0]
    matched = []
    for topic, topic_cats in topic_map.items():
        if primary_cat in topic_cats:
            matched.append((topic, 2))
        elif any(c in topic_cats for c in cats[1:]):
            matched.append((topic, 1))
    if not matched:
        return []
    matched.sort(key=lambda x: x[1], reverse=True)
    return [matched[0][0]]

count_a = sum(1 for c in records_2024 if "MLSys / ML Systems" in assign_all(c))
count_b = sum(1 for c in records_2024 if "MLSys / ML Systems" in assign_highest_weight(c))
count_c = sum(1 for c in records_2024 if "MLSys / ML Systems" in assign_primary_only(c))
count_d = sum(1 for c in records_2024 if "MLSys / ML Systems" in assign_single_best(c))

print(f"Strategy A (All matches): {count_a}")
print(f"Strategy B (Highest weight only): {count_b}")
print(f"Strategy C (Primary category only): {count_c}")
print(f"Strategy D (Single best match): {count_d}")
