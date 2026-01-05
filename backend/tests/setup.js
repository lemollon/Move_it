/**
 * Test setup file
 */
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for async tests
jest.setTimeout(30000);

// Global beforeAll
beforeAll(async () => {
  // Any global setup
});

// Global afterAll
afterAll(async () => {
  // Any global cleanup
});
