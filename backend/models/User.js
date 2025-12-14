import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sequelize } from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('buyer', 'seller', 'vendor', 'admin'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
  },
  first_name: {
    type: DataTypes.STRING(100),
  },
  last_name: {
    type: DataTypes.STRING(100),
  },
  phone: {
    type: DataTypes.STRING(20),
  },
  last_login: {
    type: DataTypes.DATE,
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
});

// Hash password before save
User.beforeSave(async (user) => {
  if (user.changed('password_hash')) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

// Instance method to check password
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

// Instance method to generate JWT
User.prototype.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this.id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Instance method to get safe user object (no password)
User.prototype.toSafeObject = function() {
  const { password_hash, ...safeUser } = this.toJSON();
  return safeUser;
};

export default User;
