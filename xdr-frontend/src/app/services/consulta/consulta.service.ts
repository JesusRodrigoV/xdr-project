import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/app/config/api.config';
import {
  Consulta,
  ConsultasPaginadas,
} from '@app/models/alerts/consulta.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConsultaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getConsultas(): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(
      `${this.apiUrl}${API_CONFIG.endpoints.consultas}`,
    );
  }

  getConsultasPaginadas(
    limit: number = 10,
    offset: number = 0,
  ): Observable<ConsultasPaginadas> {
    return this.http.get<ConsultasPaginadas>(
      `${this.apiUrl}${API_CONFIG.endpoints.consultas}/paginadas?limit=${limit}&offset=${offset}`,
    );
  }

  getConsultasPorUsuario(userId: number): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(
      `${this.apiUrl}${API_CONFIG.endpoints.consultas}/usuario/${userId}`,
    );
  }

  getConsultasPorUsuarioPaginadas(
    userId: number,
    limit: number = 10,
    offset: number = 0,
  ): Observable<ConsultasPaginadas> {
    return this.http.get<ConsultasPaginadas>(
      `${this.apiUrl}${API_CONFIG.endpoints.consultas}/usuario/${userId}/paginadas?limit=${limit}&offset=${offset}`,
    );
  }

  createConsulta(
    consulta: Omit<Consulta, 'id' | 'fecha_consulta'>,
  ): Observable<Consulta> {
    return this.http.post<Consulta>(
      `${this.apiUrl}${API_CONFIG.endpoints.consultas}`,
      consulta,
    );
  }

  updateConsulta(
    id: number,
    consulta: Pick<Consulta, 'tipo' | 'descripcion'>,
  ): Observable<Consulta> {
    return this.http.put<Consulta>(
      `${this.apiUrl}${API_CONFIG.endpoints.consultas}/${id}`,
      consulta,
    );
  }
}
