import { test, expect } from "@playwright/test";
import { LoginPage } from "./page-objects/LoginPage";
import { DashboardPage } from "./page-objects/DashboardPage";
import { TEST_CONFIG, generateThreadName, generateActionPointTitle } from "./config/test-config";

/**
 * Complete User Flow E2E Test
 *
 * Scenario:
 * 1. Zaloguj się do aplikacji
 * 2. Dodaj nowy thread z nazwą (aktualna data i godzina)
 * 3. Dodaj AP z nazwą (aktualna data i godzina)
 * 4. Zapisz nowy AP
 * 5. Wyloguj się z aplikacji
 */
test.describe("Complete User Flow: Login → Thread → Action Point → Logout", () => {
  // Test credentials from config
  const { email: TEST_EMAIL, password: TEST_PASSWORD } = TEST_CONFIG.credentials;

  test("should complete full user journey with real data", async ({ page }) => {
    // Arrange: Initialize page objects
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Generate unique names with current date and time
    const threadName = generateThreadName();
    const actionPointTitle = generateActionPointTitle();

    // ============================================
    // STEP 1: Zaloguj się do aplikacji
    // ============================================
    await test.step("1. Zaloguj się do aplikacji", async () => {
      // Navigate to login page
      await loginPage.goto();

      // Verify login form is visible
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();

      // Fill in credentials and submit
      await loginPage.login(TEST_EMAIL, TEST_PASSWORD);

      // Wait for successful navigation to dashboard
      await page.waitForURL("/threads", { timeout: 10000 });

      // Verify we're on the dashboard
      await expect(dashboardPage.createThreadButton).toBeVisible();
      await expect(dashboardPage.logoutButton).toBeVisible();

      // Step 1 completed: Successfully logged in
    });

    // ============================================
    // STEP 2: Dodaj nowy thread
    // ============================================
    await test.step("2. Dodaj nowy thread z nazwą (aktualna data i godzina)", async () => {
      const threadTabs = dashboardPage.getThreadTabs();

      // Click create thread button
      await threadTabs.createThreadButton.click();

      // Wait for modal to appear
      await expect(threadTabs.createThreadModal.nameInput).toBeVisible({ timeout: 5000 });

      // Fill thread name
      await threadTabs.createThreadModal.fillName(threadName);

      // Verify name is filled
      await expect(threadTabs.createThreadModal.nameInput).toHaveValue(threadName);

      // Submit the form
      await threadTabs.createThreadModal.submit();

      // Wait for modal to close and thread to be created
      await page.waitForTimeout(1000);

      // Verify thread was created and is visible in tabs
      const threadTab = page.getByRole("tab", { name: threadName });
      await expect(threadTab).toBeVisible({ timeout: 5000 });

      // Verify thread is selected (active)
      const hasThread = await threadTabs.hasThread(threadName);
      expect(hasThread).toBe(true);

      // Step 2 completed: Thread created successfully
    });

    // ============================================
    // STEP 3 & 4: Dodaj AP i zapisz
    // ============================================
    await test.step("3-4. Dodaj AP z nazwą (aktualna data i godzina) i zapisz", async () => {
      const actionPoints = dashboardPage.getActionPoints();

      // Wait for action points section to load
      await actionPoints.waitForActionPointsToLoad();

      // Get initial count of action points
      const initialCount = await actionPoints.getActionPointCount();

      // Click "Dodaj AP" button
      await actionPoints.addActionPointButton.click();

      // Wait for modal to appear
      await expect(actionPoints.addActionPointModal.titleInput).toBeVisible({ timeout: 5000 });

      // Fill action point title
      await actionPoints.addActionPointModal.fillTitle(actionPointTitle);

      // Verify title is filled
      await expect(actionPoints.addActionPointModal.titleInput).toHaveValue(actionPointTitle);

      // Verify checkbox is unchecked by default
      await expect(actionPoints.addActionPointModal.completedCheckbox).not.toBeChecked();

      // Submit the form
      await actionPoints.addActionPointModal.submit();

      // Wait for modal to close and action point to be created
      await page.waitForTimeout(1500);

      // Wait for action points to reload
      await actionPoints.waitForActionPointsToLoad();

      // Verify action point count increased
      const newCount = await actionPoints.getActionPointCount();
      expect(newCount).toBe(initialCount + 1);

      // Verify action point exists with correct title
      const hasActionPoint = await actionPoints.hasActionPoint(actionPointTitle);
      expect(hasActionPoint).toBe(true);

      // Verify the exact title is displayed
      const titles = await actionPoints.getActionPointTitles();
      expect(titles).toContain(actionPointTitle);

      // Find the specific action point item
      const actionPointItems = await actionPoints.getAllActionPoints();
      let foundActionPoint = false;

      for (const item of actionPointItems) {
        const titleElement = item.locator('[data-testid="action-point-title"]');
        const text = await titleElement.textContent();
        if (text === actionPointTitle) {
          foundActionPoint = true;
          // Verify it's visible
          await expect(titleElement).toBeVisible();
          break;
        }
      }

      expect(foundActionPoint).toBe(true);

      // Step 3-4 completed: Action Point created and saved successfully
    });

    // ============================================
    // STEP 5: Wyloguj się z aplikacji
    // ============================================
    await test.step("5. Wyloguj się z aplikacji", async () => {
      // Verify logout button is visible
      await expect(dashboardPage.logoutButton).toBeVisible();

      // Click logout button
      await dashboardPage.logout();

      // Wait for navigation to login page
      await page.waitForURL("/login", { timeout: 10000 });

      // Verify we're back on login page
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();

      // Wait a bit to ensure session is fully cleared
      await page.waitForTimeout(500);

      // Verify we can't access dashboard without login
      // This should redirect us back to login
      await page.goto("/threads");
      await page.waitForURL((url) => url.pathname === "/login", { timeout: 10000 });

      // Verify we're still on login page
      await expect(loginPage.emailInput).toBeVisible();

      // Step 5 completed: Successfully logged out
    });

    // Test completed successfully - all steps passed
  });

  // test("should verify thread and action point persist after re-login", async ({ page }) => {
  //   // Arrange
  //   const loginPage = new LoginPage(page);
  //   const dashboardPage = new DashboardPage(page);

  //   // Generate unique names
  //   const timestamp = new Date().toLocaleString("pl-PL", {
  //     year: "numeric",
  //     month: "2-digit",
  //     day: "2-digit",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //   });
  //   const threadName = ` Test ${timestamp}`;
  //   const apTitle = `Persist AP ${timestamp}`;

  //   // Act: Login, create thread and AP
  //   await test.step("Create thread and AP", async () => {
  //     await loginPage.goto();
  //     await loginPage.login(TEST_EMAIL, TEST_PASSWORD);
  //     await page.waitForURL("/threads");

  //     const threadTabs = dashboardPage.getThreadTabs();
  //     await threadTabs.createThread(threadName);

  //     const actionPoints = dashboardPage.getActionPoints();
  //     await actionPoints.waitForActionPointsToLoad();
  //     await actionPoints.createActionPoint(apTitle);
  //     await page.waitForTimeout(1000);
  //   });

  //   // Act: Logout
  //   await test.step("Logout", async () => {
  //     await dashboardPage.logout();
  //     await page.waitForURL("/login");
  //   });

  //   // Act: Login again
  //   await test.step("Re-login and verify persistence", async () => {
  //     await loginPage.login(TEST_EMAIL, TEST_PASSWORD);
  //     await page.waitForURL("/threads");

  //     // Verify thread still exists
  //     const threadTabs = dashboardPage.getThreadTabs();
  //     const hasThread = await threadTabs.hasThread(threadName);
  //     expect(hasThread).toBe(true);

  //     // Select the thread
  //     await threadTabs.selectThread(threadName);
  //     await page.waitForTimeout(500);

  //     // Verify action point still exists
  //     const actionPoints = dashboardPage.getActionPoints();
  //     await actionPoints.waitForActionPointsToLoad();
  //     const hasAP = await actionPoints.hasActionPoint(apTitle);
  //     expect(hasAP).toBe(true);

  //     // Verification passed: Data persists after re-login
  //   });
  // });

  // test("should handle invalid login credentials", async ({ page }) => {
  //   // Arrange
  //   const loginPage = new LoginPage(page);

  //   // Act
  //   await test.step("Attempt login with invalid credentials", async () => {
  //     await loginPage.goto();
  //     await loginPage.login("invalid@example.com", "wrongpassword");

  //     // Assert: Should remain on login page
  //     await page.waitForTimeout(2000);
  //     await expect(page).toHaveURL(/\/login/);

  //     // Should show error toast
  //     const errorToast = page.getByText(/błąd/i);
  //     await expect(errorToast).toBeVisible({ timeout: 5000 });

  //     // Verification passed: Invalid credentials handled correctly
  //   });
  // });

  // test("should validate thread name length (max 20 chars)", async ({ page }) => {
  //   // Arrange
  //   const loginPage = new LoginPage(page);
  //   const dashboardPage = new DashboardPage(page);

  //   // Act
  //   await test.step("Login and attempt to create thread with long name", async () => {
  //     await loginPage.goto();
  //     await loginPage.login(TEST_EMAIL, TEST_PASSWORD);
  //     await page.waitForURL("/threads");

  //     const threadTabs = dashboardPage.getThreadTabs();
  //     await threadTabs.openCreateThreadModal();

  //     // Try to enter name longer than 20 characters
  //     const longName = "A".repeat(25);
  //     await threadTabs.createThreadModal.fillName(longName);

  //     // Assert: Submit button should be disabled
  //     await expect(threadTabs.createThreadModal.submitButton).toBeDisabled();

  //     // Verification passed: Thread name validation works correctly
  //   });
  // });

  // test("should validate action point title is required", async ({ page }) => {
  //   // Arrange
  //   const loginPage = new LoginPage(page);
  //   const dashboardPage = new DashboardPage(page);

  //   // Act
  //   await test.step("Login and attempt to create AP without title", async () => {
  //     await loginPage.goto();
  //     await loginPage.login(TEST_EMAIL, TEST_PASSWORD);
  //     await page.waitForURL("/threads");

  //     const actionPoints = dashboardPage.getActionPoints();
  //     await actionPoints.openAddActionPointModal();

  //     // Don't fill title - leave it empty
  //     // Assert: Submit button should be disabled
  //     await expect(actionPoints.addActionPointModal.submitButton).toBeDisabled();

  //     // Verification passed: Action point title validation works correctly
  //   });
  // });
});
