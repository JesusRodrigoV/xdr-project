import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiBaseService {
  protected readonly baseUrl = environment.apiBaseUrl;

  constructor(protected http: HttpClient) {}

  protected buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`.replace(/([^:]\/)\/+/g, '$1');
  }

  protected get<T>(
    endpoint: string,
    options: {
      params?: HttpParams | Record<string, string>;
      headers?: HttpHeaders | Record<string, string>;
    } = {},
  ): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), options);
  }

  protected post<T>(
    endpoint: string,
    body: unknown,
    options: {
      params?: HttpParams | Record<string, string>;
      headers?: HttpHeaders | Record<string, string>;
      withCredentials?: boolean;
    } = {},
  ): Observable<T> {
    const defaultOptions = {
      ...options,
      withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      }),
    };
    return this.http.post<T>(this.buildUrl(endpoint), body, defaultOptions);
  }

  protected put<T>(
    endpoint: string,
    body: unknown,
    options: {
      params?: HttpParams | Record<string, string>;
      headers?: HttpHeaders | Record<string, string>;
    } = {},
  ): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), body, options);
  }

  protected delete<T>(
    endpoint: string,
    options: {
      params?: HttpParams | Record<string, string>;
      headers?: HttpHeaders | Record<string, string>;
    } = {},
  ): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), options);
  }
}
