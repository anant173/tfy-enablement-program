/**
 * Type definitions for the A2A server
 */

export interface Session {
  id: string;
  timestamp: string;
  userAgent: string | undefined;
  ip: string;
}

export interface JsonRpcContext {
  session?: Session;
  agentId?: string;
}

export interface Config {
  port: number;
  tfyApiKey: string | undefined;
  servicefoundryServerUrl: string | undefined;
  authServerUrl: string | undefined;
  natsUrl: string;
}
