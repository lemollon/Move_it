import express from 'express';
import { protect } from '../middleware/auth.js';
import { Transaction, Property, User, Offer, Document, Message, Notification } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// @route   GET /api/transactions
// @desc    Get user's transactions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;

    const where = {
      [Op.or]: [
        { buyer_id: req.user.id },
        { seller_id: req.user.id },
      ],
    };

    if (status) {
      where.status = status;
    }

    const transactions = await Transaction.findAll({
      where,
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
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        },
        {
          model: Offer,
          as: 'acceptedOffer',
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction with all details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
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
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        },
        {
          model: Offer,
          as: 'acceptedOffer',
        },
        {
          model: Document,
          as: 'documents',
          include: [
            {
              model: User,
              as: 'uploader',
              attributes: ['id', 'first_name', 'last_name'],
            },
          ],
        },
        {
          model: Message,
          as: 'messages',
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'first_name', 'last_name'],
            },
          ],
          order: [['created_at', 'ASC']],
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is part of this transaction
    if (transaction.buyer_id !== req.user.id &&
        transaction.seller_id !== req.user.id &&
        req.user.role !== 'admin' &&
        req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized to view this transaction' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Server error fetching transaction' });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update transaction details
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check authorization
    if (transaction.buyer_id !== req.user.id &&
        transaction.seller_id !== req.user.id &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const allowedUpdates = [
      'closing_date',
      'inspection_date',
      'appraisal_date',
      'title_search_date',
      'final_walkthrough_date',
      'notes',
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await transaction.update(updates);

    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Server error updating transaction' });
  }
});

// @route   POST /api/transactions/:id/update-status
// @desc    Update transaction status
// @access  Private (Admin or parties involved)
router.post('/:id/update-status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        { model: Property, as: 'property' },
        { model: User, as: 'buyer', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: User, as: 'seller', attributes: ['id', 'first_name', 'last_name', 'email'] },
      ],
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Validate status transition
    const validStatuses = [
      'initiated',
      'contract_pending',
      'inspection_period',
      'appraisal_ordered',
      'title_search',
      'financing_contingency',
      'final_walkthrough',
      'closing_scheduled',
      'closed',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const previousStatus = transaction.status;
    transaction.status = status;
    await transaction.save();

    // Update property status if transaction is closed or cancelled
    if (status === 'closed') {
      await transaction.property.update({ status: 'sold' });
    } else if (status === 'cancelled') {
      await transaction.property.update({ status: 'active' });
    }

    // Notify both parties
    const notifyUsers = [transaction.buyer_id, transaction.seller_id];
    for (const userId of notifyUsers) {
      await Notification.create({
        user_id: userId,
        notification_type: 'transaction_update',
        title: 'Transaction Status Updated',
        message: `Transaction for ${transaction.property.address_line1} has been updated to: ${status.replace(/_/g, ' ')}`,
        transaction_id: transaction.id,
        property_id: transaction.property_id,
      });
    }

    res.json({
      message: 'Status updated successfully',
      transaction,
      previousStatus,
      newStatus: status,
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

// @route   GET /api/transactions/:id/timeline
// @desc    Get transaction timeline/milestones
// @access  Private
router.get('/:id/timeline', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const timeline = [
      {
        step: 'initiated',
        label: 'Offer Accepted',
        date: transaction.created_at,
        completed: true,
      },
      {
        step: 'contract_pending',
        label: 'Contract Signed',
        date: transaction.contract_signed_date,
        completed: !!transaction.contract_signed_date,
      },
      {
        step: 'inspection_period',
        label: 'Inspection',
        date: transaction.inspection_date,
        completed: transaction.inspection_completed,
      },
      {
        step: 'appraisal_ordered',
        label: 'Appraisal',
        date: transaction.appraisal_date,
        completed: transaction.appraisal_completed,
      },
      {
        step: 'title_search',
        label: 'Title Search',
        date: transaction.title_search_date,
        completed: transaction.title_clear,
      },
      {
        step: 'final_walkthrough',
        label: 'Final Walkthrough',
        date: transaction.final_walkthrough_date,
        completed: !!transaction.final_walkthrough_date && new Date(transaction.final_walkthrough_date) <= new Date(),
      },
      {
        step: 'closing_scheduled',
        label: 'Closing',
        date: transaction.closing_date,
        completed: transaction.status === 'closed',
      },
    ];

    res.json({
      transaction_id: transaction.id,
      current_status: transaction.status,
      timeline,
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ message: 'Server error fetching timeline' });
  }
});

// @route   GET /api/transactions/:id/documents
// @desc    Get documents for a transaction
// @access  Private
router.get('/:id/documents', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check authorization
    if (transaction.buyer_id !== req.user.id &&
        transaction.seller_id !== req.user.id &&
        req.user.role !== 'admin' &&
        req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const documents = await Document.findAll({
      where: { transaction_id: req.params.id },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Server error fetching documents' });
  }
});

export default router;
