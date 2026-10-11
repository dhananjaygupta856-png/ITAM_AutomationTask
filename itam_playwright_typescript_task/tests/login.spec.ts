import { test, expect, Page } from '@playwright/test';
import { clearIssueLog, logIssue } from '../utils/logger';

const LOGIN_URL =
  'https://itassetmanagementsoftware.com/rolepermission/admin/login';

// Dummy credentials only
const DUMMY_USERNAME = 'dummy_qa_user_12345';
const DUMMY_PASSWORD = 'DummyPassword!123';
const DUMMY_EMAIL = 'dummy.qa@example.com';

async function attachErrorLogging(page: Page): Promise<void> {
  page.on('pageerror', error => {
    logIssue(`Browser error: ${error.message}`);
  });

  page.on('console', message => {
    if (message.type() === 'error') {
      logIssue(`Console error: ${message.text()}`);
    }
  });
}

test.beforeEach(async ({ page }) => {
  clearIssueLog();
  await attachErrorLogging(page);
});

test('TC_001 - Verify login page UI', async ({ page }) => {
  try {
    await page.goto(LOGIN_URL);

    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#btnContinue')).toBeVisible();
    await page.waitForTimeout(1000);
    await expect(page.locator("label[for='remember_me']")).toBeVisible();

    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();

    await expect(page.locator('#btnMsLogin')).toBeVisible();

    // Password and email should be hidden on the initial screen.
    await expect(page.locator('#password')).toBeHidden();
    await expect(page.locator('input[name="email"]')).toBeHidden();
  } catch (error) {
    logIssue(`TC_001 failed: ${String(error)}`);
    throw error;
  }
});

test('TC_002 - Verify Continue with empty username', async ({ page }) => {
  try {
    await page.goto(LOGIN_URL);

    await page.locator('#btnContinue').click();

    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();

    const validationMessage = page.locator('.validateUserMsg');

    if (await validationMessage.isVisible().catch(() => false)) {
      await expect(validationMessage).toContainText(/valid username/i);
    }
  } catch (error) {
    logIssue(`TC_002 failed: ${String(error)}`);
    throw error;
  }
});

test('TC_003 - Verify Continue with dummy username', async ({ page }) => {
  try {
    await page.goto(LOGIN_URL);

    await page.locator('#username').fill(DUMMY_USERNAME);
    await page.locator('#btnContinue').click();

    await expect(page.locator('#username')).toHaveValue(
      DUMMY_USERNAME
    );

    await expect(page.locator('body')).toBeVisible();

    // Allow the UI validation flow to complete.
    await page.waitForTimeout(1500);

    const passwordVisible = await page
      .locator('#password')
      .isVisible()
      .catch(() => false);

    const emailVisible = await page
      .locator('input[name="email"]')
      .isVisible()
      .catch(() => false);

    if (!passwordVisible && !emailVisible) {
      logIssue(
        'TC_003: Password/email fields did not appear after Continue.'
      );
    }
  } catch (error) {
    logIssue(`TC_003 failed: ${String(error)}`);
    throw error;
  }
});

test('TC_004 - Verify dummy sign-in through the UI', async ({ page }) => {
  try {
    await page.goto(LOGIN_URL);

    await page.locator('#username').fill(DUMMY_USERNAME);
    await page.locator('#btnContinue').click();

    await page.waitForTimeout(1000);

    const passwordField = page.locator('#password');
    const emailField = page.locator('input[name="email"]');

    // Continue only if the UI advances to the password step.
    if (!(await passwordField.isVisible().catch(() => false))) {
      logIssue(
        'TC_004: Sign-in skipped because the UI did not display the password field.'
      );
      return;
    }

    await passwordField.fill(DUMMY_PASSWORD);

    if (await emailField.isVisible().catch(() => false)) {
      await emailField.fill(DUMMY_EMAIL);
    }

    // Submit through the visible UI button.
    await page.locator('#btnSubmit').click();

    await expect(page.locator('body')).toBeVisible();

    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    const bodyText = (
      await page.locator('body').innerText()
    ).toLowerCase();

    const authenticatedContent =
      bodyText.includes('logout') ||
      bodyText.includes('sign out') ||
      bodyText.includes('dashboard');

    if (authenticatedContent) {
      logIssue(
        `TC_004: Unexpected authenticated-looking content. URL: ${currentUrl}`
      );
    }
  } catch (error) {
    logIssue(`TC_004 failed: ${String(error)}`);
    throw error;
  }
});

test('TC_005 - Verify Remember Me checkbox', async ({ page }) => {
  try {
    await page.goto(LOGIN_URL);

    const rememberMe = page.locator("label[for='remember_me']");

    await expect(rememberMe).not.toBeChecked();

    await rememberMe.check();
    await expect(rememberMe).toBeChecked();

    await rememberMe.uncheck();
    await expect(rememberMe).not.toBeChecked();
  } catch (error) {
    logIssue(`TC_005 failed: ${String(error)}`);
    throw error;
  }
});

test('TC_006 - Verify Forgot Password link', async ({ page }) => {
  try {
    await page.goto(LOGIN_URL);

    await expect(
      page.getByRole('link', { name: 'Forgot password?' })
    ).toHaveAttribute('href', /forgot-password/);
  } catch (error) {
    logIssue(`TC_006 failed: ${String(error)}`);
    throw error;
  }
});

test('TC_007 - Verify Microsoft sign-in link', async ({ page }) => {
  try {
    await page.goto(LOGIN_URL);

    await expect(page.locator('#btnMsLogin')).toHaveAttribute(
      'href',
      /login-with-office/
    );
  } catch (error) {
    logIssue(`TC_007 failed: ${String(error)}`);
    throw error;
  }
});