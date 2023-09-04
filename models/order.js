"use strict";
const { Model } = require("sequelize");
const { makePaginate } = require('sequelize-cursor-pagination');

module.exports = (sequelize, DataTypes) => {
  class order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.orderItem, { foreignKey: "orderID" });
    }
  }
  order.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      uuid: DataTypes.UUID,
      email: DataTypes.STRING,
      price: DataTypes.FLOAT,
      priceck: DataTypes.FLOAT,
      priceindia: DataTypes.FLOAT,
      priceus: DataTypes.FLOAT,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "order",
    }
  );
  order.paginate = makePaginate(order);

  return order;
};
