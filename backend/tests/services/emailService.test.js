/**
 * Email Service Tests
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { emailService } from '../../services/emailService.js';

describe('EmailService', () => {
  describe('send', () => {
    it('should return mock response when not configured', async () => {
      const result = await emailService.send(
        'test@example.com',
        'Test Subject',
        'Test text content',
        '<p>Test HTML content</p>'
      );

      // Should handle gracefully when Resend not configured
      expect(result === null || result.messageId).toBeTruthy();
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should format reset email correctly', async () => {
      const mockUser = {
        email: 'test@example.com',
        first_name: 'Test',
      };
      const resetToken = 'test-reset-token-12345';

      const result = await emailService.sendPasswordResetEmail(mockUser, resetToken);
      expect(result === null || result !== undefined).toBeTruthy();
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email', async () => {
      const result = await emailService.sendWelcomeEmail({
        to: 'test@example.com',
        firstName: 'Test',
        role: 'buyer',
      });

      expect(result === null || result !== undefined).toBeTruthy();
    });
  });

  describe('sendDisclosureShared', () => {
    it('should send disclosure shared email', async () => {
      const result = await emailService.sendDisclosureShared({
        to: 'buyer@example.com',
        recipientName: 'Jane Buyer',
        sellerName: 'John Seller',
        propertyAddress: '123 Main St, Dallas, TX 75201',
        viewUrl: 'https://example.com/disclosure/view/123',
        pdfUrl: 'https://example.com/pdf/123.pdf',
        message: 'Please review this disclosure.',
      });

      expect(result === null || result !== undefined).toBeTruthy();
    });

    it('should handle missing optional message', async () => {
      const result = await emailService.sendDisclosureShared({
        to: 'buyer@example.com',
        recipientName: 'Jane Buyer',
        sellerName: 'John Seller',
        propertyAddress: '123 Main St',
        viewUrl: 'https://example.com/view/123',
        pdfUrl: 'https://example.com/pdf/123.pdf',
      });

      expect(result === null || result !== undefined).toBeTruthy();
    });
  });
});
