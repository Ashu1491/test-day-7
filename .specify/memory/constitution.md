<!--
Sync Impact Report
- Version change: unversioned scaffold -> 1.0.0; 1.0.0 -> 1.1.0
- Modified principles:
	- PRINCIPLE_1_NAME placeholder -> I. Browser-First Architecture
	- PRINCIPLE_2_NAME placeholder -> II. Bounded Tax Guidance and CA Escalation
	- PRINCIPLE_3_NAME placeholder -> III. Separable and Deterministic Model Boundary
	- PRINCIPLE_4_NAME placeholder -> IV. Single-Screen Clarity
	- PRINCIPLE_5_NAME placeholder -> V. Test-Gated Delivery
- Modified sections:
	- Product and Technical Constraints: model changed from `gemini-2.5-flash` to
	  `gemma-4-26b-a4b-it` (Gemma 4 26B A4B IT).
- Added sections: Product and Technical Constraints; Development Workflow and Quality Gates.
- Removed sections: none.
- Follow-up TODOs: Confirm the original ratification date and replace
	TODO(RATIFICATION_DATE) in the metadata.
-->

# CA Buddy Constitution

## Core Principles

### I. Browser-First Architecture
CA Buddy MUST remain a frontend-only React + TypeScript + Vite application. It MUST call
Google Gemini directly from the browser through LangChain.js
(`@langchain/google-genai`) and MUST NOT introduce a backend, server, or database. The
`VITE_GOOGLE_API_KEY` value MUST come from a local `.env` during development and a GitHub
Actions secret in CI. Source files MUST NOT contain credentials.

Rationale: The browser-only boundary keeps the product small, matches the deployment model,
and makes the runtime architecture explicit.

### II. Bounded Tax Guidance and CA Escalation
The assistant MUST answer only everyday Indian GST, TDS, ITR-deadline, and audit-basics
questions for small-business owners. The CA persona system prompt MUST define these scope
rules and MUST direct users to consult a Chartered Accountant for personalized, high-risk,
out-of-scope, or uncertain questions. The one-line disclaimer MUST remain visible while
using the chat and MUST state that responses are general information, not professional advice.

Rationale: Clear boundaries reduce the risk that general educational information is treated
as a filing decision or a substitute for a Chartered Accountant.

### III. Separable and Deterministic Model Boundary
The UI MUST depend on a `ChatService` interface rather than a provider-specific client. The
production implementation MUST use LangChain.js with Google Gemini, and tests MUST be able
to inject a fake implementation. Conversation memory MUST exist only in the active browser
session, and `New chat` MUST clear both visible messages and active context.

Rationale: The interface isolates browser behavior from model behavior and makes unit tests
deterministic without network access.

### IV. Single-Screen Clarity
The product MUST present one screen containing a header, one chat panel, an input, a `New
chat` button, and a one-line disclaimer. It MUST NOT add login, saved history, or settings.
The primary interaction MUST support the three-minute demo: ask a scoped question, receive
an answer, see the CA fallback when applicable, and start a new chat.

Rationale: A deliberately small surface keeps routine tax questions fast to scan and easy to
understand for small-business owners.

### V. Test-Gated Delivery
Unit tests MUST use Vitest and Testing Library with the model faked. End-to-end tests MUST
use Playwright with the Gemini request intercepted. Both suites MUST run in GitHub Actions on
every push and pull request. GitHub Pages deployment MUST wait for all tests and the
production build to pass. The implementation MUST use exactly five tasks in the prescribed
order, with one GitHub issue and one pull request for each task.

Rationale: Automated gates protect the model boundary and prevent an unverified build from
being published.

## Product and Technical Constraints

- The supported user is an Indian small-business owner seeking general information on GST,
	TDS, ITR deadlines, or audit basics.
- The provider is Google Gemini through `@langchain/google-genai`; the model name is
	`gemma-4-26b-a4b-it` (Gemma 4 26B A4B IT) with a maximum of 1,024 output tokens per response.
- The system prompt MUST live in `src/ai/caSystemPrompt.ts` and MUST encode the CA persona,
	scope rules, CA fallback, disclaimer, and conversation-memory behavior.
- Runtime configuration MUST read `VITE_GOOGLE_API_KEY`; local development uses `.env`, and
	CI uses a GitHub Actions secret.
- The application MUST have no login, saved history, settings, backend, server, or database.

## Development Workflow and Quality Gates

- The five tasks MUST be delivered in this order: chat UI shell, unit tests, and CI; the
	`ChatService` interface, Gemini implementation, and fake; the CA persona and memory; the
	intercepted Playwright tests and CI wiring; and GitHub Pages deployment.
- Each task MUST have exactly one GitHub issue and one pull request. A pull request MUST
	identify its task and preserve the dependency order.
- A pull request MUST pass unit tests, intercepted Playwright tests, and the production build
	before merge. Deployment MUST be gated on those same checks.
- Reviewers MUST verify scope boundaries, fake-model unit coverage, intercepted Gemini
	coverage, visible disclaimer behavior, `New chat` clearing, and the absence of persistence.

## Governance

This constitution is the highest-level project governance document. When another project
artifact conflicts with it, the conflict MUST be resolved in favor of this constitution or
recorded as an approved amendment before implementation continues.

Amendments MUST be proposed in a pull request that explains the motivation, affected
principles or sections, compatibility impact, and required migration or test changes. A
maintainer MUST approve the amendment before it takes effect. The pull request MUST update
the Sync Impact Report, version, and amendment date. Any exception MUST name an owner, give a
reason, and include an expiration or follow-up decision.

Versioning follows semantic rules: MAJOR increments remove or redefine a principle or make
backward-incompatible governance changes; MINOR increments add a principle or materially
expand guidance; PATCH increments clarify wording or correct non-semantic errors.

Every pull request and release review MUST verify compliance with the principles, product
constraints, and quality gates. The review MUST confirm that no unapproved backend,
persistence, model-scope expansion, or deployment bypass has been introduced.

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE): prior adoption date unknown | **Last Amended**: 2026-09-09
