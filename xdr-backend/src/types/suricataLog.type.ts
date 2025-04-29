export interface SuricataLog {
  "@timestamp": string;
  src_ip: string;
  dest_ip: string;
  proto: string;
  pkt_len: number;
  alert: {
    severity: string;
    signature: string;
  };
}
