 # CA Buddy

## One paragraph
CA Buddy is a browser-only chatbot for Indian small-business owners who need quick, plain-language orientation on everyday GST, TDS, ITR deadlines, and audit basics. It answers within that narrow educational scope, keeps the current conversation in memory while the page is open, and clearly tells the user when a Chartered Accountant should be consulted.

## User
The user is a small-business owner in India who wants a fast answer before deciding whether a question needs professional help. They may know the business context but not tax terminology, so answers should be concise, practical, and explicit about uncertainty or the need for a CA.

## Happy path (this is the three-minute demo)
1. Open CA Buddy and see the header, chat panel, input, `New chat` button, and one-line disclaimer on one screen.
2. Ask, “What is TDS?” and receive a concise, everyday explanation.
3. Ask, “What should I check before my ITR deadline?” and receive a scoped checklist with a reminder that a CA can confirm the user’s situation.
4. Ask a personalized or high-risk question, such as whether a particular filing decision is correct, and receive a clear “consult a CA” fallback rather than a definitive professional opinion.
5. Select `New chat`; the visible conversation is cleared and the next question starts without the previous context.

## Out of scope
CA Buddy does not file returns, calculate or guarantee tax liability, submit payments, provide legal or investment advice, replace a Chartered Accountant, support non-Indian tax systems, authenticate users, save history, provide settings, or use a backend, server, or database.

## Architecture
The browser renders the React UI and calls Google Gemini directly through a `ChatService` interface. The production implementation uses LangChain.js and `@langchain/google-genai`; a fake implementation is injected for unit tests. Conversation memory exists only in the active browser session and is cleared by `New chat`.

- Frontend only. React + TypeScript + Vite. No backend, no server, no database. The browser calls Google Gemini directly through LangChain.js (@langchain/google-genai). The API key is read from VITE_GOOGLE_API_KEY — a local .env during development, a GitHub Actions secret when built in CI.
- Design: modern, attractive and simple. One screen: a header, one chat panel, an input, a "New chat" button, a one-line disclaimer. No login, no saved history, no settings.

## Functional requirements FR-1 to FR-8, each testable
- **FR-1:** On initial load, the app displays exactly one screen containing a header, chat panel, text input, `New chat` button, and one-line disclaimer.
- **FR-2:** Submitting a non-empty question adds the user message to the chat and sends it through `ChatService`.
- **FR-3:** A successful model response appears in the chat as readable assistant text without requiring a page reload.
- **FR-4:** Responses address everyday Indian GST, TDS, ITR deadlines, or audit basics in plain language and stay within that scope.
- **FR-5:** A personalized, high-risk, out-of-scope, or uncertain question produces an explicit recommendation to consult a Chartered Accountant instead of a definitive professional decision.
- **FR-6:** The active conversation is supplied as context for subsequent questions during the current browser session.
- **FR-7:** Activating `New chat` removes all visible messages and clears the active conversation context.
- **FR-8:** The one-line disclaimer remains visible while using the chat and states that the answers are general information and that users should consult a Chartered Accountant for professional advice.

## The model (provider, model name, where the system prompt lives, max tokens)
- **Provider:** Google Gemini through LangChain.js (`@langchain/google-genai`).
- **Model name:** `gemma-4-26b-a4b-it` (Gemma 4 26B A4B IT).
- **System prompt:** `src/ai/caSystemPrompt.ts`.
- **Max tokens:** 1,024 output tokens per response.

## Quality gates
- Testing: unit tests (Vitest + Testing Library) with the model faked; end-to-end tests (Playwright) with the Gemini request intercepted; both run in GitHub Actions on every push and pull request.
- Deployment: GitHub Pages through GitHub Actions. Tests must pass before anything deploys.
- A pull request must pass the unit suite, end-to-end suite, and production build before merge or deployment. The deployed site must load the one-screen chat shell and must not require a backend.

## The five tasks
- Exactly five tasks build the whole app, in this order, one GitHub issue and one pull request each:
	1. Chat UI shell, unit tests, and the CI workflow that runs them.
	2. ChatService interface; LangChain + Gemini implementation; a fake implementation for tests.
	3. The CA persona: system prompt in a file, scope rules, "consult a CA" fallback, disclaimer, conversation memory.
	4. Playwright end-to-end tests with the Gemini call intercepted, wired into CI.
	5. GitHub Pages deployment, gated on all tests passing.

## Acceptance walkthrough
Review the five pull requests in order, with exactly one issue linked to each. Run the unit tests and confirm model calls use the fake implementation. Run the Playwright tests and confirm the Gemini request is intercepted. In the browser, complete the three-minute demo: ask a GST or TDS question, ask about an ITR deadline or audit basic, verify the CA fallback for a personalized decision, confirm the disclaimer stays visible, and use `New chat` to clear context. Push a change and open a pull request to confirm both test suites run in GitHub Actions; after they pass, confirm GitHub Pages deploys the one-screen app.
