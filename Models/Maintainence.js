const db = require('../DBConfig/db_config');
const { DataTypes } = require('sequelize');
const Vehicle = require('../Models/Vehicle');
const Users = require('../Models/User');

const Maintainence = db.define('Maintainence', {
    maintainenceId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    NWVehicleNo: {
        type: DataTypes.STRING,
        allowNull: false,
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
    maintainenceDescription: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    maintainenceCost: {
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
    maintainenceBy: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

Users.hasMany(Maintainence, { foreignKey: 'maintainenceBy' });
Maintainence.belongsTo(Users, { foreignKey: 'maintainenceBy' });

Vehicle.hasMany(Maintainence, { foreignKey: 'NWVehicleNo' });
Maintainence.belongsTo(Vehicle, { foreignKey: 'NWVehicleNo' });

module.exports = Maintainence;


