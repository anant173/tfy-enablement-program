#!/usr/bin/env node

/**
 * Simple test script for the A2A server
 */

const BASE_URL = 'http://localhost:8787';

async function testHealthEndpoint(): Promise<void> {
  console.log('🔍 Testing health endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check:', data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Health check failed:', errorMessage);
  }
}

async function testJsonRpcEndpoint(): Promise<void> {
  console.log('\n🔍 Testing JSON-RPC sendMessage...');
  try {
    const response = await fetch(`${BASE_URL}/v1/agents/test-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'sendMessage',
        params: {
          message: 'Hello from test script!',
          data: { test: true }
        },
        id: 1
      })
    });
    const data = await response.json();
    console.log('✅ sendMessage response:', data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ sendMessage failed:', errorMessage);
  }
}

async function testPingMethod(): Promise<void> {
  console.log('\n🔍 Testing JSON-RPC ping...');
  try {
    const response = await fetch(`${BASE_URL}/v1/agents/test-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'ping',
        id: 2
      })
    });
    const data = await response.json();
    console.log('✅ ping response:', data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ ping failed:', errorMessage);
  }
}

async function runTests(): Promise<void> {
  console.log('🚀 Starting A2A Server Tests\n');
  
  await testHealthEndpoint();
  await testJsonRpcEndpoint();
  await testPingMethod();
  
  console.log('\n✅ All tests completed!');
}

runTests().catch(console.error);
