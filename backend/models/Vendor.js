import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Vendor = sequelize.define('Vendor', {
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
  business_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  vendor_type: {
    type: DataTypes.ENUM('title_company', 'home_inspector', 'attorney', 'appraiser'),
    allowNull: false,
  },
  license_number: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  license_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  years_in_business: {
    type: DataTypes.INTEGER,
  },
  business_phone: {
    type: DataTypes.STRING(20),
  },
  business_email: {
    type: DataTypes.STRING(255),
  },
  business_address: {
    type: DataTypes.TEXT,
  },
  website: {
    type: DataTypes.STRING(255),
  },
  service_areas: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [],
  },
  service_radius: {
    type: DataTypes.INTEGER,
  },
  tier: {
    type: DataTypes.ENUM('free', 'standard', 'premium'),
    defaultValue: 'free',
  },
  subscription_start: {
    type: DataTypes.DATEONLY,
  },
  subscription_end: {
    type: DataTypes.DATEONLY,
  },
  stripe_customer_id: {
    type: DataTypes.STRING(100),
  },
  stripe_subscription_id: {
    type: DataTypes.STRING(100),
  },
  avg_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
  },
  total_reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_transactions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  avg_response_time_hours: {
    type: DataTypes.DECIMAL(5, 2),
  },
  bio: {
    type: DataTypes.TEXT,
  },
  logo_url: {
    type: DataTypes.STRING(500),
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'vendors',
  timestamps: true,
  underscored: true,
});

export default Vendor;
