const db = require('../DBConfig/db_config');
const { DataTypes } = require('sequelize');
const Vehicle = require('../Models/Vehicle');
const Users = require('../Models/User');

const Refueling = db.define('Refueling', {
    refuelingId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    NWVehicleNo: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Vehicles', 
            key: 'NWVehicleNo'
        }
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    currentMileage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    fuelAdded: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    fuelCost: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    receiptImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    refueledBy: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Users', 
            key: 'email'
        }
    }
});

Users.hasMany(Refueling, {foreignKey: 'refueledBy'});
Refueling.belongsTo(Users, {foreignKey: 'refueledBy'});

module.exports = Refueling;

