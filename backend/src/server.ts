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

// Middleware
app.use(cors({ origin: config.corsOrigin }));

// Preserve raw body for webhook HMAC signature verification
app.use(
  express.json({
    verify: (req: Request, _res: Response, buf: Buffer) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);
app.use(express.urlencoded({ extended: true }));

socketService.initialize(server, config.corsOrigin);

// Health check / root info
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

app.use('/webhook', webhookRoutes);
app.use('/api', apiRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested API route does not exist.',
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err.stack || err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
  });
});

const PORT = config.port;
server.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Server] Webhook endpoint: http://localhost:${PORT}/webhook`);
});

const handleShutdown = (signal: string) => {
  console.log(`[Server] Received ${signal}, shutting down...`);
  server.close(() => {
    console.log('[Server] HTTP and WebSocket connections closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export { app, server };
