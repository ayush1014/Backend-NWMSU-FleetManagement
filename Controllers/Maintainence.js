const Maintainence = require('../Models/Maintainence');
const Users = require('../Models/User');
const Vehicle = require('../Models/Vehicle');

const addMaintainence = async (req, res) => {
    try {
        const { NWVehicleNo, date, currentMileage, maintainenceDescription, maintainenceCost, maintainenceBy } = req.body;
        const userExists = await Users.findByPk(maintainenceBy);
        if (!userExists) {
            return res.status(404).send('User not found');
        }

        const newMaintainence = await Maintainence.create({
            NWVehicleNo,
            date,
            currentMileage,
            maintainenceDescription,
            maintainenceCost,
            maintainenceBy,
            receiptImage: req.file ? req.file.location : null 
        });

        res.status(201).json(newMaintainence);
    } catch (error) {
        console.error('Error adding maintainence data:', error);
        res.status(500).send('Internal Server Error');
    }
};

const editMaintainence = async (req, res) => {
    const { maintainenceId } = req.params;
    try {
        const updated = await Maintainence.update(req.body, {
            where: { maintainenceId: maintainenceId }
        });
        if (updated) {
            const updateMaintainence = await Maintainence.findByPk(maintainenceId);
            res.json(updateMaintainence);
        } else {
            res.status(404).send('Maintainence not found');
        }
    } catch (error) {
        console.error('Error updating maintainence data:', error);
        res.status(500).send('Internal Server Error');
    }
};

const deleteMaintainence = async (req, res) => {
    const { maintainenceId } = req.params;
    try {
        const deleted = await Maintainence.destroy({
            where: { maintainenceId: maintainenceId }
        });
        if (deleted) {
            res.send('Maintainence deleted');
        } else {
            res.status(404).send('Maintainence not found');
        }
    } catch (error) {
        console.error('Error deleting maintainence:', error);
        res.status(500).send('Internal Server Error');
    }
};

const showMaintenance = async (req, res) => {
    try {
        const maintenances = await Maintainence.findAll({
            include: [
                { model: Users },  
                { model: Vehicle } 
            ]
        });

        if (maintenances.length > 0) {
            res.status(200).json(maintenances);
        } else {
            res.status(404).send('No maintenance records found');
        }
    } catch (error) {
        console.error('Error fetching maintenance records:', error);
        res.status(500).send('Internal Server Error');
    }
};

const showMaintenanceForVehicle = async (req, res) => {
    const { NWVehicleNo } = req.params;  

    try {
        const maintenances = await Maintainence.findAll({
            include: [
                {
                    model: Users,
                },
                {
                    model: Vehicle
                }
            ],
            where: { NWVehicleNo: NWVehicleNo }  
        });

        if (maintenances.length > 0) {
            res.status(200).json(maintenances);
        } else {
            res.status(404).send('No maintenance records found for the specified vehicle');
        }
    } catch (error) {
        console.error('Error fetching maintenance records for vehicle:', error);
        res.status(500).send('Internal Server Error');
    }
};



module.exports = { addMaintainence, editMaintainence, deleteMaintainence, showMaintenance, showMaintenanceForVehicle }