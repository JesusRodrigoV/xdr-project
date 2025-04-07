import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api-base';

@Injectable({
  providedIn: 'root',
})
export class ElasticsearchService extends ApiBaseService {
  private readonly elasticsearchEndpoint = 'anomalies';
  private url: string;

  constructor(http: HttpClient) {
    super(http);
    this.url = this.buildUrl(this.elasticsearchEndpoint);
  }

  getAnomalies(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }
}
