'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('courses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      image: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.FLOAT
      },
      priceindia: {
        type: Sequelize.FLOAT
      },
      priceus: {
        type: Sequelize.FLOAT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      is_practice_test_course: {
        type: Sequelize.BOOLEAN
      },
      slug: {
        type: Sequelize.STRING
      },
      description_log: {
        type: Sequelize.TEXT('long')
      },
      whatyouwilllearn: {
        type: Sequelize.JSON
      },
      requirements: {
        type: Sequelize.JSON
      },
      topicId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Topics",
          key: "id"
        }
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('courses');
  }
};