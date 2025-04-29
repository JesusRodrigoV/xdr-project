import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChatbotResponse } from '@app/models/chatbot';
import { catchError, Observable, retry, throwError, timeout } from 'rxjs';
import { ApiBaseService } from '../api-base';

@Injectable({
  providedIn: 'root',
})
export class ChatbotService extends ApiBaseService {
  private readonly chatbotEndpoint = 'chatbot';
  private url: string;

  constructor(http: HttpClient) {
    super(http);
    this.url = this.buildUrl(this.chatbotEndpoint);
  }

  private handleError(error: HttpErrorResponse): Observable<ChatbotResponse> {
    console.error('Error en la petición HTTP:', error);
    let errorMessage = 'Ocurrió un error en la comunicación con el servidor';

    if (error.status === 0) {
      errorMessage =
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    } else if (error.status === 429) {
      errorMessage =
        'Has excedido el límite de peticiones. Por favor, espera un momento.';
    }

    return throwError(
      () =>
        ({
          success: false,
          data: {
            response: errorMessage,
            model: 'Error',
          },
        }) as ChatbotResponse,
    );
  }

  private validateMessage(message: string): boolean {
    if (!message) return false;
    const trimmedMessage = message.trim();
    return trimmedMessage.length > 0 && trimmedMessage.length <= 500;
  }

  sendMessage(message: string): Observable<ChatbotResponse> {
    if (!this.validateMessage(message)) {
      return throwError(() => new Error('Mensaje inválido'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    return this.http
      .post<ChatbotResponse>(this.url, { message }, { headers })
      .pipe(
        timeout(30000),
        retry({ count: 2, delay: 1000 }),
        catchError((error) => this.handleError(error)),
      );
  }
}
