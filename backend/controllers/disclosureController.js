import { SellerDisclosure, FSBOChecklist, Property, User } from '../models/index.js';

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

    if (!disclosure) {
      // Create new disclosure with property address pre-filled
      disclosure = await SellerDisclosure.create({
        property_id: propertyId,
        seller_id: sellerId,
        header_data: {
          property_address: property.getFullAddress()
        },
        status: 'draft'
      });
    }

    const completion = disclosure.calculateCompletion();
    const sectionsSummary = disclosure.getSectionsSummary();

    res.status(201).json({
      disclosure,
      completion,
      sectionsSummary
    });
  } catch (error) {
    console.error('Create disclosure error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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

// @desc    Mark disclosure as completed
// @route   POST /api/disclosures/:id/complete
// @access  Private (seller only)
export const completeDisclosure = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const disclosure = await SellerDisclosure.findOne({
      where: { id, seller_id: sellerId }
    });

    if (!disclosure) {
      return res.status(404).json({ message: 'Disclosure not found' });
    }

    // Check minimum completion
    const completion = disclosure.calculateCompletion();
    if (completion < 80) {
      return res.status(400).json({
        message: 'Disclosure must be at least 80% complete',
        current_completion: completion
      });
    }

    await disclosure.update({ status: 'completed' });

    res.json({
      message: 'Disclosure marked as completed',
      disclosure
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
