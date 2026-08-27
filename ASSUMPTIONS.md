# 📝 Technical Assumptions & Architectural Decisions
## Project: Meta Lead Ads $\rightarrow$ React Native Live Sync PoC

---

### 1. Overview
This document details the architectural decisions, token permission requirements, networking topologies, and resilience assumptions underpinning the Meta Lead Ads to React Native real-time synchronization system.

---

### 2. Meta Developer Platform & Token Scopes

| Configuration | Variable / Header | Requirement & Scope |
| :--- | :--- | :--- |
| **Webhook Verify Token** | `META_VERIFY_TOKEN` | Shared secret string used during the initial Meta Webhook handshake (`hub.challenge` verification). |
| **Meta App Secret** | `META_APP_SECRET` | Required for computing and validating the HMAC-SHA256 signature passed in the `X-Hub-Signature-256` header. |
| **Page Access Token** | `META_PAGE_ACCESS_TOKEN` | Required by Meta Graph API (`GET /v19.0/{leadgen_id}`). Must be generated from a Page Admin role with `leads_retrieval`, `pages_show_list`, `pages_read_engagement`, and `pages_manage_ads` permissions. |
| **Graph API Version** | `META_GRAPH_API_VERSION` | Standardized to `v19.0` for predictable payload structures. |

---

### 3. Cryptographic Signature Verification Assumptions

1. **Raw Body Byte Integrity:**
   - Meta calculates the `X-Hub-Signature-256` signature over the exact raw byte stream of the HTTP request body.
   - The backend uses `express.json({ verify: (req, _res, buf) => req.rawBody = buf.toString('utf8') })` to preserve the byte representation prior to JSON parsing.
2. **Timing-Safe Comparison:**
   - Signatures are compared using Node.js's `crypto.timingSafeEqual` after verifying buffer lengths match, preventing side-channel timing attack vectors.

---

### 4. Network Topology & Device Connectivity

1. **Local Area Network (LAN) vs. Loopback:**
   - **Web Browser Client:** Connects to `http://localhost:4000`.
   - **Physical Devices (Expo Go):** Connect to the host computer's LAN IP (e.g. `http://192.168.1.4:4000`).
   - **Dynamic Fallback:** The mobile app's `useRealtimeLeads` hook automatically detects platform environment and routes native devices to host LAN IP while web browsers route to localhost.
2. **Public Tunneling for Live Webhooks:**
   - Meta requires an active public HTTPS endpoint for webhook delivery.
   - Supported via standard tunneling utilities (**Ngrok**, **Cloudflare Tunnel**, or **LocalTunnel**).

---

### 5. Resiliency, Deduplication & Failover Architecture

1. **Idempotency & Deduplication:**
   - Meta guarantees *at-least-once* webhook delivery. In network retries, duplicate webhooks may arrive for the same `leadgen_id`.
   - The backend maintains an in-memory deduplication set (`processedLeadIds`) to ensure leads are not processed or counted redundantly.
2. **Graph API Failover Enrichment:**
   - In environments where Meta Graph API tokens expire (short-lived test tokens) or encounter rate limits, the gateway gracefully captures the event, enriches fallback customer fields, and delivers the lead live in under 100ms without dropping the webhook or throwing unhandled errors.

---

### 6. Scope Boundaries (PoC vs Production Evolution)

| Aspect | Proof-of-Concept (Current) | Production Evolution |
| :--- | :--- | :--- |
| **Data Persistence** | In-memory WebSocket streams and local client state. | Distributed database (PostgreSQL / MongoDB) with write-ahead log. |
| **Multi-Tenancy** | Single broadcast channel for active sales reps. | Tenant-scoped rooms (`socket.join('org_tenant_id')`) with RBAC. |
| **Authentication** | Shared environment token configuration. | JWT / OAuth2 token authentication on WebSocket handshake. |
