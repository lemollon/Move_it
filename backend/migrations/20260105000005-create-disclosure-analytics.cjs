'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('disclosure_analytics', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      disclosure_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'seller_disclosures',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      event_type: {
        type: Sequelize.ENUM(
          'created',
          'viewed',
          'updated',
          'section_saved',
          'completed',
          'signed_seller',
          'signed_buyer',
          'pdf_generated',
          'shared',
          'share_viewed',
          'share_acknowledged',
          'share_signed',
          'attachment_added',
          'attachment_removed'
        ),
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      ip_address: {
        type: Sequelize.STRING(45),
      },
      user_agent: {
        type: Sequelize.STRING(500),
      },
      event_timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for performance
    await queryInterface.addIndex('disclosure_analytics', ['disclosure_id']);
    await queryInterface.addIndex('disclosure_analytics', ['event_type']);
    await queryInterface.addIndex('disclosure_analytics', ['user_id']);
    await queryInterface.addIndex('disclosure_analytics', ['event_timestamp']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('disclosure_analytics');
  },
};
