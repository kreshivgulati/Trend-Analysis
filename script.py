import requests
import pandas as pd

url = "https://api.openalex.org/works"

params = {
    "search": "machine learning",
    "per-page": 200
}

response = requests.get(url, params=params)
data = response.json()

papers = []

for paper in data["results"]:
    papers.append({
        "title": paper["title"],
        "year": paper["publication_year"],
        "citations": paper["cited_by_count"]
    })

df = pd.DataFrame(papers)
df.to_csv("ml_papers.csv", index=False)

print(df.head())