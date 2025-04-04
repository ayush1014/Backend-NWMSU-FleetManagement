const {Sequelize, where} = require('sequelize');
const Vehicles = require('../Models/Vehicle');
const Refueling = require('../Models/Refueling');
const Users = require('../Models/User');
const Maintainence = require('../Models/Maintainence');

const AddVehicle = async (req, res) => {
    try {
        const { NWVehicleNo, VIN, modelYear, make, model, purchaseDate, startingMileage, weight, vehType, vehDescription, isExempt, vehiclePic, vehicleDepartment, color, licensePlate, addBy } = req.body;

        const vehCheck = await Vehicles.findOne({
            where: { NWVehicleNo: NWVehicleNo }
        });

        if (vehCheck) {
            return res.status(409).send('Vehicle already exists');
        }

        if (isNaN(Date.parse(purchaseDate))) {
            return res.status(400).send('Invalid date format');
        }

        // Force the date to UTC
        const dateUTC = new Date(purchaseDate + 'T00:00:00Z').toISOString();

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
}

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

const GetRecentVehicles = async (req, res)=>{
    try {
        const recentVehicles = await Vehicles.findAll({
            limit: 4,
            order: [['createdAt','DESC']]
        });
        res.status(200).json(recentVehicles);
    } catch (error){
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





module.exports = {AddVehicle, GetAllVehicles, GetRecentVehicles, getVehicleProfile, deleteVehicle, editVehicle}