# Assumptions & System Design Document
## Project: Meta Lead Ads $\rightarrow$ React Native Live Sync PoC

---

### 1. Overview & Objectives
This Proof-of-Concept (PoC) demonstrates a zero-latency, real-time pipeline between **Meta Lead Ads** and a **React Native Mobile App**. 
When a prospective user fills out a lead form on Facebook/Instagram or when a test lead is generated via Meta's **Lead Ads Testing Tool**, the lead is ingested via Webhook, enriched via Meta Graph API, and pushed instantly to the mobile app screen over WebSockets.

---

### 2. Meta Platform & Access Token Assumptions

| Parameter / Scope | Requirement | Description / Rationale |
| :--- | :--- | :--- |
| **Meta Developer Account** | Required for Live Webhooks | A Meta Developer account is required to register an App and configure Webhook subscriptions. |
| **Meta App Type** | `Business` or `Consumer` | A Meta App with the `Webhooks` product added and subscribed to the `Page` object (`leadgen` field). |
| **Meta Page Access Token** | `META_PAGE_ACCESS_TOKEN` | Required by the Graph API to query `GET /v19.0/{leadgen_id}`. User tokens cannot query lead details on behalf of a page. |
| **Token Permissions** | `leads_retrieval`, `pages_show_list`, `pages_read_engagement`, `pages_manage_ads` | Minimum permission set required to access the Page's leadgen data via Graph API. |
| **Meta App Secret** | `META_APP_SECRET` | Used to compute and verify the HMAC-SHA256 signature in the `X-Hub-Signature-256` header of incoming webhook requests. |
| **Verify Token** | `META_VERIFY_TOKEN` | Arbitrary shared secret string used during the initial Meta Webhook handshake (`hub.challenge` verification). |

---

### 3. Graceful Fallbacks & Offline Simulation Mode
In development, sandbox, or offline testing environments:
1. **Mock Fallback on Missing Token:** If `META_PAGE_ACCESS_TOKEN` is blank or invalid, the backend automatically intercepts the lead request and generates realistic lead data (with Indian/International names, verified phone formats, and customizable form responses) so testing proceeds without interruption.
2. **Direct Developer Simulation API (`POST /api/simulate-lead`):** Allows any client, developer script, or the mobile app itself to broadcast realistic leads directly without requiring Meta server latency or active internet tunnels.
3. **CLI Webhook Simulator (`npm run simulate:webhook`):** Dispatches authentic Meta-formatted payloads complete with HMAC-SHA256 headers directly to `POST /webhook` to validate cryptographic verification locally.

---

### 4. Network Topology & Device Assumptions

1. **Localhost & Mobile Device Connectivity:**
   - **iOS Simulator / Web:** Connects to `http://localhost:4000`.
   - **Android Emulator:** Uses `http://10.0.2.2:4000` (Android's loopback alias for host machine).
   - **Physical Device (Expo Go):** Connects to the host PC's Local Area Network (LAN) IP (e.g., `http://192.168.1.50:4000`) or a public tunnel.
   - *In-App Switcher:* The mobile app includes a one-tap Server Config modal allowing testers to change the WebSocket target at runtime.

2. **Public Tunneling for Meta Webhooks:**
   - Meta requires a public HTTPS endpoint for webhook delivery.
   - Recommended tools: **Ngrok** (`ngrok http 4000`), **Cloudflare Tunnel** (`cloudflared tunnel --url http://localhost:4000`), or **LocalTunnel** (`npx localtunnel --port 4000`).

---

### 5. Latency & Performance SLA
- **Target End-to-End Latency:** $< 2000\text{ ms}$ from Meta form submission to mobile screen appearance.
- **WebSocket Protocol:** `Socket.io` v4 with automatic fallback to HTTP Long-Polling if WebSocket traffic is restricted on strict corporate firewalls.
- **Micro-interactions:** In-app audio-visual chime and card glow ensure instant visual confirmation for sales reps.

---

### 6. Scope Boundaries (PoC vs Production)
- **Database Persistence:** In this PoC, leads are held in active client memory / socket streams. In production, leads would be saved to PostgreSQL/MongoDB with idempotency checks against duplicate `leadgen_id`s.
- **Multi-tenancy & Auth:** In production, socket connections would require JWT authentication and user/organization room isolation (`socket.join("org_123")`).
