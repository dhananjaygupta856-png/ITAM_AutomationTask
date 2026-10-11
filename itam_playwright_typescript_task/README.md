# IT Asset Management Login — Playwright + TypeScript

UI-only automated checks for the IT Asset Management login page:

https://itassetmanagementsoftware.com/rolepermission/admin/login

The tests are based on the supplied HTML source and screenshot. The page uses a staged login flow: the initial screen displays the username step, and password/email fields may remain hidden until the user clicks **Continue** and the application handles the username.

## Coverage

- Verify the login page loads and expected initial UI controls are displayed.
- Verify the username field and Continue button on the initial step.
- Verify password and email fields are hidden initially when the UI is at the username step.
- Click Continue with an empty username and inspect the visible UI validation.
- Enter a dummy username and observe the UI response.
- Attempt sign-in with dummy username/password/email only if the UI advances to the password step.
- Check Remember Me whether its native checkbox is visible or visually hidden:
  - Check whether `#remember_me` exists in the DOM.
  - Check native checkbox visibility.
  - Verify the associated `label[for="remember_me"]` is visible.
  - When the native checkbox is hidden by custom styling, interact through the visible label/custom control and verify the checked/unchecked state.
- Verify Forgot Password and Microsoft sign-in links.
- Record browser page errors and console errors, as well as caught test issues, in `logs/automation-errors.txt`.

All functional interactions are performed through the web UI. The tests do not call API endpoints directly or use Playwright's `APIRequestContext` for API validation.

## Requirements

- Node.js 20 LTS recommended
- npm
- Git

## Setup (Windows PowerShell / CMD)

```bash
npm install
npx playwright install chromium
```

## Run tests

Run all tests:

```bash
npm test
```

Run with a visible browser:

```bash
npm run test:headed
```

Run only the login spec:

```bash
npx playwright test tests/login.spec.ts
```

Debug tests interactively:

```bash
npm run test:debug
```

Open the HTML report:

```bash
npm run report
```

## Output

- Text issue log: `logs/automation-errors.txt`
- HTML report: `playwright-report/`
- Failure screenshots, traces, and other artifacts: `test-results/`

The current logger setup clears the issue log at the start of each test. As a result, the file contains issues from the most recently started test rather than a consolidated log for the full test run. To preserve errors across the entire run, clear the file once in a global setup or remove `clearIssueLog()` from `beforeEach`.

## Remember Me checkbox behavior

Some sites hide the native checkbox with CSS and display a custom-styled control. A hidden native checkbox does not automatically mean the Remember Me UI is broken.

The test should:
1. Check whether `#remember_me` exists in the DOM.
2. Check whether the native checkbox is visible and enabled.
3. Check whether the associated label `label[for="remember_me"]` is visible.
4. If the native checkbox is hidden but the label/custom control is visible, click the visible label and verify the checkbox state changes.
5. Log an issue if neither the checkbox nor a usable visible control is available.

Avoid using `force: true` as the first solution because it can bypass genuine user-interaction problems.

## Important notes

- Credentials are intentionally dummy values. Never commit real or production credentials.
- Username validation and the next step are controlled by the live application. The dummy username may not be recognized, so password-step tests are conditional on the UI actually showing that field.
- Application behavior, UI layout, and messages may change.
- Network availability, browser setup, rate limits, or server-side changes may affect live-site execution.
- The project was generated from the supplied HTML. It has not been executed against the live website in this environment.

## Push to your own GitHub repository

Create an empty repository on GitHub, then run these commands from the project folder:

```bash
git init
git add .
git commit -m "Add Playwright TypeScript login automation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/itam-playwright-typescript-task.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. Share the repository URL only after the repository has actually been created and pushed.
