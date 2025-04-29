export interface Event {
  id: number;
  type: string;
  description: string;
  source_ip: string;
  destination_ip: string;
  severity: string;
  related_alert_id?: number;
  timestamp: string;
}
