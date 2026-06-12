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

counts_primary = {}
counts_any = {}

for cats in records_2024:
    prim = cats[0]
    counts_primary[prim] = counts_primary.get(prim, 0) + 1
    for c in set(cats):
        counts_any[c] = counts_any.get(c, 0) + 1

mlsys_cats = ["cs.LG", "cs.DC", "cs.AR", "cs.PF", "cs.MS", "stat.ML"]
print(f"{'Category':<10} | {'As Primary':<10} | {'In Any Position':<15}")
print("-" * 45)
for c in mlsys_cats:
    print(f"{c:<10} | {counts_primary.get(c, 0):<10} | {counts_any.get(c, 0):<15}")
