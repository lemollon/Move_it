import { Op } from 'sequelize';

// Note: Import DisclosureAnalytics dynamically to avoid circular deps
let DisclosureAnalytics = null;

const getModel = async () => {
  if (!DisclosureAnalytics) {
    const module = await import('../models/DisclosureAnalytics.js');
    DisclosureAnalytics = module.default;
  }
  return DisclosureAnalytics;
};

/**
 * Analytics Service for tracking disclosure events
 */
export const analyticsService = {
  /**
   * Track a disclosure event
   */
  async trackEvent({
    disclosureId,
    eventType,
    userId = null,
    metadata = {},
    ipAddress = null,
    userAgent = null,
  }) {
    try {
      const Model = await getModel();
      return await Model.create({
        disclosure_id: disclosureId,
        event_type: eventType,
        user_id: userId,
        metadata,
        ip_address: ipAddress,
        user_agent: userAgent,
        event_timestamp: new Date(),
      });
    } catch (error) {
      // Log but don't throw - analytics shouldn't break main flow
      console.error('Analytics tracking error:', error.message);
      return null;
    }
  },

  /**
   * Get analytics summary for a disclosure
   */
  async getDisclosureSummary(disclosureId) {
    try {
      const Model = await getModel();

      const [
        totalEvents,
        viewCount,
        shareCount,
        lastViewed,
        eventsByType,
      ] = await Promise.all([
        Model.count({ where: { disclosure_id: disclosureId } }),
        Model.count({ where: { disclosure_id: disclosureId, event_type: 'viewed' } }),
        Model.count({ where: { disclosure_id: disclosureId, event_type: 'shared' } }),
        Model.findOne({
          where: { disclosure_id: disclosureId, event_type: 'viewed' },
          order: [['event_timestamp', 'DESC']],
          attributes: ['event_timestamp'],
        }),
        Model.findAll({
          where: { disclosure_id: disclosureId },
          attributes: [
            'event_type',
            [Model.sequelize.fn('COUNT', Model.sequelize.col('id')), 'count'],
          ],
          group: ['event_type'],
        }),
      ]);

      return {
        totalEvents,
        viewCount,
        shareCount,
        lastViewed: lastViewed?.event_timestamp || null,
        eventsByType: eventsByType.reduce((acc, item) => {
          acc[item.event_type] = parseInt(item.getDataValue('count'));
          return acc;
        }, {}),
      };
    } catch (error) {
      console.error('Analytics summary error:', error.message);
      return null;
    }
  },

  /**
   * Get analytics for a seller's disclosures
   */
  async getSellerAnalytics(sellerId, options = {}) {
    try {
      const Model = await getModel();
      const { startDate, endDate } = options;

      const whereClause = {
        user_id: sellerId,
      };

      if (startDate || endDate) {
        whereClause.event_timestamp = {};
        if (startDate) whereClause.event_timestamp[Op.gte] = startDate;
        if (endDate) whereClause.event_timestamp[Op.lte] = endDate;
      }

      const [totalEvents, eventsByType, recentActivity] = await Promise.all([
        Model.count({ where: whereClause }),
        Model.findAll({
          where: whereClause,
          attributes: [
            'event_type',
            [Model.sequelize.fn('COUNT', Model.sequelize.col('id')), 'count'],
          ],
          group: ['event_type'],
        }),
        Model.findAll({
          where: whereClause,
          order: [['event_timestamp', 'DESC']],
          limit: 20,
          attributes: ['id', 'disclosure_id', 'event_type', 'metadata', 'event_timestamp'],
        }),
      ]);

      return {
        totalEvents,
        eventsByType: eventsByType.reduce((acc, item) => {
          acc[item.event_type] = parseInt(item.getDataValue('count'));
          return acc;
        }, {}),
        recentActivity,
      };
    } catch (error) {
      console.error('Seller analytics error:', error.message);
      return null;
    }
  },

  /**
   * Get timeline of events for a disclosure
   */
  async getDisclosureTimeline(disclosureId, options = {}) {
    try {
      const Model = await getModel();
      const { limit = 50, offset = 0 } = options;

      const events = await Model.findAll({
        where: { disclosure_id: disclosureId },
        order: [['event_timestamp', 'DESC']],
        limit,
        offset,
        attributes: ['id', 'event_type', 'user_id', 'metadata', 'event_timestamp'],
      });

      return events;
    } catch (error) {
      console.error('Timeline error:', error.message);
      return [];
    }
  },

  /**
   * Get share tracking analytics
   */
  async getShareAnalytics(disclosureId) {
    try {
      const Model = await getModel();

      const shares = await Model.findAll({
        where: {
          disclosure_id: disclosureId,
          event_type: {
            [Op.in]: ['shared', 'share_viewed', 'share_acknowledged', 'share_signed'],
          },
        },
        order: [['event_timestamp', 'ASC']],
        attributes: ['event_type', 'metadata', 'event_timestamp'],
      });

      // Group by share_id
      const shareMap = {};
      shares.forEach((event) => {
        const shareId = event.metadata?.share_id;
        if (shareId) {
          if (!shareMap[shareId]) {
            shareMap[shareId] = {
              shareId,
              recipientEmail: event.metadata?.recipient_email,
              events: [],
            };
          }
          shareMap[shareId].events.push({
            type: event.event_type,
            timestamp: event.event_timestamp,
          });
        }
      });

      return Object.values(shareMap);
    } catch (error) {
      console.error('Share analytics error:', error.message);
      return [];
    }
  },
};

export default analyticsService;
