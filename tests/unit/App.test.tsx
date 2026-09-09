import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../../src/App';
import { ChatServiceError, type ChatService } from '../../src/types/chat';

function createService(response = 'A clear general answer.') {
  return {
    sendMessage: vi.fn().mockResolvedValue(response),
  } satisfies ChatService;
}

describe('CA Buddy shell', () => {
  it('renders the one-screen chat controls and disclaimer', () => {
    render(<App service={createService()} />);

    expect(screen.getByRole('heading', { name: 'CA Buddy' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What can I help clarify?' })).toBeInTheDocument();
    expect(screen.getByLabelText('Ask CA Buddy a question')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ask CA Buddy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New chat' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'General information only. Consult a Chartered Accountant for professional advice.',
      ),
    ).toBeInTheDocument();
  });

  it('does not submit an empty question', async () => {
    const user = userEvent.setup();
    const service = createService();
    render(<App service={service} />);

    await user.click(screen.getByRole('button', { name: 'Ask CA Buddy' }));

    expect(service.sendMessage).not.toHaveBeenCalled();
  });

  it('renders the submitted question and response through the injected service', async () => {
    const user = userEvent.setup();
    const service = createService('TDS is tax deducted at source.');
    render(<App service={service} />);

    await user.type(screen.getByLabelText('Ask CA Buddy a question'), 'What is TDS?');
    await user.click(screen.getByRole('button', { name: 'Ask CA Buddy' }));

    expect(await screen.findByText('What is TDS?')).toBeInTheDocument();
    expect(await screen.findByText('TDS is tax deducted at source.')).toBeInTheDocument();
    await waitFor(() => {
      expect(service.sendMessage).toHaveBeenCalledWith('What is TDS?', []);
    });
  });

  it('forwards completed conversation history for a follow-up question', async () => {
    const user = userEvent.setup();
    const service = {
      sendMessage: vi
        .fn()
        .mockResolvedValueOnce('TDS is tax deducted at source.')
        .mockResolvedValueOnce('It is usually deducted when the payment is made.'),
    } satisfies ChatService;
    render(<App service={service} />);
    const input = screen.getByLabelText('Ask CA Buddy a question');

    await user.type(input, 'What is TDS?');
    await user.click(screen.getByRole('button', { name: 'Ask CA Buddy' }));
    await screen.findByText('TDS is tax deducted at source.');

    await user.type(input, 'When is it deducted?');
    await user.click(screen.getByRole('button', { name: 'Ask CA Buddy' }));
    await screen.findByText('It is usually deducted when the payment is made.');

    expect(service.sendMessage).toHaveBeenNthCalledWith(2, 'When is it deducted?', [
      expect.objectContaining({ role: 'user', content: 'What is TDS?' }),
      expect.objectContaining({
        role: 'assistant',
        content: 'TDS is tax deducted at source.',
      }),
    ]);
  });

  it('clears messages and follow-up context when New chat is selected', async () => {
    const user = userEvent.setup();
    const service = {
      sendMessage: vi
        .fn()
        .mockResolvedValueOnce('Old answer.')
        .mockResolvedValueOnce('Fresh answer.'),
    } satisfies ChatService;
    render(<App service={service} />);
    const input = screen.getByLabelText('Ask CA Buddy a question');

    await user.type(input, 'Old question');
    await user.click(screen.getByRole('button', { name: 'Ask CA Buddy' }));
    await screen.findByText('Old answer.');
    await user.click(screen.getByRole('button', { name: 'New chat' }));

    expect(screen.queryByText('Old question')).not.toBeInTheDocument();
    expect(screen.queryByText('Old answer.')).not.toBeInTheDocument();

    await user.type(input, 'Fresh question');
    await user.click(screen.getByRole('button', { name: 'Ask CA Buddy' }));
    await screen.findByText('Fresh answer.');

    expect(service.sendMessage).toHaveBeenNthCalledWith(2, 'Fresh question', []);
  });

  it('ignores a response that arrives after New chat clears a pending request', async () => {
    const user = userEvent.setup();
    let resolveResponse: (value: string) => void = () => undefined;
    const service = {
      sendMessage: vi.fn().mockImplementation(
        () =>
          new Promise<string>((resolve) => {
            resolveResponse = resolve;
          }),
      ),
    } satisfies ChatService;
    render(<App service={service} />);

    await user.type(screen.getByLabelText('Ask CA Buddy a question'), 'Pending question');
    await user.click(screen.getByRole('button', { name: 'Ask CA Buddy' }));
    expect(await screen.findByText('Pending question')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'New chat' }));
    resolveResponse('Late answer.');

    await vi.waitFor(() => {
      expect(screen.queryByText('Late answer.')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('keeps the disclaimer and completed messages visible after a recoverable error', async () => {
    const user = userEvent.setup();
    const service = {
      sendMessage: vi.fn().mockRejectedValue(
        new ChatServiceError('unavailable', 'Gemini is temporarily unavailable. Please try again.'),
      ),
    } satisfies ChatService;
    render(<App service={service} />);

    await user.type(screen.getByLabelText('Ask CA Buddy a question'), 'Is this filing correct?');
    await user.click(screen.getByRole('button', { name: 'Ask CA Buddy' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Gemini is temporarily unavailable. Please try again.',
    );
    expect(screen.getByText('Is this filing correct?')).toBeInTheDocument();
    expect(
      screen.getByText(
        'General information only. Consult a Chartered Accountant for professional advice.',
      ),
    ).toBeInTheDocument();
  });
});
