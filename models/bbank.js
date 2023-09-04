'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class BBank extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    BBank.init({
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        balance: DataTypes.INTEGER,
        token: DataTypes.STRING,
        lastLogined: DataTypes.INTEGER,
        deviceId: DataTypes.STRING,
        custId: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'BBank',
    });
    return BBank;
};