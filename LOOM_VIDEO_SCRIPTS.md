# 🎙️ Loom Video Presentation Scripts & Recording Guide
## Project: Meta Lead Ads $\rightarrow$ React Native Live Sync PoC

Use this document as your exact speaking script and screen recording playbook.

---

# 🎬 Video 1: Live Product & Real-Time Demo (< 5 Minutes)

**Target Length:** 3:30 – 4:30 Minutes  
**Goal:** Deliver a polished, confident product demonstration showing the zero-latency lead pipeline, the live delivery trace, speed-to-lead response tracking, and the deep technical inspector.

### 🖥️ Recommended Screen Setup:
- **Left 50%:** Terminal / Testing Tool (`npm run simulate:webhook` or Meta Lead Ads Testing Tool).
- **Right 50%:** React Native App (running in browser or phone screen mirroring) showing the clean white **Meta Leads Inbox** with the pulsing **`● LIVE`** green indicator.
- **Bottom (Optional):** Backend dev terminal showing live logs.

---

### 📜 Word-for-Word Voiceover Script:

#### [0:00 - 0:40] | The Hook & Business Context
> *"Hello everyone! In modern digital sales and lead operations, speed-to-lead is the single most critical factor in conversion. In fact, research shows that responding to an inbound Meta lead within the first five minutes increases conversion rates by up to four hundred percent.*
> 
> *Today, I’m presenting our production-grade Proof-of-Concept that bridges Meta Lead Ads directly into a real-time React Native Lead Inbox in under a hundred milliseconds—with absolutely zero user touch, manual pull-to-refresh, or polling.*
> 
> *On the right side of my screen, you can see our mobile app. The pulsing green indicator at the top confirms that our Socket.IO real-time gateway is live and actively listening for Meta webhook events."*

---

#### [0:40 - 1:50] | The Live Trigger & Animated Delivery Trace
> *"Now let's trigger a live lead through our cryptographic webhook pipeline.*
> 
> *(👉 Action: In terminal, run `npm run simulate:webhook` or click 'Create Lead' in Meta Tool)*
> 
> *Look at the mobile screen—instantly, the lead arrives at the very top of the feed!*
> 
> *Notice what just happened:*
> 1. *The **Live Delivery Trace** expanded with a sequential four-stage verification: Meta Event Received $\rightarrow$ HMAC SHA-256 Verified $\rightarrow$ Graph API Parsed $\rightarrow$ Delivered Live in just eighty-four milliseconds.*
> 2. *The total and uncontacted lead counters updated in real time.*
> 3. *The dynamic freshness indicator shows '⏱️ Received just now'.*
> 
> *This visual proof gives immediate confidence that our backend pipeline executed authentic cryptographic validation and normalization in milliseconds."*

---

#### [1:50 - 2:50] | Lead Card Hierarchy & Speed-to-Lead Response Tracker
> *"Let's examine how a sales representative interacts with this lead daily.*
> 
> *The card provides instant scannability: the lead's name, their requested service—like Enterprise Cloud Migration—their budget estimate, and their preferred contact window.*
> 
> *With a single tap, the sales rep can hit **Call** to launch the phone dialer, or **Email** to start a draft.*
> 
> *(👉 Action: Tap on the lead card to open the Detail Modal)*
> 
> *When we open the lead detail modal, we have a complete status workflow: New, Contacted, Qualified, and Closed.*
> 
> *(👉 Action: Tap 'Contacted')*
> 
> *As soon as I mark this lead as 'Contacted', our speed-to-lead engine automatically calculates and timestamps our exact response time: '⚡ Speed-to-Lead: First contacted in 38 seconds'. This status is also instantly synchronized across any other connected team devices in real time."*

---

#### [2:50 - 3:50] | Technical Delivery Inspector & System Activity Stream
> *"Now let's look at the technical depth built into this tool.*
> 
> *(👉 Action: In modal, tap '🔍 Technical Delivery Details')*
> 
> *For engineering and lead ops teams, this collapsible inspector exposes:*
> - *The exact Meta Leadgen ID.*
> - *Proof of HMAC SHA-256 signature verification.*
> - *End-to-end delivery latency telemetry.*
> - *And the raw JSON payload returned by Meta's Graph API.*
> 
> *(👉 Action: Close modal, then at the bottom of the main screen, tap '▲ View Log' on the System Activity Drawer)*
> 
> *Furthermore, at the bottom of the screen, we have a live System Activity Drawer streaming real-time backend telemetry—showing webhook handshakes, signature checks, and broadcast timestamps."*

---

#### [3:50 - 4:20] | Wrap Up
> *"To summarize: this system transforms raw Meta Webhooks into an intuitive, high-speed, and secure mobile lead inbox that helps sales teams act on high-intent leads the second they are submitted.*
> 
> *In Video 2, I’ll dive into the technical architecture, cryptographic HMAC verification, and React Native optimization. Thank you!"*

---
---

# 🎬 Video 2: Technical Architecture & Code Walkthrough (5–8 Minutes)

**Target Length:** 5:30 – 7:00 Minutes  
**Goal:** Prove deep technical understanding of Webhooks, cryptographic security, Express raw body preservation, WebSocket streaming, React Native performance, and production architecture.

### 🖥️ Recommended Screen Setup:
- **Left 60%:** VS Code showing the codebase (`server.ts`, `metaService.ts`, `useRealtimeLeads.ts`, `LeadCard.tsx`).
- **Right 40%:** Architecture diagram (from `README.md`) or running mobile preview.

---

### 📜 Word-for-Word Voiceover Script:

#### [0:00 - 1:00] | Architecture Overview & The End-to-End Pipeline
> *"Welcome to the technical architecture walkthrough for our Meta Lead Ads Real-Time Synchronization Gateway.*
> 
> *(👉 Action: Open `README.md` sequence diagram)*
> 
> *The core challenge of this project is ensuring zero-latency, secure, and resilient lead ingestion from Meta's distributed infrastructure to mobile clients.*
> 
> *Our architecture follows a clean 4-tier pipeline:*
> 1. *First, Meta triggers an HTTPS POST to our `/webhook` endpoint whenever an Instant Form is submitted.*
> 2. *Second, our Express gateway cryptographically validates the payload using HMAC SHA-256.*
> 3. *Third, our MetaService enriches the lead by querying the Meta Graph API v19.0 using our secure Page Access Token, and normalizes disparate form field keys into a strongly-typed schema.*
> 4. *Fourth, our WebSocket service broadcasts the normalized lead to all connected React Native clients in under a hundred milliseconds."*

---

#### [1:00 - 2:30] | Backend Deep Dive: HMAC Security & Raw Body Preservation
> *"Let's look at how this is implemented in the backend code.*
> 
> *(👉 Action: Open `backend/src/server.ts`)*
> 
> *One common pitfall when implementing Meta Webhooks is that standard `express.json()` parses the request body into a JavaScript object, destroying the original byte sequence. But Meta computes the HMAC signature across the exact raw byte stream.*
> 
> *Here in `server.ts`, we configure our JSON middleware with a custom `verify` hook that captures the exact raw body buffer into `req.rawBody` before parsing.*
> 
> *(👉 Action: Open `backend/src/services/metaService.ts` lines 27–46)*
> 
> *In `metaService.ts`, our `verifySignature` method extracts the `X-Hub-Signature-256` header, creates an HMAC with SHA-256 using our `META_APP_SECRET`, and verifies the signature using Node's `crypto.timingSafeEqual` with byte-length validation. This prevents timing-analysis attack vectors."*

---

#### [2:30 - 4:00] | Graph API Normalization, Deduplication & Telemetry
> *(👉 Action: Scroll down to `fetchLeadDetails` and `normalizeLeadData` in `metaService.ts`)*
> 
> *"Next, in `fetchLeadDetails`, we implement duplicate protection using an in-memory set to prevent duplicate delivery if Meta retries a webhook.*
> 
> *We record high-resolution timestamps at each stage—webhook arrival, Graph API fetch, and WebSocket dispatch—allowing us to compute actual pipeline latency in milliseconds.*
> 
> *In `normalizeLeadData`, because different Meta Lead forms use custom field names like `first_name`, `full_name`, `company_name`, or custom dropdowns, our normalizer intelligently extracts primary contact data while dynamically mapping all bespoke questions into a clean `custom_fields` dictionary."*

---

#### [4:00 - 5:30] | Mobile Client: React Native, WebSockets & Memoization
> *"Now let's switch to the mobile architecture.*
> 
> *(👉 Action: Open `mobile/src/hooks/useRealtimeLeads.ts`)*
> 
> *Our client is built on React Native and Expo with strict TypeScript. Real-time state is encapsulated inside our custom hook `useRealtimeLeads`.*
> 
> *This hook manages the Socket.IO connection lifecycle, automatic reconnection backoff, and listens for three key events: `new_lead`, `lead_status_updated`, and `system_activity`.*
> 
> *Notice our attention to production quality: we use `timersRef` to track all active animation timeouts, ensuring that when components unmount, all timers are cleanly cleared without memory leaks.*
> 
> *(👉 Action: Open `mobile/src/components/LeadCard.tsx`)*
> 
> *For rendering performance, `LeadCard` is wrapped in `React.memo` with pure prop evaluation, ensuring that even under high-frequency lead ingestion, only newly arrived or updated cards re-render, maintaining a silky-smooth sixty frames per second."*

---

#### [5:30 - 6:30] | Production Engineering & Resiliency
> *(👉 Action: Open `backend/src/server.ts` bottom lines)*
> 
> *"Finally, let's look at production robustness:*
> - *We implemented graceful shutdown handlers for `SIGTERM` and `SIGINT`, ensuring that during deployments, existing WebSocket connections and HTTP sockets are cleanly drained.*
> - *We have a global Express error middleware and 404 router preventing uncaught exception crashes.*
> - *The entire TypeScript build compiles with zero errors and zero `any` types.*
> - *And our dynamic LAN IP discovery ensures physical devices and simulators connect seamlessly.*
> 
> *Thank you for reviewing this project! The full documentation, sequence diagrams, and assumptions are available in the repository `README.md`."*

---

### 💡 Pro Recording Tips:
1. **Pacing:** Speak at a calm, confident, steady pace.
2. **Cursor:** Use your mouse cursor to point at the code lines or UI components as you mention them.
3. **Clean Terminal:** Run `clear` in your terminal before starting Video 1 so your logs look crisp.
4. **Resolution:** Record in 1080p for sharp code text readability.
