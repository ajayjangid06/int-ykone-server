const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Client = sequelize.define('Client', {
    cin: {
        type: DataTypes.STRING(21),
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    pin: {
        type: DataTypes.STRING(6),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
});

module.exports = { Client };
