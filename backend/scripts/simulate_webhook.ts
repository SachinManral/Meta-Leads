import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || '4000';
const APP_SECRET = process.env.META_APP_SECRET || '';
const WEBHOOK_URL = `http://localhost:${PORT}/webhook`;

interface SimulationOptions {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  leadgenId?: string;
  pageId?: string;
  formName?: string;
}

// Parse command-line flags (e.g. --name "Alice" --email "alice@example.com")
function parseArgs(): SimulationOptions {
  const args = process.argv.slice(2);
  const options: SimulationOptions = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) {
      options.fullName = args[i + 1];
      i++;
    } else if (args[i] === '--email' && args[i + 1]) {
      options.email = args[i + 1];
      i++;
    } else if (args[i] === '--phone' && args[i + 1]) {
      options.phoneNumber = args[i + 1];
      i++;
    } else if (args[i] === '--id' && args[i + 1]) {
      options.leadgenId = args[i + 1];
      i++;
    }
  }

  return options;
}

/**
 * Creates a valid Meta Webhook Leadgen Event payload matching Meta's exact schema
 */
function createMetaWebhookPayload(leadgenId: string, pageId: string) {
  return {
    object: 'page',
    entry: [
      {
        id: pageId,
        time: Math.floor(Date.now() / 1000),
        changes: [
          {
            field: 'leadgen',
            value: {
              ad_id: `ad_${Math.floor(100000000 + Math.random() * 900000000)}`,
              form_id: `form_${Math.floor(100000000 + Math.random() * 900000000)}`,
              leadgen_id: leadgenId,
              created_time: Math.floor(Date.now() / 1000),
              page_id: pageId,
              adgroup_id: `adgroup_${Math.floor(100000000 + Math.random() * 900000000)}`,
            },
          },
        ],
      },
    ],
  };
}

/**
 * Computes X-Hub-Signature-256 HMAC-SHA256 signature
 */
function computeSignature(payloadString: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadString, 'utf8');
  return `sha256=${hmac.digest('hex')}`;
}

async function runSimulation() {
  const options = parseArgs();
  const leadgenId = options.leadgenId || `lead_${Date.now()}`;
  const pageId = options.pageId || '1029384756';

  const payload = createMetaWebhookPayload(leadgenId, pageId);
  const payloadString = JSON.stringify(payload);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'facebookexternalua',
  };

  if (APP_SECRET) {
    headers['x-hub-signature-256'] = computeSignature(payloadString, APP_SECRET);
    console.log(`🔐 Generated X-Hub-Signature-256 using configured META_APP_SECRET`);
  } else {
    console.log(`ℹ️ No META_APP_SECRET in .env — sending without HMAC header (Development Mode)`);
  }

  console.log(`\n======================================================`);
  console.log(`🚀 Triggering Simulated Meta Webhook Event`);
  console.log(`🎯 Target URL: ${WEBHOOK_URL}`);
  console.log(`📦 Leadgen ID: ${leadgenId}`);
  console.log(`📄 Page ID:    ${pageId}`);
  if (options.fullName) console.log(`👤 Custom Name: ${options.fullName}`);
  console.log(`======================================================\n`);

  try {
    const startTime = Date.now();
    const response = await axios.post(WEBHOOK_URL, payload, { headers });
    const latency = Date.now() - startTime;

    console.log(`✅ Webhook Accepted by Server! Status: ${response.status} (${response.statusText})`);
    console.log(`⏱️ Latency: ${latency}ms`);
    console.log(`📱 Check your React Native mobile app — the lead will have appeared live!\n`);
  } catch (error: any) {
    console.error(`❌ Webhook dispatch failed:`, error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error(`\n💡 Tip: Is the backend server running? Start it with "npm run dev" in the backend directory.`);
    }
  }
}

// Execute simulation
runSimulation();
