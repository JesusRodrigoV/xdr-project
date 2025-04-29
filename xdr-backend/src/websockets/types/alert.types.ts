export type AlertType = "TRAFFIC" | "SYSTEM" | "SECURITY";
export type AlertLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Alert {
  id: string;
  timestamp: string;
  type: AlertType;
  level: AlertLevel;
  source: string;
  message: string;
  details: {
    protocol?: string;
    port?: number;
    [key: string]: any;
  };
}
