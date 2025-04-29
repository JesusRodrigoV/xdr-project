import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder


class SuricataModel:
    def __init__(self):
        self.model = None
        self.encoders = {}

    def train(self, log_path):
        logs = pd.read_json(log_path, lines=True)
        features = logs[["flow_id", "src_ip", "dest_ip", "proto", "pkt_len", "alert"]]

        for col in ["src_ip", "dest_ip", "proto"]:
            le = LabelEncoder()
            features[col] = le.fit_transform(features[col])
            self.encoders[col] = le

        self.model = IsolationForest(
            n_estimators=150, contamination=0.05, random_state=42
        )
        self.model.fit(features)

        joblib.dump(
            {"model": self.model, "encoders": self.encoders},
            "src/ml/model/suricata_model.pkl",
        )


if __name__ == "__main__":
    model = SuricataModel()
    model.train("data/suricata_logs/eve.json")
