import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.js';
import { Document, Transaction } from '../models/index.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// @route   POST /api/uploads/document
// @desc    Upload a document for a transaction
// @access  Private
router.post('/document', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { transaction_id, document_type, requires_signature } = req.body;

    // Verify transaction exists and user has access
    if (transaction_id) {
      const transaction = await Transaction.findByPk(transaction_id);
      if (!transaction) {
        // Delete uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Transaction not found' });
      }

      if (transaction.buyer_id !== req.user.id &&
          transaction.seller_id !== req.user.id &&
          req.user.role !== 'admin' &&
          req.user.role !== 'vendor') {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    // Create document record
    const document = await Document.create({
      transaction_id: transaction_id || null,
      uploaded_by: req.user.id,
      document_type: document_type || 'other',
      filename: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      s3_key: null, // Using local storage
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      requires_signature: requires_signature === 'true',
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      document: {
        id: document.id,
        filename: document.filename,
        url: document.url,
        document_type: document.document_type,
        file_size: document.file_size,
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    // Clean up file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error uploading file' });
  }
});

// @route   POST /api/uploads/image
// @desc    Upload an image (for property photos, profile, etc.)
// @access  Private
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: {
        filename: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error uploading image' });
  }
});

// @route   POST /api/uploads/multiple
// @desc    Upload multiple files
// @access  Private
router.post('/multiple', protect, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.status(201).json({
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    // Clean up files on error
    if (req.files) {
      req.files.forEach(file => fs.unlinkSync(file.path));
    }
    res.status(500).json({ message: 'Server error uploading files' });
  }
});

// @route   DELETE /api/uploads/:filename
// @desc    Delete an uploaded file
// @access  Private (Admin only)
router.delete('/:filename', protect, async (req, res) => {
  try {
    // Only admin can delete files directly
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const filePath = path.join(uploadsDir, req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    fs.unlinkSync(filePath);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Server error deleting file' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ message: error.message });
  }
  next(error);
});

export default router;
