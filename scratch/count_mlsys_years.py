import json
import re

counts = {y: 0 for y in range(2000, 2025)}
processed = 0

systems = {"cs.DC", "cs.AR", "cs.PF", "cs.MS"}
ml = {"cs.LG", "stat.ML"}

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
        # Find the year
        match = re.search(r"\b(20\d\d)\b", created_str)
        if not match:
            continue
        year = int(match.group(1))
        if year < 2000 or year > 2024:
            continue
        
        cats = cats_str.strip().split()
        primary = cats[0]
        
        is_mlsys = False
        if primary in systems:
            is_mlsys = True
        elif primary in ml and any(c in systems for c in cats[1:]):
            is_mlsys = True
            
        if is_mlsys:
            counts[year] += 1
            processed += 1

print(f"Total MLSys papers across all years: {processed}")
for y in sorted(counts.keys()):
    print(f"{y}: {counts[y]}")
