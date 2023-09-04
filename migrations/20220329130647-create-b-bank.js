'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('BBanks', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            username: {
                type: Sequelize.STRING
            },
            password: {
                type: Sequelize.STRING
            },
            balance: {
                type: Sequelize.INTEGER
            },
            token: {
                type: Sequelize.STRING
            },
            lastLogined: {
                type: Sequelize.INTEGER
            },
            deviceId: {
                type: Sequelize.STRING
            },
            custId: {
                type: Sequelize.STRING
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('BBanks');
    }
};