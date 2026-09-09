# CA Buddy Chatbot Research

## Stack and project bootstrap

**Decision**: Use npm with Node.js 22 LTS, React 19, TypeScript 5.x, and Vite 7.x. Pin the
resolved dependency versions in `package-lock.json`.

**Rationale**: This is a new single-package frontend with no existing runtime conventions.
Node 22 LTS gives CI and local development a stable common runtime, while React + TypeScript +
Vite are constitutional requirements. npm keeps the bootstrap and GitHub Actions setup
available without introducing another package manager.

**Alternatives considered**: A different package manager would add repository conventions with
no user value. A server framework would violate the browser-only boundary. An older React or
Vite baseline would add compatibility constraints without helping this one-screen product.

## Model access boundary

**Decision**: Implement `ChatService` as the UI-facing abstraction. The production adapter will
use LangChain.js `@langchain/google-genai` and `ChatGoogleGenerativeAI` with model
`gemma-4-26b-a4b-it`, `maxOutputTokens: 1024`, and the `VITE_GOOGLE_API_KEY` environment value.
The system prompt will be imported from `src/ai/caSystemPrompt.ts` and will be sent as the
model system message before the active conversation and current question.

**Rationale**: This follows the constitution exactly and isolates provider behavior from the
screen. It also lets unit tests use a deterministic fake without network calls while allowing
end-to-end tests to verify the browser-to-Gemini boundary through interception.

**Alternatives considered**: A backend proxy would hide the key but is explicitly prohibited.
Calling the provider client directly from React would make the UI difficult to test and violate
the required service boundary. A different model provider would violate the product contract.

## Conversation ownership and memory

**Decision**: React application state owns the ordered user and assistant messages. Each
`sendMessage` call receives prior completed messages as input; the service itself remains
stateless. `New chat` replaces the message list with an empty list and invalidates any pending
request so a late result cannot repopulate the cleared conversation.

**Rationale**: The state model is sufficient for follow-up context and makes the no-persistence
rule visible in code. A stateless adapter avoids a second memory store and makes reset behavior
straightforward to test.

**Alternatives considered**: Browser storage would violate the no-saved-history rule. A
provider-managed thread would hide state and make `New chat` harder to guarantee. A global store
would add complexity to a one-screen application.

## Error handling

**Decision**: Normalize missing configuration, unavailable provider responses, timeouts, and
empty model output into a typed `ChatServiceError` category. The UI will show a concise,
recoverable error, leave the disclaimer visible, retain completed messages, and allow another
submission. The first release will use one request attempt with a 30-second user-visible
response deadline; it will not silently retry or display guessed tax guidance.

**Rationale**: Users need an honest recovery path for a financial-information tool. A single
bounded attempt avoids duplicate model requests and keeps the acceptance timing measurable.

**Alternatives considered**: Silent retries can duplicate requests and obscure quota failures.
Displaying a canned answer after a failed request would violate the no-fabrication requirement.
A backend error queue is outside the approved architecture.

## User interface and accessibility

**Decision**: Use semantic React elements and plain CSS: a heading/header, one chat panel,
message list, labelled text input, submit control, `New chat` button, loading state, error state,
and one-line disclaimer. The layout will remain one screen while adapting to narrow viewports.
Focus order, keyboard submission, labelled controls, readable contrast, and live announcement of
new responses and errors are required.

**Rationale**: A small custom surface matches the product constraint and avoids the cost and
visual assumptions of a component library. Semantic controls make the three-minute demo usable
with keyboard and assistive technology.

**Alternatives considered**: A UI component library would add dependency and styling surface
without a required workflow. Markdown rendering is unnecessary for the specified plain-language
answers and would add unneeded parsing and security considerations.

## Test strategy

**Decision**: Unit tests will inject `FakeChatService` and cover rendering, submission,
loading/error states, context forwarding, disclaimer visibility, and reset behavior. Playwright
will run against a local Vite production preview and intercept requests to the Gemini API with a
fixed provider-shaped response. The end-to-end suite will cover the three-minute demo, request
interception, CA fallback display, and `New chat` reset without a real API key.

**Rationale**: The two layers verify both the deterministic application behavior and the browser
integration boundary while keeping CI independent of Gemini quota and credentials.

**Alternatives considered**: Real model calls in CI would be flaky, costly, and unsafe. Testing
only the React components would miss request wiring and deployed asset behavior. Testing only
end-to-end would make failures slower and less diagnostic.

## GitHub Pages and CI

**Decision**: Treat the repository as a GitHub Pages project site at `/test-day-7/`. Vite's
`base` will be configurable through `VITE_BASE_PATH`, defaulting to `/` for local development
and set to `/test-day-7/` for deployment. A single GitHub Actions workflow will run unit tests,
Playwright tests, and the production build on every push and pull request. A Pages deployment
job will run only for a successful push to the default branch and will depend on all validation
jobs; it will publish the built `dist/` artifact with the Pages actions.

**Rationale**: The project-repository path is the natural Pages target for `Ashu1491/test-day-7`.
Keeping validation and deployment jobs in one dependency graph makes the deployment gate
explicit and prevents an independently triggered deploy from bypassing tests.

**Alternatives considered**: Deploying from a `gh-pages` branch would create a second publication
path and weaken the direct job dependency. A custom domain is not part of the feature. A separate
workflow triggered by another workflow would require duplicating or externally transferring the
gate result.

## Scope and delivery order

**Decision**: Implement exactly the five constitutionally ordered tasks: UI shell plus unit and
CI foundation; service interface, Gemini adapter, and fake; CA persona, scope rules, disclaimer,
and memory; intercepted Playwright coverage; and Pages deployment gated on all checks. Each task
will map to one issue and one pull request.

**Rationale**: The order establishes a testable shell before model integration, then protects
provider behavior before adding browser integration and deployment. It is the only delivery
sequence allowed by the PRD and constitution.

**Alternatives considered**: Combining tasks would violate the one-issue/one-pull-request rule.
Adding authentication, persistence, extra pages, or additional model features would expand scope.

## Research outcome

All technical choices required by the plan are resolved. No clarification is required before
Phase 1 design or `/speckit-tasks`.
