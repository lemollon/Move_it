import express from 'express';
import { protect } from '../middleware/auth.js';
import { Message, Transaction, User, Notification } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// @route   GET /api/messages
// @desc    Get all messages for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { transaction_id, unread_only } = req.query;

    const where = {
      [Op.or]: [
        { sender_id: req.user.id },
        { recipient_id: req.user.id },
      ],
    };

    if (transaction_id) {
      where.transaction_id = transaction_id;
    }

    if (unread_only === 'true') {
      where.recipient_id = req.user.id;
      where.read = false;
    }

    const messages = await Message.findAll({
      where,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: Transaction,
          as: 'transaction',
          attributes: ['id', 'status', 'property_id'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// @route   GET /api/messages/transaction/:transactionId
// @desc    Get messages for a specific transaction
// @access  Private
router.get('/transaction/:transactionId', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is part of this transaction
    if (transaction.buyer_id !== req.user.id &&
        transaction.seller_id !== req.user.id &&
        req.user.role !== 'admin' &&
        req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.findAll({
      where: { transaction_id: req.params.transactionId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [['created_at', 'ASC']],
    });

    // Mark messages as read
    await Message.update(
      { read: true, read_at: new Date() },
      {
        where: {
          transaction_id: req.params.transactionId,
          recipient_id: req.user.id,
          read: false,
        },
      }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { transaction_id, recipient_id, message: messageText, attachments } = req.body;

    if (!messageText || !messageText.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // If transaction_id provided, verify access
    if (transaction_id) {
      const transaction = await Transaction.findByPk(transaction_id);

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      if (transaction.buyer_id !== req.user.id &&
          transaction.seller_id !== req.user.id &&
          req.user.role !== 'admin' &&
          req.user.role !== 'vendor') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Auto-determine recipient if not provided
      const actualRecipientId = recipient_id ||
        (transaction.buyer_id === req.user.id ? transaction.seller_id : transaction.buyer_id);

      const newMessage = await Message.create({
        transaction_id,
        sender_id: req.user.id,
        recipient_id: actualRecipientId,
        message: messageText.trim(),
        attachments: attachments || [],
      });

      // Notify recipient
      await Notification.create({
        user_id: actualRecipientId,
        notification_type: 'message_received',
        title: 'New Message',
        message: `You have a new message regarding your transaction.`,
        transaction_id,
      });

      const messageWithRelations = await Message.findByPk(newMessage.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'first_name', 'last_name'],
          },
          {
            model: User,
            as: 'recipient',
            attributes: ['id', 'first_name', 'last_name'],
          },
        ],
      });

      return res.status(201).json(messageWithRelations);
    }

    // Direct message without transaction
    if (!recipient_id) {
      return res.status(400).json({ message: 'Recipient is required' });
    }

    const newMessage = await Message.create({
      sender_id: req.user.id,
      recipient_id,
      message: messageText.trim(),
      attachments: attachments || [],
    });

    // Notify recipient
    await Notification.create({
      user_id: recipient_id,
      notification_type: 'message_received',
      title: 'New Message',
      message: `You have a new message.`,
    });

    const messageWithRelations = await Message.findByPk(newMessage.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    res.status(201).json(messageWithRelations);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark a message as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.recipient_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.read = true;
    message.read_at = new Date();
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/unread/count
// @desc    Get unread message count
// @access  Private
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Message.count({
      where: {
        recipient_id: req.user.id,
        read: false,
      },
    });

    res.json({ unread_count: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private (Sender only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await message.destroy();

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
