import { Hono } from 'hono';
import type { Context } from 'hono';
import { decode } from 'hono/jwt';
import { jsonRpcHandler } from './handlers/jsonrpc.ts';
import type { Session } from './types.ts';
import { HelloWorldA2ARequestHandler } from './a2a/requestHandler.ts';
import { UserSession } from './context.ts';

const app = new Hono<{
  Variables: {
    session: Session;
  };
}>();


// Health check endpoint
app.get('/health', (c: Context) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'tfy-a2a-server'
  });
});


// GET endpoint to retrieve agent card
app.get('/v1/agents/:agentId/.well-known/agent-card.json', async (c: Context) => {
  try {
    // Create a temporary handler instance for getting the agent card
    const agentId = c.req.param('agentId');
    
    // Extract and decode token from Authorization header (without verification - temporary)
    let subjectId = 'unknown';
    const authHeader = c.req.header('Authorization');
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      if (token) {
        try {
          const decoded = decode(token);
          // Extract subjectId from token payload
          // Try common JWT claim names: sub, subjectId, id, email
          subjectId = (decoded.payload as any).sub || 
                     (decoded.payload as any).subjectId || 
                     (decoded.payload as any).id || 
                     (decoded.payload as any).email || 
                     'unknown';
        } catch (error) {
          console.warn('Failed to decode token:', error);
          // Continue with default subjectId
        }
      }
    }

    const userSession = new UserSession("id-1234", authHeader || "", subjectId);
    const handler = new HelloWorldA2ARequestHandler(agentId, userSession);
    const agentCard = await handler.getAgentCard();
    return c.json(agentCard, 200);
  } catch (error) {
    console.error('Error fetching agent card:', error);
    return c.json({ 
      error: 'Failed to fetch agent card',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// A2A-compatible JSON-RPC endpoint
app.post('/v1/agents/:agentId', jsonRpcHandler({ 
  requestHandlerFactory: (agentId: string, userSession: UserSession) => {
    return new HelloWorldA2ARequestHandler(agentId, userSession);
  },
}));


// Catch-all for undefined routes
app.notFound((c: Context) => {
  return c.json({ 
    error: 'Not Found',
    path: c.req.path,
    method: c.req.method 
  }, 404);
});

export default app;
