import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for Login Page
 * Handles all interactions with the login form
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly registerLink: Locator;
  readonly resetPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId("login-email-input");
    this.passwordInput = page.getByTestId("login-password-input");
    this.submitButton = page.getByTestId("login-submit-button");
    this.registerLink = page.getByRole("link", { name: /zarejestruj się/i });
    this.resetPasswordLink = page.getByRole("link", { name: /zapomniałeś hasła/i });
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto("/login");
  }

  /**
   * Perform login with email and password
   * @param email - User email
   * @param password - User password
   */
  async login(email: string, password: string) {
    // Wait for inputs to be enabled and ready for interaction
    await this.emailInput.waitFor({ state: "visible", timeout: 10000 });
    await this.passwordInput.waitFor({ state: "visible", timeout: 10000 });

    // Ensure inputs are not disabled (React hydration complete)
    await this.page.waitForFunction(
      () => {
        const emailInput = document.querySelector('[data-testid="login-email-input"]') as HTMLInputElement;
        const passwordInput = document.querySelector('[data-testid="login-password-input"]') as HTMLInputElement;
        return emailInput && passwordInput && !emailInput.disabled && !passwordInput.disabled;
      },
      { timeout: 10000 }
    );

    // Fill inputs with a small delay to ensure React state is ready
    await this.emailInput.fill(email);
    await this.page.waitForTimeout(100);
    await this.passwordInput.fill(password);
    await this.page.waitForTimeout(100);

    // Wait for submit button to be enabled
    await this.submitButton.waitFor({ state: "visible", timeout: 5000 });
    await this.page.waitForFunction(
      () => {
        const button = document.querySelector('[data-testid="login-submit-button"]') as HTMLButtonElement;
        return button && !button.disabled;
      },
      { timeout: 5000 }
    );

    await this.submitButton.click();
  }

  /**
   * Check if login form is visible
   */
  async isVisible() {
    return await this.emailInput.isVisible();
  }

  /**
   * Get error message for a specific field
   * @param fieldName - Name of the field (email or password)
   */
  async getFieldError(fieldName: "email" | "password") {
    const input = fieldName === "email" ? this.emailInput : this.passwordInput;
    const errorElement = this.page.locator(`[aria-describedby]:has(#${await input.getAttribute("id")})`);
    return await errorElement.textContent();
  }

  /**
   * Navigate to registration page
   */
  async goToRegister() {
    await this.registerLink.click();
  }

  /**
   * Navigate to password reset page
   */
  async goToResetPassword() {
    await this.resetPasswordLink.click();
  }
}
