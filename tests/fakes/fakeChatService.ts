import type { ChatMessage, ChatService } from '../../src/types/chat';

export interface FakeChatCall {
  question: string;
  history: readonly ChatMessage[];
}

export class FakeChatService implements ChatService {
  readonly calls: FakeChatCall[] = [];
  private readonly response: string;
  private readonly failure?: Error;

  constructor(response = 'A deterministic general answer.', failure?: Error) {
    this.response = response;
    this.failure = failure;
  }

  async sendMessage(question: string, history: readonly ChatMessage[]) {
    this.calls.push({ question, history: [...history] });

    if (this.failure) {
      throw this.failure;
    }

    return this.response;
  }
}
