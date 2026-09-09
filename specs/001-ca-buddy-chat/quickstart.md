# CA Buddy Chatbot Quickstart

This guide validates the planned feature locally without making real Gemini calls during tests.

## Prerequisites

- Node.js 22 LTS and npm
- A modern browser for manual use
- A Google Gemini API key only for manually trying real responses locally

No API key is required for unit tests or Playwright tests because the model is faked or the
Gemini request is intercepted.

## Install and configure

```sh
npm ci
cp .env.example .env
```

For manual real-model use, set `VITE_GOOGLE_API_KEY` in `.env`. Never commit `.env` or a real
key. Local development uses the root base path; Pages deployment sets `VITE_BASE_PATH=/test-day-7/`.

## Run the application

```sh
npm run dev
```

Open the printed local URL. Confirm that the single screen shows the CA Buddy header, chat
panel, input, `New chat` button, and one-line disclaimer. Ask a routine GST or TDS question,
then a question about an ITR deadline or audit basic.

## Run validation

```sh
npm run test:unit
npm run test:e2e
npm run build
```

Expected outcomes:

- Unit tests pass using the fake `ChatService` with no network request.
- Playwright builds and serves a production preview, intercepts Gemini requests, verifies the
  routine answer, CA escalation, disclaimer, error handling, follow-up context, and `New chat`.
- The production build completes without a backend or database.

To verify the project-site asset path used by GitHub Pages, run:

```sh
VITE_BASE_PATH=/test-day-7/ npm run build
grep -Fq 'test-day-7' dist/index.html
```

Pull requests run the unit tests, intercepted Playwright suite, and production build but do not
deploy. A push to `main` deploys only after all three jobs pass. The deployment job uses the
`VITE_GOOGLE_API_KEY` GitHub Actions secret when building the Pages artifact.

## Manual acceptance walkthrough

1. Load the empty screen and confirm every required control is visible without navigation.
2. Ask `What is TDS?`; confirm the question and a concise response appear.
3. Ask what to check before an ITR deadline; confirm general orientation without a personal
   filing determination.
4. Ask whether a specific filing decision is correct; confirm the response recommends a
   Chartered Accountant.
5. Select `New chat`; confirm all messages disappear and a new question has no prior context.
6. Force or simulate a provider failure; confirm a recoverable error appears, no invented tax
   answer is shown, and the disclaimer remains visible.
7. Reload the page; confirm no prior conversation is restored.

## CI and Pages gate

Every push and pull request runs the unit suite, intercepted Playwright suite, and production
build in GitHub Actions. The Pages deployment job runs only after those jobs pass on the default
branch. The deployed project site is expected at `/test-day-7/` and must contain the same
one-screen experience.
