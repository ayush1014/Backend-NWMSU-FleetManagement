const db = require('../DBConfig/db_config');
const {Sequelize, DataTypes} = require('sequelize');
const Users = require('../Models/User');

const Vehicles = db.define('Vehicle', {
    NWVehicleNo:{
        primaryKey: true,
        type: DataTypes.STRING,
        allowNull: false
    },

    VIN: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    modelYear: {
        type: DataTypes.SMALLINT,
        allowNul: false,
        validate: {
            min: 0, 
            max(value) {
                const currentYear = new Date().getFullYear(); 
                if (value > currentYear) {
                    throw new Error(`Year cannot be greater than ${currentYear}`);
                }
        }
    }},

    make: {
        type: DataTypes.STRING,
        allowNull: false
    },

    model: {
        type: DataTypes.STRING,
        allowNull: false
    },

    purchaseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },

    startingMileage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0 //ensures only non-negative values
        }
    },

    weight: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    vehType: {
        type: DataTypes.STRING,
        allowNull: false
    },

    vehDescription: {
        type: DataTypes.STRING,
        allowNull: false
    },

    isExempt: {
        type: DataTypes.STRING,
        allowNull: false
    },

    vehiclePic: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    vehicleDepartment: {
        type: DataTypes.STRING,
        allowNull: true
    },

    color: {
        type: DataTypes.STRING,
        allowNull: true
    },

    licensePlate: {
        type: DataTypes.STRING,
        allowNull: true
    },

    addBy: {
        type: DataTypes.STRING,
        allowNull: false,
    }
})

Users.hasMany(Vehicles, { foreignKey: 'addBy' });
Vehicles.belongsTo(Users, { foreignKey: 'addBy' });


module.exports = Vehicles;