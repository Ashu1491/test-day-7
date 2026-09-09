import type { FormEvent } from 'react';
import type { ChatMessage } from '../types/chat';
import { MessageList } from './MessageList';

interface ChatPanelProps {
  messages: readonly ChatMessage[];
  question: string;
  isLoading: boolean;
  error: string | null;
  onQuestionChange: (question: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNewChat: () => void;
}

export function ChatPanel({
  messages,
  question,
  isLoading,
  error,
  onQuestionChange,
  onSubmit,
  onNewChat,
}: ChatPanelProps) {
  return (
    <section className="chat-panel" aria-labelledby="chat-panel-title" aria-busy={isLoading}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Your tax desk</p>
          <h2 id="chat-panel-title">What can I help clarify?</h2>
        </div>
        <button className="button button-secondary" type="button" onClick={onNewChat}>
          New chat
        </button>
      </div>

      <MessageList messages={messages} />

      <div className="chat-controls">
        {error ? (
          <p className="error-message" role="alert">
            {error}
          </p>
        ) : null}
        <form className="question-form" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="question-input">
            Ask CA Buddy a question
          </label>
          <textarea
            id="question-input"
            name="question"
            value={question}
            onChange={(event) => onQuestionChange(event.target.value)}
            placeholder="For example: What is TDS?"
            rows={2}
            disabled={isLoading}
          />
          <button className="button button-primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Thinking...' : 'Ask CA Buddy'}
          </button>
        </form>
      </div>
    </section>
  );
}
