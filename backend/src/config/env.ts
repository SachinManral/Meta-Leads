import dotenv from 'dotenv';
import path from 'path';

// Load environment variables dynamically
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

export const config = {
  get port(): number {
    return parseInt(process.env.PORT || '4000', 10);
  },
  meta: {
    get verifyToken(): string {
      return process.env.META_VERIFY_TOKEN || 'meta_lead_sync_secret_token_2026';
    },
    get appSecret(): string {
      return process.env.META_APP_SECRET || '';
    },
    get pageAccessToken(): string {
      return process.env.META_PAGE_ACCESS_TOKEN || '';
    },
    get graphApiVersion(): string {
      return process.env.META_GRAPH_API_VERSION || 'v19.0';
    },
  },
  get corsOrigin(): string {
    return process.env.CORS_ORIGIN || '*';
  },
};
