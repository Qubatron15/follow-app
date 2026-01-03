// import { test, expect } from "@playwright/test";
// import { LoginPage } from "./page-objects/LoginPage";
// import { DashboardPage } from "./page-objects/DashboardPage";

// /**
//  * E2E Test: Complete User Journey
//  * Scenario:
//  * 1. Login to application
//  * 2. Create new thread with current date/time
//  * 3. Add action point with current date/time
//  * 4. Verify action point was created
//  * 5. Logout from application
//  */
// test.describe("User Journey: Login -> Create Thread -> Add Action Point -> Logout", () => {
//   let loginPage: LoginPage;
//   let dashboardPage: DashboardPage;

//   test.beforeEach(async ({ page }) => {
//     // Arrange: Initialize page objects
//     loginPage = new LoginPage(page);
//     dashboardPage = new DashboardPage(page);
//   });

//   test("should complete full user journey successfully", async ({ page }) => {
//     // Arrange: Prepare test data with current date/time
//     const currentDateTime = new Date().toLocaleString("pl-PL", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     });
//     const threadName = `Thread ${currentDateTime}`;
//     const actionPointTitle = `AP ${currentDateTime}`;
//     const testEmail = "test@example.com";
//     const testPassword = "TestPassword123!";

//     // Act & Assert: Step 1 - Login to application
//     await test.step("Login to application", async () => {
//       await loginPage.goto();
//       await expect(loginPage.emailInput).toBeVisible();
//       await loginPage.login(testEmail, testPassword);

//       // Wait for navigation to dashboard
//       await page.waitForURL("/threads");
//       await expect(dashboardPage.createThreadButton).toBeVisible();
//     });

//     // Act & Assert: Step 2 - Create new thread
//     await test.step("Create new thread with current date/time", async () => {
//       const threadTabs = dashboardPage.getThreadTabs();

//       await threadTabs.createThread(threadName);

//       // Verify thread was created and is visible
//       await expect(page.getByRole("tab", { name: threadName })).toBeVisible();

//       // Verify thread is selected (active)
//       const hasThread = await threadTabs.hasThread(threadName);
//       expect(hasThread).toBe(true);
//     });

//     // Act & Assert: Step 3 - Add action point
//     await test.step("Add action point with current date/time", async () => {
//       const actionPoints = dashboardPage.getActionPoints();

//       // Get initial count
//       await actionPoints.waitForActionPointsToLoad();
//       const initialCount = await actionPoints.getActionPointCount();

//       // Create new action point
//       await actionPoints.createActionPoint(actionPointTitle, false);

//       // Wait for action point to be added
//       await page.waitForTimeout(500); // Small delay for UI update
//       await actionPoints.waitForActionPointsToLoad();

//       // Verify count increased
//       const newCount = await actionPoints.getActionPointCount();
//       expect(newCount).toBe(initialCount + 1);
//     });

//     // Act & Assert: Step 4 - Verify action point was created
//     await test.step("Verify action point was created with correct title", async () => {
//       const actionPoints = dashboardPage.getActionPoints();

//       // Check if action point exists
//       const hasActionPoint = await actionPoints.hasActionPoint(actionPointTitle);
//       expect(hasActionPoint).toBe(true);

//       // Verify title is displayed correctly
//       const titles = await actionPoints.getActionPointTitles();
//       expect(titles).toContain(actionPointTitle);
//     });

//     // Act & Assert: Step 5 - Logout from application
//     await test.step("Logout from application", async () => {
//       await dashboardPage.logout();

//       // Wait for navigation to login page
//       await page.waitForURL("/login");
//       await expect(loginPage.emailInput).toBeVisible();
//     });
//   });
// });
