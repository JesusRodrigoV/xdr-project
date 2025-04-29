export interface NetworkLog {
  id: string;
  timestamp: string;
  event_type: string;
  src_ip: string;
  dst_ip: string;
  src_port?: number;
  dst_port?: number;
  protocol?: string;
  alert?: {
    category: string;
    severity: number;
    signature: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
