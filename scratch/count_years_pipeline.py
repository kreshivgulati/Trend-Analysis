import json
import re
from collections import Counter

counts = Counter()
processed = 0

with open("data.json", "r", encoding="utf-8") as f:
    for line in f:
        processed += 1
        if processed % 100000 == 0:
            print(f"Processed {processed}...")
        try:
            item = json.loads(line)
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
