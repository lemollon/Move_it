import crypto from 'crypto';
import { SellerDisclosure, FSBOChecklist, Property, User, SharedDisclosure } from '../models/index.js';
import { pdfService } from '../services/pdfService.js';
import { emailService } from '../services/emailService.js';
import { analyticsService } from '../services/analyticsService.js';

// =====================================================
// SELLER DISCLOSURE CONTROLLERS
// =====================================================

// @desc    Get disclosure for a property
// @route   GET /api/disclosures/property/:propertyId
// @access  Private (seller, buyer in transaction, admin)
export const getDisclosure = async (req, res) => {
  try {
    const { propertyId } = req.params;

    let disclosure = await SellerDisclosure.findOne({
      where: { property_id: propertyId },
      include: [
        { model: Property, as: 'property', attributes: ['id', 'address_line1', 'city', 'state', 'zip_code'] },
        { model: User, as: 'seller', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ]
    });

    if (!disclosure) {
      return res.status(404).json({ message: 'Disclosure not found for this property' });
    }

    // Calculate completion percentage
    const completion = disclosure.calculateCompletion();
    const sectionsSummary = disclosure.getSectionsSummary();

    res.json({
      disclosure,
      completion,
      sectionsSummary
    });
  } catch (error) {
    console.error('Get disclosure error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create or get existing disclosure for a property
// @route   POST /api/disclosures/property/:propertyId
// @access  Private (seller only)
export const createOrGetDisclosure = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const sellerId = req.user.id;

    // Verify property belongs to seller
    const property = await Property.findOne({
      where: { id: propertyId, seller_id: sellerId }
    });

    if (!property) {
      return res.status(403).json({ message: 'Property not found or you are not the owner' });
    }

    // Check if disclosure already exists
    let disclosure = await SellerDisclosure.findOne({
      where: { property_id: propertyId }
    });

    let isNew = false;
    if (!disclosure) {
      isNew = true;

      // Pre-fill data from property
      const prefillData = generatePrefillFromProperty(property);

      // Create new disclosure with pre-filled data
      disclosure = await SellerDisclosure.create({
        property_id: propertyId,
        seller_id: sellerId,
        ...prefillData,
        status: 'draft'
      });
    }

    const completion = disclosure.calculateCompletion();
    const sectionsSummary = disclosure.getSectionsSummary();

    res.status(201).json({
      disclosure,
      completion,
      sectionsSummary,
      isNew,
      prefilled: isNew ? 'Property data has been pre-filled where available' : null,
    });
  } catch (error) {
    console.error('Create disclosure error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to generate pre-fill data from property
function generatePrefillFromProperty(property) {
  const prefill = {
    header_data: {
      property_address: property.getFullAddress ? property.getFullAddress() : '',
      city: property.city,
      county: property.county,
      zip_code: property.zip_code,
    },
    section1_roof_info: {},
    section1_water_supply: {},
    section5_flood_data: {},
    section8_hoa_details: {},
  };

  // Pre-fill year built info for lead paint disclosure
  if (property.year_built) {
    prefill.section1_roof_info.built_before_1978 = property.year_built < 1978 ? 'yes' : 'no';
    prefill.section1_roof_info.year_built = property.year_built;
  }

  // Pre-fill flood zone data if available
  if (property.flood_zone) {
    prefill.section5_flood_data.flood_zone = property.flood_zone;
    prefill.section5_flood_data.in_100_year_floodplain =
      ['A', 'AE', 'AO', 'AH', 'V', 'VE'].includes(property.flood_zone);
    prefill.section5_flood_data.in_500_year_floodplain =
      property.flood_zone === 'X500' || property.flood_zone === 'B';
  }

  if (property.flood_zone_data) {
    prefill.section5_flood_data = {
      ...prefill.section5_flood_data,
      ...property.flood_zone_data,
    };
  }

  // Pre-fill MUD district info if available
  if (property.mud_district) {
    prefill.section8_hoa_details.mud_district = property.mud_district;
    prefill.section8_hoa_details.mud_annual_fee = property.mud_annual_fee;
  }

  // Pre-fill school district if available
  if (property.school_district) {
    prefill.header_data.school_district = property.school_district;
  }

  // Pre-fill property tax info if available
  if (property.property_taxes) {
    prefill.header_data.estimated_annual_taxes = property.property_taxes;
  }

  return prefill;
}

// @desc    Auto-save disclosure section
// @route   PATCH /api/disclosures/:id/section/:sectionNumber
// @access  Private (seller only)
export const autoSaveSection = async (req, res) => {
  try {
    const { id, sectionNumber } = req.params;
    const { data } = req.body;
    const sellerId = req.user.id;

    const disclosure = await SellerDisclosure.findOne({
      where: { id, seller_id: sellerId }
    });

    if (!disclosure) {
      return res.status(404).json({ message: 'Disclosure not found' });
    }

    // Map section number to field
    const sectionFieldMap = {
      '1': ['section1_property_items', 'section1_water_supply', 'section1_roof_info', 'section1_defects_explanation'],
      '2': ['section2_defects', 'section2_explanation'],
      '3': ['section3_conditions', 'section3_explanation'],
      '4': ['section4_additional_repairs', 'section4_explanation'],
      '5': ['section5_flood_data', 'section5_explanation'],
      '6': ['section6_flood_claim', 'section6_explanation'],
      '7': ['section7_fema_assistance', 'section7_explanation'],
      '8': ['section8_conditions', 'section8_hoa_details', 'section8_common_areas', 'section8_explanation'],
      '9': ['section9_has_reports', 'section9_reports'],
      '10': ['section10_exemptions'],
      '11': ['section11_insurance_claims'],
      '12': ['section12_unremediated_claims', 'section12_explanation'],
      '13': ['section13_smoke_detectors', 'section13_explanation'],
      'header': ['header_data'],
      'utilities': ['utility_providers'],
      'signatures': ['seller1_signature', 'seller2_signature']
    };

    const allowedFields = sectionFieldMap[sectionNumber];
    if (!allowedFields) {
      return res.status(400).json({ message: 'Invalid section number' });
    }

    // Update only the fields for this section
    const updateData = { last_auto_save: new Date() };
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    // Update current section tracker
    const sectionNum = parseInt(sectionNumber);
    if (!isNaN(sectionNum) && sectionNum > disclosure.current_section) {
      updateData.current_section = sectionNum;
    }

    // Update status if still draft
    if (disclosure.status === 'draft') {
      updateData.status = 'in_progress';
    }

    await disclosure.update(updateData);
    await disclosure.reload();

    // Recalculate completion
    const completion = disclosure.calculateCompletion();
    await disclosure.update({ completion_percentage: completion });

    res.json({
      message: 'Section saved',
      last_auto_save: disclosure.last_auto_save,
      completion,
      current_section: disclosure.current_section
    });
  } catch (error) {
    console.error('Auto-save error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update full disclosure
// @route   PUT /api/disclosures/:id
// @access  Private (seller only)
export const updateDisclosure = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const disclosure = await SellerDisclosure.findOne({
      where: { id, seller_id: sellerId }
    });

    if (!disclosure) {
      return res.status(404).json({ message: 'Disclosure not found' });
    }

    // Don't allow updates to signed disclosures
    if (disclosure.status === 'signed') {
      return res.status(403).json({ message: 'Cannot modify a signed disclosure' });
    }

    await disclosure.update(req.body);
    await disclosure.reload();

    const completion = disclosure.calculateCompletion();
    await disclosure.update({ completion_percentage: completion });

    res.json({
      disclosure,
      completion,
      sectionsSummary: disclosure.getSectionsSummary()
    });
  } catch (error) {
    console.error('Update disclosure error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Validate disclosure before completion
// @route   POST /api/disclosures/:id/validate
// @access  Private (seller only)
export const validateDisclosure = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const disclosure = await SellerDisclosure.findOne({
      where: { id, seller_id: sellerId }
    });

    if (!disclosure) {
      return res.status(404).json({ message: 'Disclosure not found' });
    }

    const validation = disclosure.validateForCompletion();
    const incomplete = disclosure.getIncompleteFields();
    const completion = disclosure.calculateCompletion();

    res.json({
      valid: validation.valid,
      completion,
      errors: validation.errors,
      warnings: validation.warnings,
      incompleteFields: incomplete,
      canComplete: validation.valid && completion >= 80,
    });
  } catch (error) {
    console.error('Validate disclosure error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark disclosure as completed
// @route   POST /api/disclosures/:id/complete
// @access  Private (seller only)
export const completeDisclosure = async (req, res) => {
  try {
    const { id } = req.params;
    const { force } = req.body; // Allow forcing completion with warnings
    const sellerId = req.user.id;

    const disclosure = await SellerDisclosure.findOne({
      where: { id, seller_id: sellerId }
    });

    if (!disclosure) {
      return res.status(404).json({ message: 'Disclosure not found' });
    }

    // Validate required fields
    const validation = disclosure.validateForCompletion();
    if (!validation.valid) {
      return res.status(400).json({
        message: 'Please complete all required fields before submitting',
        errors: validation.errors,
        warnings: validation.warnings,
      });
    }

    // Check minimum completion percentage
    const completion = disclosure.calculateCompletion();
    if (completion < 80 && !force) {
      return res.status(400).json({
        message: 'Disclosure must be at least 80% complete',
        current_completion: completion,
        incompleteFields: disclosure.getIncompleteFields(),
      });
    }

    await disclosure.update({
      status: 'completed',
      completion_percentage: completion,
    });

    res.json({
      message: 'Disclosure marked as completed',
      disclosure,
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error('Complete disclosure error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Sign disclosure (seller)
// @route   POST /api/disclosures/:id/sign/seller
// @access  Private (seller only)
export const signDisclosureSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { signature_data, printed_name, seller_number } = req.body;
    const sellerId = req.user.id;

    const disclosure = await SellerDisclosure.findOne({
      where: { id, seller_id: sellerId }
    });

    if (!disclosure) {
      return res.status(404).json({ message: 'Disclosure not found' });
    }

    const signatureField = seller_number === 2 ? 'seller2_signature' : 'seller1_signature';

    await disclosure.update({
      [signatureField]: {
        signature_data,
        printed_name,
        date: new Date().toISOString()
      },
      status: 'signed'
    });

    res.json({
      message: 'Disclosure signed successfully',
      disclosure
    });
  } catch (error) {
    console.error('Sign disclosure error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Sign disclosure (buyer acknowledgment)
// @route   POST /api/disclosures/:id/sign/buyer
// @access  Private (buyer in transaction)
export const signDisclosureBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const { signature_data, printed_name, buyer_number } = req.body;

    const disclosure = await SellerDisclosure.findByPk(id);

    if (!disclosure) {
      return res.status(404).json({ message: 'Disclosure not found' });
    }

    const signatureField = buyer_number === 2 ? 'buyer2_signature' : 'buyer1_signature';

    await disclosure.update({
      [signatureField]: {
        signature_data,
        printed_name,
        date: new Date().toISOString()
      }
    });

    res.json({
      message: 'Buyer acknowledgment recorded',
      disclosure
    });
  } catch (error) {
    console.error('Buyer sign error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all disclosures for a seller
// @route   GET /api/disclosures/seller
// @access  Private (seller only)
export const getSellerDisclosures = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const disclosures = await SellerDisclosure.findAll({
      where: { seller_id: sellerId },
      include: [
        { model: Property, as: 'property', attributes: ['id', 'address_line1', 'city', 'state', 'zip_code', 'status'] }
      ],
      order: [['updated_at', 'DESC']]
    });

    res.json(disclosures.map(d => ({
      ...d.toJSON(),
      completion: d.calculateCompletion()
    })));
  } catch (error) {
    console.error('Get seller disclosures error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// =====================================================
// FSBO CHECKLIST CONTROLLERS
// =====================================================

// @desc    Get FSBO checklist for a seller (or create if not exists)
// @route   GET /api/disclosures/fsbo-checklist
// @access  Private (seller only)
export const getFSBOChecklist = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { propertyId } = req.query;

    let checklist;

    if (propertyId) {
      checklist = await FSBOChecklist.findOne({
        where: { property_id: propertyId, seller_id: sellerId },
        include: [
          { model: Property, as: 'property', attributes: ['id', 'address_line1', 'city', 'state', 'zip_code'] }
        ]
      });
    } else {
      // Get or create a general checklist for the seller (not property-specific)
      checklist = await FSBOChecklist.findOne({
        where: { seller_id: sellerId, property_id: null }
      });

      if (!checklist) {
        checklist = await FSBOChecklist.create({
          seller_id: sellerId,
          status: 'not_started'
        });
      }
    }

    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }

    const completion = checklist.calculateCompletion();
    const categorySummaries = checklist.getCategorySummaries();

    res.json({
      checklist,
      completion,
      categorySummaries
    });
  } catch (error) {
    console.error('Get FSBO checklist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create FSBO checklist for a property
// @route   POST /api/disclosures/fsbo-checklist/property/:propertyId
// @access  Private (seller only)
export const createFSBOChecklist = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const sellerId = req.user.id;

    // Verify property ownership
    const property = await Property.findOne({
      where: { id: propertyId, seller_id: sellerId }
    });

    if (!property) {
      return res.status(403).json({ message: 'Property not found or you are not the owner' });
    }

    // Check if checklist already exists
    let checklist = await FSBOChecklist.findOne({
      where: { property_id: propertyId }
    });

    if (!checklist) {
      // Pre-fill with property data
      checklist = await FSBOChecklist.create({
        property_id: propertyId,
        seller_id: sellerId,
        status: 'not_started',
        property_details: {
          property_address: { checked: true, notes: property.getFullAddress() },
          year_built: { checked: !!property.year_built, notes: property.year_built?.toString() || '' },
          bedrooms_bathrooms: { checked: !!(property.bedrooms && property.bathrooms), notes: `${property.bedrooms || '?'} bed / ${property.bathrooms || '?'} bath` },
          square_footage: { checked: !!property.sqft, notes: property.sqft?.toString() || '' },
          lot_size: { checked: !!property.lot_size, notes: property.lot_size?.toString() || '' },
          property_type: { checked: !!property.property_type, notes: property.property_type || '' },
          parking_details: { checked: false, notes: '' }
        }
      });
    }

    const completion = checklist.calculateCompletion();
    const categorySummaries = checklist.getCategorySummaries();

    res.status(201).json({
      checklist,
      completion,
      categorySummaries
    });
  } catch (error) {
    console.error('Create FSBO checklist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Auto-save FSBO checklist category
// @route   PATCH /api/disclosures/fsbo-checklist/:id/category/:category
// @access  Private (seller only)
export const autoSaveFSBOCategory = async (req, res) => {
  try {
    const { id, category } = req.params;
    const { data } = req.body;
    const sellerId = req.user.id;

    const checklist = await FSBOChecklist.findOne({
      where: { id, seller_id: sellerId }
    });

    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }

    const validCategories = [
      'property_details', 'hoa_info', 'ownership_legal', 'pricing',
      'property_condition', 'photos_marketing', 'showings', 'offers_closing'
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Update the category
    const updateData = {
      [category]: data,
      last_auto_save: new Date()
    };

    // Update status if not started
    if (checklist.status === 'not_started') {
      updateData.status = 'in_progress';
    }

    await checklist.update(updateData);
    await checklist.reload();

    // Recalculate completion
    const completion = checklist.calculateCompletion();
    await checklist.update({ completion_percentage: completion });

    // Check if completed
    if (completion === 100) {
      await checklist.update({ status: 'completed' });
    }

    res.json({
      message: 'Category saved',
      last_auto_save: checklist.last_auto_save,
      completion,
      status: checklist.status
    });
  } catch (error) {
    console.error('Auto-save FSBO error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update full FSBO checklist
// @route   PUT /api/disclosures/fsbo-checklist/:id
// @access  Private (seller only)
export const updateFSBOChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const checklist = await FSBOChecklist.findOne({
      where: { id, seller_id: sellerId }
    });

    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }

    await checklist.update(req.body);
    await checklist.reload();

    const completion = checklist.calculateCompletion();
    await checklist.update({ completion_percentage: completion });

    res.json({
      checklist,
      completion,
      categorySummaries: checklist.getCategorySummaries()
    });
  } catch (error) {
    console.error('Update FSBO checklist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete FSBO checklist
// @route   DELETE /api/disclosures/fsbo-checklist/:id
// @access  Private (seller only)
export const deleteFSBOChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const checklist = await FSBOChecklist.findOne({
      where: { id, seller_id: sellerId }
    });

    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }

    await checklist.destroy();

    res.json({ message: 'Checklist deleted' });
  } catch (error) {
    console.error('Delete FSBO checklist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// =====================================================
// ATTACHMENT CONTROLLERS
// =====================================================

// @desc    Add attachment to disclosure
// @route   POST /api/disclosures/:id/attachments
// @access  Private (seller only)
export const addAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, url, size } = req.body;
    const sellerId = req.user.id;

    const disclosure = await SellerDisclosure.findOne({
      where: { id, seller_id: sellerId }
    });

    if (!disclosure) {
      return res.status(404).json({ message: 'Disclosure not found' });
    }

    // Validate attachment type
    const allowedTypes = [
      'inspection_report',
      'hoa_document',
      'survey',
      'title_document',
      'warranty',
      'permit',
      'other'
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: 'Invalid attachment type',
        allowedTypes
      });
    }

    const attachment = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      url,
      size: size || 0,
      uploaded_at: new Date().toISOString(),
      uploaded_by: sellerId,
    };

    const attachments = disclosure.attachments || [];
    attachments.push(attachment);

    await disclosure.update({ attachments });

    res.status(201).json({
      message: 'Attachment added',
      attachment,
      totalAttachments: attachments.length,
    });
  } catch (error) {
    console.error('Add attachment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove attachment from disclosure
// @route   DELETE /api/disclosures/:id/attachments/:attachmentId
// @access  Private (seller only)
export const removeAttachment = async (req, res) => {
  try {
    const { id, attachmentId } = req.params;
    const sellerId = req.user.id;

    const disclosure = await SellerDisclosure.findOne({
      where: { id, seller_id: sellerId }
    });

    if (!disclosure) {
      return res.status(404).json({ message: 'Disclosure not found' });
    }

    const attachments = disclosure.attachments || [];
    const attachmentIndex = attachments.findIndex(a => a.id === attachmentId);

    if (attachmentIndex === -1) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    attachments.splice(attachmentIndex, 1);
    await disclosure.update({ attachments });

    res.json({
      message: 'Attachment removed',
      totalAttachments: attachments.length,
    });
  } catch (error) {
    console.error('Remove attachment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// =====================================================
// PDF GENERATION
// =====================================================

// @desc    Generate PDF for disclosure
// @route   POST /api/disclosures/:id/generate-pdf
// @route   GET /api/disclosures/:id/pdf
// @access  Private
export const generatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const disclosure = await SellerDisclosure.findOne({
      where: { id },
      include: [
        { model: Property, as: 'property' },
        { model: User, as: 'seller', attributes: ['first_name', 'last_name', 'email'] }
      ]
    });

    if (!disclosure) {
      return res.status(404).json({ message: 'Disclosure not found' });
    }

    // Check access - seller or buyer in transaction can view
    if (disclosure.seller_id !== userId) {
      if (disclosure.status !== 'completed' && disclosure.status !== 'signed') {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Generate actual PDF
    const pdfResult = await pdfService.generateDisclosurePDF(
      disclosure,
      disclosure.property,
      disclosure.seller
    );

    // Update disclosure with PDF URL
    await disclosure.update({
      pdf_url: pdfResult.url,
      pdf_generated_at: new Date(),
    });

    res.json({
      message: 'PDF generated successfully',
      disclosure_id: id,
      property_address: disclosure.property?.getFullAddress?.() || disclosure.property?.address_line1,
      status: disclosure.status,
      completion: disclosure.calculateCompletion(),
      generated_at: new Date().toISOString(),
      pdf_url: pdfResult.url,
    });
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Share disclosure with buyer via email
// @route   POST /api/disclosures/:id/share
// @access  Private (seller only)
export const shareDisclosure = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipientEmail, recipientName, message } = req.body;
    const sellerId = req.user.id;

    if (!recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }

    const disclosure = await SellerDisclosure.findOne({
      where: { id, seller_id: sellerId },
      include: [
        { model: Property, as: 'property' },
        { model: User, as: 'seller', attributes: ['first_name', 'last_name', 'email'] }
      ]
    });

    if (!disclosure) {
      return res.status(404).json({ message: 'Disclosure not found' });
    }

    // Check if disclosure is ready to share
    if (disclosure.status === 'draft') {
      return res.status(400).json({
        message: 'Please complete more of the disclosure before sharing',
        completion: disclosure.calculateCompletion(),
      });
    }

    // Generate PDF if not already generated
    let pdfUrl = disclosure.pdf_url;
    if (!pdfUrl) {
      const pdfResult = await pdfService.generateDisclosurePDF(
        disclosure,
        disclosure.property,
        disclosure.seller
      );
      pdfUrl = pdfResult.url;
      await disclosure.update({
        pdf_url: pdfUrl,
        pdf_generated_at: new Date(),
      });
    }

    // Generate unique access token for tracking
    const accessToken = crypto.randomBytes(32).toString('hex');

    // Check if recipient is an existing user
    const recipientUser = await User.findOne({ where: { email: recipientEmail } });

    // Create SharedDisclosure record for tracking
    const sharedDisclosure = await SharedDisclosure.create({
      disclosure_id: id,
      recipient_email: recipientEmail,
      recipient_name: recipientName || null,
      recipient_user_id: recipientUser?.id || null,
      shared_by: sellerId,
      message: message || null,
      access_token: accessToken,
      status: 'pending',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // Generate view link with tracking token
    const viewUrl = `${process.env.FRONTEND_URL || 'https://move-it.com'}/buyer/disclosure/${sharedDisclosure.id}`;

    // Send email notification
    await emailService.sendDisclosureShared({
      to: recipientEmail,
      recipientName: recipientName || 'Buyer',
      sellerName: `${disclosure.seller?.first_name || ''} ${disclosure.seller?.last_name || ''}`.trim() || 'Seller',
      propertyAddress: disclosure.property?.getFullAddress?.() || disclosure.property?.address_line1 || 'Property',
      viewUrl,
      pdfUrl,
      message,
    });

    // Track the share event
    await analyticsService.trackEvent({
      disclosureId: id,
      eventType: 'shared',
      userId: sellerId,
      metadata: {
        share_id: sharedDisclosure.id,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      message: 'Disclosure shared successfully',
      sentTo: recipientEmail,
      shareId: sharedDisclosure.id,
      viewUrl,
      pdfUrl,
    });
  } catch (error) {
    console.error('Share disclosure error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to structure disclosure data for PDF
function generateDisclosurePDFData(disclosure) {
  const property = disclosure.property || {};

  return {
    header: {
      form_title: "SELLER'S DISCLOSURE NOTICE",
      form_number: "TXR-1406",
      property_address: property.getFullAddress ? property.getFullAddress() : '',
      seller_name: disclosure.seller
        ? `${disclosure.seller.first_name} ${disclosure.seller.last_name}`
        : '',
      date: new Date().toLocaleDateString(),
    },
    sections: [
      {
        number: 1,
        title: 'Property Items',
        data: {
          items: disclosure.section1_property_items || {},
          water_supply: disclosure.section1_water_supply || {},
          roof_info: disclosure.section1_roof_info || {},
          defects_explanation: disclosure.section1_defects_explanation,
        }
      },
      {
        number: 2,
        title: 'Defects or Malfunctions',
        data: {
          defects: disclosure.section2_defects || {},
          explanation: disclosure.section2_explanation,
        }
      },
      {
        number: 3,
        title: 'Awareness of Conditions',
        data: {
          conditions: disclosure.section3_conditions || {},
          explanation: disclosure.section3_explanation,
        }
      },
      {
        number: 4,
        title: 'Additional Repairs',
        data: {
          additional_repairs: disclosure.section4_additional_repairs,
          explanation: disclosure.section4_explanation,
        }
      },
      {
        number: 5,
        title: 'Flood-Related Conditions',
        data: {
          flood_data: disclosure.section5_flood_data || {},
          explanation: disclosure.section5_explanation,
        }
      },
      {
        number: 6,
        title: 'Flood Insurance Claims',
        data: {
          flood_claim: disclosure.section6_flood_claim,
          explanation: disclosure.section6_explanation,
        }
      },
      {
        number: 7,
        title: 'FEMA/SBA Assistance',
        data: {
          fema_assistance: disclosure.section7_fema_assistance,
          explanation: disclosure.section7_explanation,
        }
      },
      {
        number: 8,
        title: 'Legal, HOA, and Property Conditions',
        data: {
          conditions: disclosure.section8_conditions || {},
          hoa_details: disclosure.section8_hoa_details || {},
          common_areas: disclosure.section8_common_areas || {},
          explanation: disclosure.section8_explanation,
        }
      },
      {
        number: 9,
        title: 'Inspection Reports',
        data: {
          has_reports: disclosure.section9_has_reports,
          reports: disclosure.section9_reports || [],
        }
      },
      {
        number: 10,
        title: 'Tax Exemptions',
        data: {
          exemptions: disclosure.section10_exemptions || [],
        }
      },
      {
        number: 11,
        title: 'Insurance Claims',
        data: {
          insurance_claims: disclosure.section11_insurance_claims,
        }
      },
      {
        number: 12,
        title: 'Unremediated Claims',
        data: {
          unremediated_claims: disclosure.section12_unremediated_claims,
          explanation: disclosure.section12_explanation,
        }
      },
      {
        number: 13,
        title: 'Smoke Detectors',
        data: {
          smoke_detectors: disclosure.section13_smoke_detectors,
          explanation: disclosure.section13_explanation,
        }
      },
    ],
    utilities: disclosure.utility_providers || {},
    signatures: {
      seller1: disclosure.seller1_signature,
      seller2: disclosure.seller2_signature,
      buyer1: disclosure.buyer1_signature,
      buyer2: disclosure.buyer2_signature,
    },
    attachments: disclosure.attachments || [],
  };
}
