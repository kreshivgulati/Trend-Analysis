import joblib
import pandas as pd

df = joblib.load("topic_features.pkl")
mlsys_df = df[df["topic"] == "MLSys / ML Systems"]
print(mlsys_df.to_string())
