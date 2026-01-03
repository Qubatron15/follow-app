import { Page } from "@playwright/test";
import { LoginPage } from "../page-objects/LoginPage";
import { DashboardPage } from "../page-objects/DashboardPage";

/**
 * Helper functions for E2E tests
 */

/**
 * Generate a unique timestamp-based name
 * @param prefix - Prefix for the name
 * @returns Unique name with timestamp
 */
export function generateUniqueName(prefix: string): string {
  const timestamp = new Date().toLocaleString("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${prefix} ${timestamp}`;
}

/**
 * Login helper - performs login and waits for dashboard
 * @param page - Playwright page object
 * @param email - User email
 * @param password - User password
 */
export async function loginAsUser(page: Page, email: string, password: string): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);
  await page.waitForURL("/threads");
}

/**
 * Setup authenticated session - creates a reusable authentication state
 * @param page - Playwright page object
 * @param email - User email
 * @param password - User password
 */
export async function setupAuthenticatedSession(page: Page, email: string, password: string): Promise<void> {
  await loginAsUser(page, email, password);
  // Save authentication state
  await page.context().storageState({ path: "e2e/.auth/user.json" });
}

/**
 * Create a thread and return its name
 * @param page - Playwright page object
 * @param threadName - Optional thread name (generates unique if not provided)
 * @returns Thread name
 */
export async function createThread(page: Page, threadName?: string): Promise<string> {
  const dashboardPage = new DashboardPage(page);
  const threadTabs = dashboardPage.getThreadTabs();
  
  const name = threadName || generateUniqueName("Thread");
  await threadTabs.createThread(name);
  
  return name;
}

/**
 * Create an action point and return its title
 * @param page - Playwright page object
 * @param title - Optional action point title (generates unique if not provided)
 * @param isCompleted - Whether the action point is completed
 * @returns Action point title
 */
export async function createActionPoint(
  page: Page,
  title?: string,
  isCompleted = false
): Promise<string> {
  const dashboardPage = new DashboardPage(page);
  const actionPoints = dashboardPage.getActionPoints();
  
  const apTitle = title || generateUniqueName("AP");
  await actionPoints.createActionPoint(apTitle, isCompleted);
  
  return apTitle;
}

/**
 * Wait for toast notification to appear
 * @param page - Playwright page object
 * @param message - Expected toast message (regex or string)
 * @param timeout - Timeout in milliseconds
 */
export async function waitForToast(page: Page, message: string | RegExp, timeout = 5000): Promise<void> {
  const toastLocator = typeof message === "string" 
    ? page.getByText(message) 
    : page.getByText(message);
  
  await toastLocator.waitFor({ state: "visible", timeout });
}

/**
 * Clear all threads (cleanup helper)
 * @param page - Playwright page object
 */
export async function clearAllThreads(page: Page): Promise<void> {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.goto();
  
  // This would require implementing delete functionality in POM
  // For now, this is a placeholder
  console.warn("clearAllThreads not fully implemented - requires delete thread functionality");
}

/**
 * Take a screenshot with a descriptive name
 * @param page - Playwright page object
 * @param name - Screenshot name
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  await page.screenshot({ path: `e2e/screenshots/${name}-${timestamp}.png`, fullPage: true });
}
