import { Router, Request, Response } from 'express';
import { metaService } from '../services/metaService';
import { socketService } from '../services/socketService';
import { storageService } from '../services/storageService';
import { config } from '../config/env';
import { LeadStatus } from '../types/lead';

const router = Router();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connectedMobileClients: socketService.getConnectedClientsCount(),
    graphApiConfigured: Boolean(config.meta.pageAccessToken),
    webhookVerifyTokenConfigured: Boolean(config.meta.verifyToken),
    totalPersistedLeads: storageService.getLeads().length,
  });
});

// List leads with optional status/search filters
router.get('/leads', (req: Request, res: Response) => {
  const status = req.query.status as LeadStatus | undefined;
  const search = req.query.search as string | undefined;

  const leads = storageService.getLeads(status, search);
  res.json({
    total: leads.length,
    leads,
  });
});

// Export leads as CSV
router.get('/leads/export', (req: Request, res: Response) => {
  const leads = storageService.getLeads();

  const headers = ['ID', 'Leadgen ID', 'Created Time', 'Full Name', 'Email', 'Phone', 'City', 'Company', 'Status', 'Speed to Lead (s)', 'Notes'];
  const rows = leads.map((l) => [
    `"${l.id}"`,
    `"${l.leadgen_id}"`,
    `"${l.created_time}"`,
    `"${(l.full_name || '').replace(/"/g, '""')}"`,
    `"${(l.email || '').replace(/"/g, '""')}"`,
    `"${(l.phone_number || '').replace(/"/g, '""')}"`,
    `"${(l.city || '').replace(/"/g, '""')}"`,
    `"${(l.company_name || '').replace(/"/g, '""')}"`,
    `"${l.status}"`,
    l.response_time_seconds || '',
    `"${(l.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="meta-leads-${Date.now()}.csv"`);
  res.status(200).send(csv);
});

// Get lead by ID
router.get('/leads/:id', (req: Request, res: Response) => {
  const lead = storageService.getLeadById(req.params.id);
  if (!lead) {
    res.status(404).json({ error: 'Lead not found' });
    return;
  }
  res.json({ lead });
});

// Update lead status
router.patch('/leads/:id/status', (req: Request, res: Response) => {
  const { status, contactedAt, responseTimeSeconds } = req.body;
  if (!status) {
    res.status(400).json({ error: 'Status is required' });
    return;
  }

  const updated = storageService.updateLeadStatus(req.params.id, status, contactedAt, responseTimeSeconds);
  if (!updated) {
    res.status(404).json({ error: 'Lead not found' });
    return;
  }

  socketService.logActivity({
    type: 'status_updated',
    message: `Lead ${updated.id.substring(0, 10)} marked as "${status}"`,
    metadata: { leadId: updated.id, status },
  });

  res.json({ lead: updated });
});

// Update lead notes
router.patch('/leads/:id/notes', (req: Request, res: Response) => {
  const { notes } = req.body;
  const updated = storageService.updateLeadNotes(req.params.id, notes || '');
  if (!updated) {
    res.status(404).json({ error: 'Lead not found' });
    return;
  }
  res.json({ lead: updated });
});

// Clear all leads
router.delete('/leads', (req: Request, res: Response) => {
  storageService.clearLeads();
  socketService.logActivity({
    type: 'status_updated',
    message: 'Lead inbox cleared by user',
  });
  res.json({ message: 'All leads cleared successfully' });
});

// Recent activity events
router.get('/activities', (req: Request, res: Response) => {
  res.json({
    activities: storageService.getActivities(),
  });
});

// Simulation endpoint for test demo
router.post('/simulate-lead', (req: Request, res: Response) => {
  const customData = req.body || {};
  const mockLead = metaService.generateMockLead(customData.leadgen_id);

  if (customData.full_name) mockLead.full_name = customData.full_name;
  if (customData.email) mockLead.email = customData.email;
  if (customData.phone_number) mockLead.phone_number = customData.phone_number;

  storageService.saveLead(mockLead);
  socketService.broadcastNewLead(mockLead);

  res.status(201).json({
    message: 'Lead simulated and broadcasted successfully',
    lead: mockLead,
  });
});

export default router;
