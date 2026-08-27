import { Router, Request, Response } from 'express';
import { metaService } from '../services/metaService';
import { socketService } from '../services/socketService';
import { config } from '../config/env';

const router = Router();

/**
 * GET /api/health
 * System health and connected clients count
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connectedMobileClients: socketService.getConnectedClientsCount(),
    graphApiConfigured: Boolean(config.meta.pageAccessToken),
    webhookVerifyTokenConfigured: Boolean(config.meta.verifyToken),
  });
});

/**
 * GET /api/activities
 * Returns recent system activity events
 */
router.get('/activities', (req: Request, res: Response) => {
  res.json({
    activities: socketService.getRecentActivities(),
  });
});

/**
 * POST /api/simulate-lead
 * Standalone mock endpoint for local debugging and quick test demo
 */
router.post('/simulate-lead', (req: Request, res: Response) => {
  const customData = req.body || {};
  const mockLead = metaService.generateMockLead(
    customData.leadgen_id
  );

  if (customData.full_name) mockLead.full_name = customData.full_name;
  if (customData.email) mockLead.email = customData.email;
  if (customData.phone_number) mockLead.phone_number = customData.phone_number;

  // Broadcast to all active phone/simulator screens
  socketService.broadcastNewLead(mockLead);

  res.status(201).json({
    message: 'Lead simulated and broadcasted successfully',
    lead: mockLead,
  });
});

export default router;
