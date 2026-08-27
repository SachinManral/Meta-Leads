# Business Requirements Document (BRD)
## Project: Meta Lead Ads to React Native Live Sync PoC

---

### 1. Executive Summary
This project is a Proof-of-Concept (PoC) demonstrating a frictionless, real-time lead capture pipeline. When a prospective customer submits a Meta Lead Ad form (simulated via Meta's Leadgen Testing Tool), the lead data must instantly synchronize and appear on an open React Native mobile screen without any user intervention or manual pull-to-refresh.

---

### 2. Business Objectives & Value Proposition
* **Zero-Latency Lead Notification:** Immediate lead delivery enables sales reps to reach leads within seconds (the golden window of conversion), dramatically increasing lead-to-close rates.
* **Frictionless Experience:** Eliminate manual polling or app restarts. The lead pops up live with sound and visual feedback.
* **Enterprise Security & Reliability:** Verify Webhook authenticity using Meta App Secret (`X-Hub-Signature-256`) and handle edge cases gracefully (network reconnect, token expiration).

---

### 3. Scope of Work

#### In Scope
1. **Backend Integration Service:**
   * Meta Webhook verification endpoint (`GET /webhook`) for Meta handshake.
   * Webhook event receiver endpoint (`POST /webhook`) to capture `leadgen` event notifications.
   * Secure Graph API fetching using Page Access Token to retrieve lead details (`full_name`, `email`, `phone_number`, `custom_questions`, `created_time`).
   * Real-time push mechanism (WebSockets / Socket.io) broadcasting leads to connected mobile clients.
2. **React Native Mobile App (Clean Minimalist White Theme):**
   * Real-time connection manager (auto-reconnect, connection status indicator).
   * Live Leads feed list (clean card-based UI, minimalist aesthetic).
   * Instant micro-animation (smooth entry animation + subtle indicator) when a new lead arrives.
   * Lead detail modal showing raw & formatted response fields.
3. **Meta Developer Platform Setup:**
   * Meta App configuration (Webhooks product, Page subscription).
   * Webhook tunneling via Ngrok / Cloudflare Tunnel / LocalTunnel.
   * Meta Lead Ads Testing Tool simulation.

#### Out of Scope
* Paid Meta advertising campaigns (all testing done using Meta Lead Testing Tool).
* Production multi-tenant database & auth system (PoC focuses on live real-time pipeline & clean architecture).

---

### 4. Stakeholder Deliverables & Success Metrics
| Deliverable | Description | Success Metric |
| :--- | :--- | :--- |
| **Loom Video 1 (Live Demo)** | Max 5 min showing Meta tool submit $\rightarrow$ instant mobile screen update without touching phone | 100% automated update within $< 2$ seconds |
| **Loom Video 2 (Architecture)** | Code walkthrough & technical explanation | Clear explanation of Webhook, Graph API & Socket flow |
| **Git Repository** | Clean, modular, well-documented source code | Production-quality code structure with clear README |
| **Assumptions Document** | Explicit list of environment & token assumptions | Clear setup instructions for reproducibility |

---

### 5. Non-Functional Requirements
* **Latency:** End-to-end delivery from webhook trigger to mobile UI update $< 2$ seconds.
* **Resilience:** Graceful handling of disconnected socket clients with automatic reconnection.
* **Design Philosophy:** Crisp, clean, minimalist white UI typography and fluid layout.
