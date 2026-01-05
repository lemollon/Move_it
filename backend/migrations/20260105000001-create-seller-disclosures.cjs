'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('seller_disclosures', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      property_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'properties',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      seller_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      // Form status tracking
      status: {
        type: Sequelize.ENUM('draft', 'in_progress', 'completed', 'signed'),
        defaultValue: 'draft',
      },
      current_section: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      completion_percentage: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      // Header Fields
      header_data: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },

      // Section 1: Property Items
      section1_property_items: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      section1_water_supply: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      section1_roof_info: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      section1_defects_explanation: {
        type: Sequelize.TEXT,
      },

      // Section 2: Defects or Malfunctions
      section2_defects: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      section2_explanation: {
        type: Sequelize.TEXT,
      },

      // Section 3: Awareness of Conditions
      section3_conditions: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      section3_explanation: {
        type: Sequelize.TEXT,
      },

      // Section 4: Additional Repair Needs
      section4_additional_repairs: {
        type: Sequelize.BOOLEAN,
      },
      section4_explanation: {
        type: Sequelize.TEXT,
      },

      // Section 5: Flood-Related Conditions
      section5_flood_data: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      section5_explanation: {
        type: Sequelize.TEXT,
      },

      // Section 6: Flood Insurance Claims
      section6_flood_claim: {
        type: Sequelize.BOOLEAN,
      },
      section6_explanation: {
        type: Sequelize.TEXT,
      },

      // Section 7: FEMA/SBA Assistance
      section7_fema_assistance: {
        type: Sequelize.BOOLEAN,
      },
      section7_explanation: {
        type: Sequelize.TEXT,
      },

      // Section 8: Legal, HOA, and Property Conditions
      section8_conditions: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      section8_hoa_details: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      section8_common_areas: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      section8_explanation: {
        type: Sequelize.TEXT,
      },

      // Section 9: Previous Inspection Reports
      section9_has_reports: {
        type: Sequelize.BOOLEAN,
      },
      section9_reports: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },

      // Section 10: Tax Exemptions
      section10_exemptions: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },

      // Section 11: Insurance Claims (Non-Flood)
      section11_insurance_claims: {
        type: Sequelize.BOOLEAN,
      },

      // Section 12: Unremediated Claims
      section12_unremediated_claims: {
        type: Sequelize.BOOLEAN,
      },
      section12_explanation: {
        type: Sequelize.TEXT,
      },

      // Section 13: Smoke Detectors
      section13_smoke_detectors: {
        type: Sequelize.ENUM('yes', 'no', 'unknown'),
      },
      section13_explanation: {
        type: Sequelize.TEXT,
      },

      // Utility Providers
      utility_providers: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },

      // Seller Signatures
      seller1_signature: {
        type: Sequelize.JSONB,
        defaultValue: null,
      },
      seller2_signature: {
        type: Sequelize.JSONB,
        defaultValue: null,
      },

      // Buyer Signatures (after review)
      buyer1_signature: {
        type: Sequelize.JSONB,
        defaultValue: null,
      },
      buyer2_signature: {
        type: Sequelize.JSONB,
        defaultValue: null,
      },

      // Attachments
      attachments: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },

      // PDF Export
      pdf_url: {
        type: Sequelize.STRING(500),
      },
      pdf_generated_at: {
        type: Sequelize.DATE,
      },

      // Auto-save tracking
      last_auto_save: {
        type: Sequelize.DATE,
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('seller_disclosures', ['property_id']);
    await queryInterface.addIndex('seller_disclosures', ['seller_id']);
    await queryInterface.addIndex('seller_disclosures', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('seller_disclosures');
  },
};
