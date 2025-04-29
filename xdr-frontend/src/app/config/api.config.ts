import { environment } from 'src/environments/environment';

export const API_CONFIG = {
  baseUrl: environment.apiUrl,
  endpoints: {
    alerts: '/api/alerts',
    events: '/api/events',
    consultas: '/api/consultas',
    sensors: '/api/sensors',
    users: '/api/users',
    health: '/api/health',
  },
};
