# Implementation Plan: CA Buddy Chatbot

**Branch**: `001-ca-buddy-chat` | **Date**: 2026-09-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-ca-buddy-chat/spec.md`

## Summary

Build a single-screen browser chatbot that gives small-business owners concise, general
guidance on Indian GST, TDS, ITR deadlines, and audit basics, and explicitly escalates
personalized, risky, uncertain, or out-of-scope questions to a Chartered Accountant. The
implementation will use a small React UI backed by a `ChatService` interface. The production
service will call Gemini directly through LangChain.js, while unit tests inject a fake service
and Playwright intercepts the Gemini request. Conversation state will remain in React memory
only. A single GitHub Actions workflow will run unit tests, a built-preview end-to-end suite,
and the production build on every push and pull request; its successful main-branch run will
deploy the build to GitHub Pages.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node.js 22 LTS, npm

**Primary Dependencies**: Vite 7.x, `@langchain/google-genai`, `langchain`, Vitest,
Testing Library, and Playwright

**Storage**: N/A; conversation state is held in React memory for the active page session only

**Testing**: Vitest + Testing Library with an injected fake `ChatService`; Playwright with the
Gemini request intercepted; Vite production build

**Target Platform**: Modern evergreen browsers served as the GitHub Pages project site
`/test-day-7/`; CI runs on Ubuntu with Node.js 22 LTS

**Project Type**: Frontend-only single-screen web application

**Performance Goals**: The UI displays submitted questions immediately; in the acceptance
environment, at least 95% of non-empty questions reach a response or recoverable error within
30 seconds; the three-minute demo is completable within three minutes

**Constraints**: No backend, server, database, login, settings, or saved history; direct
browser Gemini calls through `@langchain/google-genai`; `VITE_GOOGLE_API_KEY` is supplied by a
local `.env` or GitHub Actions secret; maximum 1,024 output tokens; one screen; no credentials
committed to source; deployment is gated on tests and build

**Scale/Scope**: One route and one active conversation per browser tab; four supported topic
areas; one model provider; no multi-user data, persistence, or administrative surface

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Browser-First Architecture**: PASS. The plan uses React + TypeScript + Vite, direct
  browser Gemini calls, and no backend, server, or database.
- **II. Bounded Tax Guidance and CA Escalation**: PASS. The system prompt is a source file,
  scope is limited to the four approved topics, risky questions receive a CA fallback, and the
  disclaimer is part of the persistent shell.
- **III. Separable and Deterministic Model Boundary**: PASS. UI code depends on `ChatService`,
  production and fake implementations are replaceable, and conversation state is session-only.
- **IV. Single-Screen Clarity**: PASS. The structure contains one screen with only the required
  header, chat panel, input, `New chat` action, and disclaimer.
- **V. Test-Gated Delivery**: PASS. Unit tests, intercepted Playwright tests, and a production
  build run in GitHub Actions; the Pages deployment job depends on all validation jobs.
- **Gate result**: PASS. No constitution violation or complexity exception is required.

## Project Structure

### Documentation (this feature)

```text
specs/001-ca-buddy-chat/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── chat-service.md
│   └── gemini-boundary.md
└── tasks.md                 # Created by /speckit-tasks, not this plan
```

### Source Code (repository root)

```text
.
├── .env.example
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── index.html
├── package.json
├── package-lock.json
├── playwright.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   ├── ai/
│   │   └── caSystemPrompt.ts
│   ├── components/
│   │   ├── ChatPanel.tsx
│   │   ├── Disclaimer.tsx
│   │   ├── Header.tsx
│   │   └── MessageList.tsx
│   ├── services/
│   │   ├── chatService.ts
│   │   └── geminiChatService.ts
│   └── types/
│       └── chat.ts
└── tests/
    ├── e2e/
    │   └── chat.spec.ts
    ├── fakes/
    │   └── fakeChatService.ts
    └── unit/
        ├── App.test.tsx
        ├── chatService.test.ts
        └── geminiChatService.test.ts
```

**Structure Decision**: Use one Vite project at the repository root. Keep UI components,
conversation types, the service contract, Gemini adapter, and system prompt under `src/`.
Keep fake implementations and tests under `tests/`; this prevents test-only behavior from
becoming part of the production bundle. Use plain CSS to satisfy the attractive, simple design
without adding a component library or a second styling system.

## Complexity Tracking

No constitution violations were identified, so no complexity exceptions are required.

## Post-Design Constitution Check

- **Browser-only boundary**: PASS. The research and contracts keep all model calls in the
  browser and exclude backend, server, and database artifacts.
- **Scope and CA escalation**: PASS. The system-prompt contract and quickstart require the
  four supported topics, general-information language, visible disclaimer, and CA fallback.
- **Deterministic boundary**: PASS. The data model assigns memory to React state, the
  `ChatService` contract is provider-neutral, and the fake/interception contracts exclude real
  model calls from tests.
- **Single-screen product**: PASS. The source structure contains one app shell and no routing,
  authentication, settings, or history surface.
- **Test-gated delivery**: PASS. The quickstart and research require unit tests, intercepted
  Playwright tests, and a build on every push and pull request, with Pages depending on them.
- **Result**: PASS. Phase 1 introduced no governance violation and left no unresolved technical
  decision required before task generation.
