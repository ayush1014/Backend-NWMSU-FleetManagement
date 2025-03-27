const db = require('../DBConfig/db_config');
const {Sequelize, DataTypes} = require('sequelize');

const Users = db.define('User', {
    email:{
        primaryKey: true,
        type: DataTypes.STRING
    },

    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },

    role: {
        type: DataTypes.STRING,
        allowNull: false
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    profile_pic: {
        type: DataTypes.TEXT,
        allowNull: true
    }
    
})

module.exports = Users;