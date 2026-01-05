import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const FSBOChecklist = sequelize.define('FSBOChecklist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  property_id: {
    type: DataTypes.UUID,
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

  // Overall status
  status: {
    type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
    defaultValue: 'not_started',
  },
  completion_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  // Category 1: Property Details
  property_details: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: {
    //   property_address: { checked: false, notes: '' },
    //   year_built: { checked: false, notes: '' },
    //   bedrooms_bathrooms: { checked: false, notes: '' },
    //   square_footage: { checked: false, notes: '' },
    //   lot_size: { checked: false, notes: '' },
    //   property_type: { checked: false, notes: '' },
    //   parking_details: { checked: false, notes: '' }
    // }
  },

  // Category 2: HOA (If Applicable)
  hoa_info: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: {
    //   has_hoa: null, // true/false/null
    //   hoa_name: { checked: false, notes: '' },
    //   dues_coverage: { checked: false, notes: '' },
    //   rental_restrictions: { checked: false, notes: '' }
    // }
  },

  // Category 3: Ownership & Legal
  ownership_legal: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: {
    //   clear_title: { checked: false, notes: '' },
    //   mortgage_payoff: { checked: false, notes: '' },
    //   no_liens: { checked: false, notes: '' },
    //   taxes_current: { checked: false, notes: '' },
    //   disclosures_ready: { checked: false, notes: '' }
    // }
  },

  // Category 4: Pricing
  pricing: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: {
    //   market_value: { checked: false, notes: '' },
    //   comps_reviewed: { checked: false, notes: '' },
    //   listing_price_set: { checked: false, notes: '' },
    //   minimum_price: { checked: false, notes: '' },
    //   buyer_concessions: { checked: false, notes: '' }
    // }
  },

  // Category 5: Property Condition
  property_condition: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: {
    //   roof_age: { checked: false, notes: '' },
    //   hvac_age: { checked: false, notes: '' },
    //   water_heater_age: { checked: false, notes: '' },
    //   repairs_upgrades: { checked: false, notes: '' },
    //   known_issues: { checked: false, notes: '' }
    // }
  },

  // Category 6: Photos & Marketing
  photos_marketing: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: {
    //   professional_photos: { checked: false, notes: '' },
    //   virtual_tour: { checked: false, notes: '' },
    //   features_highlighted: { checked: false, notes: '' },
    //   listing_description: { checked: false, notes: '' },
    //   platforms_selected: { checked: false, notes: '' }
    // }
  },

  // Category 7: Showings
  showings: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: {
    //   showing_schedule: { checked: false, notes: '' },
    //   access_instructions: { checked: false, notes: '' },
    //   occupancy_status: { checked: false, notes: '' }
    // }
  },

  // Category 8: Offers & Closing
  offers_closing: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Structure: {
    //   accepted_financing: { checked: false, notes: '' },
    //   ideal_closing_date: { checked: false, notes: '' },
    //   title_company: { checked: false, notes: '' },
    //   closing_costs: { checked: false, notes: '' },
    //   buyer_faq: { checked: false, notes: '' }
    // }
  },

  // Auto-save tracking
  last_auto_save: {
    type: DataTypes.DATE,
  },

}, {
  tableName: 'fsbo_checklists',
  timestamps: true,
  underscored: true,
});

// Calculate completion percentage
FSBOChecklist.prototype.calculateCompletion = function() {
  const categories = [
    { data: this.property_details, items: 7 },
    { data: this.hoa_info, items: 3, optional: true },
    { data: this.ownership_legal, items: 5 },
    { data: this.pricing, items: 5 },
    { data: this.property_condition, items: 5 },
    { data: this.photos_marketing, items: 5 },
    { data: this.showings, items: 3 },
    { data: this.offers_closing, items: 5 },
  ];

  let totalChecked = 0;
  let totalItems = 0;

  categories.forEach(category => {
    // Skip HOA if not applicable
    if (category.optional && category.data?.has_hoa === false) {
      return;
    }

    const data = category.data || {};
    Object.keys(data).forEach(key => {
      if (key !== 'has_hoa' && typeof data[key] === 'object') {
        totalItems++;
        if (data[key]?.checked) {
          totalChecked++;
        }
      }
    });
  });

  return totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;
};

// Get category summaries
FSBOChecklist.prototype.getCategorySummaries = function() {
  const countChecked = (data) => {
    if (!data) return { checked: 0, total: 0 };
    let checked = 0;
    let total = 0;
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'object' && data[key] !== null && 'checked' in data[key]) {
        total++;
        if (data[key].checked) checked++;
      }
    });
    return { checked, total };
  };

  return {
    property_details: { name: 'Property Details', ...countChecked(this.property_details) },
    hoa_info: {
      name: 'HOA Information',
      ...countChecked(this.hoa_info),
      applicable: this.hoa_info?.has_hoa !== false
    },
    ownership_legal: { name: 'Ownership & Legal', ...countChecked(this.ownership_legal) },
    pricing: { name: 'Pricing', ...countChecked(this.pricing) },
    property_condition: { name: 'Property Condition', ...countChecked(this.property_condition) },
    photos_marketing: { name: 'Photos & Marketing', ...countChecked(this.photos_marketing) },
    showings: { name: 'Showings', ...countChecked(this.showings) },
    offers_closing: { name: 'Offers & Closing', ...countChecked(this.offers_closing) },
  };
};

export default FSBOChecklist;
