# TFY A2A Server

Lightweight A2A-compatible microservice with JSON-RPC 2.0 support.

## Features

- 🚀 **Hono.js Framework** - Fast and lightweight
- 🔌 **JSON-RPC 2.0** - A2A-compatible endpoint
- 🔐 **Auth Middleware** - Session management (no authorization yet)
- 📡 **NATS Support** - Ready for message queuing
- 🗄️ **Redis Support** - Ready for caching
- 🌐 **HTTP Client** - Axios for external requests

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **Test the server:**
   ```bash
   npm test
   ```

## API Endpoints

### Health Check
```
GET /health
```

### A2A JSON-RPC Endpoint
```
POST /v1/agents/:agentId
```

Example request:
```json
{
  "jsonrpc": "2.0",
  "method": "sendMessage",
  "params": {
    "message": "Hello, world!"
  },
  "id": 1
}
```

Example response:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "success": true,
    "message": "Hello from A2A-compatible microservice!",
    "sessionId": "sess_1234567890_abc123",
    "timestamp": "2025-12-03T10:30:00.000Z",
    "receivedParams": {
      "message": "Hello, world!"
    }
  },
  "id": 1
}
```

## Environment Variables

- `TFY_API_KEY` - TruFoundry API key
- `SERVICEFOUNDRY_SERVER_URL` - ServiceFoundry server URL
- `AUTH_SERVER_URL` - Authentication server URL
- `NATS_URL` - NATS server URL (default: nats://localhost:4222)
- `PORT` - Server port (default: 8787)

## Available JSON-RPC Methods

- `sendMessage` - A2A-compatible message sending (hello world implementation)
- `ping` - Health check method

## Architecture

- **TypeScript** - Fully typed with strict type checking
- **No bundling** - Runs with tsx in dev, compiled TypeScript in production
- **ES Modules** - Modern JavaScript module system
- **Minimal dependencies** - Only essential libraries
- **Session-aware** - Each request gets a session object
- **Extensible** - Easy to add new JSON-RPC methods

## Development

```bash
# Development mode (with tsx - no build needed)
npm run dev

# Build for production
npm run build

# Production mode (runs compiled JavaScript)
npm start
```
# tfy-a2a-test-server
