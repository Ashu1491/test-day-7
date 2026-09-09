import type { BaseMessage } from '@langchain/core/messages';
import { describe, expect, it, vi } from 'vitest';
import { CA_DISCLAIMER, CA_SYSTEM_PROMPT } from '../../src/ai/caSystemPrompt';
import { createGeminiChatService, geminiConfig } from '../../src/services/geminiChatService';

const priorMessage = {
  id: 'assistant-1',
  role: 'assistant' as const,
  content: 'TDS is tax deducted at source.',
};

describe('createGeminiChatService', () => {
  it('configures Gemini and sends the system prompt, history, and question in order', async () => {
    const model = {
      invoke: vi.fn().mockResolvedValue({ content: 'A mocked Gemini answer.' }),
    };
    const createModel = vi.fn(() => model);
    const service = createGeminiChatService({
      apiKey: 'test-key',
      systemPrompt: 'Act as CA Buddy.',
      createModel,
    });

    await expect(service.sendMessage('What is GST?', [priorMessage])).resolves.toBe(
      'A mocked Gemini answer.',
    );

    expect(createModel).toHaveBeenCalledWith({
      apiKey: 'test-key',
      model: geminiConfig.model,
      maxOutputTokens: geminiConfig.maxOutputTokens,
      maxRetries: 0,
    });
    expect(geminiConfig.timeoutMs).toBe(30_000);
    const sentMessages = model.invoke.mock.calls[0][0] as BaseMessage[];
    expect(sentMessages.map((message) => message.content)).toEqual([
      'Act as CA Buddy.',
      'TDS is tax deducted at source.',
      'What is GST?',
    ]);
  });

  it('returns a configuration error without an API key', async () => {
    const service = createGeminiChatService({ apiKey: '' });

    await expect(service.sendMessage('What is GST?', [])).rejects.toMatchObject({
      code: 'configuration',
    });
  });

  it('uses the CA system prompt and disclaimer by default', async () => {
    const model = {
      invoke: vi.fn().mockResolvedValue({ content: 'A safe answer.' }),
    };
    const service = createGeminiChatService({
      apiKey: 'test-key',
      createModel: () => model,
    });

    await service.sendMessage('What is GST?', []);

    const sentMessages = model.invoke.mock.calls[0][0] as BaseMessage[];
    expect(sentMessages[0].content).toBe(CA_SYSTEM_PROMPT);
    expect(CA_SYSTEM_PROMPT).toContain('GST, TDS, ITR deadlines, and audit basics');
    expect(CA_SYSTEM_PROMPT).toContain('consult a Chartered Accountant');
    expect(CA_SYSTEM_PROMPT).toContain(CA_DISCLAIMER);
  });
});
