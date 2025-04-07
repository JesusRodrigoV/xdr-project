import { Server } from "socket.io";
import { logger } from "../utils/logger";
import { Alert, AlertLevel, AlertType } from "./types";

export class AlertService {
  private io: Server;
  private alertInterval: NodeJS.Timer | null = null;

  constructor(port: number) {
    this.io = new Server(port, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.setupSocketHandlers();
    this.startAlertSimulation();
    logger.info(`WebSocket server iniciado en puerto ${port}`);
  }

  private setupSocketHandlers(): void {
    this.io.on("connection", (socket) => {
      logger.info(`Cliente conectado: ${socket.id}`);

      socket.on("disconnect", () => {
        logger.info(`Cliente desconectado: ${socket.id}`);
      });

      // Manejo de suscripción a alertas
      socket.on("subscribe", (type: AlertType) => {
        socket.join(`alerts:${type}`);
        logger.info(`Cliente ${socket.id} suscrito a alertas de tipo: ${type}`);
      });

      socket.on("unsubscribe", (type: AlertType) => {
        socket.leave(`alerts:${type}`);
        logger.info(
          `Cliente ${socket.id} desuscrito de alertas de tipo: ${type}`,
        );
      });
    });
  }

  private startAlertSimulation(): void {
    this.alertInterval = setInterval(() => {
      const mockAlert: Alert = this.generateMockAlert();
      this.broadcastAlert(mockAlert);
    }, 5000);
  }

  private generateMockAlert(): Alert {
    const types: AlertType[] = ["TRAFFIC", "SYSTEM", "SECURITY"];
    const levels: AlertLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: types[Math.floor(Math.random() * types.length)],
      level: levels[Math.floor(Math.random() * levels.length)],
      source: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      message: "Actividad sospechosa detectada",
      details: {
        protocol: ["TCP", "UDP", "HTTP"][Math.floor(Math.random() * 3)],
        port: Math.floor(Math.random() * 65535),
      },
    };
  }

  public broadcastAlert(alert: Alert): void {
    // Emitir a todos los clientes suscritos al tipo específico de alerta
    this.io.to(`alerts:${alert.type}`).emit("alert", alert);
    logger.info(`Alert emitida: ${JSON.stringify(alert)}`);
  }

  public stopAlertSimulation(): void {
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
      this.alertInterval = null;
    }
  }
}
