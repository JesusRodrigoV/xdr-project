import { AlertService } from "./websocket/AlertService";
import { logger } from "./utils/logger";

// Otros imports y configuraciones...

try {
  const alertService = new AlertService(3001); // O el puerto que prefieras
  logger.info("Servidor de alertas iniciado correctamente");
} catch (error) {
  logger.error("Error al iniciar el servidor de alertas:", error);
}
import { Elysia, t } from "elysia";
import { ThreatAnalyzer } from "./services/threatAnalysis";
import { setupLogging } from "./utils/logger";
import type { NetworkEvent } from "./services/threatAnalysis";

const app = new Elysia();

// Configuración inicial
const analyzer = new ThreatAnalyzer();
const events: NetworkEvent[] = [];
const MAX_EVENTS_HISTORY = 1000;

// Esquema de validación para eventos
const eventSchema = t.Object({
  timestamp: t.Number(),
  type: t.String(),
  sourceIP: t.String({ format: "ipv4" }),
  destinationIP: t.String({ format: "ipv4" }),
  severity: t.Union([
    t.Literal("low"),
    t.Literal("medium"),
    t.Literal("high"),
    t.Literal("critical"),
  ]),
  details: t.String(),
});

// Middleware de logging
setupLogging(app);

// Almacenamiento seguro de eventos
function storeEvent(event: NetworkEvent) {
  if (events.length >= MAX_EVENTS_HISTORY) {
    events.shift(); // Eliminar el evento más antiguo
  }
  events.push(event);
}

// Endpoint para recibir y analizar eventos
app.post(
  "/api/event",
  async ({ body, set }) => {
    try {
      const event = body as NetworkEvent;
      storeEvent(event);

      const analysisResult = await analyzer.analyzeThreat(event);

      return {
        event: {
          ...event,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        },
        analysis: analysisResult,
      };
    } catch (error) {
      set.status = 500;
      return { error: "Error processing event", details: error.message };
    }
  },
  {
    body: eventSchema,
  },
);

// Endpoint para obtener eventos con paginación
app.get(
  "/api/events",
  ({ query }) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 100;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      page,
      total: events.length,
      results: events.slice(start, end),
    };
  },
  {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  },
);

// Health check endpoint
app.get("/health", () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
  system: {
    eventsInMemory: events.length,
    memoryUsage: process.memoryUsage(),
  },
}));

// Security headers middleware
app.onRequest(({ set }) => {
  set.headers = {
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'self'",
    "X-Content-Type-Options": "nosniff",
  };
});

// Manejo de errores global
app.onError(({ code, error, set }) => {
  switch (code) {
    case "VALIDATION":
      set.status = 400;
      return { error: "Invalid request format", details: error.message };
    default:
      set.status = 500;
      return { error: "Internal server error", details: error.message };
  }
});

// Iniciar servidor
app.listen(3000, ({ hostname, port }) => {
  console.log(
    `🚀 XDR Backend operativo en http://${hostname}:${port}\n`,
    `• Entorno: ${process.env.NODE_ENV || "development"}\n`,
    `• Modelo ML: ${process.env.MODEL_VERSION || "v1.0.0"}`,
  );
});

export type App = typeof app;
