import { PythonShell } from "python-shell";
import type { SuricataLog } from "../types/suricata";

// Mantenemos tu interfaz existente
export interface NetworkEvent {
  timestamp: number;
  type: string;
  sourceIP: string;
  destinationIP: string;
  severity: "low" | "medium" | "high" | "critical";
  details: string;
}

// Mapeo a tipo SuricataLog
const mapToSuricataLog = (event: NetworkEvent): SuricataLog => ({
  "@timestamp": new Date(event.timestamp).toISOString(),
  src_ip: event.sourceIP,
  dest_ip: event.destinationIP,
  proto: "tcp", // Extraer de details si es necesario
  pkt_len: 0, // Mapear desde details
  alert: {
    severity: event.severity.toUpperCase(),
    signature: event.type,
  },
});

export class ThreatAnalyzer {
  private pythonOptions = {
    mode: "json",
    pythonPath: process.env.PYTHON_PATH || "python3",
    scriptPath: "./src/ml",
    pythonOptions: ["-u"],
  };

  async analyzeThreat(event: NetworkEvent) {
    try {
      const suricataLog = mapToSuricataLog(event);
      const pyshell = new PythonShell(
        "prediction_handler.py",
        this.pythonOptions,
      );

      pyshell.send(JSON.stringify(suricataLog));

      const prediction = await new Promise<number>((resolve, reject) => {
        pyshell.on("message", (message: { threat_probability: number }) => {
          resolve(message.threat_probability);
        });

        pyshell.end((err) => {
          if (err) reject(err);
        });
      });

      return this.generateAlert(prediction);
    } catch (error) {
      console.error("Error en análisis de amenaza:", error);
      return {
        alert: false,
        message: "Error en análisis",
        action: "Reintentar",
        prediction: 0.0,
      };
    }
  }

  private generateAlert(probability: number) {
    let alert = false;
    let message = "Evento normal";
    let action = "Ninguna";

    if (probability > 0.7) {
      alert = true;
      message = "¡Amenaza crítica detectada por ML!";
      action = "Bloqueo recomendado y análisis detallado";
    } else if (probability > 0.4) {
      alert = true;
      message = "Amenaza potencial detectada";
      action = "Monitoreo aumentado requerido";
    }

    return {
      alert,
      message,
      action,
      prediction: probability,
    };
  }
}
