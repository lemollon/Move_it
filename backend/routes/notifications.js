import express from 'express';
import { protect } from '../middleware/auth.js';
import { Notification, Transaction, Property } from '../models/index.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { unread_only, limit = 50 } = req.query;

    const where = { user_id: req.user.id };

    if (unread_only === 'true') {
      where.read = false;
    }

    const notifications = await Notification.findAll({
      where,
      include: [
        {
          model: Transaction,
          as: 'transaction',
          attributes: ['id', 'status'],
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'address_line1', 'city'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
});

// @route   GET /api/notifications/unread/count
// @desc    Get unread notification count
// @access  Private
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Notification.count({
      where: {
        user_id: req.user.id,
        read: false,
      },
    });

    res.json({ unread_count: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.read = true;
    notification.read_at = new Date();
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.update(
      { read: true, read_at: new Date() },
      {
        where: {
          user_id: req.user.id,
          read: false,
        },
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await notification.destroy();

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/clear-all
// @desc    Clear all notifications for user
// @access  Private
router.delete('/clear-all', protect, async (req, res) => {
  try {
    await Notification.destroy({
      where: { user_id: req.user.id },
    });

    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
