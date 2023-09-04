"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class driveCourse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.course, { foreignKey: "idCourse" });
    }
  }
  driveCourse.init(
    {
      name: DataTypes.STRING,
      idDrive: DataTypes.STRING,
      idCourse: DataTypes.INTEGER,
      isOneDrive: DataTypes.BOOLEAN,
      OneDriveParentReferenceId: DataTypes.STRING,
    },

    {
      sequelize,
      modelName: "driveCourse",
      timestamps: false,

    },
  );
  return driveCourse;
};
