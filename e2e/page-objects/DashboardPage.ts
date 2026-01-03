import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for Dashboard Page
 * Handles interactions with threads, transcripts, and action points
 */
export class DashboardPage {
  readonly page: Page;
  readonly createThreadButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createThreadButton = page.getByTestId("create-thread-button");
    this.logoutButton = page.getByTestId("logout-button");
  }

  /**
   * Navigate to dashboard page
   */
  async goto() {
    await this.page.goto("/threads");
  }

  /**
   * Check if dashboard is visible
   */
  async isVisible() {
    return await this.createThreadButton.isVisible();
  }

  /**
   * Logout from the application
   */
  async logout() {
    await this.logoutButton.click();
  }

  /**
   * Get thread tabs component
   */
  getThreadTabs() {
    return new ThreadTabsComponent(this.page);
  }

  /**
   * Get action points component
   */
  getActionPoints() {
    return new ActionPointsComponent(this.page);
  }
}

/**
 * Component for Thread Tabs interactions
 */
export class ThreadTabsComponent {
  readonly page: Page;
  readonly createThreadButton: Locator;
  readonly createThreadModal: CreateThreadModal;

  constructor(page: Page) {
    this.page = page;
    this.createThreadButton = page.getByTestId("create-thread-button");
    this.createThreadModal = new CreateThreadModal(page);
  }

  /**
   * Open create thread modal
   */
  async openCreateThreadModal() {
    await this.createThreadButton.click();
  }

  /**
   * Create a new thread with given name
   * @param name - Thread name
   */
  async createThread(name: string) {
    await this.openCreateThreadModal();
    await this.createThreadModal.fillName(name);
    await this.createThreadModal.submit();
  }

  /**
   * Select a thread by name
   * @param name - Thread name to select
   */
  async selectThread(name: string) {
    await this.page.getByRole("tab", { name }).click();
  }

  /**
   * Get all thread tabs
   */
  async getAllThreads() {
    return await this.page.getByRole("tab").allTextContents();
  }

  /**
   * Check if thread exists by name
   * @param name - Thread name
   */
  async hasThread(name: string) {
    return await this.page.getByRole("tab", { name }).isVisible();
  }
}

/**
 * Modal for creating a new thread
 */
export class CreateThreadModal {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId("create-thread-name-input");
    this.submitButton = page.getByTestId("create-thread-submit-button");
    this.cancelButton = page.getByRole("button", { name: /anuluj/i });
  }

  /**
   * Fill thread name
   * @param name - Thread name
   */
  async fillName(name: string) {
    // Wait for input to be ready
    await this.nameInput.waitFor({ state: "visible", timeout: 5000 });
    await this.page.waitForFunction(
      () => {
        const input = document.querySelector('[data-testid="create-thread-name-input"]') as HTMLInputElement;
        return input && !input.disabled;
      },
      { timeout: 5000 }
    );
    await this.nameInput.fill(name);
  }

  /**
   * Submit the form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Cancel thread creation
   */
  async cancel() {
    await this.cancelButton.click();
  }

  /**
   * Check if modal is visible
   */
  async isVisible() {
    return await this.nameInput.isVisible();
  }
}

/**
 * Component for Action Points interactions
 */
export class ActionPointsComponent {
  readonly page: Page;
  readonly addActionPointButton: Locator;
  readonly addActionPointModal: AddActionPointModal;

  constructor(page: Page) {
    this.page = page;
    this.addActionPointButton = page.getByTestId("open-add-action-point-modal-button");
    this.addActionPointModal = new AddActionPointModal(page);
  }

  /**
   * Open add action point modal
   */
  async openAddActionPointModal() {
    await this.addActionPointButton.click();
  }

  /**
   * Create a new action point
   * @param title - Action point title
   * @param isCompleted - Whether the action point is completed (default: false)
   */
  async createActionPoint(title: string, isCompleted = false) {
    await this.openAddActionPointModal();
    await this.addActionPointModal.fillTitle(title);
    if (isCompleted) {
      await this.addActionPointModal.toggleCompleted();
    }
    await this.addActionPointModal.submit();
  }

  /**
   * Get all action point items
   */
  async getAllActionPoints() {
    return await this.page.getByTestId("action-point-item").all();
  }

  /**
   * Get action point titles
   */
  async getActionPointTitles() {
    return await this.page.getByTestId("action-point-title").allTextContents();
  }

  /**
   * Check if action point exists by title
   * @param title - Action point title
   */
  async hasActionPoint(title: string) {
    const titles = await this.getActionPointTitles();
    return titles.includes(title);
  }

  /**
   * Get count of action points
   */
  async getActionPointCount() {
    const items = await this.getAllActionPoints();
    return items.length;
  }

  /**
   * Wait for action points to load
   */
  async waitForActionPointsToLoad() {
    // Wait for either action points to appear or empty state
    await this.page.waitForSelector('[data-testid="action-point-item"], :text("Brak Action Points")', {
      timeout: 5000,
    });
  }
}

/**
 * Modal for adding a new action point
 */
export class AddActionPointModal {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly completedCheckbox: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByTestId("add-action-point-title-input");
    this.completedCheckbox = page.getByTestId("add-action-point-completed-checkbox");
    this.submitButton = page.getByTestId("add-action-point-submit-button");
    this.cancelButton = page.getByRole("button", { name: /anuluj/i });
  }

  /**
   * Fill action point title
   * @param title - Action point title
   */
  async fillTitle(title: string) {
    // Wait for input to be ready
    await this.titleInput.waitFor({ state: "visible", timeout: 5000 });
    await this.page.waitForFunction(
      () => {
        const input = document.querySelector('[data-testid="add-action-point-title-input"]') as HTMLTextAreaElement;
        return input && !input.disabled;
      },
      { timeout: 5000 }
    );
    await this.titleInput.fill(title);
  }

  /**
   * Toggle completed checkbox
   */
  async toggleCompleted() {
    await this.completedCheckbox.click();
  }

  /**
   * Submit the form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Cancel action point creation
   */
  async cancel() {
    await this.cancelButton.click();
  }

  /**
   * Check if modal is visible
   */
  async isVisible() {
    return await this.titleInput.isVisible();
  }
}
