"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("driveCourses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      idDrive: {
        type: Sequelize.STRING,
      },
      isOneDrive: { type: Sequelize.BOOLEAN },
      OneDriveParentReferenceId: {
        type: Sequelize.STRING,
      },
      idCourse: {
        type: Sequelize.INTEGER,
        references: {
          model: "courses",
          key: "id",
        },
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("driveCourses");
  },
};
