import { useRef, useState, type FormEvent } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { Disclaimer } from './components/Disclaimer';
import { Header } from './components/Header';
import { unavailableChatService, type ChatService } from './services/chatService';
import { ChatServiceError, type ChatMessage } from './types/chat';

interface AppProps {
  service?: ChatService;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ChatServiceError) {
    return error.message;
  }

  return 'We could not get a safe answer. Please try again.';
}

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function App({ service = unavailableChatService }: AppProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestVersion = useRef(0);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    const history = messages;
    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content: trimmedQuestion,
    };
    const currentRequest = requestVersion.current + 1;
    requestVersion.current = currentRequest;

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setQuestion('');
    setError(null);
    setIsLoading(true);

    try {
      const response = await service.sendMessage(trimmedQuestion, history);

      if (requestVersion.current !== currentRequest) {
        return;
      }

      const trimmedResponse = response.trim();
      if (!trimmedResponse) {
        throw new ChatServiceError('invalid-response', 'The response was empty. Please try again.');
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        { id: createMessageId(), role: 'assistant', content: trimmedResponse },
      ]);
      setIsLoading(false);
    } catch (caughtError) {
      if (requestVersion.current !== currentRequest) {
        return;
      }

      setError(getErrorMessage(caughtError));
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    requestVersion.current += 1;
    setMessages([]);
    setQuestion('');
    setError(null);
    setIsLoading(false);
  };

  return (
    <main className="app-shell">
      <Header />
      <ChatPanel
        messages={messages}
        question={question}
        isLoading={isLoading}
        error={error}
        onQuestionChange={setQuestion}
        onSubmit={handleSubmit}
        onNewChat={handleNewChat}
      />
      <Disclaimer />
    </main>
  );
}
