import fs from 'fs';
import path from 'path';
import { FormattedLead, SystemActivityLog, LeadStatus } from '../types/lead';

class StorageService {
  private dataDir: string;
  private leadsFile: string;
  private activitiesFile: string;
  private leads: FormattedLead[] = [];
  private activities: SystemActivityLog[] = [];
  private processedLeadIds: Set<string> = new Set();
  private isInitialized = false;

  constructor() {
    this.dataDir = path.resolve(process.cwd(), 'data');
    this.leadsFile = path.join(this.dataDir, 'leads.json');
    this.activitiesFile = path.join(this.dataDir, 'activities.json');
    this.ensureDataDirectory();
    this.loadData();
  }

  private ensureDataDirectory(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[StorageService] Failed to create data directory:', error.message);
    }
  }

  private loadData(): void {
    try {
      if (fs.existsSync(this.leadsFile)) {
        const raw = fs.readFileSync(this.leadsFile, 'utf-8');
        this.leads = JSON.parse(raw);
        this.leads.forEach((l) => {
          if (l.leadgen_id) this.processedLeadIds.add(l.leadgen_id);
          if (l.id) this.processedLeadIds.add(l.id);
        });
        console.log(`[StorageService] Loaded ${this.leads.length} persisted leads from disk`);
      }

      if (fs.existsSync(this.activitiesFile)) {
        const raw = fs.readFileSync(this.activitiesFile, 'utf-8');
        this.activities = JSON.parse(raw);
        console.log(`[StorageService] Loaded ${this.activities.length} persisted activity logs`);
      }

      this.isInitialized = true;
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('[StorageService] Error loading persisted data, starting fresh:', error.message);
      this.leads = [];
      this.activities = [];
    }
  }

  private persistLeads(): void {
    try {
      const tempPath = `${this.leadsFile}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.leads, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.leadsFile);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[StorageService] Failed to persist leads:', error.message);
    }
  }

  private persistActivities(): void {
    try {
      const tempPath = `${this.activitiesFile}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.activities.slice(0, 50), null, 2), 'utf-8');
      fs.renameSync(tempPath, this.activitiesFile);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[StorageService] Failed to persist activities:', error.message);
    }
  }

  public isDuplicate(leadgenId: string): boolean {
    // Always allow Meta dashboard sample test events to stack
    if (leadgenId === '444444444444') return false;
    return this.processedLeadIds.has(leadgenId);
  }

  public saveLead(lead: FormattedLead): FormattedLead {
    const isMetaSampleTest = lead.leadgen_id === '444444444444';

    // Add to deduplication set unless it's a sample test event
    if (!isMetaSampleTest && lead.leadgen_id) this.processedLeadIds.add(lead.leadgen_id);
    if (lead.id) this.processedLeadIds.add(lead.id);

    // Unshift to top of list (newest first)
    const existingIndex = isMetaSampleTest
      ? this.leads.findIndex((l) => l.id === lead.id)
      : this.leads.findIndex((l) => l.id === lead.id || l.leadgen_id === lead.leadgen_id);

    if (existingIndex >= 0) {
      this.leads[existingIndex] = { ...this.leads[existingIndex], ...lead };
    } else {
      this.leads.unshift(lead);
    }

    this.persistLeads();
    return lead;
  }

  public getLeads(status?: LeadStatus, search?: string): FormattedLead[] {
    let result = [...this.leads];

    if (status) {
      result = result.filter((l) => l.status === status);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((l) => {
        const nameMatch = l.full_name?.toLowerCase().includes(q);
        const emailMatch = l.email?.toLowerCase().includes(q);
        const phoneMatch = l.phone_number?.toLowerCase().includes(q);
        const companyMatch = l.company_name?.toLowerCase().includes(q);
        const formMatch = l.form_name?.toLowerCase().includes(q);
        return nameMatch || emailMatch || phoneMatch || companyMatch || formMatch;
      });
    }

    return result;
  }

  public getLeadById(id: string): FormattedLead | null {
    return this.leads.find((l) => l.id === id || l.leadgen_id === id) || null;
  }

  public updateLeadStatus(
    id: string,
    status: LeadStatus,
    contactedAt?: string,
    responseTimeSeconds?: number
  ): FormattedLead | null {
    const lead = this.getLeadById(id);
    if (!lead) return null;

    lead.status = status;
    if (contactedAt) lead.contacted_at = contactedAt;
    if (responseTimeSeconds !== undefined) lead.response_time_seconds = responseTimeSeconds;

    this.persistLeads();
    return lead;
  }

  public updateLeadNotes(id: string, notes: string): FormattedLead | null {
    const lead = this.getLeadById(id);
    if (!lead) return null;

    lead.notes = notes;
    this.persistLeads();
    return lead;
  }

  public clearLeads(): void {
    this.leads = [];
    this.processedLeadIds.clear();
    this.persistLeads();
  }

  public saveActivity(activity: SystemActivityLog): void {
    this.activities.unshift(activity);
    if (this.activities.length > 50) {
      this.activities = this.activities.slice(0, 50);
    }
    this.persistActivities();
  }

  public getActivities(): SystemActivityLog[] {
    return this.activities;
  }
}

export const storageService = new StorageService();
