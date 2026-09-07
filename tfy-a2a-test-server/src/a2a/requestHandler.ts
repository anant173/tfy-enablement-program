import type { A2ARequestHandler } from '@a2a-js/sdk/server';
import { A2AError } from '@a2a-js/sdk/server';
import type {
  AgentCard,
  Message,
  Task,
  MessageSendParams,
  TaskQueryParams,
  TaskIdParams,
  TaskPushNotificationConfig,
  GetTaskPushNotificationConfigParams,
  ListTaskPushNotificationConfigParams,
  DeleteTaskPushNotificationConfigParams,
  TaskStatusUpdateEvent,
  TaskArtifactUpdateEvent,
} from '@a2a-js/sdk';
import { UserSession } from 'src/context';
import { sendHelloWorldMessage, sendHelloWorldMessageStream } from 'src/a2a/helloWorldUtils';

/**
 * Default A2A request handler with hello world implementation
 * Only implements sendMessage and sendMessageStream
 * All other methods return "not implemented" errors
 */
export class HelloWorldA2ARequestHandler implements A2ARequestHandler {
  constructor(private agentId: string, private userSession: UserSession) {
    this.agentId = agentId;
    this.userSession = userSession;
  }
  /**
   * Returns a basic agent card
   */
  async getAgentCard(): Promise<AgentCard> {
    return {
      name: this.agentId,
      description: 'A simple A2A-compatible agent that generates a secret story"',
      capabilities: {
        streaming: true,
      },
      defaultInputModes: ['text/plain'],
      defaultOutputModes: ['text/plain'],
      url: `https://hello-world-a2a-nikhil-ws-8787.tfy-usea1-ctl.devtest.truefoundry.tech/v1/agents/${this.agentId}`,
      preferredTransport: 'JSONRPC',
      protocolVersion: '1.0',
      version: '1.0.0',
      skills: [
        {
          id: 'hello-world',
          name: 'Secret Story Generator',
          description: 'Generates a secret story',
          tags: ['story', 'secret'],
        },
      ],
    };
  }

  /**
   * Returns the same agent card as getAgentCard
   */
  async getAuthenticatedExtendedAgentCard(): Promise<AgentCard> {
    return this.getAgentCard();
  }

  /**
   * Sends a message and returns a hello world response
   */
  async sendMessage(params: MessageSendParams): Promise<Message | Task> {
    if (this.agentId === 'hello-world') {
      return sendHelloWorldMessage(params, this.userSession.subjectId);
    }
    // TODO: Implement different logic for other agent IDs
    throw A2AError.unsupportedOperation(`sendMessage is not implemented for agentId: ${this.agentId}`);
  }

  /**
   * Sends a message with streaming and returns a hello world response
   */
  async *sendMessageStream(
    params: MessageSendParams
  ): AsyncGenerator<Message | Task | TaskStatusUpdateEvent | TaskArtifactUpdateEvent, void, undefined> {
    if (this.agentId === 'hello-world') {
      yield* sendHelloWorldMessageStream(params, this.userSession.subjectId);
      return;
    }
    // TODO: Implement different logic for other agent IDs
    throw A2AError.unsupportedOperation(`sendMessageStream is not implemented for agentId: ${this.agentId}`);
  }

  /**
   * Not implemented - returns unsupported operation error
   */
  async getTask(params: TaskQueryParams): Promise<Task> {
    throw A2AError.unsupportedOperation('getTask is not implemented');
  }

  /**
   * Not implemented - returns unsupported operation error
   */
  async cancelTask(params: TaskIdParams): Promise<Task> {
    throw A2AError.unsupportedOperation('cancelTask is not implemented');
  }

  /**
   * Not implemented - returns unsupported operation error
   */
  async setTaskPushNotificationConfig(params: TaskPushNotificationConfig): Promise<TaskPushNotificationConfig> {
    throw A2AError.unsupportedOperation('setTaskPushNotificationConfig is not implemented');
  }

  /**
   * Not implemented - returns unsupported operation error
   */
  async getTaskPushNotificationConfig(
    params: TaskIdParams | GetTaskPushNotificationConfigParams
  ): Promise<TaskPushNotificationConfig> {
    throw A2AError.unsupportedOperation('getTaskPushNotificationConfig is not implemented');
  }

  /**
   * Not implemented - returns unsupported operation error
   */
  async listTaskPushNotificationConfigs(params: ListTaskPushNotificationConfigParams): Promise<TaskPushNotificationConfig[]> {
    throw A2AError.unsupportedOperation('listTaskPushNotificationConfigs is not implemented');
  }

  /**
   * Not implemented - returns unsupported operation error
   */
  async deleteTaskPushNotificationConfig(params: DeleteTaskPushNotificationConfigParams): Promise<void> {
    throw A2AError.unsupportedOperation('deleteTaskPushNotificationConfig is not implemented');
  }

  /**
   * Not implemented - returns unsupported operation error
   */
  async *resubscribe(
    params: TaskIdParams
  ): AsyncGenerator<Task | TaskStatusUpdateEvent | TaskArtifactUpdateEvent, void, undefined> {
    throw A2AError.unsupportedOperation('resubscribe is not implemented');
  }
}

