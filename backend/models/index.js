import { sequelize } from '../config/database.js';
import User from './User.js';
import Property from './Property.js';
import Offer from './Offer.js';
import Transaction from './Transaction.js';
import Vendor from './Vendor.js';
import Document from './Document.js';
import Message from './Message.js';
import Favorite from './Favorite.js';
import Notification from './Notification.js';
import SellerDisclosure from './SellerDisclosure.js';
import FSBOChecklist from './FSBOChecklist.js';
import SharedDisclosure from './SharedDisclosure.js';
import DisclosureAnalytics from './DisclosureAnalytics.js';

// =====================================================
// ASSOCIATIONS
// =====================================================

// User associations
User.hasMany(Property, { foreignKey: 'seller_id', as: 'properties' });
User.hasMany(Offer, { foreignKey: 'buyer_id', as: 'offers' });
User.hasOne(Vendor, { foreignKey: 'user_id', as: 'vendor' });
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'recipient_id', as: 'receivedMessages' });

// Property associations
Property.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });
Property.hasMany(Offer, { foreignKey: 'property_id', as: 'offers' });
Property.hasOne(Transaction, { foreignKey: 'property_id', as: 'transaction' });
Property.hasMany(Favorite, { foreignKey: 'property_id', as: 'favorites' });

// Offer associations
Offer.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });
Offer.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });
Offer.hasOne(Transaction, { foreignKey: 'accepted_offer_id', as: 'transaction' });

// Transaction associations
Transaction.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });
Transaction.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });
Transaction.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });
Transaction.belongsTo(Offer, { foreignKey: 'accepted_offer_id', as: 'acceptedOffer' });
Transaction.hasMany(Document, { foreignKey: 'transaction_id', as: 'documents' });
Transaction.hasMany(Message, { foreignKey: 'transaction_id', as: 'messages' });

// Vendor associations
Vendor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Document associations
Document.belongsTo(Transaction, { foreignKey: 'transaction_id', as: 'transaction' });
Document.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// Message associations
Message.belongsTo(Transaction, { foreignKey: 'transaction_id', as: 'transaction' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'recipient_id', as: 'recipient' });

// Favorite associations
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Favorite.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Notification.belongsTo(Transaction, { foreignKey: 'transaction_id', as: 'transaction' });
Notification.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

// SellerDisclosure associations
SellerDisclosure.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });
SellerDisclosure.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });
Property.hasOne(SellerDisclosure, { foreignKey: 'property_id', as: 'disclosure' });
User.hasMany(SellerDisclosure, { foreignKey: 'seller_id', as: 'disclosures' });

// FSBOChecklist associations
FSBOChecklist.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });
FSBOChecklist.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });
Property.hasOne(FSBOChecklist, { foreignKey: 'property_id', as: 'fsboChecklist' });
User.hasMany(FSBOChecklist, { foreignKey: 'seller_id', as: 'fsboChecklists' });

// SharedDisclosure associations
SharedDisclosure.belongsTo(SellerDisclosure, { foreignKey: 'disclosure_id', as: 'disclosure' });
SharedDisclosure.belongsTo(User, { foreignKey: 'shared_by', as: 'sharer' });
SharedDisclosure.belongsTo(User, { foreignKey: 'recipient_user_id', as: 'recipient' });
SellerDisclosure.hasMany(SharedDisclosure, { foreignKey: 'disclosure_id', as: 'shares' });
User.hasMany(SharedDisclosure, { foreignKey: 'recipient_user_id', as: 'receivedDisclosures' });

// DisclosureAnalytics associations
DisclosureAnalytics.belongsTo(SellerDisclosure, { foreignKey: 'disclosure_id', as: 'disclosure' });
DisclosureAnalytics.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
SellerDisclosure.hasMany(DisclosureAnalytics, { foreignKey: 'disclosure_id', as: 'analytics' });

// =====================================================
// SYNC FUNCTION
// =====================================================

const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

export {
  sequelize,
  User,
  Property,
  Offer,
  Transaction,
  Vendor,
  Document,
  Message,
  Favorite,
  Notification,
  SellerDisclosure,
  FSBOChecklist,
  SharedDisclosure,
  DisclosureAnalytics,
  syncDatabase,
};
