# Tasks: CA Buddy Chatbot

**Input**: Design documents from `/specs/001-ca-buddy-chat/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/](contracts/), and [quickstart.md](quickstart.md)

## Constitutional Delivery Rule

Exactly five tasks build the whole app. Each task below maps to exactly one GitHub issue and
exactly one pull request, and MUST be completed in the listed order. Do not split a delivery
task into additional issue/PR tasks. The `[US#]` marker identifies the primary user story
covered by that delivery; the story may also receive supporting work from adjacent deliveries.

## Phase 1: Delivery Task 1 - Chat UI Shell, Unit Tests, and CI

**Goal**: Establish the runnable Vite application and the one-screen shell so a user can see
the required controls and submit a question-shaped interaction without a provider dependency.
This is the foundation for User Story 1 and the visible reset/disclaimer surface of User Story 3.

**Independent test**: Run the unit suite with no API key and no network. Confirm the empty screen
contains the header, chat panel, labelled input, submit control, `New chat` button, and one-line
disclaimer; blank input does not submit; the shell renders a submitted question through a test
callback; and the CI workflow runs the unit suite on push and pull request.

- [X] T001 Create the root React + TypeScript + Vite project, one-screen accessible chat shell, initial unit-test harness, and push/pull-request unit-test CI in `package.json`, `package-lock.json`, `index.html`, `.env.example`, `.gitignore`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/types/chat.ts`, `src/components/Header.tsx`, `src/components/ChatPanel.tsx`, `src/components/MessageList.tsx`, `src/components/Disclaimer.tsx`, `src/styles.css`, `tests/unit/App.test.tsx`, and `.github/workflows/ci.yml` (one GitHub issue and one pull request)

## Phase 2: Delivery Task 2 - ChatService, Gemini Adapter, and Fake

**Goal**: Replace the shell callback with the provider-neutral service boundary and make a real
browser Gemini call possible while keeping unit tests deterministic. This completes the model
path needed by User Story 1 but does not add the CA persona rules yet.

**Independent test**: Unit tests inject `FakeChatService`, verify the question and completed
history passed by the UI, and verify that the Gemini adapter configures the required model,
API-key source, system-prompt dependency, and 1,024-token output limit without making a real
network call.

- [X] T002 [US1] Define and integrate the provider-neutral `ChatService`, direct LangChain + Gemini adapter, deterministic fake, normalized provider errors, and service-focused unit tests in `src/services/chatService.ts`, `src/services/geminiChatService.ts`, `src/types/chat.ts`, `src/App.tsx`, `tests/fakes/fakeChatService.ts`, `tests/unit/chatService.test.ts`, and `tests/unit/geminiChatService.test.ts` (depends on T001; one GitHub issue and one pull request)

## Phase 3: Delivery Task 3 - CA Persona, Scope, Disclaimer, and Memory

**Goal**: Make answers safe and useful for the target user: encode the CA persona and topic
boundaries, require the Chartered Accountant fallback, preserve the disclaimer, and implement
session-only conversation memory plus robust reset/error behavior. This completes User Stories 1
and 2 and the implementation portion of User Story 3.

**Independent test**: With the fake service, verify representative GST, TDS, ITR-deadline, and
audit-basic exchanges; verify personalized, high-risk, uncertain, and out-of-scope exchanges
recommend a Chartered Accountant; verify follow-up history is forwarded; verify `New chat`
clears visible messages and context; verify a late pending result cannot repopulate a cleared
conversation; and verify errors do not remove the disclaimer or completed messages.

- [X] T003 [US2] Add the CA system prompt, scope rules, explicit Chartered Accountant fallback, disclaimer text, session-only conversation state, pending-request invalidation, loading/error states, and focused unit coverage in `src/ai/caSystemPrompt.ts`, `src/App.tsx`, `src/components/ChatPanel.tsx`, `src/components/Disclaimer.tsx`, `src/components/MessageList.tsx`, `src/types/chat.ts`, `src/styles.css`, `tests/unit/App.test.tsx`, `tests/unit/chatService.test.ts`, and `tests/unit/geminiChatService.test.ts` (depends on T002; one GitHub issue and one pull request)

## Phase 4: Delivery Task 4 - Intercepted Playwright End-to-End Tests

**Goal**: Prove the complete browser flow against a production preview without Gemini network
access, and wire the end-to-end gate into CI. This validates all three user stories at the
browser boundary.

**Independent test**: Start the built preview, intercept every Google Generative Language API
request before network access, and run the three-minute demo: routine supported answer, CA
fallback, visible disclaimer, recoverable provider failure, follow-up context, `New chat` reset,
and reload with no saved history. Confirm CI installs the browser and runs the suite on every
push and pull request.

- [X] T004 [US3] Implement built-preview Playwright configuration, Gemini request interception, deterministic success/failure fixtures, three-minute-demo coverage, context-payload assertions, reset/reload assertions, and CI wiring in `playwright.config.ts`, `tests/e2e/chat.spec.ts`, and `.github/workflows/ci.yml` (depends on T003; one GitHub issue and one pull request)

## Phase 5: Delivery Task 5 - GitHub Pages Deployment and Final Gate

**Goal**: Publish the verified single-screen app to the `test-day-7` GitHub Pages project site
only after every required validation job passes. This is the final cross-cutting delivery and
must not add features, persistence, authentication, or another screen.

**Independent test**: On a push to the default branch, confirm the workflow waits for unit,
intercepted Playwright, and production-build jobs, publishes the `dist/` artifact only after
success, loads the app at `/test-day-7/`, and preserves the same one-screen acceptance flow.
Confirm pull requests run validation but do not deploy.

- [X] T005 Configure the GitHub Pages project base path, deployment permissions, artifact upload, validation-job dependencies, default-branch deployment condition, and final quickstart/production-build verification in `vite.config.ts`, `.github/workflows/ci.yml`, and `specs/001-ca-buddy-chat/quickstart.md` (depends on T004; one GitHub issue and one pull request)

## User Story Coverage and Independent Tests

### User Story 1 - Ask an Everyday Tax Question (P1)

**Coverage**: T001 supplies the screen and submission path; T002 supplies the service and fake;
T003 supplies the CA-aware prompt and response states; T004 verifies the browser flow.

**Independent test**: Inject the fake service, submit one representative GST, TDS, ITR-deadline,
and audit-basic question, and verify each produces a readable, scoped assistant response without
a real API key. Repeat the happy path through intercepted Playwright requests.

### User Story 2 - Know When to Consult a Chartered Accountant (P1)

**Coverage**: T003 defines the persona, scope boundary, fallback, and disclaimer; T004 verifies
these behaviors through the browser and intercepted provider response.

**Independent test**: Submit personalized, high-risk, uncertain, and out-of-scope prompts and
verify every response explicitly recommends consulting a Chartered Accountant without claiming a
definitive individual filing decision. Verify the disclaimer remains visible after success and
error.

### User Story 3 - Continue or Reset a Conversation (P2)

**Coverage**: T001 provides the chat surface; T003 owns in-memory state, follow-up context, and
reset invalidation; T004 verifies request payloads, reset behavior, pending-response handling, and
reload behavior.

**Independent test**: Submit a question and follow-up, assert the second service call includes
only completed prior messages, select `New chat`, assert visible messages and subsequent context
are empty, and reload to confirm no history returns.

## Dependencies and Execution Order

### Task Dependency Graph

```text
T001 -> T002 -> T003 -> T004 -> T005
```

- **T001** has no predecessor and creates the project and test foundation.
- **T002** depends on the shell and introduces the service boundary used by later work.
- **T003** depends on the service contract and adds the required persona, scope, memory, and
  error behavior.
- **T004** depends on the complete user-visible behavior and adds the browser-level gate.
- **T005** depends on all tests and the build being runnable and gates Pages deployment on them.

No delivery tasks may run in parallel because the constitution requires this exact five-task
order and one issue/pull request per task.

### Parallel Opportunities Inside Delivery Tasks

These are file-level activities within the same issue/PR, not additional tasks or parallel
branches:

- **T001 / US1**: After the package/config skeleton is established, the header, message list,
  disclaimer, and base stylesheet can be drafted independently before App wiring.
- **T002 / US1**: The service interface and fake contract can be reviewed in parallel with the
  mocked Gemini adapter test, then integrated through the App after both are coherent.
- **T003 / US2 and US3**: The system-prompt text and disclaimer copy can be authored in parallel
  with state-transition unit cases before the App integration is finalized.
- **T004 / all stories**: Interception fixtures for success and failure can be prepared in
  parallel with locator-level shell assertions, then combined in the end-to-end flow.
- **T005 / cross-cutting**: Pages permissions and Vite base-path checks can be reviewed in
  parallel, but deployment remains blocked until T004 validation is complete.

## Implementation Strategy

### MVP Scope

The MVP user value is User Story 1: a small-business owner can ask a routine supported-topic
question and receive a readable general answer. Because CA escalation is a P1 safety boundary,
any usable MVP also requires the relevant T003 fallback and disclaimer behavior. The first
browser-demonstrable milestone is therefore T001 through T004; T005 makes that verified result
public on GitHub Pages.

### Incremental Delivery

1. Complete T001 and verify the one-screen shell and unit CI gate.
2. Complete T002 and verify the fake service plus provider adapter boundary without network calls.
3. Complete T003 and validate routine guidance, CA escalation, disclaimer, memory, reset, and
   error behavior with unit tests.
4. Complete T004 and run the full three-minute demo through intercepted Playwright requests.
5. Complete T005 and deploy only after unit tests, end-to-end tests, and the production build
   pass in GitHub Actions.

### Completion Rule

The feature is complete only when all five task checkboxes are complete, each task has exactly
one linked GitHub issue and pull request, the acceptance walkthrough passes, and no backend,
server, database, login, saved history, settings, extra route, or unapproved model scope has
been introduced.

## Format and Traceability Notes

- Total executable tasks: **5**, exactly matching the five mandated delivery tasks.
- User-story coverage counts: **US1: 4 deliveries (T001-T004)**, **US2: 2 deliveries (T003-T004)**,
  **US3: 3 deliveries (T001, T003, T004)**.
- Every executable task uses the required `- [ ] T###` checklist prefix, has a unique sequential
  ID, names exact file paths, and states its dependency.
- Tests are included because the feature specification and constitution explicitly require unit,
  intercepted end-to-end, CI, and build validation.
