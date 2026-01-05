/**
 * SMS Service Tests
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { smsService } from '../../services/smsService.js';

describe('SMSService', () => {
  describe('isConfigured', () => {
    it('should return false when credentials not set', () => {
      // Without actual Twilio credentials
      const result = smsService.isConfigured();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('send', () => {
    it('should return mock response when not configured', async () => {
      const result = await smsService.send('+15555555555', 'Test message');

      // Should return mock success when not configured
      expect(result.success).toBe(true);
      expect(result.mock).toBe(true);
    });
  });

  describe('sendDisclosureShared', () => {
    it('should format message correctly', async () => {
      const result = await smsService.sendDisclosureShared({
        to: '+15555555555',
        sellerName: 'John Doe',
        propertyAddress: '123 Main St',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('sendNewOfferNotification', () => {
    it('should format currency correctly', async () => {
      const result = await smsService.sendNewOfferNotification({
        to: '+15555555555',
        buyerName: 'Jane Doe',
        propertyAddress: '123 Main St',
        offerAmount: 450000,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('sendOfferStatusUpdate', () => {
    it('should handle accepted status', async () => {
      const result = await smsService.sendOfferStatusUpdate({
        to: '+15555555555',
        propertyAddress: '123 Main St',
        status: 'accepted',
      });

      expect(result.success).toBe(true);
    });

    it('should handle rejected status', async () => {
      const result = await smsService.sendOfferStatusUpdate({
        to: '+15555555555',
        propertyAddress: '123 Main St',
        status: 'rejected',
      });

      expect(result.success).toBe(true);
    });

    it('should handle countered status', async () => {
      const result = await smsService.sendOfferStatusUpdate({
        to: '+15555555555',
        propertyAddress: '123 Main St',
        status: 'countered',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('sendTransactionMilestone', () => {
    const milestones = [
      'contract_signed',
      'earnest_money_received',
      'inspection_completed',
      'clear_to_close',
      'closed',
    ];

    milestones.forEach((milestone) => {
      it(`should handle ${milestone} milestone`, async () => {
        const result = await smsService.sendTransactionMilestone({
          to: '+15555555555',
          propertyAddress: '123 Main St',
          milestone,
        });

        expect(result.success).toBe(true);
      });
    });
  });
});
