import json
import re

latest_date = None
processed = 0

with open("data.json", "r", encoding="utf-8") as f:
    for line in f:
        processed += 1
        try:
            item = json.loads(line)
            versions = item.get("versions")
            if not versions:
                continue
            created_str = versions[0].get("created")
            if not created_str:
                continue
            # Let's just print a few v1 created strings for papers with year 2023 or 2024
            match = re.search(r"\b(2023|2024)\b", created_str)
            if match:
                print(f"Sample: {created_str}")
                processed += 1
                if processed > 20:
                    break
        except Exception:
            pass
