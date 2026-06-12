import json
import re

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
            records_2024.append(cats_str.strip().split())

def is_mlsys(cats):
    primary = cats[0]
    systems = {"cs.DC", "cs.AR", "cs.PF", "cs.MS"}
    ml = {"cs.LG", "stat.ML"}
    
    # Condition 1: Primary is systems
    if primary in systems:
        return True
    # Condition 2: Primary is ML, and any secondary is systems
    if primary in ml and any(c in systems for c in cats[1:]):
        return True
    return False

count = sum(1 for c in records_2024 if is_mlsys(c))
print(f"MLSys papers in 2024 under systems-constrained rule: {count}")
