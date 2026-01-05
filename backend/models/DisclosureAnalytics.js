import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const DisclosureAnalytics = sequelize.define('DisclosureAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  disclosure_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'seller_disclosures',
      key: 'id',
    },
  },
  // Event tracking
  event_type: {
    type: DataTypes.ENUM(
      'created',
      'viewed',
      'updated',
      'section_saved',
      'completed',
      'signed_seller',
      'signed_buyer',
      'pdf_generated',
      'shared',
      'share_viewed',
      'share_acknowledged',
      'share_signed',
      'attachment_added',
      'attachment_removed'
    ),
    allowNull: false,
  },
  // Who triggered the event
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  // Additional context
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure varies by event_type:
    // section_saved: { section_number, completion_before, completion_after }
    // shared: { recipient_email, share_id }
    // share_viewed: { share_id, view_count }
  },
  // Session/request info
  ip_address: {
    type: DataTypes.STRING(45),
  },
  user_agent: {
    type: DataTypes.STRING(500),
  },
  // Timestamp (separate from createdAt for explicit event timing)
  event_timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'disclosure_analytics',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['disclosure_id'] },
    { fields: ['event_type'] },
    { fields: ['user_id'] },
    { fields: ['event_timestamp'] },
  ],
});

export default DisclosureAnalytics;
