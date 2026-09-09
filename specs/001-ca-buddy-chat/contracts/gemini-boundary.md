# Gemini Boundary Contract

## Provider request

The browser production adapter sends requests through LangChain.js to Google Gemini using:

- Provider package: `@langchain/google-genai`
- Model: `gemma-4-26b-a4b-it` (Gemma 4 26B A4B IT)
- API key source: `import.meta.env.VITE_GOOGLE_API_KEY`
- Output limit: 1,024 tokens
- Message order: CA system prompt, prior completed conversation messages, current user question

The API key is intentionally a browser build input under the approved architecture. It MUST be
provided through local `.env` development configuration or a GitHub Actions secret and MUST NOT
be hardcoded or committed.

## Prompt boundary

`src/ai/caSystemPrompt.ts` is the single source for the CA persona. It MUST define:

- Indian small-business context and plain-language tone
- Supported topics: GST, TDS, ITR deadlines, and audit basics
- General-information boundary and prohibition on definitive personalized decisions
- Explicit recommendation to consult a Chartered Accountant for risky, uncertain, or out-of-scope questions
- One-line disclaimer wording used by the UI
- Instruction to use only the active conversation supplied with the request

## End-to-end interception

Playwright MUST intercept requests whose URL targets the Google Generative Language API before
any network request is sent. The fixture MUST return a deterministic successful provider-shaped
response containing assistant text for the happy path and a controlled failure for error-path
coverage. Tests MUST assert that the application renders the intercepted text and never require
a real API key or external Gemini quota.

The interception contract MUST cover:

1. a routine supported-topic answer;
2. an explicit CA escalation answer;
3. a provider failure or timeout surfaced as a recoverable UI error; and
4. a follow-up request whose payload includes the active conversation, followed by `New chat`
   behavior that omits the old context.
