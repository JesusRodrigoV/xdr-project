import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ChatbotResponse } from '@app/models/chatbot';
import { ChatbotService } from '@app/services/chatbot';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-chatbot',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    FormsModule,
    MatProgressBarModule,
    MarkdownComponent,
  ],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
})
export class ChatbotComponent {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  private chatbotService = inject(ChatbotService);

  chatHistory = signal<
    Array<{
      user: string;
      response?: {
        text: string;
        model: string;
      };
    }>
  >([]);

  userMessage = signal<string>('');
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  sendMessage() {
    if (this.userMessage().trim() === '') return;

    const userMsg = this.userMessage();
    this.loading.set(true);
    this.error.set(null);
    this.chatHistory.update((history) => [...history, { user: userMsg }]);

    this.chatbotService.sendMessage(userMsg).subscribe({
      next: (response: ChatbotResponse) => {
        this.loading.set(false);
        this.chatHistory.update((history) => {
          const newHistory = [...history];
          newHistory[newHistory.length - 1].response = {
            text: response.data.response,
            model: response.data.model,
          };
          return newHistory;
        });
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error:', error);
        this.chatHistory.update((history) => {
          const newHistory = [...history];
          newHistory[newHistory.length - 1].response = {
            text: 'Error: No se pudo procesar tu mensaje. Por favor, intenta nuevamente más tarde.',
            model: 'Error',
          };
          return newHistory;
        });
      },
    });

    this.userMessage.set('');
  }

  private scrollToBottom(): void {
    try {
      const element = this.scrollContainer.nativeElement;
      const isScrolledToBottom =
        element.scrollHeight - element.scrollTop <= element.clientHeight + 100;

      // Solo hacemos scroll si ya estaba cerca del final o si es un nuevo mensaje del usuario
      if (isScrolledToBottom) {
        setTimeout(() => {
          element.scrollTop = element.scrollHeight;
        }, 100);
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
