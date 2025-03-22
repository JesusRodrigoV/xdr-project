import { Elysia } from "elysia";
import { analyzeThreat } from "./services/threatAnalysis";

const app = new Elysia();

interface NetworkEvent {
  timestamp: number;
  type: string;
  sourceIP: string;
  destinationIP: string;
  severity: "low" | "medium" | "high" | "critical";
  details: string;
}

const events: NetworkEvent[] = [];

// Endpoint para recibir eventos de red
app.post("/api/event", ({ body }) => {
  const event = body as NetworkEvent;
  events.push(event);

  // Analizar el evento en busca de amenazas
  const alert = analyzeThreat(event);

  return { message: "Evento recibido", event, alert };
});

// Endpoint para obtener eventos almacenados
app.get("/api/events", () => events);

// Iniciar servidor con Bun
app.listen(3000, () => {
  console.log("XDR Backend corriendo en http://localhost:3000");
});
