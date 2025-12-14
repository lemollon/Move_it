import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  transaction_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'transactions',
      key: 'id',
    },
  },
  uploaded_by: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  document_type: {
    type: DataTypes.ENUM(
      'purchase_agreement',
      'seller_disclosure',
      'inspection_report',
      'appraisal',
      'title_commitment',
      'closing_disclosure',
      'deed',
      'other'
    ),
    allowNull: false,
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  s3_key: {
    type: DataTypes.STRING(500),
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  file_size: {
    type: DataTypes.INTEGER,
  },
  mime_type: {
    type: DataTypes.STRING(100),
  },
  requires_signature: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  buyer_signed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  seller_signed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  buyer_signature_date: {
    type: DataTypes.DATE,
  },
  seller_signature_date: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'documents',
  timestamps: true,
  underscored: true,
});

export default Document;
