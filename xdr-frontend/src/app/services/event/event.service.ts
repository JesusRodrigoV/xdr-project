import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/app/config/api.config';
import { Event } from '@app/models/alerts/event.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(
      `${this.apiUrl}${API_CONFIG.endpoints.events}`,
    );
  }

  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(
      `${this.apiUrl}${API_CONFIG.endpoints.events}/${id}`,
    );
  }

  createEvent(event: Omit<Event, 'id' | 'timestamp'>): Observable<Event> {
    return this.http.post<Event>(
      `${this.apiUrl}${API_CONFIG.endpoints.events}`,
      event,
    );
  }

  deleteEvent(id: number): Observable<Event> {
    return this.http.delete<Event>(
      `${this.apiUrl}${API_CONFIG.endpoints.events}/${id}`,
    );
  }
}
