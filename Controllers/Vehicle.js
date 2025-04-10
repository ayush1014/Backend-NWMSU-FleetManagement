const { Sequelize, where, Op } = require('sequelize');
const Vehicles = require('../Models/Vehicle');
const Refueling = require('../Models/Refueling');
const Users = require('../Models/User');
const Maintainence = require('../Models/Maintainence');

const AddVehicle = async (req, res) => {
    try {
        const { NWVehicleNo, VIN, modelYear, make, model, purchaseDate, startingMileage, weight, vehType, vehDescription, isExempt, vehiclePic, vehicleDepartment, color, licensePlate, addBy } = req.body;

        const vehCheck = await Vehicles.findOne({
            where: { NWVehicleNo }
        });

        if (vehCheck) {
            return res.status(409).send('Vehicle already exists');
        }

        // Convert incoming date to Date object directly, handle full date string including time zone
        const dateObj = new Date(purchaseDate);

        // Check if the date object is valid
        if (isNaN(dateObj.getTime())) {
            return res.status(400).send('Invalid date format');
        }

        // Convert to ISO string for UTC standardized format
        const dateUTC = dateObj.toISOString();

        const newVehicle = await Vehicles.create({
            NWVehicleNo,
            VIN,
            modelYear,
            make,
            model,
            purchaseDate: dateUTC,
            startingMileage,
            weight,
            vehType,
            vehDescription,
            isExempt,
            vehiclePic: req.file ? req.file.location : null,
            vehicleDepartment,
            color,
            licensePlate,
            addBy
        });

        res.status(201).json(newVehicle);

    } catch (err) {
        console.error('Internal server error', err);
        res.status(500).send('Internal Server Error');
    }
};




const GetAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicles.findAll();
        if (vehicles.length === 0) {
            return res.status(404).send('No vehicles found');
        }
        res.status(200).json(vehicles);
    } catch (err) {
        console.error('Failed to fetch vehicles', err);
        res.status(500).send('Internal Server Error');
    }
};

const GetRecentVehicles = async (req, res) => {
    try {
        const recentVehicles = await Vehicles.findAll({
            limit: 4,
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(recentVehicles);
    } catch (error) {
        console.error('Failed to fetch recent vehicles:', error);
        res.status(500).send('Internal Server Error');
    }
};

const getVehicleProfile = async (req, res) => {
    const { NWVehicleNo } = req.params;

    try {
        const vehicle = await Vehicles.findOne({
            where: { NWVehicleNo },
            include: [
                {
                    model: Refueling,
                    include: [
                        {
                            model: Users,
                            attributes: ['email', 'firstName', 'lastName', 'profile_pic']
                        }
                    ]
                },
                {
                    model: Maintainence,
                    include: [
                        {
                            model: Users,
                            attributes: ['email', 'firstName', 'lastName', 'profile_pic']
                        }
                    ]
                },
                {
                    model: Users,
                    as: 'User',
                    attributes: ['email', 'firstName', 'lastName', 'profile_pic'],
                }
            ]
        });

        if (!vehicle) {
            return res.status(404).send('Vehicle not found');
        }

        res.status(200).json(vehicle);
    } catch (error) {
        console.error('Error fetching vehicle profile:', error);
        res.status(500).send('Internal Server Error');
    }
};

const deleteVehicle = async (req, res) => {
    const { NWVehicleNo } = req.params;
    try {
        const vehicle = await Vehicles.findByPk(NWVehicleNo);
        if (!vehicle) {
            return res.status(404).send('Vehicle not found');
        }
        await Refueling.destroy({
            where: { NWVehicleNo }
        });
        await Maintainence.destroy({
            where: { NWVehicleNo }
        });
        await vehicle.destroy();
        res.status(200).send('Vehicle and all related records have been deleted successfully');
    } catch (error) {
        console.error('Error deleting the vehicle and its associated records:', error);
        res.status(500).send('Internal Server Error');
    }
};

const editVehicle = async (req, res) => {
    const { NWVehicleNo } = req.params;
    let updateData = req.body;

    try {
        if (req.file) {
            updateData.vehiclePic = req.file.location;
        }

        const updatedVehicle = await Vehicles.update(updateData, {
            where: { NWVehicleNo }
        });

        if (updatedVehicle[0] === 0) {
            return res.status(404).send('Vehicle not found');
        }

        res.status(200).send('Vehicle updated successfully');
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).send('Internal Server Error');
    }
};

const getVehicleRefuelingDataByYear = async (req, res) => {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const { NWVehicleNo } = req.params;

    if (!NWVehicleNo) {
        return res.status(400).send('Vehicle ID (NWVehicleNo) is required');
    }

    try {
        const startDate = new Date(year, 7, 1);       
        const endDate = new Date(year + 1, 6, 31);    

        const refuelings = await Refueling.findAll({
            attributes: [
                [Sequelize.fn('YEAR', Sequelize.col('date')), 'year'],
                [Sequelize.fn('MONTH', Sequelize.col('date')), 'month'],
                [Sequelize.fn('COUNT', Sequelize.col('refuelingId')), 'refuelingsCount'],
                [Sequelize.fn('SUM', Sequelize.col('fuelCost')), 'totalFuelCost']
            ],
            where: {
                NWVehicleNo,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            group: [
                Sequelize.fn('YEAR', Sequelize.col('date')),
                Sequelize.fn('MONTH', Sequelize.col('date'))
            ],
            order: [
                [Sequelize.fn('YEAR', Sequelize.col('date')), 'ASC'],
                [Sequelize.fn('MONTH', Sequelize.col('date')), 'ASC']
            ]
        });

        res.json(refuelings.map(item => ({
            year: item.dataValues.year,
            month: `${item.dataValues.year}-${item.dataValues.month}`,
            totalFuelCost: item.dataValues.totalFuelCost,
            refuelingsCount: item.dataValues.refuelingsCount
        })));
    } catch (error) {
        console.error('Error fetching vehicle-specific monthly refueling data:', error);
        res.status(500).send('Internal Server Error');
    }
};


const getVehicleMaintenanceDataByYear = async (req, res) => {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const { NWVehicleNo } = req.params;

    if (!NWVehicleNo) {
        return res.status(400).send('Vehicle ID (NWVehicleNo) is required');
    }

    try {
        // Fiscal year 2018 = Aug 2018 – Jul 2019
        const startDate = new Date(Date.UTC(year, 7, 1, 0, 0, 0));      // Aug 1, 00:00 UTC
        const endDate = new Date(Date.UTC(year + 1, 6, 31, 23, 59, 59)); // Jul 31, 23:59 UTC

        const maintenances = await Maintainence.findAll({
            attributes: [
                [Sequelize.fn('YEAR', Sequelize.col('date')), 'year'],
                [Sequelize.fn('MONTH', Sequelize.col('date')), 'month'],
                [Sequelize.fn('COUNT', Sequelize.col('maintainenceId')), 'maintenanceCount'],
                [Sequelize.fn('SUM', Sequelize.col('maintainenceCost')), 'totalMaintenanceCost']
            ],
            where: {
                NWVehicleNo,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            group: [
                Sequelize.fn('YEAR', Sequelize.col('date')),
                Sequelize.fn('MONTH', Sequelize.col('date'))
            ],
            order: [
                [Sequelize.fn('YEAR', Sequelize.col('date')), 'ASC'],
                [Sequelize.fn('MONTH', Sequelize.col('date')), 'ASC']
            ]
        });

        res.json(maintenances.map(item => ({
            year: item.dataValues.year,
            month: `${item.dataValues.year}-${item.dataValues.month}`,
            totalMaintenanceCost: item.dataValues.totalMaintenanceCost,
            maintenanceCount: item.dataValues.maintenanceCount
        })));
    } catch (error) {
        console.error('Error fetching vehicle-specific monthly maintenance data:', error);
        res.status(500).send('Internal Server Error');
    }
};

const checkVehicleExists = async (req, res) => {
    const { NWVehicleNo } = req.params;
    const vehicle = await Vehicles.findByPk(NWVehicleNo);
    if (vehicle) {
      res.json({ exists: true });
    } else {
      res.status(404).json({ exists: false });
    }
  };




module.exports = { AddVehicle, GetAllVehicles, GetRecentVehicles, getVehicleProfile, deleteVehicle, editVehicle, getVehicleRefuelingDataByYear, getVehicleMaintenanceDataByYear, checkVehicleExists }