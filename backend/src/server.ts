import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import { config } from './config/env';
import { socketService } from './services/socketService';
import webhookRoutes from './routes/webhookRoutes';
import apiRoutes from './routes/apiRoutes';

// Extend Express Request type for raw body preservation
declare global {
  namespace Express {
    interface Request {
      rawBody?: string;
    }
  }
}

const app = express();
const server = http.createServer(app);

// Security & Middleware Configuration
app.use(cors({ origin: config.corsOrigin }));

// Preserve raw body buffer for HMAC-SHA256 signature verification
app.use(
  express.json({
    verify: (req: Request, _res: Response, buf: Buffer) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Initialize WebSocket Service (Socket.io)
socketService.initialize(server, config.corsOrigin);

// Root Health & System Discovery Route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'Meta Lead Ads Real-Time Sync Gateway',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      webhook: '/webhook',
      activities: '/api/activities',
      simulateLead: '/api/simulate-lead',
    },
  });
});

// Route Handlers
app.use('/webhook', webhookRoutes);
app.use('/api', apiRoutes);

// 404 Route Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested API route does not exist.',
  });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err.stack || err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
  });
});

// Start HTTP + WebSocket Server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Meta Lead Ads Real-Time Gateway Server`);
  console.log(`📡 Server listening on: http://localhost:${PORT}`);
  console.log(`🔗 Webhook Endpoint:    http://localhost:${PORT}/webhook`);
  console.log(`⚡ WebSocket Server:    ws://localhost:${PORT}`);
  console.log(`🧪 Test Simulation API: POST http://localhost:${PORT}/api/simulate-lead`);
  console.log(`======================================================\n`);
});

// Graceful Shutdown Handlers
const handleShutdown = (signal: string) => {
  console.log(`\n[Server] 🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[Server] 🔒 HTTP and WebSocket servers closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export { app, server };
