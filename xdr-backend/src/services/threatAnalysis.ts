export interface NetworkEvent {
  timestamp: number;
  type: string;
  sourceIP: string;
  destinationIP: string;
  severity: "low" | "medium" | "high" | "critical";
  details: string;
}

export async function analyzeThreat(event: NetworkEvent) {
  // Llamada al microservicio de ML
  let mlPrediction = { threat_probability: 0.0 };
  try {
    const mlResponse = await fetch("http://localhost:5001/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    mlPrediction = await mlResponse.json();
  } catch (error) {
    console.error("Error en la comunicación con el servicio ML:", error);
  }

  // Lógica de alerta basada en la probabilidad obtenida
  let alert = false;
  let message = "Evento normal";
  let action = "Ninguna";

  if (mlPrediction.threat_probability > 0.7) {
    alert = true;
    message = "¡Amenaza crítica detectada por ML!";
    action = "Bloqueo recomendado y análisis detallado";
  }

  return {
    alert,
    message,
    action,
    prediction: mlPrediction.threat_probability,
  };
}
