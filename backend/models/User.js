import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
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
  // Password reset fields
  password_reset_token: {
    type: DataTypes.STRING(255),
  },
  password_reset_expires: {
    type: DataTypes.DATE,
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
  const { password_hash, password_reset_token, password_reset_expires, ...safeUser } = this.toJSON();
  return safeUser;
};

// Generate and set password reset token
User.prototype.generatePasswordResetToken = function() {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and save to database
  this.password_reset_token = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiry to 1 hour
  this.password_reset_expires = new Date(Date.now() + 60 * 60 * 1000);

  // Return unhashed token (this gets sent to user)
  return resetToken;
};

// Clear password reset token
User.prototype.clearPasswordResetToken = function() {
  this.password_reset_token = null;
  this.password_reset_expires = null;
};

// Static method to find user by reset token
User.findByResetToken = async function(token) {
  // Hash the provided token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with matching token that hasn't expired
  return User.findOne({
    where: {
      password_reset_token: hashedToken,
      password_reset_expires: {
        [sequelize.Sequelize.Op.gt]: new Date()
      }
    }
  });
};

export default User;
