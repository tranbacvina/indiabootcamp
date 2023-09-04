"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class orderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.order, { foreignKey: "orderID" });
      this.belongsTo(models.course, { foreignKey: "courseID" });
    }
  }
  orderItem.init(
    {
      orderID: DataTypes.INTEGER,
      courseID: DataTypes.INTEGER,
      status: DataTypes.STRING,
      driveDaGui: DataTypes.STRING,
      isOneDrive: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: "orderItem",
      timestamps: false,
    }
  );
  return orderItem;
};
