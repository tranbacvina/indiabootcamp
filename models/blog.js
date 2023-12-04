'use strict';
const {
  Model
} = require('sequelize');
const SequelizeSlugify = require('sequelize-slugify')
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Category, { foreignKey: "categoryId" });
      this.belongsToMany(models.course, {through: 'blogCourse'});

    }
  }
  Blog.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    content: DataTypes.TEXT,
    keywords: DataTypes.STRING,
    slug: { type: DataTypes.STRING, unique: true },
    thumbnail: DataTypes.STRING,
    categoryId: DataTypes.INTEGER,
    courseId: DataTypes.INTEGER,
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Blog',
  });
  SequelizeSlugify.slugifyModel(Blog, {
    source: ['title']
  });

  return Blog;
};