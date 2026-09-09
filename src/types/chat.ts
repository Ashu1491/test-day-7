export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export type ChatServiceErrorCode =
  | 'configuration'
  | 'timeout'
  | 'unavailable'
  | 'invalid-response';

export class ChatServiceError extends Error {
  readonly code: ChatServiceErrorCode;

  constructor(code: ChatServiceErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ChatServiceError';
    this.code = code;
  }
}

export interface ChatService {
  sendMessage(question: string, history: readonly ChatMessage[]): Promise<string>;
}
