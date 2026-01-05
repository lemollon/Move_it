import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const SellerDisclosure = sequelize.define('SellerDisclosure', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  property_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id',
    },
  },
  seller_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },

  // Form status tracking
  status: {
    type: DataTypes.ENUM('draft', 'in_progress', 'completed', 'signed'),
    defaultValue: 'draft',
  },
  current_section: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  completion_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  // Header Fields
  header_data: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: { property_address, seller_occupancy, unoccupied_duration }
  },

  // Section 1: Property Items (Y/N/U responses + additional fields)
  section1_property_items: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: { cable_tv_wiring: 'Y'|'N'|'U', central_ac: { value: 'Y', type: 'electric', units: 2 }, ... }
  },
  section1_water_supply: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: { provider: 'city'|'well'|'MUD'|'co-op'|'unknown'|'other', other_specify: '' }
  },
  section1_roof_info: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: { built_before_1978: 'yes'|'no'|'unknown', roof_type: '', roof_age: '', overlay_roof: '' }
  },
  section1_defects_explanation: {
    type: DataTypes.TEXT,
  },

  // Section 2: Defects or Malfunctions
  section2_defects: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: { basement: true|false, ceilings: true|false, ... }
  },
  section2_explanation: {
    type: DataTypes.TEXT,
  },

  // Section 3: Awareness of Conditions
  section3_conditions: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: { aluminum_wiring: true|false, asbestos_components: true|false, ... }
  },
  section3_explanation: {
    type: DataTypes.TEXT,
  },

  // Section 4: Additional Repair Needs
  section4_additional_repairs: {
    type: DataTypes.BOOLEAN,
  },
  section4_explanation: {
    type: DataTypes.TEXT,
  },

  // Section 5: Flood-Related Conditions
  section5_flood_data: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: { flood_insurance_present: true|false, flood_100yr_floodplain: { value: true, extent: 'wholly'|'partly' }, ... }
  },
  section5_explanation: {
    type: DataTypes.TEXT,
  },

  // Section 6: Flood Insurance Claims
  section6_flood_claim: {
    type: DataTypes.BOOLEAN,
  },
  section6_explanation: {
    type: DataTypes.TEXT,
  },

  // Section 7: FEMA/SBA Assistance
  section7_fema_assistance: {
    type: DataTypes.BOOLEAN,
  },
  section7_explanation: {
    type: DataTypes.TEXT,
  },

  // Section 8: Legal, HOA, and Property Conditions
  section8_conditions: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: { unpermitted_work: true|false, hoa_exists: true|false, ... }
  },
  section8_hoa_details: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: { name: '', manager_name: '', manager_phone: '', fees_amount: 0, fees_period: '', fees_type: '', unpaid_fees: false, unpaid_amount: 0 }
  },
  section8_common_areas: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: { user_fees: true|false, describe: '' }
  },
  section8_explanation: {
    type: DataTypes.TEXT,
  },

  // Section 9: Previous Inspection Reports
  section9_has_reports: {
    type: DataTypes.BOOLEAN,
  },
  section9_reports: {
    type: DataTypes.JSONB,
    defaultValue: [],
    // Structure: [{ inspection_date: '', inspection_type: '', inspector_name: '', report_pages: 0 }]
  },

  // Section 10: Tax Exemptions
  section10_exemptions: {
    type: DataTypes.JSONB,
    defaultValue: [],
    // Structure: ['homestead', 'senior_citizen', 'disabled', ...] or { exemptions: [], other_specify: '' }
  },

  // Section 11: Insurance Claims (Non-Flood)
  section11_insurance_claims: {
    type: DataTypes.BOOLEAN,
  },

  // Section 12: Unremediated Claims
  section12_unremediated_claims: {
    type: DataTypes.BOOLEAN,
  },
  section12_explanation: {
    type: DataTypes.TEXT,
  },

  // Section 13: Smoke Detectors
  section13_smoke_detectors: {
    type: DataTypes.ENUM('yes', 'no', 'unknown'),
  },
  section13_explanation: {
    type: DataTypes.TEXT,
  },

  // Utility Providers
  utility_providers: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: { electric: { provider: '', phone: '' }, water: { provider: '', phone: '' }, ... }
  },

  // Seller Signatures
  seller1_signature: {
    type: DataTypes.JSONB,
    defaultValue: null,
    // Structure: { signature_data: '', printed_name: '', date: '' }
  },
  seller2_signature: {
    type: DataTypes.JSONB,
    defaultValue: null,
  },

  // Buyer Signatures (after review)
  buyer1_signature: {
    type: DataTypes.JSONB,
    defaultValue: null,
    // Structure: { signature_data: '', printed_name: '', date: '' }
  },
  buyer2_signature: {
    type: DataTypes.JSONB,
    defaultValue: null,
  },

  // Attachments (inspection reports, HOA docs, etc.)
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: [],
    // Structure: [{ id: '', name: '', type: '', url: '', size: 0, uploaded_at: '' }]
  },

  // PDF Export
  pdf_url: {
    type: DataTypes.STRING(500),
  },
  pdf_generated_at: {
    type: DataTypes.DATE,
  },

  // Auto-save tracking
  last_auto_save: {
    type: DataTypes.DATE,
  },

}, {
  tableName: 'seller_disclosures',
  timestamps: true,
  underscored: true,
});

// Calculate completion percentage based on filled sections
SellerDisclosure.prototype.calculateCompletion = function() {
  const sections = [
    { data: this.section1_property_items, weight: 15 },
    { data: this.section2_defects, weight: 10 },
    { data: this.section3_conditions, weight: 15 },
    { data: this.section4_additional_repairs !== null, weight: 5 },
    { data: this.section5_flood_data, weight: 10 },
    { data: this.section6_flood_claim !== null, weight: 5 },
    { data: this.section7_fema_assistance !== null, weight: 5 },
    { data: this.section8_conditions, weight: 10 },
    { data: this.section9_has_reports !== null, weight: 5 },
    { data: this.section10_exemptions, weight: 5 },
    { data: this.section11_insurance_claims !== null, weight: 5 },
    { data: this.section12_unremediated_claims !== null, weight: 5 },
    { data: this.section13_smoke_detectors !== null, weight: 5 },
  ];

  let completed = 0;
  sections.forEach(section => {
    if (typeof section.data === 'boolean' || section.data === true) {
      completed += section.weight;
    } else if (section.data && typeof section.data === 'object' && Object.keys(section.data).length > 0) {
      completed += section.weight;
    }
  });

  return Math.min(completed, 100);
};

// Get summary of sections with issues
SellerDisclosure.prototype.getSectionsSummary = function() {
  return {
    section1: { name: 'Property Items', completed: Object.keys(this.section1_property_items || {}).length > 0 },
    section2: { name: 'Defects/Malfunctions', completed: Object.keys(this.section2_defects || {}).length > 0 },
    section3: { name: 'Conditions', completed: Object.keys(this.section3_conditions || {}).length > 0 },
    section4: { name: 'Additional Repairs', completed: this.section4_additional_repairs !== null },
    section5: { name: 'Flood Conditions', completed: Object.keys(this.section5_flood_data || {}).length > 0 },
    section6: { name: 'Flood Claims', completed: this.section6_flood_claim !== null },
    section7: { name: 'FEMA/SBA Assistance', completed: this.section7_fema_assistance !== null },
    section8: { name: 'Legal/HOA', completed: Object.keys(this.section8_conditions || {}).length > 0 },
    section9: { name: 'Inspection Reports', completed: this.section9_has_reports !== null },
    section10: { name: 'Tax Exemptions', completed: (this.section10_exemptions || []).length > 0 },
    section11: { name: 'Insurance Claims', completed: this.section11_insurance_claims !== null },
    section12: { name: 'Unremediated Claims', completed: this.section12_unremediated_claims !== null },
    section13: { name: 'Smoke Detectors', completed: this.section13_smoke_detectors !== null },
  };
};

// Validate required fields for completion
SellerDisclosure.prototype.validateForCompletion = function() {
  const errors = [];
  const warnings = [];

  // Section 1: Required - roof info
  const roofInfo = this.section1_roof_info || {};
  if (!roofInfo.built_before_1978) {
    errors.push({ section: 1, field: 'built_before_1978', message: 'Please indicate if property was built before 1978' });
  }
  if (!roofInfo.roof_type) {
    errors.push({ section: 1, field: 'roof_type', message: 'Roof type is required' });
  }
  if (!roofInfo.roof_age) {
    errors.push({ section: 1, field: 'roof_age', message: 'Roof age is required' });
  }

  // Section 1: Required - water supply
  const waterSupply = this.section1_water_supply || {};
  if (!waterSupply.provider) {
    errors.push({ section: 1, field: 'water_provider', message: 'Water supply provider is required' });
  }

  // Section 4: Required
  if (this.section4_additional_repairs === null) {
    errors.push({ section: 4, field: 'additional_repairs', message: 'Please indicate if additional repairs are needed' });
  }

  // Section 5: Required flood questions
  const floodData = this.section5_flood_data || {};
  if (floodData.flood_insurance_present === undefined) {
    errors.push({ section: 5, field: 'flood_insurance', message: 'Please indicate if flood insurance is present' });
  }

  // Section 6: Required
  if (this.section6_flood_claim === null) {
    errors.push({ section: 6, field: 'flood_claim', message: 'Please indicate if flood claims were filed' });
  }

  // Section 7: Required
  if (this.section7_fema_assistance === null) {
    errors.push({ section: 7, field: 'fema_assistance', message: 'Please indicate if FEMA/SBA assistance was received' });
  }

  // Section 9: Required
  if (this.section9_has_reports === null) {
    errors.push({ section: 9, field: 'has_reports', message: 'Please indicate if inspection reports exist' });
  }

  // Section 11: Required
  if (this.section11_insurance_claims === null) {
    errors.push({ section: 11, field: 'insurance_claims', message: 'Please indicate if insurance claims were filed' });
  }

  // Section 12: Required
  if (this.section12_unremediated_claims === null) {
    errors.push({ section: 12, field: 'unremediated_claims', message: 'Please indicate if there are unremediated claims' });
  }

  // Section 13: Required
  if (!this.section13_smoke_detectors) {
    errors.push({ section: 13, field: 'smoke_detectors', message: 'Please indicate smoke detector status' });
  }

  // Warnings (not blocking but recommended)
  if (Object.keys(this.section1_property_items || {}).length < 5) {
    warnings.push({ section: 1, message: 'Consider reviewing more property items' });
  }

  if (!this.utility_providers || Object.keys(this.utility_providers).length === 0) {
    warnings.push({ section: 'utilities', message: 'Utility provider information is recommended' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    errorCount: errors.length,
    warningCount: warnings.length,
  };
};

// Get fields that need attention
SellerDisclosure.prototype.getIncompleteFields = function() {
  const incomplete = [];
  const summary = this.getSectionsSummary();

  Object.entries(summary).forEach(([key, value]) => {
    if (!value.completed) {
      incomplete.push({
        section: key,
        name: value.name,
      });
    }
  });

  return incomplete;
};

export default SellerDisclosure;
