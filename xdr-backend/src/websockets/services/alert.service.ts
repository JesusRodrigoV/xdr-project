import { Server } from "socket.io";
import { randomUUID } from "crypto";
import type { Alert, AlertLevel, AlertType } from "../types/alert.types";
import config from "../../../config";
import logger from "../../utils/logs/logger";

export class AlertService {
  private io: Server;
  private alertInterval: ReturnType<typeof setInterval> | null = null;

  constructor(httpServer?: any) {
    this.io = new Server(httpServer || config.wsPort, {
      cors: {
        origin: config.frontendUrl,
        methods: ["GET", "POST"],
      },
      transports: ["websocket"],
    });

    this.initialize();
  }

  private initialize(): void {
    this.setupSocketHandlers();

    if (process.env.NODE_ENV === "development") {
      this.startAlertSimulation();
    }

    logger.info(`WebSocket Server iniciado en puerto ${config.wsPort}`);
  }

  private setupSocketHandlers(): void {
    this.io.on("connection", (socket) => {
      logger.info(`Cliente conectado: ${socket.id}`);

      // Manejo de suscripciones
      socket.on("subscribe", (type: AlertType) => {
        socket.join(`alerts:${type}`);
        logger.info(`Cliente ${socket.id} suscrito a: ${type}`);
      });

      socket.on("unsubscribe", (type: AlertType) => {
        socket.leave(`alerts:${type}`);
        logger.info(`Cliente ${socket.id} desuscrito de: ${type}`);
      });

      socket.on("disconnect", () => {
        logger.info(`Cliente desconectado: ${socket.id}`);
      });
    });
  }

  public sendAlert(alert: Alert): void {
    this.io.to(`alerts:${alert.type}`).emit("alert", alert);
    logger.info(`Alerta enviada: ${alert.id}`);
  }

  private startAlertSimulation(): void {
    this.alertInterval = setInterval(() => {
      this.sendAlert(this.generateMockAlert());
    }, 15000);
  }

  private getRandomElement<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error("Cannot get random element from empty array");
    }
    const index = Math.floor(Math.random() * array.length);
    return array[index]!;
  }

  private generateMockAlert(): Alert {
    const types: AlertType[] = ["TRAFFIC", "SYSTEM", "SECURITY"];
    const levels: AlertLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

    return {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      type: this.getRandomElement(types),
      level: this.getRandomElement(levels),
      source: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      message: "Actividad sospechosa detectada",
      details: {
        protocol: ["TCP", "UDP", "HTTP"][Math.floor(Math.random() * 3)],
        port: Math.floor(Math.random() * 65535),
      },
    };
  }

  public stop(): void {
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
    }
    this.io.close();
  }
}
