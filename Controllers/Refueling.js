const Refueling = require('../Models/Refueling');
const Users = require('../Models/User');
const Vehicle = require('../Models/Vehicle');

const addRefueling = async (req, res) => {
    try {
        const { NWVehicleNo, date, currentMileage, fuelAdded, fuelCost, refueledBy } = req.body;

        const userExists = await Users.findByPk(refueledBy);
        if (!userExists) {
            return res.status(404).send('User not found');
        }

        if (isNaN(Date.parse(date))) {
            return res.status(400).send('Invalid date format');
        }

        // Force the date to UTC
        const dateUTC = new Date(date + 'T00:00:00Z').toISOString();

        const newRefueling = await Refueling.create({
            NWVehicleNo,
            date: dateUTC,
            currentMileage,
            fuelAdded,
            fuelCost,
            refueledBy,
            receiptImage: req.file ? req.file.location : null
        });

        res.status(201).json(newRefueling);
    } catch (error) {
        console.error('Error adding refueling data:', error);
        res.status(500).send('Internal Server Error');
    }
};



const editRefueling = async (req, res) => {
    const { refuelingId } = req.params;
    try {
        const updated = await Refueling.update(req.body, {
            where: { refuelingId: refuelingId }
        });
        if (updated) {
            const updatedRefueling = await Refueling.findByPk(refuelingId);
            res.json(updatedRefueling);
        } else {
            res.status(404).send('Refueling not found');
        }
    } catch (error) {
        console.error('Error updating refueling data:', error);
        res.status(500).send('Internal Server Error');
    }
};

const deleteRefueling = async (req, res) => {
    const { refuelingId } = req.params;
    try {
        const deleted = await Refueling.destroy({
            where: { refuelingId: refuelingId }
        });
        if (deleted) {
            res.send('Refueling deleted');
        } else {
            res.status(404).send('Refueling not found');
        }
    } catch (error) {
        console.error('Error deleting refueling:', error);
        res.status(500).send('Internal Server Error');
    }
};

const showRefueling = async (req, res) => {
    try {
        const refuelings = await Refueling.findAll({
            include: [
                {
                    model: Users,
                },
                {
                    model: Vehicle,
                }
            ]
        });

        if (refuelings.length > 0) {
            res.status(200).json(refuelings);
        } else {
            res.status(404).send('No refueling records found');
        }
    } catch (error) {
        console.error('Error fetching refueling records:', error);
        res.status(500).send('Internal Server Error');
    }
};

const showRefuelingForVehicle = async (req, res) => {
    const { NWVehicleNo } = req.params;

    try {
        const refuelings = await Refueling.findAll({
            include: [
                {
                    model: Users,
                    attributes: ['email', 'firstName', 'lastName', 'profile_pic'],
                },
                {
                    model: Vehicle
                }
            ],
            where: { NWVehicleNo: NWVehicleNo }
        });

        if (refuelings.length > 0) {
            res.status(200).json(refuelings);
        } else {
            res.status(404).send('No refueling records found for the specified vehicle');
        }
    } catch (error) {
        console.error('Error fetching refueling records for vehicle:', error);
        res.status(500).send('Internal Server Error');
    }
};



module.exports = { addRefueling, editRefueling, deleteRefueling, showRefueling, showRefuelingForVehicle }