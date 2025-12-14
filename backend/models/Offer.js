import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Offer = sequelize.define('Offer', {
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
  offer_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  earnest_money: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  financing_type: {
    type: DataTypes.ENUM('cash', 'conventional', 'fha', 'va', 'usda', 'other'),
    allowNull: false,
  },
  down_payment: {
    type: DataTypes.DECIMAL(12, 2),
  },
  proposed_closing_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  option_period_days: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  contingency_inspection: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  contingency_appraisal: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  contingency_financing: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  contingency_other: {
    type: DataTypes.TEXT,
  },
  personal_message: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'countered', 'withdrawn'),
    defaultValue: 'pending',
  },
  counter_price: {
    type: DataTypes.DECIMAL(12, 2),
  },
  counter_terms: {
    type: DataTypes.TEXT,
  },
  responded_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'offers',
  timestamps: true,
  underscored: true,
});

export default Offer;
