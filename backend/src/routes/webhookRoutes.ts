import { Router, Request, Response } from 'express';
import { metaService } from '../services/metaService';
import { socketService } from '../services/socketService';
import { MetaWebhookPayload } from '../types/lead';

const router = Router();

// Verification endpoint for Meta webhook setup
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

// Receiver for Meta leadgen webhook events
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const signature = req.headers['x-hub-signature-256'] as string | undefined;

    // Validate HMAC signature
    const isValid = metaService.verifySignature(rawBody, signature);
    if (!isValid) {
      console.warn('[Webhook] Invalid signature header');
      res.status(401).json({ error: 'Invalid HMAC signature' });
      return;
    }

    // Acknowledge immediately to prevent retries
    res.status(200).send('EVENT_RECEIVED');

    const startTime = Date.now();
    const body: MetaWebhookPayload = req.body;
    console.log('[Webhook] Received payload from Meta');

    if (body.object === 'page' && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (!Array.isArray(entry.changes)) continue;
        
        for (const change of entry.changes) {
          if (change.field === 'leadgen' && change.value?.leadgen_id) {
            const leadgenId = change.value.leadgen_id;
            console.log(`[Webhook] Processing leadgen_id: ${leadgenId}`);

            const formattedLead = await metaService.fetchLeadDetails(leadgenId, startTime, isValid);
            socketService.broadcastNewLead(formattedLead);
          }
        }
      }
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[Webhook] Error processing event:', err.message);
  }
});

export default router;
