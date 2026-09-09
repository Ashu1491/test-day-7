# ChatService Contract

## Purpose

The UI depends on this contract and does not import LangChain or provider-specific types. The
contract supports deterministic unit tests through a fake implementation and keeps conversation
memory in the app shell.

## Interface

```ts
export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export interface ChatService {
  sendMessage(
    question: string,
    history: readonly ChatMessage[],
  ): Promise<string>;
}
```

The production adapter may expose a constructor or factory in addition to this interface, but
components only require `ChatService`.

## Input contract

- `question` MUST be trimmed, non-empty text. The UI rejects blank input before calling the
  service.
- `history` MUST contain only completed visible user and assistant messages in chronological
  order. It MUST NOT contain the current question twice.
- The service MUST prepend the CA system prompt, append the current question as the newest user
  message, and request no more than 1,024 output tokens.

## Output contract

- Resolve with non-empty assistant text suitable for display in the chat panel.
- The text MUST follow the CA scope rules and include an explicit Chartered Accountant
  recommendation when the question is personalized, high-risk, uncertain, or out of scope.
- Reject with a normalized `ChatServiceError` category when no safe response can be produced.
- Never resolve with a fabricated fallback answer after a provider failure.

## Lifecycle and reset

The service is stateless with respect to conversation history. `New chat` clears the app-owned
history and invalidates pending UI work; it does not require a service-side reset call.

## Fake implementation contract

The test fake MUST implement `ChatService`, return deterministic text, record the question and
history it receives, and support controlled success and failure responses. Unit tests MUST use
the fake rather than a real Gemini client or network request.
