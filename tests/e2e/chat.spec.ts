import { expect, test, type Page } from '@playwright/test';

type GeminiBody = Record<string, unknown>;

type GeminiReply = string | ((body: GeminiBody, requestNumber: number) => string);

async function interceptGemini(page: Page, reply: GeminiReply) {
  const requests: GeminiBody[] = [];

  await page.route('**/generativelanguage.googleapis.com/**', async (route) => {
    const body = JSON.parse(route.request().postData() ?? '{}') as GeminiBody;
    requests.push(body);
    const responseText =
      typeof reply === 'function' ? reply(body, requests.length) : reply;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        candidates: [
          {
            content: {
              parts: [{ text: responseText }],
              role: 'model',
            },
            finishReason: 'STOP',
          },
        ],
        usageMetadata: {
          promptTokenCount: 1,
          candidatesTokenCount: 1,
          totalTokenCount: 2,
        },
      }),
    });
  });

  return requests;
}

function requestContents(body: GeminiBody) {
  return JSON.stringify(body.contents ?? '');
}

test.describe('CA Buddy browser flow', () => {
  test('answers a routine question through an intercepted Gemini request', async ({ page }) => {
    const requests = await interceptGemini(
      page,
      'TDS is tax deducted at source. This is general information.',
    );
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'CA Buddy' })).toBeVisible();
    await expect(
      page.getByText(
        'General information only. Consult a Chartered Accountant for professional advice.',
      ),
    ).toBeVisible();

    await page.getByLabel('Ask CA Buddy a question').fill('What is TDS?');
    await page.getByRole('button', { name: 'Ask CA Buddy' }).click();

    await expect(page.getByText('TDS is tax deducted at source. This is general information.'))
      .toBeVisible();
    expect(requests).toHaveLength(1);
    expect(requestContents(requests[0])).toContain('What is TDS?');
  });

  test('shows CA escalation and recoverable errors while keeping the disclaimer visible', async ({
    page,
  }) => {
    const requests: GeminiBody[] = [];
    await page.route('**/generativelanguage.googleapis.com/**', async (route) => {
      const body = JSON.parse(route.request().postData() ?? '{}') as GeminiBody;
      requests.push(body);
      const contents = requestContents(body);

      if (contents.includes('force an error')) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: { code: 500, message: 'test failure' } }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: 'This is a personalized filing decision. Please consult a Chartered Accountant.',
                  },
                ],
                role: 'model',
              },
              finishReason: 'STOP',
            },
          ],
        }),
      });
    });
    await page.goto('/');

    await page.getByLabel('Ask CA Buddy a question').fill('Is this filing correct for my business?');
    await page.getByRole('button', { name: 'Ask CA Buddy' }).click();
    await expect(
      page.getByText('This is a personalized filing decision. Please consult a Chartered Accountant.'),
    ).toBeVisible();

    await page.getByRole('button', { name: 'New chat' }).click();
    await page.getByLabel('Ask CA Buddy a question').fill('Please force an error');
    await page.getByRole('button', { name: 'Ask CA Buddy' }).click();

    await expect(page.getByRole('alert')).toContainText('Gemini is temporarily unavailable');
    await expect(
      page.getByText(
        'General information only. Consult a Chartered Accountant for professional advice.',
      ),
    ).toBeVisible();
    expect(requests).toHaveLength(2);
  });

  test('forwards active context, clears it with New chat, and restores no history on reload', async ({
    page,
  }) => {
    const requests = await interceptGemini(page, (_body, requestNumber) =>
      requestNumber === 1 ? 'TDS is tax deducted at source.' : 'Here is a general follow-up answer.',
    );
    await page.goto('/');

    const input = page.getByLabel('Ask CA Buddy a question');
    await input.fill('What is TDS?');
    await page.getByRole('button', { name: 'Ask CA Buddy' }).click();
    await expect(page.getByText('TDS is tax deducted at source.')).toBeVisible();

    await input.fill('When is it deducted?');
    await page.getByRole('button', { name: 'Ask CA Buddy' }).click();
    await expect(page.getByText('Here is a general follow-up answer.')).toBeVisible();
    expect(requestContents(requests[1])).toContain('What is TDS?');
    expect(requestContents(requests[1])).toContain('TDS is tax deducted at source.');

    await page.getByRole('button', { name: 'New chat' }).click();
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByText('What is TDS?')).not.toBeVisible();

    await input.fill('What is GST?');
    await page.getByRole('button', { name: 'Ask CA Buddy' }).click();
    await expect(page.getByText('Here is a general follow-up answer.')).toBeVisible();
    expect(requestContents(requests[2])).not.toContain('What is TDS?');
    expect(requestContents(requests[2])).not.toContain('TDS is tax deducted at source.');

    await page.reload();
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByText('What is GST?')).not.toBeVisible();
  });
});
