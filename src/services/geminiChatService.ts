import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  type BaseMessage,
} from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { CA_SYSTEM_PROMPT } from '../ai/caSystemPrompt';
import { ChatServiceError, type ChatMessage, type ChatService } from '../types/chat';

const DEFAULT_MODEL = 'gemma-4-26b-a4b-it';
const DEFAULT_MAX_OUTPUT_TOKENS = 1024;
const DEFAULT_TIMEOUT_MS = 30_000;

type GeminiModelConfig = {
  apiKey: string;
  model: string;
  maxOutputTokens: number;
  maxRetries: number;
};

type GeminiModel = {
  invoke(messages: BaseMessage[]): Promise<{ content: unknown }>;
};

interface GeminiChatServiceOptions {
  apiKey?: string;
  model?: string;
  maxOutputTokens?: number;
  timeoutMs?: number;
  systemPrompt?: string;
  createModel?: (config: GeminiModelConfig) => GeminiModel;
}

function defaultModelFactory(config: GeminiModelConfig) {
  return new ChatGoogleGenerativeAI({
    apiKey: config.apiKey,
    model: config.model,
    maxOutputTokens: config.maxOutputTokens,
    maxRetries: config.maxRetries,
  });
}

function extractText(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        if (part && typeof part === 'object' && 'text' in part) {
          return typeof part.text === 'string' ? part.text : '';
        }

        return '';
      })
      .join('');
  }

  return '';
}

function toProviderMessages(
  systemPrompt: string,
  history: readonly ChatMessage[],
  question: string,
): BaseMessage[] {
  return [
    new SystemMessage(systemPrompt),
    ...history.map((message) =>
      message.role === 'user'
        ? new HumanMessage(message.content)
        : new AIMessage(message.content),
    ),
    new HumanMessage(question),
  ];
}

async function invokeWithTimeout(
  model: GeminiModel,
  messages: BaseMessage[],
  timeoutMs: number,
) {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(
        new ChatServiceError(
          'timeout',
          'The response took too long. Please try again.',
        ),
      );
    }, timeoutMs);
  });

  try {
    return await Promise.race([model.invoke(messages), timeout]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}

export function createGeminiChatService(options: GeminiChatServiceOptions = {}): ChatService {
  const apiKey = options.apiKey ?? import.meta.env.VITE_GOOGLE_API_KEY;
  const modelName = options.model ?? DEFAULT_MODEL;
  const maxOutputTokens = options.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const systemPrompt = options.systemPrompt ?? CA_SYSTEM_PROMPT;
  const createModel = options.createModel ?? defaultModelFactory;

  return {
    async sendMessage(question, history) {
      const trimmedQuestion = question.trim();
      if (!trimmedQuestion) {
        throw new ChatServiceError('invalid-response', 'Please enter a question.');
      }

      if (!apiKey) {
        throw new ChatServiceError(
          'configuration',
          'The chat service is not configured. Add VITE_GOOGLE_API_KEY and try again.',
        );
      }

      const model = createModel({
        apiKey,
        model: modelName,
        maxOutputTokens,
        maxRetries: 0,
      });
      const messages = toProviderMessages(systemPrompt, history, trimmedQuestion);

      try {
        const response = await invokeWithTimeout(model, messages, timeoutMs);
        const text = extractText(response.content).trim();

        if (!text) {
          throw new ChatServiceError(
            'invalid-response',
            'The response was empty. Please try again.',
          );
        }

        return text;
      } catch (error) {
        if (error instanceof ChatServiceError) {
          throw error;
        }

        throw new ChatServiceError(
          'unavailable',
          'Gemini is temporarily unavailable. Please try again.',
          { cause: error },
        );
      }
    },
  };
}

export const geminiConfig = {
  model: DEFAULT_MODEL,
  maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS,
  timeoutMs: DEFAULT_TIMEOUT_MS,
} as const;
