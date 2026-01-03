/**
 * Test configuration
 * Contains test credentials and environment settings
 */

export const TEST_CONFIG = {
  // Test user credentials
  credentials: {
    email: process.env.TEST_EMAIL || "qubatron15@gmail.com",
    password: process.env.TEST_PASSWORD || "sajgonki",
  },

  // Base URL
  baseUrl: process.env.BASE_URL || "http://localhost:3000",

  // Timeouts
  timeouts: {
    navigation: 10000,
    action: 5000,
    assertion: 5000,
  },

  // Test data
  testData: {
    threadNamePrefix: "Thread",
    actionPointPrefix: "AP",
  },
};

/**
 * Generate timestamp for unique names
 */
export function generateTimestamp(): string {
  return new Date().getTime().toString();
}

/**
 * Generate unique thread name
 */
export function generateThreadName(): string {
  return `${TEST_CONFIG.testData.threadNamePrefix} ${generateTimestamp()}`;
}

/**
 * Generate unique action point title
 */
export function generateActionPointTitle(): string {
  return `${TEST_CONFIG.testData.actionPointPrefix} ${generateTimestamp()}`;
}
