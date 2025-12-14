import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  property_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id',
    },
  },
  buyer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  seller_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  accepted_offer_id: {
    type: DataTypes.UUID,
    references: {
      model: 'offers',
      key: 'id',
    },
  },
  purchase_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  earnest_money_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  closing_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      'offer_accepted',
      'under_contract',
      'inspection_period',
      'appraisal_ordered',
      'title_search',
      'final_walkthrough',
      'closing',
      'closed',
      'cancelled'
    ),
    defaultValue: 'offer_accepted',
  },
  platform_fee: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  platform_fee_paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  option_period_end: {
    type: DataTypes.DATEONLY,
  },
  title_due_date: {
    type: DataTypes.DATEONLY,
  },
  appraisal_due_date: {
    type: DataTypes.DATEONLY,
  },
  inspection_due_date: {
    type: DataTypes.DATEONLY,
  },
  closed_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'transactions',
  timestamps: true,
  underscored: true,
});

export default Transaction;
