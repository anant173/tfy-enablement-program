import type { Context } from 'hono';
import type { A2ARequestHandler } from '@a2a-js/sdk/server';
import {
  JsonRpcTransportHandler,
  A2AError,
} from '@a2a-js/sdk/server';
import type { JSONRPCErrorResponse, A2AResponse } from '@a2a-js/sdk';
import { decode } from 'hono/jwt';
import { ServerCallContext, UserSession } from '../context.ts';
import { getRequestedExtensions } from '../utils/extensions.ts';
import { HTTP_EXTENSION_HEADER } from '../utils/constants.ts';

// JSONRPCResponse is the union type returned by the transport handler
type JSONRPCResponse = A2AResponse ;

/**
 * Factory function to create A2A request handlers per request
 */
export type RequestHandlerFactory = (agentId: string, userSession: UserSession) => A2ARequestHandler;

/**
 * Options for the JSON-RPC handler
 */
export interface JsonRpcHandlerOptions {
  requestHandlerFactory: RequestHandlerFactory;
}

/**
 * Creates Hono middleware to handle A2A JSON-RPC requests.
 * 
 * @example
 * // Handle at root
 * app.post('/', jsonRpcHandler({ requestHandler: a2aRequestHandler, userBuilder: buildUser }));
 * 
 * // or
 * app.post('/a2a/json-rpc', jsonRpcHandler({ requestHandler: a2aRequestHandler, userBuilder: buildUser }));
 */
export function jsonRpcHandler(options: JsonRpcHandlerOptions) {
  return async (c: Context) => {
    try {

      // Get requested extensions from header
      const extensionHeader = c.req.header(HTTP_EXTENSION_HEADER);
      const requestedExtensions = getRequestedExtensions(extensionHeader);

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
      const agentId = c.req.param('agentId');

      // Create server call context for extensions
      const context = new ServerCallContext(requestedExtensions, agentId, userSession);

      // Create handler instance with agentId and userSession
      const requestHandler = options.requestHandlerFactory(agentId, userSession);

      // Create transport handler with the per-request handler instance
      const jsonRpcTransportHandler = new JsonRpcTransportHandler(requestHandler);

      // Parse request body
      let requestBody: unknown;
      try {
        requestBody = await c.req.json();
      } catch (parseError) {
        // Handle JSON parse errors
        if (parseError instanceof SyntaxError || (parseError instanceof Error && parseError.message.includes('JSON'))) {
          const a2aError = A2AError.parseError('Invalid JSON payload.');
          const errorResponse: JSONRPCErrorResponse = {
            jsonrpc: '2.0',
            id: null,
            error: a2aError.toJSONRPCError(),
          };
          return c.json(errorResponse, 400);
        }
        throw parseError;
      }

      // Handle the JSON-RPC request
      const rpcResponseOrStream = await jsonRpcTransportHandler.handle(requestBody);

      // Set extension headers if any were activated
      if (context.activatedExtensions.size > 0) {
        c.header(HTTP_EXTENSION_HEADER, Array.from(context.activatedExtensions).join(','));
      }

      // Check if it's an AsyncGenerator (stream)
      if (typeof (rpcResponseOrStream as AsyncGenerator)?.[Symbol.asyncIterator] === 'function') {
        const stream = rpcResponseOrStream as AsyncGenerator<
          JSONRPCResponse,
          void,
          undefined
        >;

        // Set up SSE headers
        c.header('Content-Type', 'text/event-stream');
        c.header('Cache-Control', 'no-cache');
        c.header('Connection', 'keep-alive');

        // Create a readable stream for SSE
        const encoder = new TextEncoder();
        const streamResponse = new ReadableStream({
          async start(controller) {
            try {
              for await (const event of stream) {
                // Each event from the stream is already a JSONRPCResult
                const timestamp = new Date().getTime();
                const data = `id: ${timestamp}\n`;
                const eventData = `data: ${JSON.stringify(event)}\n\n`;
                controller.enqueue(encoder.encode(data + eventData));
              }
            } catch (streamError) {
              console.error(`Error during SSE streaming (request ${(requestBody as { id?: unknown })?.id}):`, streamError);
              
              // If the stream itself throws an error, send a final JSONRPCErrorResponse
              let a2aError: A2AError;
              if (streamError instanceof A2AError) {
                a2aError = streamError;
              } else {
                a2aError = A2AError.internalError(
                  (streamError instanceof Error && streamError.message) || 'Streaming error.'
                );
              }

              const requestId = (requestBody as { id?: string | number | null })?.id;
              const errorResponse: JSONRPCErrorResponse = {
                jsonrpc: '2.0',
                id: (typeof requestId === 'string' || typeof requestId === 'number') ? requestId : null,
                error: a2aError.toJSONRPCError(),
              };

              // Try to send as last SSE event
              const timestamp = new Date().getTime();
              const errorData = `id: ${timestamp}\n`;
              const errorEvent = `event: error\n`;
              const errorPayload = `data: ${JSON.stringify(errorResponse)}\n\n`;
              controller.enqueue(encoder.encode(errorData + errorEvent + errorPayload));
            } finally {
              controller.close();
            }
          },
        });

        return new Response(streamResponse, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } else {
        // Single JSON-RPC response
        const rpcResponse = rpcResponseOrStream as JSONRPCResponse;
        return c.json(rpcResponse, 200);
      }
    } catch (error) {
      // Catch errors from jsonRpcTransportHandler.handle itself (e.g., initial parse error)
      console.error('Unhandled error in JSON-RPC handler:', error);
      
      const a2aError =
        error instanceof A2AError ? error : A2AError.internalError('General processing error.');
      
      const errorResponse: JSONRPCErrorResponse = {
        jsonrpc: '2.0',
        id: null,
        error: a2aError.toJSONRPCError(),
      };

      return c.json(errorResponse, 500);
    }
  };
}
