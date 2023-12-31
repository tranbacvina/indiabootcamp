"use strict";
const { Model } = require("sequelize");
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
    }
  }
  course.init(
    {
      name: DataTypes.STRING,
      url: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.STRING,
      price: DataTypes.FLOAT,
      priceindia: {
        type: DataTypes.FLOAT,
        defaultValue: 9900,
      },
      priceus: {
        type: DataTypes.FLOAT,
        defaultValue: 300,
      },
      is_practice_test_course: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "course",
    }
  );
  return course;
};
