import dotenv from 'dotenv';
import type { Config } from './types.js';

dotenv.config();

export const config: Config = {
  port: parseInt(process.env.PORT || '8787', 10),
  tfyApiKey: process.env.TFY_API_KEY,
  servicefoundryServerUrl: process.env.SERVICEFOUNDRY_SERVER_URL,
  authServerUrl: process.env.AUTH_SERVER_URL,
  natsUrl: process.env.NATS_URL || 'nats://localhost:4222'
};

// Validate required environment variables
const requiredEnvVars = ['TFY_API_KEY', 'SERVICEFOUNDRY_SERVER_URL', 'AUTH_SERVER_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: ${envVar} environment variable is not set`);
  }
}
