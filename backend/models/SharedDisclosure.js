import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const SharedDisclosure = sequelize.define('SharedDisclosure', {
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
  // Recipient info (may or may not be a registered user)
  recipient_email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  recipient_name: {
    type: DataTypes.STRING(255),
  },
  recipient_user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  // Sharing details
  shared_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  message: {
    type: DataTypes.TEXT,
  },
  // Access tracking
  access_token: {
    type: DataTypes.STRING(255),
    unique: true,
  },
  first_viewed_at: {
    type: DataTypes.DATE,
  },
  last_viewed_at: {
    type: DataTypes.DATE,
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Status
  status: {
    type: DataTypes.ENUM('pending', 'viewed', 'acknowledged', 'signed'),
    defaultValue: 'pending',
  },
  acknowledged_at: {
    type: DataTypes.DATE,
  },
  signed_at: {
    type: DataTypes.DATE,
  },
  // Expiration
  expires_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'shared_disclosures',
  timestamps: true,
  underscored: true,
});

export default SharedDisclosure;
