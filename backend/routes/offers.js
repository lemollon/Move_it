import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { Offer, Property, User, Transaction, Notification } from '../models/index.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// @route   GET /api/offers
// @desc    Get offers for current user (as buyer or seller)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { role } = req.query;

    let offers;
    if (role === 'buyer' || req.user.role === 'buyer') {
      // Get offers made by this user
      offers = await Offer.findAll({
        where: { buyer_id: req.user.id },
        include: [
          {
            model: Property,
            as: 'property',
            include: [
              {
                model: User,
                as: 'seller',
                attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
              },
            ],
          },
        ],
        order: [['created_at', 'DESC']],
      });
    } else {
      // Get offers on seller's properties
      const sellerProperties = await Property.findAll({
        where: { seller_id: req.user.id },
        attributes: ['id'],
      });
      const propertyIds = sellerProperties.map(p => p.id);

      offers = await Offer.findAll({
        where: { property_id: propertyIds },
        include: [
          {
            model: Property,
            as: 'property',
          },
          {
            model: User,
            as: 'buyer',
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
          },
        ],
        order: [['created_at', 'DESC']],
      });
    }

    res.json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ message: 'Server error fetching offers' });
  }
});

// @route   GET /api/offers/:id
// @desc    Get single offer
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const offer = await Offer.findByPk(req.params.id, {
      include: [
        {
          model: Property,
          as: 'property',
          include: [
            {
              model: User,
              as: 'seller',
              attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
            },
          ],
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        },
      ],
    });

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Check if user is buyer or seller
    if (offer.buyer_id !== req.user.id && offer.property.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this offer' });
    }

    res.json(offer);
  } catch (error) {
    console.error('Error fetching offer:', error);
    res.status(500).json({ message: 'Server error fetching offer' });
  }
});

// @route   POST /api/offers
// @desc    Create an offer on a property
// @access  Private (Buyer)
router.post('/', protect, authorize('buyer', 'admin'), async (req, res) => {
  try {
    const { property_id, offer_price, earnest_money, financing_type, proposed_closing_date, contingencies, notes } = req.body;

    // Check if property exists and is active
    const property = await Property.findByPk(property_id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.status !== 'active') {
      return res.status(400).json({ message: 'Property is not available for offers' });
    }

    // Check if user already has a pending offer on this property
    const existingOffer = await Offer.findOne({
      where: {
        property_id,
        buyer_id: req.user.id,
        status: ['pending', 'countered'],
      },
    });
    if (existingOffer) {
      return res.status(400).json({ message: 'You already have an active offer on this property' });
    }

    const offer = await Offer.create({
      property_id,
      buyer_id: req.user.id,
      offer_price,
      earnest_money,
      financing_type,
      proposed_closing_date,
      contingencies: contingencies || [],
      notes,
      status: 'pending',
    });

    // Create notification for seller
    await Notification.create({
      user_id: property.seller_id,
      notification_type: 'offer_received',
      title: 'New Offer Received',
      message: `You received a new offer of $${offer_price.toLocaleString()} on your property at ${property.address_line1}`,
      property_id,
    });

    // Send email notification to seller
    const seller = await User.findByPk(property.seller_id);
    if (seller) {
      emailService.sendOfferReceived(seller, offer, property).catch(err => {
        console.error('Failed to send offer email:', err);
      });
    }

    const offerWithRelations = await Offer.findByPk(offer.id, {
      include: [
        {
          model: Property,
          as: 'property',
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
      ],
    });

    res.status(201).json(offerWithRelations);
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ message: 'Server error creating offer' });
  }
});

// @route   PUT /api/offers/:id
// @desc    Update offer (counter, notes)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const offer = await Offer.findByPk(req.params.id, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Only buyer can update their own offer, only seller can counter
    if (offer.buyer_id !== req.user.id && offer.property.seller_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { counter_price, notes } = req.body;

    if (counter_price && offer.property.seller_id === req.user.id) {
      offer.counter_price = counter_price;
      offer.status = 'countered';

      // Notify buyer
      await Notification.create({
        user_id: offer.buyer_id,
        notification_type: 'offer_countered',
        title: 'Offer Countered',
        message: `The seller has countered your offer with $${counter_price.toLocaleString()}`,
        property_id: offer.property_id,
      });
    }

    if (notes) {
      offer.notes = notes;
    }

    await offer.save();

    res.json(offer);
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ message: 'Server error updating offer' });
  }
});

// @route   POST /api/offers/:id/accept
// @desc    Accept an offer (seller only)
// @access  Private (Seller)
router.post('/:id/accept', protect, async (req, res) => {
  try {
    const offer = await Offer.findByPk(req.params.id, {
      include: [
        { model: Property, as: 'property' },
        { model: User, as: 'buyer', attributes: ['id', 'first_name', 'last_name', 'email'] },
      ],
    });

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (offer.property.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the seller can accept offers' });
    }

    if (offer.status !== 'pending' && offer.status !== 'countered') {
      return res.status(400).json({ message: 'This offer cannot be accepted' });
    }

    // Accept the offer
    offer.status = 'accepted';
    await offer.save();

    // Update property status
    await offer.property.update({ status: 'under_contract' });

    // Create transaction
    const transaction = await Transaction.create({
      property_id: offer.property_id,
      buyer_id: offer.buyer_id,
      seller_id: offer.property.seller_id,
      accepted_offer_id: offer.id,
      purchase_price: offer.counter_price || offer.offer_price,
      earnest_money: offer.earnest_money,
      closing_date: offer.proposed_closing_date,
      status: 'initiated',
      platform_fee: (offer.counter_price || offer.offer_price) * 0.02,
    });

    // Reject other pending offers
    await Offer.update(
      { status: 'rejected' },
      {
        where: {
          property_id: offer.property_id,
          id: { [require('sequelize').Op.ne]: offer.id },
          status: ['pending', 'countered'],
        },
      }
    );

    // Notify buyer
    await Notification.create({
      user_id: offer.buyer_id,
      notification_type: 'offer_accepted',
      title: 'Offer Accepted!',
      message: `Congratulations! Your offer on ${offer.property.address_line1} has been accepted.`,
      property_id: offer.property_id,
      transaction_id: transaction.id,
    });

    // Send email notification to buyer
    emailService.sendOfferAccepted(offer.buyer, offer, offer.property).catch(err => {
      console.error('Failed to send offer accepted email:', err);
    });

    res.json({
      offer,
      transaction,
      message: 'Offer accepted and transaction created',
    });
  } catch (error) {
    console.error('Error accepting offer:', error);
    res.status(500).json({ message: 'Server error accepting offer' });
  }
});

// @route   POST /api/offers/:id/reject
// @desc    Reject an offer
// @access  Private (Seller)
router.post('/:id/reject', protect, async (req, res) => {
  try {
    const offer = await Offer.findByPk(req.params.id, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (offer.property.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the seller can reject offers' });
    }

    offer.status = 'rejected';
    await offer.save();

    // Notify buyer
    await Notification.create({
      user_id: offer.buyer_id,
      notification_type: 'offer_rejected',
      title: 'Offer Rejected',
      message: `Your offer on ${offer.property.address_line1} was not accepted.`,
      property_id: offer.property_id,
    });

    res.json({ message: 'Offer rejected', offer });
  } catch (error) {
    console.error('Error rejecting offer:', error);
    res.status(500).json({ message: 'Server error rejecting offer' });
  }
});

// @route   POST /api/offers/:id/withdraw
// @desc    Withdraw an offer (buyer only)
// @access  Private (Buyer)
router.post('/:id/withdraw', protect, async (req, res) => {
  try {
    const offer = await Offer.findByPk(req.params.id, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (offer.buyer_id !== req.user.id) {
      return res.status(403).json({ message: 'Only the buyer can withdraw their offer' });
    }

    if (offer.status !== 'pending' && offer.status !== 'countered') {
      return res.status(400).json({ message: 'This offer cannot be withdrawn' });
    }

    offer.status = 'withdrawn';
    await offer.save();

    res.json({ message: 'Offer withdrawn', offer });
  } catch (error) {
    console.error('Error withdrawing offer:', error);
    res.status(500).json({ message: 'Server error withdrawing offer' });
  }
});

export default router;
