import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/app/config/api.config';
import { User } from '@app/models/alerts/user.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}${API_CONFIG.endpoints.users}`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(
      `${this.apiUrl}${API_CONFIG.endpoints.users}/${id}`,
    );
  }

  createUser(user: Omit<User, 'id' | 'created_at'>): Observable<User> {
    return this.http.post<User>(
      `${this.apiUrl}${API_CONFIG.endpoints.users}`,
      user,
    );
  }

  updateUser(id: number, user: Pick<User, 'name' | 'email'>): Observable<User> {
    return this.http.put<User>(
      `${this.apiUrl}${API_CONFIG.endpoints.users}/${id}`,
      user,
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}${API_CONFIG.endpoints.users}/${id}`,
    );
  }
}
