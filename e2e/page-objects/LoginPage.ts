import { Page, Locator } from "@playwright/test";

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
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
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
