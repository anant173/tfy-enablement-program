#!/usr/bin/env node

import { serve } from '@hono/node-server';
import app from './app.ts';
import { config } from './config.ts';

async function startServer(): Promise<void> {
  try {
    console.log('🚀 Starting TFY A2A Server...');
    console.log(`📡 Port: ${config.port}`);
    console.log(`🔗 NATS URL: ${config.natsUrl}`);
    console.log(`🔐 Auth Server: ${config.authServerUrl || 'Not configured'}`);
    console.log(`🏢 ServiceFoundry Server: ${config.servicefoundryServerUrl || 'Not configured'}`);
    
    const server = serve({
      fetch: app.fetch,
      port: config.port,
    });

    console.log(`✅ Server running on http://localhost:${config.port}`);
    console.log(`📋 Health check: http://localhost:${config.port}/health`);
    console.log(`🤖 A2A Endpoint: http://localhost:${config.port}/v1/agents/{agentId}`);
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
