'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Media extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  } 
  Media.init({
    alternativeText: DataTypes.STRING,
    title: DataTypes.STRING,
    caption: DataTypes.STRING,
    description: DataTypes.STRING,
    fileUrl: DataTypes.STRING,
    isDeleted: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Media',
  });
  return Media;
};