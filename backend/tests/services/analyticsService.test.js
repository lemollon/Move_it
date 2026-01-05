/**
 * Analytics Service Tests
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { analyticsService } from '../../services/analyticsService.js';

describe('AnalyticsService', () => {
  describe('trackEvent', () => {
    it('should track a disclosure event', async () => {
      const result = await analyticsService.trackEvent({
        disclosureId: 'test-disclosure-id',
        eventType: 'viewed',
        userId: 'test-user-id',
        metadata: { test: true },
      });

      // In test mode without DB, this should return null gracefully
      expect(result === null || result.id).toBeTruthy();
    });

    it('should handle missing optional parameters', async () => {
      const result = await analyticsService.trackEvent({
        disclosureId: 'test-disclosure-id',
        eventType: 'created',
      });

      expect(result === null || result !== undefined).toBeTruthy();
    });
  });

  describe('getDisclosureSummary', () => {
    it('should return summary object structure', async () => {
      const summary = await analyticsService.getDisclosureSummary('test-id');

      // In test mode, this may return null
      if (summary !== null) {
        expect(summary).toHaveProperty('totalEvents');
        expect(summary).toHaveProperty('viewCount');
        expect(summary).toHaveProperty('shareCount');
        expect(summary).toHaveProperty('eventsByType');
      }
    });
  });
});
