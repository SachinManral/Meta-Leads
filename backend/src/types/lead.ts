export interface MetaWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    changes: Array<{
      field: string;
      value: {
        ad_id?: string;
        form_id?: string;
        leadgen_id: string;
        created_time: number;
        page_id: string;
        adgroup_id?: string;
      };
    }>;
  }>;
}

export interface MetaLeadField {
  name: string;
  values: string[];
}

export interface MetaLeadGraphResponse {
  id: string;
  created_time: string;
  ad_id?: string;
  ad_name?: string;
  adset_name?: string;
  campaign_name?: string;
  form_id?: string;
  form_name?: string;
  field_data: MetaLeadField[];
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed';

export interface LeadTelemetry {
  webhook_received_at: string;
  graph_api_fetched_at: string;
  broadcast_at: string;
  pipeline_latency_ms: number;
  hmac_verified: boolean;
  duplicate_protected: boolean;
}

export interface FormattedLead {
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
  telemetry: LeadTelemetry;
  raw_data?: any;
  received_at: string;
  notes?: string;
}

export interface SystemActivityLog {
  id: string;
  timestamp: string;
  type: 'webhook_received' | 'signature_verified' | 'lead_fetched' | 'lead_broadcast' | 'status_updated' | 'client_connected';
  message: string;
  metadata?: Record<string, any>;
}
