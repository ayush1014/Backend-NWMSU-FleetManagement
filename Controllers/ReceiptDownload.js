
const axios = require('axios');
const { PassThrough } = require('stream');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const Vehicle = require('../Models/Vehicle');
const Maintainence = require('../Models/Maintainence');
const Refueling = require('../Models/Refueling');

async function appendRemoteFile(archive, url, filename) {
    return axios({
        method: 'get',
        url: url,
        responseType: 'stream'
    }).then(response => {
        const passThrough = new PassThrough();
        response.data.pipe(passThrough);
        archive.append(passThrough, { name: filename });
    }).catch(error => {
        console.error('Failed to fetch or append file:', url, error);
        throw new Error(`Failed to fetch or append file: ${url}`); 
    });
}


const Receipt = async (req, res) => {
    const vehicleId = req.params.NWVehicleNo;
    console.log('Params: ', vehicleId);
    const outputPath = path.join(__dirname, `output_${vehicleId}.zip`);
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', function(err) {
        console.log('Archive Error:', err);
        res.status(500).send({ error: 'Error creating archive' });
    });

    output.on('close', function() {
        console.log(`Archive wrote ${archive.pointer()} bytes`);
        res.download(outputPath, () => {
            fs.unlinkSync(outputPath);
        });
    });

    archive.pipe(output);

    const refuelings = await getRefuelingsForVehicle(vehicleId);
    const maintenances = await getMaintenancesForVehicle(vehicleId);

    const appendPromises = refuelings.map(refuel => {
        if (refuel.receiptImage) {
            const filePath = `Refueling Receipts/${refuel.date}/${path.basename(refuel.receiptImage)}`;
            return appendRemoteFile(archive, refuel.receiptImage, filePath);
        }
    }).concat(maintenances.map(maintenance => {
        if (maintenance.receiptImage) {
            const filePath = `Maintenance Receipts/${maintenance.date}/${path.basename(maintenance.receiptImage)}`;
            return appendRemoteFile(archive, maintenance.receiptImage, filePath);
        }
    }));
    
    try {
        await Promise.all(appendPromises);
        archive.finalize();
    } catch (error) {
        res.status(500).send("Failed to create archive due to an error with one or more files.");
    }
    
};

async function getRefuelingsForVehicle(vehicleId) {
    try {
        console.log('RefuelingId', vehicleId)
        const refuelingReceipts = await Refueling.findAll({
            where: { NWVehicleNo: vehicleId },  
            attributes: ['date', 'receiptImage']
        });
        return refuelingReceipts || [];  
    } catch (error) {
        console.error("Error fetching refuelings:", error);
        return [];
    }
}

async function getMaintenancesForVehicle(vehicleId) {
    try {
        const maintenanceReceipts = await Maintainence.findAll({
            where: { NWVehicleNo: vehicleId }, 
            attributes: ['date', 'receiptImage']
        });
        return maintenanceReceipts || [];  
    } catch (error) {
        console.error("Error fetching maintenances:", error);
        return [];
    }
}

module.exports = { Receipt };
