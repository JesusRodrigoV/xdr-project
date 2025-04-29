export type SeverityLevel = "low" | "medium" | "high" | "critical";

export interface NetworkEventDetails {
  packet_length: number;
  protocol?: string;
  additional_info?: string;
}

export interface NetworkEvent {
  timestamp: number;
  type: string;
  sourceIP: string;
  destinationIP: string;
  severity: SeverityLevel;
  details: NetworkEventDetails | string;
}

export interface ThreatAnalysisResult {
  alert: boolean;
  message: string;
  action: string;
  prediction: number;
}
export interface ThreatAnalysisResponse {
  success: boolean;
  data?: any;
  metadata?: {
    modelVersion: string;
    analyzedAt: string;
  };
  error?: string;
  code?: string;
}
