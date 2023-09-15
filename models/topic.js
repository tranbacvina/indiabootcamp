'use strict';
const {
  Model
} = require('sequelize');
const SequelizeSlugify = require('sequelize-slugify')

module.exports = (sequelize, DataTypes) => {
  class Topic extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.course, { foreignKey: "topicId" })
    }
  }
  Topic.init({
    name: DataTypes.STRING,
    slug: { type: DataTypes.STRING, unique: true },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Topic',
    timestamps: false,
  });
  SequelizeSlugify.slugifyModel(Topic, {
    source: ['name']
  });
  return Topic;
}; 