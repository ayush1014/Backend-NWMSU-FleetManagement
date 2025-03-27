const {Sequelize, where} = require('sequelize');
const Vehicles = require('../Models/Vehicle');

const AddVehicle = async (req, res) => {
    try {
        const { NWVehicleNo, VIN, modelYear, make, model, purchaseDate, startingMileage, weight, vehType, vehDescription, isExempt, vehiclePic, vehicleDepartment, color, licensePlate } = req.body;

        const vehCheck = await Vehicles.findOne({
            where: { NWVehicleNo: NWVehicleNo }
        });

        if (vehCheck) {
            return res.status(409).send('Vehicle already exists');
        }

        const newVehicle = await Vehicles.create({
            NWVehicleNo,
            VIN,
            modelYear,
            make,
            model,
            purchaseDate,
            startingMileage,
            weight,
            vehType,
            vehDescription,
            isExempt,
            vehiclePic: req.file ? req.file.location : null,
            vehicleDepartment,
            color,
            licensePlate
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

module.exports = {AddVehicle, GetAllVehicles, GetRecentVehicles}