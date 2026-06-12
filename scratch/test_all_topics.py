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

# Let's count for all topics under Strategy A and Strategy D
counts_a = {t: 0 for t in topic_map}
counts_d = {t: 0 for t in topic_map}

for cats_str in records_2024:
    for t in assign_all(cats_str):
        counts_a[t] += 1
    for t in assign_single_best(cats_str):
        counts_d[t] += 1

print(f"{'Topic':<30} | {'Strategy A':<12} | {'Strategy D':<12}")
print("-" * 60)
for t in topic_map:
    print(f"{t:<30} | {counts_a[t]:<12} | {counts_d[t]:<12}")
