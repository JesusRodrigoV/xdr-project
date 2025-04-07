import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AnomalyService {
  private apiUrl = 'http://localhost:5002/predict';
  private http: HttpClient = inject(HttpClient);

  detectAnomaly(data: any) {
    return this.http.post<any>(this.apiUrl, data);
  }
}
