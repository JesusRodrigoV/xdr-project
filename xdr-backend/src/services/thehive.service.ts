import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface ITheHiveCase {
  title: string;
  description: string;
  severity: number;
  startDate: number;
  tags: string[];
  flag: boolean;
}

export interface ITheHiveObservable {
  dataType: string;
  data: string;
  message: string;
  tags: string[];
  tlp: number;
  ioc: boolean;
}

export class TheHiveService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.theHive.url,
      headers: {
        'Authorization': `Bearer ${config.theHive.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createCase(caseData: ITheHiveCase): Promise<any> {
    try {
      const response = await this.client.post('/api/case', {
        ...caseData,
        startDate: caseData.startDate || Date.now()
      });
      logger.info({ caseId: response.data._id }, 'Created case in TheHive');
      return response.data;
    } catch (error) {
      logger.error({ error, caseData }, 'Error creating case in TheHive');
      throw error;
    }
  }

  async addObservable(caseId: string, observable: ITheHiveObservable): Promise<any> {
    try {
      const response = await this.client.post(`/api/case/${caseId}/artifact`, {
        ...observable,
        startDate: Date.now()
      });
      logger.info({ caseId, observableId: response.data._id }, 'Added observable to case');
      return response.data;
    } catch (error) {
      logger.error({ error, caseId, observable }, 'Error adding observable to case');
      throw error;
    }
  }

  async getCaseByTitle(title: string): Promise<any> {
    try {
      const response = await this.client.post('/api/case/_search', {
        query: { _string: `title:"${title}"` }
      });
      return response.data;
    } catch (error) {
      logger.error({ error, title }, 'Error searching case by title');
      throw error;
    }
  }

  async updateCase(caseId: string, updateData: Partial<ITheHiveCase>): Promise<any> {
    try {
      const response = await this.client.patch(`/api/case/${caseId}`, updateData);
      logger.info({ caseId }, 'Updated case in TheHive');
      return response.data;
    } catch (error) {
      logger.error({ error, caseId, updateData }, 'Error updating case');
      throw error;
    }
  }
}
