import { Router, Request, Response } from 'express';
import { metaService } from '../services/metaService';
import { socketService } from '../services/socketService';
import { MetaWebhookPayload } from '../types/lead';

const router = Router();

/**
 * GET /webhook
 * Verification handshake endpoint for Meta Webhook setup
 */
router.get('/', (req: Request, res: Response): void => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifiedChallenge = metaService.verifyWebhookChallenge(mode, token, challenge);
  if (verifiedChallenge) {
    res.status(200).send(verifiedChallenge);
    return;
  }

  res.status(403).send('Forbidden: Token mismatch or invalid mode.');
});

/**
 * POST /webhook
 * Real-time receiver for Meta leadgen webhook events
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const signature = req.headers['x-hub-signature-256'] as string | undefined;

    // Cryptographic validation of Meta HMAC signature
    const isValid = metaService.verifySignature(rawBody, signature);
    if (!isValid) {
      console.warn('[Webhook] ⚠️ Invalid X-Hub-Signature-256 header.');
      res.status(401).json({ error: 'Invalid HMAC signature' });
      return;
    }

    // Immediately acknowledge receipt with 200 OK to Meta to avoid retry storms
    res.status(200).send('EVENT_RECEIVED');

    const startTime = Date.now();
    const body: MetaWebhookPayload = req.body;
    console.log('[Webhook] 📬 Received valid webhook payload from Meta');

    if (body.object === 'page' && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (!Array.isArray(entry.changes)) continue;
        
        for (const change of entry.changes) {
          if (change.field === 'leadgen' && change.value?.leadgen_id) {
            const leadgenId = change.value.leadgen_id;
            console.log(`[Webhook] 🎯 Processing Leadgen Event: leadgen_id=${leadgenId}`);

            // Fetch full lead information from Meta Graph API with timing telemetry
            const formattedLead = await metaService.fetchLeadDetails(leadgenId, startTime, isValid);

            // Broadcast instantly to all connected mobile clients over WebSockets
            socketService.broadcastNewLead(formattedLead);
          }
        }
      }
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[Webhook] ❌ Error processing webhook event:', err.message);
  }
});

export default router;
