import sys
import json
import joblib
import pandas as pd
from sklearn.preprocessing import LabelEncoder

model, encoders = None, None


def load_model():
    global model, encoders
    if model is None:
        model_data = joblib.load("src/ml/model/suricata_model.pkl")
        model = model_data["model"]
        encoders = model_data["encoders"]


def predict_threat(data):
    df = pd.DataFrame([data])

    # Feature engineering
    try:
        for col in ["src_ip", "dest_ip", "proto"]:
            le = encoders.get(col)
            if le:
                df[col] = le.transform(df[col].fillna("unknown"))
    except ValueError as e:
        return 1.0  # Máxima probabilidad si hay error

    # Obtener probabilidad de anomalía
    try:
        scores = model.decision_function(df)
        # Normalizar a probabilidad 0-1
        min_score, max_score = scores.min(), scores.max()
        return (scores[0] - min_score) / (max_score - min_score)
    except:
        return 1.0


if __name__ == "__main__":
    load_model()
    for line in sys.stdin:
        try:
            log_data = json.loads(line)
            probability = predict_threat(log_data)
            print(json.dumps({"threat_probability": probability}))
        except Exception as e:
            print(json.dumps({"error": str(e)}))

