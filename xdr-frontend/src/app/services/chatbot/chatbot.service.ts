import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChatbotResponse } from '@app/models/chatbot';
import { Observable } from 'rxjs';
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

  sendMessage(message: string): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(this.url, { message });
  }
}
