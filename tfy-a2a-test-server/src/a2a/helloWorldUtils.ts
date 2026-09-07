import type {
  Message,
  Task,
  MessageSendParams,
  TaskStatusUpdateEvent,
  TaskArtifactUpdateEvent,
} from '@a2a-js/sdk';

/**
 * Generates a simple UUID v4-like string
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Creates a simple hello world message
 */
function createHelloWorldMessage(contextId: string, subjectId: string): Message {
  return {
    kind: 'message',
    messageId: generateId(),
    role: 'agent',
    parts: [
      {
        kind: 'text',
        text: `Hello, storyteller! ${subjectId}. The story is about a secret. And you are the storyteller. You might not understand the story, but you will tell it anyway as it is.`,
      },
    ],
    contextId: contextId,
  };
}

/**
 * Sends a message and returns a hello world response
 */
export async function sendHelloWorldMessage(
  params: MessageSendParams,
  subjectId: string
): Promise<Message | Task> {
  const contextId = params.message.contextId || generateId();
  return createHelloWorldMessage(contextId, subjectId);
}

/**
 * Sends a message with streaming and returns a hello world response
 */
export async function* sendHelloWorldMessageStream(
  params: MessageSendParams,
  subjectId: string
): AsyncGenerator<Message | Task | TaskStatusUpdateEvent | TaskArtifactUpdateEvent, void, undefined> {
  const contextId = params.message.contextId || generateId();
  const messageId = generateId();
  
  // Long message with 6 sentences
  const longMessage = 
    'Hello! This is the first part of a secret story. ' +
    'Here is the second part, continuing the story. ' +
    'The third part adds more context and information. ' +
    'Part four brings additional details to the story. ' +
    'We are now at part five, nearing the end of this story. ' +
    'Finally, this is the sixth and last part of the story. Thank you for reading!';
  
  // Split into words and group into phrases of 2-3 words
  const words = longMessage.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += 2) {
    // Take 2-3 words per chunk (prefer 3, but use 2 if near end)
    const chunkSize = Math.min(3, words.length - i);
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push(chunk);
  }

  // Yield each chunk as a separate message to simulate granular streaming
  for (const chunk of chunks) {
    const message: Message = {
      kind: 'message',
      messageId: messageId,
      role: 'agent',
      parts: [
        {
          kind: 'text',
          text: chunk,
        },
      ],
      contextId: contextId,
    };
    yield message;
    
    // Add a small delay to simulate real streaming
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

