'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Topic extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // this.belongsTo(models.course)
      this.belongsToMany(models.course, { through: models.course_topic, foreignKey: "topic_id" } );
      // this.hasOne(models.course, {
      //   foreignKey: 'topicId'
      // })
    }
  }
  Topic.init({
    name: DataTypes.STRING,
    slug: { type: DataTypes.STRING, },
    seotitle: DataTypes.STRING,
    seodescription: DataTypes.TEXT('medium'),
    parent_id: DataTypes.INTEGER,            
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
  
  return Topic;
}; 