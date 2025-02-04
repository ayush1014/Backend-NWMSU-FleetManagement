const db = require('../DBConfig/db_config');
const {Sequelize, DataTypes} = require('sequelize');

const Users = db.define('User', {
    id:{
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },

    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    lastName: {
        type: DataTypes.STRING,
        allowNul: false
    },

    role: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    phone: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
})

module.exports = {Users}