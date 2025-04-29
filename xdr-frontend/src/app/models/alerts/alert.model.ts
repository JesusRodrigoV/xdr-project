export interface Alert {
  id: number;
  title: string;
  description: string;
  severity: string;
  source_ip: string;
  destination_ip: string;
  status: string;
  timestamp: string;
}
