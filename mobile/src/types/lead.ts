export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed';

export interface LeadTelemetry {
  webhook_received_at: string;
  graph_api_fetched_at: string;
  broadcast_at: string;
  pipeline_latency_ms: number;
  hmac_verified: boolean;
  duplicate_protected: boolean;
}

export interface Lead {
  id: string;
  leadgen_id: string;
  created_time: string;
  full_name: string;
  email: string;
  phone_number: string;
  city?: string;
  company_name?: string;
  form_name?: string;
  custom_fields: Record<string, string>;
  status: LeadStatus;
  contacted_at?: string;
  response_time_seconds?: number;
  telemetry?: LeadTelemetry;
  raw_data?: any;
  received_at: string;
  isNew?: boolean;
  showTrace?: boolean;
}

export interface SystemActivityLog {
  id: string;
  timestamp: string;
  type: 'webhook_received' | 'signature_verified' | 'lead_fetched' | 'lead_broadcast' | 'status_updated' | 'client_connected';
  message: string;
  metadata?: Record<string, any>;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';
export type AppMode = 'demo' | 'dev';
