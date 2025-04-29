import { AlertService } from "./services/alert.service";

let alertService: AlertService;

export const initializeWebSocket = (httpServer?: any): AlertService => {
  if (!alertService) {
    alertService = new AlertService(httpServer);
  }
  return alertService;
};

export const getAlertService = (): AlertService => {
  if (!alertService) {
    throw new Error("WebSocket service no inicializado");
  }
  return alertService;
};
