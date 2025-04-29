import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/app/config/api.config';
import { Alert } from '@app/models/alerts/alert.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(
      `${this.apiUrl}${API_CONFIG.endpoints.alerts}`,
    );
  }

  getAlert(id: number): Observable<Alert> {
    return this.http.get<Alert>(
      `${this.apiUrl}${API_CONFIG.endpoints.alerts}/${id}`,
    );
  }

  createAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Observable<Alert> {
    return this.http.post<Alert>(
      `${this.apiUrl}${API_CONFIG.endpoints.alerts}`,
      alert,
    );
  }

  updateAlertStatus(id: number, status: string): Observable<Alert> {
    return this.http.put<Alert>(
      `${this.apiUrl}${API_CONFIG.endpoints.alerts}/${id}/status`,
      { status },
    );
  }

  deleteAlert(id: number): Observable<Alert> {
    return this.http.delete<Alert>(
      `${this.apiUrl}${API_CONFIG.endpoints.alerts}/${id}`,
    );
  }
}
