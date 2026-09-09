# Feature Specification: CA Buddy Chatbot

**Feature Branch**: `001-ca-buddy-chat`

**Created**: 2026-09-09

**Status**: Draft

**Input**: User description: Create CA Buddy, a one-screen chatbot that gives Indian small-business owners everyday guidance on GST, TDS, ITR deadlines, and audit basics, and tells them when to consult a Chartered Accountant. Source: `prd.md`; governing constraints: `constitution.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask an Everyday Tax Question (Priority: P1)

A small-business owner opens CA Buddy and asks a plain-language question about GST, TDS,
an ITR deadline, or an audit basic. The user receives a concise general-information answer
that helps them understand the topic and decide whether professional help is needed.

**Why this priority**: Answering a routine question is the core value of CA Buddy and the
smallest useful experience for the target user.

**Independent Test**: Start with an empty chat, submit one representative question from each
supported topic, and verify that each produces a readable, topic-relevant response without
requiring a second feature or a saved account.

**Acceptance Scenarios**:

1. **Given** the empty CA Buddy screen, **When** the user submits "What is TDS?", **Then**
   the question appears in the conversation and the user receives a concise explanation of
   TDS in everyday language.
2. **Given** the empty CA Buddy screen, **When** the user asks what to check before an ITR
   deadline, **Then** the response provides general, practical orientation and does not claim
   to determine the user's individual filing obligation.
3. **Given** the empty CA Buddy screen, **When** the user asks an everyday GST or audit-basics
   question, **Then** the response addresses the asked topic and remains within general
   educational guidance.

---

### User Story 2 - Know When to Consult a Chartered Accountant (Priority: P1)

A small-business owner asks a personalized, high-risk, uncertain, or out-of-scope question.
CA Buddy clearly recommends consulting a Chartered Accountant instead of presenting a
specific filing decision as settled professional advice.

**Why this priority**: Tax and audit questions can have financial consequences. A clear
boundary is essential for responsible use and for maintaining user trust.

**Independent Test**: Submit representative personalized, high-risk, and out-of-scope
questions and verify that each response contains an explicit recommendation to consult a
Chartered Accountant and avoids a definitive individualized decision.

**Acceptance Scenarios**:

1. **Given** the user asks whether a particular filing decision is correct for their business,
   **When** CA Buddy responds, **Then** it recommends consulting a Chartered Accountant and
   does not make the decision on the user's behalf.
2. **Given** the user asks a question outside Indian GST, TDS, ITR deadlines, or audit basics,
   **When** CA Buddy responds, **Then** it identifies the boundary and directs the user to a
   Chartered Accountant or another appropriate professional rather than improvising an answer.
3. **Given** any chat state, **When** the user views the page, **Then** a one-line disclaimer
   remains visible and identifies the responses as general information while advising users to
   consult a Chartered Accountant for professional advice.

---

### User Story 3 - Continue or Reset a Conversation (Priority: P2)

A user asks a follow-up question that depends on the current exchange, then starts a new chat
when they want to change topics. The current conversation helps the follow-up, while `New
chat` removes the old exchange from the active experience.

**Why this priority**: Short-lived context makes the chatbot useful for a multi-step question
without introducing accounts or saved history.

**Independent Test**: Submit a question and a follow-up that refers to it, then use `New chat`
and verify that the visible conversation and subsequent context are cleared.

**Acceptance Scenarios**:

1. **Given** a completed exchange about TDS, **When** the user asks a follow-up referring to
   that exchange, **Then** CA Buddy uses the active conversation to answer coherently.
2. **Given** a conversation with visible messages, **When** the user selects `New chat`,
   **Then** all visible messages disappear and the next question starts without the previous
   conversation as context.
3. **Given** the user reloads or leaves the page, **When** they return to CA Buddy, **Then**
   no prior conversation is presented as saved history.

### Edge Cases

- When the input is empty or contains only whitespace, submission MUST not add a message or
  request an answer; the user remains able to enter a question.
- When the response service is unavailable, times out, or returns an unusable response, the
  user MUST see a clear recoverable error and no invented tax guidance; the disclaimer remains
  visible and existing messages remain intact.
- When a question combines supported and unsupported topics, the response MUST address only
  the supported portion and identify the boundary for the rest.
- When a user selects `New chat` while a response is pending, the cleared conversation MUST
  remain empty rather than being repopulated by the previous request.

## Requirements *(mandatory)

### Functional Requirements

- **FR-001**: The product MUST display a single screen containing a header, one chat panel,
  an input, a `New chat` action, and a one-line disclaimer.
- **FR-002**: The product MUST accept a non-empty user question and provide a visible submitted
  question followed by an assistant response without requiring a page reload.
- **FR-003**: The product MUST answer questions about everyday Indian GST, TDS, ITR deadlines,
  and audit basics in concise, plain language suitable for small-business owners.
- **FR-004**: The product MUST keep responses within general educational guidance and MUST NOT
  present a personalized filing, tax, or audit decision as definitive professional advice.
- **FR-005**: For personalized, high-risk, uncertain, or out-of-scope questions, the product
  MUST explicitly recommend consulting a Chartered Accountant.
- **FR-006**: The one-line disclaimer MUST remain visible throughout the chat and MUST state
  that responses are general information and that users should consult a Chartered Accountant
  for professional advice.
- **FR-007**: The product MUST use the active conversation as context for follow-up questions
  during the current page session and MUST NOT present context from a prior page session.
- **FR-008**: Selecting `New chat` MUST remove all visible messages and clear the active
  conversation context before the next question is answered.
- **FR-009**: The product MUST NOT require login and MUST NOT provide saved history or settings.
- **FR-010**: When an answer cannot be obtained, the product MUST show a clear recoverable
  error, MUST avoid fabricating tax guidance, and MUST preserve the disclaimer.
- **FR-011**: The product MUST support the three-minute demo: a new user can ask a routine
  question, receive a scoped answer, see the CA escalation for a risky question, and start a
  new chat from the same screen.

### Key Entities *(include if feature involves data)*

- **Conversation**: The ordered set of messages held for the current page session; it is
  cleared by `New chat` and is not presented as saved history after the session ends.
- **User Question**: The text submitted by the small-business owner, including its position in
  the active conversation.
- **Assistant Response**: General educational guidance or an explicit CA escalation associated
  with a user question, plus the ongoing disclaimer shown with the chat.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of first-time evaluators complete the three-minute demo within
  three minutes without assistance: ask a routine question, recognize the answer, trigger a
  CA escalation, and start a new chat.
- **SC-002**: For a fixed acceptance set of at least 20 representative prompts, 100% produce
  either an in-scope general answer or an explicit recommendation to consult a Chartered
  Accountant, and 0% present a personalized filing decision as definitive advice.
- **SC-003**: In 100% of evaluated chat states, including after an answer, an error, and a new
  chat, the one-line disclaimer remains visible and readable.
- **SC-004**: In 100% of evaluated `New chat` actions, visible messages and follow-up context
  are cleared, and a subsequent page visit shows no saved conversation.
- **SC-005**: At least 90% of evaluators rate the response to each supported-topic example as
  understandable and useful, scoring at least 4 out of 5 on a simple clarity question.
- **SC-006**: In a test environment with a functioning response service, at least 95% of
  submitted non-empty questions display either a response or a clear recoverable error within
  30 seconds.

## Assumptions

- Users have an internet connection and ask questions in clear everyday language.
- CA Buddy provides general information only; users verify current deadlines and consequential
  decisions with a Chartered Accountant or an appropriate official source.
- The initial release uses one primary language and does not include translation or
  localization workflows.
- The active conversation is intentionally temporary; no account, cross-device continuity, or
  user-controlled history is required.
- A failed or delayed response is handled as a recoverable user-visible error rather than by
  displaying an unverified answer.
- The constitution is authoritative for the approved browser-only architecture, testing gates,
  delivery order, and deployment constraints; this specification defines the user-visible
  behavior and outcomes.
