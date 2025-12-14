import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  seller_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  address_line1: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  address_line2: {
    type: DataTypes.STRING(255),
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING(2),
    defaultValue: 'TX',
  },
  zip_code: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  county: {
    type: DataTypes.STRING(100),
  },
  property_type: {
    type: DataTypes.STRING(50),
  },
  bedrooms: {
    type: DataTypes.INTEGER,
  },
  bathrooms: {
    type: DataTypes.DECIMAL(3, 1),
  },
  sqft: {
    type: DataTypes.INTEGER,
  },
  lot_size: {
    type: DataTypes.INTEGER,
  },
  year_built: {
    type: DataTypes.INTEGER,
  },
  list_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  ai_suggested_price: {
    type: DataTypes.DECIMAL(12, 2),
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'under_contract', 'sold', 'withdrawn'),
    defaultValue: 'draft',
  },
  listed_date: {
    type: DataTypes.DATEONLY,
  },
  sold_date: {
    type: DataTypes.DATEONLY,
  },
  sold_price: {
    type: DataTypes.DECIMAL(12, 2),
  },
  description: {
    type: DataTypes.TEXT,
  },
  features: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  school_district: {
    type: DataTypes.JSONB,
  },
  property_taxes: {
    type: DataTypes.DECIMAL(10, 2),
  },
  hoa_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  mud_district: {
    type: DataTypes.STRING(100),
  },
  flood_zone: {
    type: DataTypes.STRING(50),
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  favorite_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'properties',
  timestamps: true,
  underscored: true,
});

// Virtual for full address
Property.prototype.getFullAddress = function() {
  let addr = this.address_line1;
  if (this.address_line2) addr += ` ${this.address_line2}`;
  return `${addr}, ${this.city}, ${this.state} ${this.zip_code}`;
};

export default Property;
