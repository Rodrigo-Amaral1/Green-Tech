'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('boletos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nome_sacado: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      id_lote: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'lotes',
          key: 'id'
        }
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      linha_digitavel: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('boletos', ['id_lote']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('boletos');
  }
}; 