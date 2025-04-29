import sys
import json
from typing import Dict, Optional, Any, Union
import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest

ModelType = Optional[IsolationForest]
EncodersType = Optional[Dict[str, Any]]

model: ModelType = None
encoders: EncodersType = None


def load_model() -> None:
    """Carga el modelo y los encoders desde el archivo pickle."""
    global model, encoders
    try:
        model_data = joblib.load("src/ml/model/suricata_model.pkl")
        model = model_data["model"]
        encoders = model_data["encoders"]
    except Exception as err:
        print(json.dumps({"error": f"Error loading model: {str(err)}"}))
        sys.exit(1)


def predict_threat(data: Dict[str, Any]) -> float:
    """
    Predice la probabilidad de amenaza para los datos de entrada.

    Args:
        data: Diccionario con los datos de la amenaza

    Returns:
        float: Probabilidad de amenaza entre 0 y 1
    """
    if model is None or encoders is None:
        return 1.0

    df = pd.DataFrame([data])

    try:
        for col in ["src_ip", "dest_ip", "proto"]:
            encoder = encoders.get(col)
            if encoder is not None:
                df[col] = encoder.transform(df[col].fillna("unknown"))
    except ValueError:
        return 1.0  # Máxima probabilidad si hay error en la transformación

    try:
        scores = model.decision_function(df)
        min_score, max_score = scores.min(), scores.max()
        if min_score == max_score:
            return 1.0
        return float((scores[0] - min_score) / (max_score - min_score))
    except Exception as prediction_error:
        print(
            json.dumps({"error": f"Prediction error: {str(prediction_error)}"}),
            file=sys.stderr,
        )
        return 1.0


def main() -> None:
    """Función principal que procesa la entrada desde stdin."""
    try:
        load_model()
        for line in sys.stdin:
            try:
                log_data = json.loads(line)
                probability = predict_threat(log_data)
                response = json.dumps({"threat_probability": probability})
                sys.stdout.write(response + "\n")
                sys.stdout.flush()
                sys.stderr.write(f"Debug: Sent response: {response}\n")
                sys.stderr.flush()
            except json.JSONDecodeError as json_err:
                sys.stderr.write(
                    json.dumps({"error": f"Invalid JSON input: {str(json_err)}"}) + "\n"
                )
                sys.stderr.flush()
            except Exception as err:
                sys.stderr.write(
                    json.dumps({"error": f"Unexpected error: {str(err)}"}) + "\n"
                )
                sys.stderr.flush()
    except Exception as err:
        sys.stderr.write(json.dumps({"error": f"Fatal error: {str(err)}"}) + "\n")
        sys.stderr.flush()
        sys.exit(1)


if __name__ == "__main__":
    main()
