"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orderItems", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      orderID: {
        type: Sequelize.INTEGER,
        references: {
          model: "orders",
          key: "id",
        },
      },
      courseID: {
        type: Sequelize.INTEGER,
        references: {
          model: "courses",
          key: "id",
        },
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: "Chua gui",
      },
      driveDaGui: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      isOneDrive: {
        type: Sequelize.BOOLEAN,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("orderItems");
  },
};
