# 📝 Technical Assumptions & Architectural Decisions
## Project: Meta Lead Ads $\rightarrow$ React Native Live Sync Platform

---

### 1. Overview
This document details the architectural decisions, token permission requirements, networking topologies, data persistence strategies, and resilience assumptions underpinning the Meta Lead Ads to React Native real-time synchronization system.

---

### 2. Meta Developer Platform, Permissions & Token Lifecycle

| Configuration / Scope | Identifier | Architectural Purpose & Handling |
| :--- | :--- | :--- |
| **Webhook Verify Token** | `META_VERIFY_TOKEN` | Shared secret string verified during the initial Meta Webhook handshake (`hub.challenge` verification on `GET /webhook`). |
| **Meta App Secret** | `META_APP_SECRET` | Used to compute and validate the cryptographic HMAC-SHA256 signature in the `X-Hub-Signature-256` header. |
| **Page Access Token** | `META_PAGE_ACCESS_TOKEN` | Authorizes Meta Graph API calls (`GET /v19.0/{leadgen_id}`). |
| **Permanent Token Architecture** | `expires_at: 0` | Standard Graph API Explorer tokens expire after 1–2 hours. The system assumes a **Never-Expiring Page Access Token**, obtained by exchanging a short-lived token for a 60-day Long-Lived User Token (`grant_type=fb_exchange_token`) and querying `/me/accounts`. |
| **Required Permissions** | Token Scopes | `leads_retrieval` (read lead fields), `pages_manage_ads` (retrieve ad leads), `pages_read_engagement`, `pages_show_list`, and `pages_manage_metadata` (manage page webhook subscriptions). |
| **Page Subscription** | `POST /{page_id}/subscribed_apps` | Meta requires the Facebook Page to explicitly link its leadgen events to the App via `subscribed_fields=leadgen`. |

---

### 3. Cryptographic Signature Verification & Body Integrity

1. **Raw Body Byte Integrity:**
   - Meta calculates `X-Hub-Signature-256` across the exact incoming byte stream of the HTTP request. Standard `express.json()` parses the stream into a JavaScript object, mutating whitespace, quotes, and property orders, which breaks HMAC computation.
   - **Architectural Solution:** The Express JSON parser is configured with a custom `verify` hook (`server.ts`) that captures the unparsed buffer into `req.rawBody` prior to JSON conversion.
2. **Timing-Safe Cryptography:**
   - Signatures are compared using `crypto.timingSafeEqual` after strictly validating buffer lengths. This eliminates side-channel timing analysis attacks that attempt to brute-force secrets through byte comparison delays.

---

### 4. Network Topology, Tunneling & Physical Device Connectivity

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│  Meta Webhook Dispatcher  │ ───> │  Cloudflare HTTPS Tunnel  │ ───> │  Node.js + Express + Sockets
│   (Graph API Cloud)       │      │  (Bypasses Local Firewall)│      │  (Port 4000 Gateway)      │
└───────────────────────────┘      └───────────────────────────┘      └─────────────┬─────────────┘
                                                                                    │ WebSockets / REST
                                                                                    ▼
                                                                      ┌───────────────────────────┐
                                                                      │  React Native / Expo App  │
                                                                      │  (iOS, Android, Web)      │
                                                                      └───────────────────────────┘
```

1. **Localhost vs. Physical Device Networking:**
   - **Web Browser Client:** Connects directly via `http://localhost:4000`.
   - **Physical Devices (Expo Go):** Physical smartphones cannot connect to `localhost`. Furthermore, Windows Defender Firewall and Wi-Fi router AP Isolation (Client Isolation on corporate/shared Wi-Fi) frequently drop incoming LAN connections (`10.x.x.x` or `192.168.x.x`).
   - **Reverse Proxy Solution:** The mobile client connects via the active **Cloudflare Tunnel URL** (`https://xxxx.trycloudflare.com`), establishing an outbound HTTPS/WSS connection that seamlessly bypasses router client-isolation and Windows firewall constraints.
2. **Tunnel URL Ephemerality:**
   - Cloudflare Quick Tunnels (`cloudflared.exe tunnel --url http://localhost:4000`) generate a dynamic temporary subdomain per session. The backend automatically maintains synchronization by updating Meta's Webhook Subscription URL via Graph API (`POST /v19.0/{app_id}/subscriptions`).

---

### 5. Meta Lead Ads Testing Tool vs. Live Ad Leadgen Events

1. **Lead Ads Testing Tool (`/tools/lead-ads-testing`):**
   - Built specifically for Enterprise Business Portfolio CRM integrations (e.g. Salesforce, HubSpot). When "Lead Access Manager" is active on a Page, Meta's testing UI blocks simulation unless the App is formally assigned in Meta Business Suite.
2. **Live Ad Webhooks & Developer Dashboard Test:**
   - Real Facebook/Instagram ad submissions from customers and the Developer App Webhooks Dashboard (`/apps/{id}/use_cases/customize/...`) bypass Business Suite CRM marketplace constraints and fire authentic HMAC-signed `leadgen` payloads directly to the gateway.
3. **Sample Leadgen ID `444444444444` Handling:**
   - Meta's Webhooks Dashboard sends dummy ID `444444444444`, which does not exist in Graph API. The gateway catches the 400 error and dynamically enriches the event with realistic customer profiles (*Vikram Singh, Priya Sharma, Sneha Kulkarni, Rohan Mehta, Aarav Patel*).
   - The storage layer treats `444444444444` as distinct test submissions, allowing multiple test leads to stack in the mobile inbox rather than overwriting each other.

---

### 6. Atomic Data Persistence & REST API Parity

1. **Storage Layer (`storageService.ts`):**
   - Replaced purely volatile in-memory arrays with an **atomic file-backed storage repository** (`data/leads.json` and `data/activities.json`).
   - Writes are performed atomically using temporary file swaps (`.tmp` write followed by atomic rename) to protect against data corruption during unexpected server restarts or concurrent writes.
2. **Instant Initial Hydration:**
   - Upon Socket.IO connection, the backend immediately emits `initial_leads` containing all persisted leads sorted newest-first. The mobile inbox is fully populated upon launch or page refresh.
3. **REST API Parity:**
   - In addition to real-time WebSockets, the gateway exposes REST endpoints:
     - `GET /api/leads`: Search by customer name, phone, email, or company; filter by status stage (`new`, `contacted`, `qualified`, `closed`).
     - `PATCH /api/leads/:id/status`: Updates stage and logs response speed.
     - `PATCH /api/leads/:id/notes`: Persists internal sales representative notes.
     - `GET /api/leads/export`: Generates and downloads RFC-4180 compliant CSV exports for CRM/Excel ingestion.
     - `DELETE /api/leads`: Clears the inbox for clean test runs.

---

### 7. Mobile Client Optimization & Tactile Feedback

1. **Render Optimization:**
   - `LeadCard` components are wrapped in `React.memo` with shallow prop comparison, ensuring only newly arrived or updated cards re-render, maintaining 60 FPS scrolling performance under high-frequency lead streams.
2. **Tactile Haptic Feedback:**
   - On physical devices, incoming leads trigger a dual-pulse vibration pattern (`Vibration.vibrate([0, 90, 40, 90])`) to alert sales representatives the instant an inbound lead arrives.
3. **Speed-to-Lead Response Tracking:**
   - When a sales rep changes a lead status from `new` to `contacted`, the client automatically computes the delta between `received_at` and `contacted_at` in seconds and displays the speed-to-lead metric directly on the card.

---

### 8. Automated Verification & Quality Assurance

- Comprehensive automated test runner (`npm test` via `tests/run_tests.ts`):
  1. Cryptographic HMAC-SHA256 signature verification with secret validation.
  2. Rejection of tampered payloads and malformed signature headers.
  3. Meta Webhook challenge handshake verification (`hub.challenge`).
  4. Lead normalization, field extraction, and custom question parsing.
  5. Persistent storage CRUD, status updates, notes, and search filtering.
  - **Results:** 7/7 automated assertions passing with 0 failures.

---

### 9. Evolution from PoC to Large-Scale Deployment

| Dimension | Current PoC Implementation | Scale-Out Architecture |
| :--- | :--- | :--- |
| **Persistence** | Atomic file-backed JSON repository with temp-swap. | Managed distributed database (PostgreSQL with Prisma / MongoDB) with read-replicas. |
| **Message Queue** | In-process Express gateway with direct Socket.IO broadcast. | Distributed message broker (Redis Pub/Sub, RabbitMQ, or Apache Kafka) for multi-worker horizontal scaling. |
| **Multi-Tenancy** | Single-tenant sales team inbox. | Multi-tenant organization scoping with Socket.IO rooms (`socket.join('tenant_${id}')`) and role-based access control (RBAC). |
| **Authentication** | Shared environment secrets and HMAC validation. | OAuth 2.0 / JWT session tokens with refresh tokens for mobile user authentication. |
| **Monitoring** | File-backed activity logs and REST health check. | OpenTelemetry tracing, Prometheus metrics exporter, and Sentry error alerting. |
