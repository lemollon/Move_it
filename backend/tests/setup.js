/**
 * Jest test setup file
 * Runs before each test file
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRE = '1h';
process.env.PORT = '5001';

// Mock external services
jest.mock('../services/emailService.js', () => ({
  emailService: {
    send: jest.fn().mockResolvedValue({ id: 'test-email-id', success: true }),
    sendWelcome: jest.fn().mockResolvedValue({ id: 'test-email-id', success: true }),
    sendPasswordResetEmail: jest.fn().mockResolvedValue({ id: 'test-email-id', success: true }),
    sendPasswordResetSuccess: jest.fn().mockResolvedValue({ id: 'test-email-id', success: true }),
    sendOfferReceived: jest.fn().mockResolvedValue({ id: 'test-email-id', success: true }),
    sendOfferAccepted: jest.fn().mockResolvedValue({ id: 'test-email-id', success: true }),
  },
  default: {
    send: jest.fn().mockResolvedValue({ id: 'test-email-id', success: true }),
    sendWelcome: jest.fn().mockResolvedValue({ id: 'test-email-id', success: true }),
    sendPasswordResetEmail: jest.fn().mockResolvedValue({ id: 'test-email-id', success: true }),
    sendPasswordResetSuccess: jest.fn().mockResolvedValue({ id: 'test-email-id', success: true }),
    sendOfferReceived: jest.fn().mockResolvedValue({ id: 'test-email-id', success: true }),
    sendOfferAccepted: jest.fn().mockResolvedValue({ id: 'test-email-id', success: true }),
  },
}));

// Increase timeout for database operations
jest.setTimeout(30000);

// Global teardown
afterAll(async () => {
  // Close any open handles
  await new Promise(resolve => setTimeout(resolve, 500));
});
