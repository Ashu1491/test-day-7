import { describe, expect, it } from 'vitest';
import { FakeChatService } from '../fakes/fakeChatService';

const priorMessage = {
  id: 'user-1',
  role: 'user' as const,
  content: 'What is TDS?',
};

describe('FakeChatService', () => {
  it('records the current question and completed history', async () => {
    const service = new FakeChatService('TDS means tax deducted at source.');

    await expect(service.sendMessage('What is the TDS rate?', [priorMessage])).resolves.toBe(
      'TDS means tax deducted at source.',
    );

    expect(service.calls).toEqual([
      {
        question: 'What is the TDS rate?',
        history: [priorMessage],
      },
    ]);
  });
});
