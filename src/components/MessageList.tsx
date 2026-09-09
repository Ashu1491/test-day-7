import type { ChatMessage } from '../types/chat';

interface MessageListProps {
  messages: readonly ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="empty-state" data-testid="empty-state">
        <span className="empty-kicker">Start with a simple question</span>
        <p>Ask about GST, TDS, ITR deadlines, or audit basics.</p>
      </div>
    );
  }

  return (
    <ol className="message-list" aria-live="polite" aria-label="Conversation">
      {messages.map((message) => (
        <li className={`message message-${message.role}`} key={message.id}>
          <span className="message-role">{message.role === 'user' ? 'You' : 'CA Buddy'}</span>
          <p>{message.content}</p>
        </li>
      ))}
    </ol>
  );
}
