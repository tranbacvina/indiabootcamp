'use strict';
const {
  Model
} = require('sequelize');
const SequelizeSlugify = require('sequelize-slugify')

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Blog, { foreignKey: "categoryId" })
    }
  }
  Category.init({
    name: DataTypes.STRING,
    slug: { type: DataTypes.STRING, unique: true },
    seotitle: DataTypes.STRING,
    seodescription: DataTypes.STRING,
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Category',
    timestamps: false,
  });
  SequelizeSlugify.slugifyModel(Category, {
    source: ['name']
  });
  return Category;
}; 