import requests

def test_leaderboard():
    print("--- TESTING LEADERBOARD ---")
    response = requests.get("http://127.0.0.1:8000/leaderboard")
    if response.status_code == 200:
        data = response.json()
        print("Rank | Topic | Latest Score | Predicted Score | Growth | Potential")
        print("-" * 75)
        for item in data[:10]:
            print(f"{item.get('rank'):<4} | {item.get('topic'):<30} | {item.get('latest_score'):<12} | {item.get('predicted_score'):<15} | {item.get('growth'):<6}% | {item.get('potential')}")
    else:
        print(f"Error {response.status_code}: {response.text}")

def test_predict(topic):
    print(f"\n--- TESTING PREDICT: {topic} ---")
    response = requests.post("http://127.0.0.1:8000/predict", json={"topic": topic})
    if response.status_code == 200:
        data = response.json()
        print(f"Topic: {data.get('topic')}")
        print(f"Predicted Score: {data.get('predicted_score')}")
        print(f"Expected Growth: {data.get('expected_growth')}")
        print(f"Future Potential: {data.get('future_potential')}")
    else:
        print(f"Error {response.status_code}: {response.text}")

test_leaderboard()
test_predict("Generative AI")
test_predict("Deep Learning")
test_predict("Natural Language Processing")
