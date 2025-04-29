export interface Sensor {
  id?: number;
  name: string;
  type: string;
  location: string;
  status: string;
  last_active?: Date;
}
