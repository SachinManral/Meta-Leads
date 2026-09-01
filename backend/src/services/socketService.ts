import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { FormattedLead, SystemActivityLog, LeadStatus } from '../types/lead';
import { storageService } from './storageService';

class SocketService {
  private io: SocketIOServer | null = null;
  private connectedClientsCount: number = 0;

  public initialize(httpServer: HTTPServer, corsOrigin: string = '*'): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket: Socket) => {
      this.connectedClientsCount++;
      console.log(`[Socket] Client connected: ${socket.id} (total: ${this.connectedClientsCount})`);

      socket.emit('connection_status', {
        status: 'connected',
        socketId: socket.id,
        connectedAt: new Date().toISOString(),
        totalClients: this.connectedClientsCount,
      });

      // Send existing leads to new client
      const existingLeads = storageService.getLeads();
      socket.emit('initial_leads', existingLeads);

      const recentActivities = storageService.getActivities();
      if (recentActivities.length > 0) {
        socket.emit('activity_history', recentActivities);
      }

      this.logActivity({
        type: 'client_connected',
        message: `Mobile client connected (${socket.id.substring(0, 6)}...)`,
        metadata: { socketId: socket.id, totalClients: this.connectedClientsCount },
      });

      // Handle status updates from client
      socket.on('update_lead_status', (data: { leadId: string; status: LeadStatus; contactedAt?: string; responseTimeSeconds?: number }) => {
        console.log(`[Socket] Lead ${data.leadId} status changed to "${data.status}"`);
        
        storageService.updateLeadStatus(data.leadId, data.status, data.contactedAt, data.responseTimeSeconds);

        this.logActivity({
          type: 'status_updated',
          message: `Lead ${data.leadId.substring(0, 10)} marked as "${data.status}"`,
          metadata: data,
        });

        this.io?.emit('lead_status_updated', data);
      });

      // Handle notes updates
      socket.on('update_lead_notes', (data: { leadId: string; notes: string }) => {
        console.log(`[Socket] Lead ${data.leadId} notes updated`);
        storageService.updateLeadNotes(data.leadId, data.notes);
        this.io?.emit('lead_notes_updated', data);
      });

      socket.on('disconnect', (reason) => {
        this.connectedClientsCount = Math.max(0, this.connectedClientsCount - 1);
        console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
      });
    });

    return this.io;
  }

  public broadcastNewLead(lead: FormattedLead): void {
    if (!this.io) {
      console.warn('[Socket] Socket.io not initialized yet');
      return;
    }

    console.log(`[Socket] Broadcasting new lead: ${lead.full_name} (${lead.leadgen_id}) [${lead.telemetry.pipeline_latency_ms}ms]`);
    this.io.emit('new_lead', lead);

    this.logActivity({
      type: 'lead_broadcast',
      message: `Lead "${lead.full_name}" delivered live (${lead.telemetry.pipeline_latency_ms}ms)`,
      metadata: { leadId: lead.id, leadgenId: lead.leadgen_id, latency: lead.telemetry.pipeline_latency_ms },
    });
  }

  public logActivity(activity: Omit<SystemActivityLog, 'id' | 'timestamp'>): SystemActivityLog {
    const entry: SystemActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...activity,
    };

    storageService.saveActivity(entry);
    this.io?.emit('system_activity', entry);
    return entry;
  }

  public getConnectedClientsCount(): number {
    return this.connectedClientsCount;
  }

  public getRecentActivities(): SystemActivityLog[] {
    return storageService.getActivities();
  }
}

export const socketService = new SocketService();
