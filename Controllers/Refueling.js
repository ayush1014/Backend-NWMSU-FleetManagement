const Refueling = require('../Models/Refueling');

const addRefueling = async (req, res) => {
    try {
        const { NWVehicleNo, date, currentMileage, fuelAdded, fuelCost } = req.body;
        const newRefueling = await Refueling.create({
            NWVehicleNo,
            date,
            currentMileage,
            fuelAdded,
            fuelCost,
            receiptImage: req.file ? req.file.path : null  
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


module.exports = { addRefueling, editRefueling, deleteRefueling }