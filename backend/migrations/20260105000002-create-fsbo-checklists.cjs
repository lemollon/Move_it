'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create enum type first
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE fsbo_status AS ENUM ('not_started', 'in_progress', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.createTable('fsbo_checklists', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      property_id: {
        type: Sequelize.UUID,
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

      // Overall status
      status: {
        type: Sequelize.ENUM('not_started', 'in_progress', 'completed'),
        defaultValue: 'not_started',
      },
      completion_percentage: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      // Category 1: Property Details
      property_details: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },

      // Category 2: HOA (If Applicable)
      hoa_info: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },

      // Category 3: Ownership & Legal
      ownership_legal: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },

      // Category 4: Pricing
      pricing: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },

      // Category 5: Property Condition
      property_condition: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },

      // Category 6: Photos & Marketing
      photos_marketing: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },

      // Category 7: Showings
      showings: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },

      // Category 8: Offers & Closing
      offers_closing: {
        type: Sequelize.JSONB,
        defaultValue: {},
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
    await queryInterface.addIndex('fsbo_checklists', ['property_id']);
    await queryInterface.addIndex('fsbo_checklists', ['seller_id']);
    await queryInterface.addIndex('fsbo_checklists', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('fsbo_checklists');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS fsbo_status;');
  },
};
