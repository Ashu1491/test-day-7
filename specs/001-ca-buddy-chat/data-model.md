# CA Buddy Chatbot Data Model

## Conversation

An in-memory ordered collection of completed user and assistant messages for the active page
session.

| Field | Type | Rules |
|---|---|---|
| `messages` | ordered list of `ChatMessage` | Starts empty; preserves display and model context order; never written to browser storage or a server |
| `requestState` | `idle`, `submitting`, `error` | At most one active submission is represented by the UI |
| `error` | recoverable error or empty | Cleared on a new submission or `New chat`; must not replace the disclaimer |

**Relationships**: A conversation contains zero or more `ChatMessage` records. The active
conversation is owned by the app shell and is passed to `ChatService` for each follow-up.

## ChatMessage

A visible exchange item shown in the chat panel and, when applicable, supplied as prior context
to the model.

| Field | Type | Rules |
|---|---|---|
| `id` | string | Unique for the active page session; used for stable rendering only |
| `role` | `user` or `assistant` | User entries are submitted questions; assistant entries are model responses or explicit CA escalation |
| `content` | non-empty string | User input is trimmed before submission; assistant content must be non-empty before display |

The system prompt is not a visible `ChatMessage` and is not stored in the conversation state.
The Gemini adapter composes it with the prior messages and current question at request time.

## ChatServiceError

A normalized failure category shown as a recoverable UI error rather than model-generated tax
guidance.

| Category | Meaning | User behavior |
|---|---|---|
| `configuration` | Required browser configuration is missing or unusable | Show configuration guidance without exposing a key |
| `timeout` | No usable response arrived within the 30-second response deadline | Allow the user to submit again |
| `unavailable` | Provider/network request failed or was rejected | Preserve completed messages and show a retry path |
| `invalid-response` | Provider returned no usable assistant text | Do not invent an answer; allow retry |

## State transitions

```text
empty/idle
  -> submitting       when a non-empty question is submitted
  -> empty/idle       when New chat is selected before submission completes

submitting
  -> idle + assistant message   when a non-empty response succeeds
  -> error + completed history  when the request fails or times out
  -> empty/idle                 when New chat invalidates the pending request

error
  -> submitting       when the user submits a new non-empty question
  -> empty/idle       when New chat is selected

idle with messages
  -> submitting       when a follow-up question is submitted with prior context
  -> empty/idle       when New chat clears messages and context
```

A late result from an invalidated request MUST be ignored. Leaving or reloading the page ends
the in-memory conversation; no transition restores it.
