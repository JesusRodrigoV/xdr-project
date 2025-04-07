import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { ApiBaseService } from '../api-base';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SocketService extends ApiBaseService {
  private socket: Socket;

  constructor(http: HttpClient) {
    super(http);
    this.socket = io(environment.apiBaseUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Conectado al servidor de websockets');
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor de websockets');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión:', error);
    });
  }

  listen(eventName: string, callback: (data: any) => void) {
    this.socket.on(eventName, callback);
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  isConnected(): boolean {
    return this.socket && this.socket.connected;
  }
}
