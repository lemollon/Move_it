import express from 'express';
import { protect } from '../middleware/auth.js';
import { Document, Transaction, User, Notification } from '../models/index.js';

const router = express.Router();

// @route   GET /api/documents
// @desc    Get documents for user's transactions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { transaction_id, document_type } = req.query;

    // Get all transactions the user is part of
    const transactions = await Transaction.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { buyer_id: req.user.id },
          { seller_id: req.user.id },
        ],
      },
      attributes: ['id'],
    });

    const transactionIds = transactions.map(t => t.id);

    const where = {
      transaction_id: transactionIds,
    };

    if (transaction_id && transactionIds.includes(transaction_id)) {
      where.transaction_id = transaction_id;
    }

    if (document_type) {
      where.document_type = document_type;
    }

    const documents = await Document.findAll({
      where,
      include: [
        {
          model: Transaction,
          as: 'transaction',
          attributes: ['id', 'status'],
        },
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

// @route   GET /api/documents/:id
// @desc    Get single document
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        {
          model: Transaction,
          as: 'transaction',
          include: [
            { model: User, as: 'buyer', attributes: ['id'] },
            { model: User, as: 'seller', attributes: ['id'] },
          ],
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access
    const transaction = document.transaction;
    if (transaction.buyer_id !== req.user.id &&
        transaction.seller_id !== req.user.id &&
        req.user.role !== 'admin' &&
        req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized to view this document' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Server error fetching document' });
  }
});

// @route   POST /api/documents
// @desc    Upload a document to a transaction
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      transaction_id,
      document_type,
      filename,
      url,
      s3_key,
      file_size,
      mime_type,
      requires_signature = false,
    } = req.body;

    // Verify transaction exists and user has access
    const transaction = await Transaction.findByPk(transaction_id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.buyer_id !== req.user.id &&
        transaction.seller_id !== req.user.id &&
        req.user.role !== 'admin' &&
        req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized to upload to this transaction' });
    }

    const document = await Document.create({
      transaction_id,
      uploaded_by: req.user.id,
      document_type,
      filename,
      url,
      s3_key,
      file_size,
      mime_type,
      requires_signature,
    });

    // Notify other party
    const notifyUserId = transaction.buyer_id === req.user.id
      ? transaction.seller_id
      : transaction.buyer_id;

    await Notification.create({
      user_id: notifyUserId,
      notification_type: 'document_uploaded',
      title: 'New Document Uploaded',
      message: `A new ${document_type.replace(/_/g, ' ')} document has been uploaded.`,
      transaction_id,
    });

    const documentWithRelations = await Document.findByPk(document.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    res.status(201).json(documentWithRelations);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Server error uploading document' });
  }
});

// @route   POST /api/documents/:id/sign
// @desc    Sign a document
// @access  Private
router.post('/:id/sign', protect, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        {
          model: Transaction,
          as: 'transaction',
        },
      ],
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const transaction = document.transaction;

    if (!document.requires_signature) {
      return res.status(400).json({ message: 'This document does not require a signature' });
    }

    // Determine if user is buyer or seller
    if (transaction.buyer_id === req.user.id) {
      if (document.buyer_signed) {
        return res.status(400).json({ message: 'You have already signed this document' });
      }
      document.buyer_signed = true;
      document.buyer_signature_date = new Date();
    } else if (transaction.seller_id === req.user.id) {
      if (document.seller_signed) {
        return res.status(400).json({ message: 'You have already signed this document' });
      }
      document.seller_signed = true;
      document.seller_signature_date = new Date();
    } else {
      return res.status(403).json({ message: 'Not authorized to sign this document' });
    }

    await document.save();

    // Notify other party
    const notifyUserId = transaction.buyer_id === req.user.id
      ? transaction.seller_id
      : transaction.buyer_id;

    await Notification.create({
      user_id: notifyUserId,
      notification_type: 'document_signed',
      title: 'Document Signed',
      message: `The ${document.document_type.replace(/_/g, ' ')} has been signed.`,
      transaction_id: transaction.id,
    });

    res.json({
      message: 'Document signed successfully',
      document,
    });
  } catch (error) {
    console.error('Error signing document:', error);
    res.status(500).json({ message: 'Server error signing document' });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private (Uploader or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.uploaded_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    // In production, you'd also delete from S3 here
    await document.destroy();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server error deleting document' });
  }
});

// @route   GET /api/documents/types/list
// @desc    Get list of document types
// @access  Public
router.get('/types/list', async (req, res) => {
  const documentTypes = [
    { value: 'purchase_agreement', label: 'Purchase Agreement' },
    { value: 'seller_disclosure', label: 'Seller Disclosure' },
    { value: 'inspection_report', label: 'Inspection Report' },
    { value: 'appraisal', label: 'Appraisal' },
    { value: 'title_commitment', label: 'Title Commitment' },
    { value: 'closing_disclosure', label: 'Closing Disclosure' },
    { value: 'deed', label: 'Deed' },
    { value: 'other', label: 'Other' },
  ];

  res.json(documentTypes);
});

export default router;
