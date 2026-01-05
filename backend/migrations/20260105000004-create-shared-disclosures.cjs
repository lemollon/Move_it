'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shared_disclosures', {
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
      recipient_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      recipient_name: {
        type: Sequelize.STRING(255),
      },
      recipient_user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      shared_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      message: {
        type: Sequelize.TEXT,
      },
      access_token: {
        type: Sequelize.STRING(255),
        unique: true,
      },
      first_viewed_at: {
        type: Sequelize.DATE,
      },
      last_viewed_at: {
        type: Sequelize.DATE,
      },
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('pending', 'viewed', 'acknowledged', 'signed'),
        defaultValue: 'pending',
      },
      acknowledged_at: {
        type: Sequelize.DATE,
      },
      signed_at: {
        type: Sequelize.DATE,
      },
      expires_at: {
        type: Sequelize.DATE,
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

    // Add indexes
    await queryInterface.addIndex('shared_disclosures', ['disclosure_id']);
    await queryInterface.addIndex('shared_disclosures', ['recipient_email']);
    await queryInterface.addIndex('shared_disclosures', ['recipient_user_id']);
    await queryInterface.addIndex('shared_disclosures', ['access_token']);
    await queryInterface.addIndex('shared_disclosures', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('shared_disclosures');
  },
};
