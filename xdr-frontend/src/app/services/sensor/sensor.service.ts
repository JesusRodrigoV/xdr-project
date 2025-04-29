import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/app/config/api.config';
import { Sensor } from '@app/models/alerts/sensor.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SensorService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSensors(): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(
      `${this.apiUrl}${API_CONFIG.endpoints.sensors}`,
    );
  }

  getSensor(id: number): Observable<Sensor> {
    return this.http.get<Sensor>(
      `${this.apiUrl}${API_CONFIG.endpoints.sensors}/${id}`,
    );
  }

  createSensor(sensor: Omit<Sensor, 'id' | 'last_active'>): Observable<Sensor> {
    return this.http.post<Sensor>(
      `${this.apiUrl}${API_CONFIG.endpoints.sensors}`,
      sensor,
    );
  }

  updateSensor(id: number, sensor: Partial<Sensor>): Observable<Sensor> {
    return this.http.put<Sensor>(
      `${this.apiUrl}${API_CONFIG.endpoints.sensors}/${id}`,
      sensor,
    );
  }

  deleteSensor(id: number): Observable<Sensor> {
    return this.http.delete<Sensor>(
      `${this.apiUrl}${API_CONFIG.endpoints.sensors}/${id}`,
    );
  }
}
