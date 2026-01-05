import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  // Seller Disclosure
  getDisclosure,
  createOrGetDisclosure,
  autoSaveSection,
  updateDisclosure,
  validateDisclosure,
  completeDisclosure,
  signDisclosureSeller,
  signDisclosureBuyer,
  getSellerDisclosures,
  addAttachment,
  removeAttachment,
  generatePDF,
  // FSBO Checklist
  getFSBOChecklist,
  createFSBOChecklist,
  autoSaveFSBOCategory,
  updateFSBOChecklist,
  deleteFSBOChecklist
} from '../controllers/disclosureController.js';

const router = express.Router();

// =====================================================
// SELLER DISCLOSURE ROUTES
// =====================================================

// Get all disclosures for the logged-in seller
router.get('/seller', protect, getSellerDisclosures);

// Get disclosure for a specific property
router.get('/property/:propertyId', protect, getDisclosure);

// Create or get existing disclosure for a property
router.post('/property/:propertyId', protect, createOrGetDisclosure);

// Auto-save a section (used for live saving as user types)
router.patch('/:id/section/:sectionNumber', protect, autoSaveSection);

// Update full disclosure
router.put('/:id', protect, updateDisclosure);

// Validate disclosure before completion
router.post('/:id/validate', protect, validateDisclosure);

// Mark disclosure as completed
router.post('/:id/complete', protect, completeDisclosure);

// Sign disclosure (seller)
router.post('/:id/sign/seller', protect, signDisclosureSeller);

// Sign disclosure (buyer acknowledgment)
router.post('/:id/sign/buyer', protect, signDisclosureBuyer);

// Attachments
router.post('/:id/attachments', protect, addAttachment);
router.delete('/:id/attachments/:attachmentId', protect, removeAttachment);

// PDF Generation
router.post('/:id/generate-pdf', protect, generatePDF);
router.get('/:id/pdf', protect, generatePDF);

// =====================================================
// FSBO CHECKLIST ROUTES
// =====================================================

// Get FSBO checklist for seller (optionally property-specific)
router.get('/fsbo-checklist', protect, getFSBOChecklist);

// Create FSBO checklist for a property
router.post('/fsbo-checklist/property/:propertyId', protect, createFSBOChecklist);

// Auto-save a category
router.patch('/fsbo-checklist/:id/category/:category', protect, autoSaveFSBOCategory);

// Update full checklist
router.put('/fsbo-checklist/:id', protect, updateFSBOChecklist);

// Delete checklist
router.delete('/fsbo-checklist/:id', protect, deleteFSBOChecklist);

export default router;
