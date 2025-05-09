import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ElasticsearchService } from '@app/services/elasticsearch';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, map } from 'rxjs';
import {
  ArcElement,
  CategoryScale,
  Chart,
  BarController,
  Legend,
  LinearScale,
  Tooltip,
  BarElement,
} from 'chart.js';
import { CommonModule } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { SocketService } from '@app/services/sockets';
import { MatCardModule } from '@angular/material/card';
import { ReportService } from '@app/services/report';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AnomalyService } from '@app/services/anomaly';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ChatbotComponent } from '@app/components/chatbot/chatbot.component';

Chart.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Legend,
  Tooltip,
);
Chart.defaults.color = '#fff';

@Component({
  selector: 'app-inicio',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatProgressBarModule,
    ChatbotComponent,
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InicioComponent implements OnInit {
  private esService: ElasticsearchService = inject(ElasticsearchService);
  private socketService: SocketService = inject(SocketService);
  private reportService: ReportService = inject(ReportService);
  private anomalyService: AnomalyService = inject(AnomalyService);
  chartData$: Observable<any>;
  filteredData$: Observable<any>;
  protected originalAnomalies: any[] = [];
  alerts = signal<any[]>([]);
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
  inputData = { duration: 0, src_bytes: 0, dst_bytes: 0, count: 0 };
  anomalyResult: string = '';

  constructor() {
    this.chartData$ = this.esService.getAnomalies().pipe(
      map((anomalies) => {
        this.originalAnomalies = anomalies;
        return this.prepareChartData(anomalies);
      }),
    );
    this.filteredData$ = this.chartData$;
  }

  ngOnInit() {
    // Suscripción a los datos del gráfico
    this.chartData$.subscribe((chartData) => {
      this.renderChart(chartData);
    });

    // Escuchar eventos de alerta individuales
    this.socketService.listen('alert', (alert) => {
      this.alerts.update((currentAlerts) => [...currentAlerts, alert]);
    });

    // Escuchar actualizaciones completas de alertas
    this.socketService.listen('alerts', (alerts: any[]) => {
      this.alerts.set(alerts);
    });
  }

  private prepareChartData(anomalies: any[]) {
    if (!anomalies || anomalies.length === 0) {
      return null;
    }
    const labels = anomalies.map((a) => a._source.src_ip);
    const data = anomalies.map((a) => a._source.pkt_len);

    return {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Tamaño de Paquete',
            data: data,
            backgroundColor: 'red',
            hoverOffset: 2,
          },
        ],
      },
    };
  }

  private renderChart(chartConfig: any) {
    const existingChart = Chart.getChart('anomalyChart');
    if (existingChart) {
      existingChart.destroy();
    }

    if (!chartConfig) {
      console.warn('No hay datos para mostrar en el gráfico');
      return;
    }

    new Chart('anomalyChart', {
      type: chartConfig.type,
      data: chartConfig.data,
    });
  }

  // Método para reintentar la carga en caso de error
  retryLoading() {
    this.chartData$ = this.esService
      .getAnomalies()
      .pipe(map((anomalies) => this.prepareChartData(anomalies)));
  }

  filterAnomalies(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value;

    if (!searchValue) {
      this.filteredData$ = this.chartData$;
      return;
    }
    const filteredAnomalies = this.originalAnomalies.filter(
      (a) =>
        a._source.src_ip.toLowerCase().includes(searchValue) ||
        a._source.dest_ip.toLowerCase().includes(searchValue),
    );

    this.filteredData$ = new Observable((subscriber) => {
      const chartData = this.prepareChartData(filteredAnomalies);
      subscriber.next(chartData);
      subscriber.complete();
    });

    this.filteredData$.subscribe((chartData) => {
      this.renderChart(chartData);
    });
  }
  exportPDF() {
    this.reportService.generatePDF(this.originalAnomalies);
  }

  exportExcel() {
    this.reportService.generateExcel(this.originalAnomalies);
  }
  checkAnomaly() {
    this.anomalyService
      .detectAnomaly(this.inputData)
      .subscribe((response: any) => {
        this.anomalyResult = response.status;
      });
  }
}
