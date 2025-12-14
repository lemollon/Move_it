import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  transaction_id: {
    type: DataTypes.UUID,
    references: {
      model: 'transactions',
      key: 'id',
    },
  },
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  recipient_id: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  read_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'messages',
  timestamps: true,
  underscored: true,
});

export default Message;
