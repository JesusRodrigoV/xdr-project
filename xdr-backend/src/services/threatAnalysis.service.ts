import { PythonShell } from "python-shell";
import { getPythonShellOptions } from "../utils/python/pythonShell.config";
import type {
  NetworkEvent,
  NetworkEventDetails,
  ThreatAnalysisResult,
} from "../types/networkEvent.type";
import type { SuricataLog } from "../types/suricataLog.type";
import logger from "../utils/logs/logger";

export class ThreatAnalysisService {
  private mapToSuricataLog(event: NetworkEvent): SuricataLog {
    const details =
      typeof event.details === "string"
        ? (JSON.parse(event.details) as NetworkEventDetails)
        : event.details;

    return {
      "@timestamp": new Date(event.timestamp).toISOString(),
      src_ip: event.sourceIP,
      dest_ip: event.destinationIP,
      proto: details.protocol || "tcp",
      pkt_len: this.extractPacketLength(event.details),
      alert: {
        severity: event.severity.toUpperCase(),
        signature: event.type,
      },
    };
  }

  private extractPacketLength(details: NetworkEventDetails | string): number {
    try {
      if (typeof details === "string") {
        const jsonDetails = JSON.parse(details);
        return jsonDetails.packet_length || 0;
      }
      return details.packet_length || 0;
    } catch {
      return 0;
    }
  }

  private generateAlert(probability: number): ThreatAnalysisResult {
    const result: ThreatAnalysisResult = {
      alert: false,
      message: "Evento normal",
      action: "Ninguna",
      prediction: probability,
    };

    if (probability > 0.7) {
      result.alert = true;
      result.message = "¡Amenaza crítica detectada por ML!";
      result.action = "Bloqueo inmediato requerido";
    } else if (probability > 0.4) {
      result.alert = true;
      result.message = "Amenaza potencial detectada";
      result.action = "Monitoreo aumentado";
    }

    return result;
  }

  async analyzeThreat(event: NetworkEvent): Promise<ThreatAnalysisResult> {
    try {
      const suricataLog = this.mapToSuricataLog(event);
      const pyshell = new PythonShell(
        "src/ml/prediction-handler.py",
        getPythonShellOptions("src/ml/prediction-handler.py"),
      );

      pyshell.send(JSON.stringify(suricataLog));

      const prediction = await new Promise<number>((resolve, reject) => {
        let receivedPrediction = false;

        pyshell.on("message", (rawMessage: string) => {
          logger.debug("Raw Python output received:", rawMessage);

          try {
            const message = JSON.parse(rawMessage);
            logger.debug("Parsed Python output:", message);

            if (typeof message.threat_probability === "number") {
              receivedPrediction = true;
              resolve(message.threat_probability);
            } else if (message.error) {
              reject(new Error(message.error));
            }
          } catch (parseError: any) {
            logger.error("Error parsing Python output:", {
              error: parseError,
              rawMessage,
            });
            reject(
              new Error(`Error parsing Python output: ${parseError.message}`),
            );
          }
        });

        pyshell.on("stderr", (stderr) => {
          logger.error("Python stderr:", stderr);
        });

        pyshell.on("error", (err) => {
          logger.error("Python shell error:", err);
          reject(err);
        });

        pyshell.end((err) => {
          if (err) {
            logger.error("Python process end error:", err);
            reject(err);
          }
          if (!receivedPrediction) {
            logger.error("No prediction received from Python");
            reject(new Error("No prediction received from Python"));
          }
          logger.debug("Python process finished successfully");
        });
      });

      return this.generateAlert(prediction);
    } catch (error) {
      logger.error("Error en análisis de amenaza:", {
        error: error instanceof Error ? error.message : "Unknown error",
        event,
      });

      return {
        alert: true,
        message: "Error en análisis de amenaza",
        action: "Revisar logs del sistema",
        prediction: 1.0,
      };
    }
  }
}
