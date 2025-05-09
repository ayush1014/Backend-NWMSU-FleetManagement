
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
const {Sequelize, Op} = require('sequelize')

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


function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    });
}

const Receipt = async (req, res) => {
    const vehicleId = req.params.NWVehicleNo;
    const year = parseInt(req.query.year); 

    const outputPath = path.join('/tmp', `output_${vehicleId}_${year}.zip`);
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', function (err) {
        res.status(500).send({ error: 'Error creating archive' });
    });

    output.on('close', function () {
        res.download(outputPath, () => {
            fs.unlinkSync(outputPath);
        });
    });

    archive.pipe(output);

    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year + 1, 0, 1));

    const refuelings = await Refueling.findAll({
        where: {
            NWVehicleNo: vehicleId,
            date: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
        },
        attributes: ['date', 'receiptImage'],
    });

    const maintenances = await Maintainence.findAll({
        where: {
            NWVehicleNo: vehicleId,
            date: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
        },
        attributes: ['date', 'receiptImage'],
    });

    const appendPromises = [
        ...refuelings.map((refuel) => {
            if (refuel.receiptImage) {
                const formattedDate = formatDate(refuel.date);
                const filePath = `Refueling Receipts/${formattedDate}/${path.basename(refuel.receiptImage)}`;
                return appendRemoteFile(archive, refuel.receiptImage, filePath);
            }
        }),
        ...maintenances.map((maintenance) => {
            if (maintenance.receiptImage) {
                const formattedDate = formatDate(maintenance.date);
                const filePath = `Maintenance Receipts/${formattedDate}/${path.basename(maintenance.receiptImage)}`;
                return appendRemoteFile(archive, maintenance.receiptImage, filePath);
            }
        }),
    ];

    try {
        await Promise.all(appendPromises);
        archive.finalize();
    } catch (error) {
        console.error("Archive error:", error);
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
