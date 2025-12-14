import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  notification_type: {
    type: DataTypes.ENUM(
      'new_offer',
      'offer_accepted',
      'offer_rejected',
      'message_received',
      'document_uploaded',
      'vendor_request',
      'milestone_approaching',
      'payment_required'
    ),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  action_url: {
    type: DataTypes.STRING(500),
  },
  transaction_id: {
    type: DataTypes.UUID,
    references: {
      model: 'transactions',
      key: 'id',
    },
  },
  property_id: {
    type: DataTypes.UUID,
    references: {
      model: 'properties',
      key: 'id',
    },
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  read_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
});

export default Notification;
