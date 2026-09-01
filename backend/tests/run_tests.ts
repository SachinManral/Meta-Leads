import assert from 'assert';
import crypto from 'crypto';
import { metaService } from '../src/services/metaService';
import { storageService } from '../src/services/storageService';
import { config } from '../src/config/env';
import { MetaLeadGraphResponse } from '../src/types/lead';

let passed = 0;
let failed = 0;

function it(desc: string, fn: () => void) {
  try {
    fn();
    console.log(`  PASS: ${desc}`);
    passed++;
  } catch (err: unknown) {
    console.error(`  FAIL: ${desc}`);
    console.error(`     ${(err as Error).message}`);
    failed++;
  }
}

console.log('\nRunning Meta Leads Test Suite...\n');

console.log('1. Cryptographic HMAC Verification');

it('should verify valid HMAC-SHA256 signature when secret matches', () => {
  const secret = config.meta.appSecret || 'test_app_secret_123';
  const payload = JSON.stringify({ object: 'page', entry: [{ id: '12345' }] });
  const hash = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
  const signatureHeader = `sha256=${hash}`;

  // Temporarily set appSecret in config if empty
  const originalSecret = config.meta.appSecret;
  Object.defineProperty(config.meta, 'appSecret', { value: secret, configurable: true });

  const isValid = metaService.verifySignature(payload, signatureHeader);
  assert.strictEqual(isValid, true, 'Valid signature should return true');

  Object.defineProperty(config.meta, 'appSecret', { value: originalSecret, configurable: true });
});

it('should reject tampered payload with mismatched signature', () => {
  const secret = 'test_app_secret_123';
  const originalPayload = JSON.stringify({ object: 'page', entry: [{ id: '12345' }] });
  const tamperedPayload = JSON.stringify({ object: 'page', entry: [{ id: '99999' }] });
  const hash = crypto.createHmac('sha256', secret).update(originalPayload, 'utf8').digest('hex');
  const signatureHeader = `sha256=${hash}`;

  const originalSecret = config.meta.appSecret;
  Object.defineProperty(config.meta, 'appSecret', { value: secret, configurable: true });

  const isValid = metaService.verifySignature(tamperedPayload, signatureHeader);
  assert.strictEqual(isValid, false, 'Tampered payload must return false');

  Object.defineProperty(config.meta, 'appSecret', { value: originalSecret, configurable: true });
});

it('should reject invalid or missing signature header formats', () => {
  assert.strictEqual(metaService.verifySignature('body', undefined), false);
  assert.strictEqual(metaService.verifySignature('body', 'md5=invalid_prefix'), false);
  assert.strictEqual(metaService.verifySignature('body', 'sha256=short'), false);
});

console.log('\n2. Webhook Challenge Handshake Verification');

it('should accept valid subscribe mode and matching token', () => {
  const challenge = 'random_challenge_string_9988';
  const result = metaService.verifyWebhookChallenge('subscribe', config.meta.verifyToken, challenge);
  assert.strictEqual(result, challenge, 'Handshake should return challenge string');
});

it('should reject token mismatch or wrong mode', () => {
  assert.strictEqual(metaService.verifyWebhookChallenge('subscribe', 'wrong_token', '123'), null);
  assert.strictEqual(metaService.verifyWebhookChallenge('unsubscribe', config.meta.verifyToken, '123'), null);
});

console.log('\n3. Lead Normalization & Field Mapping');

it('should normalize Meta Graph API response with custom questions', () => {
  const mockGraphResponse: MetaLeadGraphResponse = {
    id: 'lead_graph_9999',
    created_time: '2026-08-31T10:00:00.000Z',
    form_name: 'Q3 Enterprise Lead Ad',
    field_data: [
      { name: 'full_name', values: ['Priya Sharma'] },
      { name: 'email', values: ['priya.sharma@example.com'] },
      { name: 'phone_number', values: ['+91 9812345678'] },
      { name: 'city', values: ['Mumbai'] },
      { name: 'company_name', values: ['Fintech Systems Ltd'] },
      { name: 'Estimated Budget', values: ['$50,000+'] },
      { name: 'Timeline', values: ['Immediate'] },
    ],
  };

  const telemetry = {
    webhook_received_at: '2026-08-31T10:00:01.000Z',
    graph_api_fetched_at: '2026-08-31T10:00:01.045Z',
    broadcast_at: '2026-08-31T10:00:01.050Z',
    pipeline_latency_ms: 50,
    hmac_verified: true,
    duplicate_protected: true,
  };

  const normalized = metaService.normalizeLeadData(mockGraphResponse, telemetry);

  assert.strictEqual(normalized.id, 'lead_graph_9999');
  assert.strictEqual(normalized.full_name, 'Priya Sharma');
  assert.strictEqual(normalized.email, 'priya.sharma@example.com');
  assert.strictEqual(normalized.phone_number, '+91 9812345678');
  assert.strictEqual(normalized.city, 'Mumbai');
  assert.strictEqual(normalized.company_name, 'Fintech Systems Ltd');
  assert.strictEqual(normalized.custom_fields['Estimated Budget'], '$50,000+');
  assert.strictEqual(normalized.custom_fields['Timeline'], 'Immediate');
  assert.strictEqual(normalized.telemetry.pipeline_latency_ms, 50);
});

console.log('\n4. Persistent Storage & Deduplication');

it('should save lead, deduplicate, and support status and notes updates', () => {
  const testLeadId = `test_${Date.now()}`;
  const testLead = metaService.generateMockLead(testLeadId);
  testLead.full_name = 'Test Deduplication User';

  storageService.saveLead(testLead);
  assert.strictEqual(storageService.isDuplicate(testLeadId), true, 'Lead must be marked as duplicate');

  // Update Status
  const updatedStatus = storageService.updateLeadStatus(testLead.id, 'contacted', new Date().toISOString(), 45);
  assert.strictEqual(updatedStatus?.status, 'contacted');
  assert.strictEqual(updatedStatus?.response_time_seconds, 45);

  // Update Notes
  const updatedNotes = storageService.updateLeadNotes(testLead.id, 'Spoke with client. Very interested in enterprise plan.');
  assert.strictEqual(updatedNotes?.notes, 'Spoke with client. Very interested in enterprise plan.');

  // Search Filter
  const searchResults = storageService.getLeads(undefined, 'Deduplication');
  assert.strictEqual(searchResults.length >= 1, true, 'Search should find the lead by name');
});

console.log(`\nTest Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
