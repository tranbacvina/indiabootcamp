"use strict";
const { Model } = require("sequelize");
const SequelizeSlugify = require('sequelize-slugify')

module.exports = (sequelize, DataTypes) => {
  class course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.driveCourse, { foreignKey: "idCourse" });
      this.hasMany(models.orderItem, { foreignKey: "courseID" });
      this.hasMany(models.rating, { foreignKey: "courseId" } );
      this.belongsToMany(models.Topic, { through: models.course_topic, foreignKey: "course_id" } );
    }
  }
  course.init(
    {
      name: DataTypes.STRING,
      url: DataTypes.STRING,
      slug: { type: DataTypes.STRING, unique: true },
      description: DataTypes.TEXT,
      description_log: DataTypes.TEXT('long'),
      whatyouwilllearn: DataTypes.JSON,
      requirements: DataTypes.JSON,
      sections: DataTypes.JSON,
      image: DataTypes.STRING,
      price: DataTypes.FLOAT,
      originprice: DataTypes.FLOAT,
      // TopicID:DataTypes.INTEGER, 
      priceindia: {
        type: DataTypes.FLOAT,
        defaultValue: 9900,
      },
      priceus: {
        type: DataTypes.FLOAT,
        defaultValue: 300,
      },
      is_practice_test_course: DataTypes.BOOLEAN,
      sharelinkfree: DataTypes.STRING,

    },
    {
      sequelize,
      modelName: "course",
    }
  );
  SequelizeSlugify.slugifyModel(course, {
    source: ['name']
  });
  return course;
};
