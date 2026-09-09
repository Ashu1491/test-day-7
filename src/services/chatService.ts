import { ChatServiceError, type ChatService } from '../types/chat';

export type { ChatService } from '../types/chat';
export { ChatServiceError } from '../types/chat';

export const unavailableChatService: ChatService = {
  async sendMessage() {
    throw new ChatServiceError(
      'unavailable',
      'The chat service is not configured yet. Please try again later.',
    );
  },
};
