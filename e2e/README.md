# E2E Testing with Playwright

This directory contains end-to-end tests for the follow-app application using Playwright.

## 📁 Structure

```
e2e/
├── page-objects/          # Page Object Model classes
│   ├── LoginPage.ts       # Login page interactions
│   └── DashboardPage.ts   # Dashboard, threads, and action points
├── helpers/               # Test helper functions
│   └── test-helpers.ts    # Common test utilities
├── user-journey.spec.ts   # Main user journey tests
└── README.md             # This file
```

## 🎯 Page Object Model (POM)

We follow the Page Object Model pattern for maintainable and reusable test code.

### LoginPage

Handles all interactions with the login form:
- `goto()` - Navigate to login page
- `login(email, password)` - Perform login
- `isVisible()` - Check if login form is visible
- `goToRegister()` - Navigate to registration
- `goToResetPassword()` - Navigate to password reset

### DashboardPage

Main dashboard interactions:
- `goto()` - Navigate to dashboard
- `logout()` - Logout from application
- `getThreadTabs()` - Get thread tabs component
- `getActionPoints()` - Get action points component

### ThreadTabsComponent

Thread management:
- `createThread(name)` - Create a new thread
- `selectThread(name)` - Select a thread by name
- `getAllThreads()` - Get all thread names
- `hasThread(name)` - Check if thread exists

### ActionPointsComponent

Action points management:
- `createActionPoint(title, isCompleted)` - Create new action point
- `getAllActionPoints()` - Get all action point elements
- `getActionPointTitles()` - Get all action point titles
- `hasActionPoint(title)` - Check if action point exists
- `getActionPointCount()` - Get count of action points

## 🧪 Running Tests

### Install dependencies
```bash
npm install
npx playwright install chromium
```

### Run all tests
```bash
npx playwright test
```

### Run tests in UI mode (interactive)
```bash
npx playwright test --ui
```

### Run specific test file
```bash
npx playwright test e2e/user-journey.spec.ts
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Debug tests
```bash
npx playwright test --debug
```

### View test report
```bash
npx playwright show-report
```

## 🎬 Test Recording (Codegen)

Generate tests by recording your actions:
```bash
npx playwright codegen http://localhost:4321
```

## 🔍 Trace Viewer

View traces for failed tests:
```bash
npx playwright show-trace trace.zip
```

## 📝 Writing Tests

### Test Structure (AAA Pattern)

Follow the **Arrange, Act, Assert** pattern:

```typescript
test("should do something", async ({ page }) => {
  // Arrange: Setup test data and page objects
  const loginPage = new LoginPage(page);
  const testEmail = "test@example.com";
  
  // Act: Perform actions
  await loginPage.goto();
  await loginPage.login(testEmail, "password");
  
  // Assert: Verify results
  await expect(page).toHaveURL("/threads");
});
```

### Using Test Steps

Break down complex tests into steps:

```typescript
test("complex user journey", async ({ page }) => {
  await test.step("Login", async () => {
    // Login logic
  });
  
  await test.step("Create thread", async () => {
    // Thread creation logic
  });
  
  await test.step("Verify result", async () => {
    // Assertions
  });
});
```

### Using data-testid Selectors

Always prefer `data-testid` attributes for reliable selectors:

```typescript
// ✅ Good - using data-testid
await page.getByTestId("login-email-input").fill("test@example.com");

// ❌ Avoid - using CSS selectors
await page.locator("#email").fill("test@example.com");
```

## 🔧 Helper Functions

Use helper functions from `helpers/test-helpers.ts`:

```typescript
import { loginAsUser, createThread, generateUniqueName } from "./helpers/test-helpers";

test("example with helpers", async ({ page }) => {
  // Login
  await loginAsUser(page, "test@example.com", "password");
  
  // Create thread with unique name
  const threadName = generateUniqueName("Thread");
  await createThread(page, threadName);
});
```

## 📊 Test Coverage

Current test scenarios:
- ✅ Complete user journey (login → create thread → add AP → logout)
- ✅ Login with invalid credentials
- ✅ Thread name validation
- ✅ Action point title validation

## 🐛 Debugging Tips

1. **Use headed mode** to see what's happening:
   ```bash
   npx playwright test --headed --slowmo=1000
   ```

2. **Use debug mode** to step through tests:
   ```bash
   npx playwright test --debug
   ```

3. **Take screenshots** during test execution:
   ```typescript
   await page.screenshot({ path: "screenshot.png" });
   ```

4. **Use trace viewer** for failed tests - traces are automatically captured on first retry

5. **Check console logs**:
   ```typescript
   page.on("console", msg => console.log(msg.text()));
   ```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [Test Assertions](https://playwright.dev/docs/test-assertions)
