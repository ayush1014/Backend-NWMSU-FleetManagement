const express = require('express');
const router = express.Router();
const {SignUp, Login} =  require('../Controllers/Authentication');
const {AddUser, ShowUsers} = require('../Controllers/Users');
const {AddVehicle, GetAllVehicles, GetRecentVehicles, getVehicleProfile} = require('../Controllers/Vehicle');
const { addRefueling, editRefueling, deleteRefueling, showRefueling, showRefuelingForVehicle } = require('../Controllers/Refueling');
const { addMaintainence, editMaintainence, deleteMaintainence, showMaintenance, showMaintenanceForVehicle} = require('../Controllers/Maintainence');
const {Receipt} = require('../Controllers/ReceiptDownload')
const { upload, makePublicRead } = require('../Controllers/S3Service');



router.post('/signup', SignUp);
router.post('/login', Login);
router.post('/addUser', upload.single('profile_pic'), AddUser);
router.get('/showUsers', ShowUsers);
router.post('/addVehicle', upload.single('vehicle_pic'), AddVehicle);
router.get('/vehicles', GetAllVehicles);
router.get('/recentVehicles', GetRecentVehicles);
router.post('/addRefueling', upload.single('receiptImage'), addRefueling);
router.put('/editRefueling/:refuelingId', upload.single('receiptImage'), editRefueling);
router.delete('/deleteRefueling/:refuelingId', deleteRefueling);
router.get('/showRefueling', showRefueling);
router.post('/addMaintainence', upload.single('receiptImage'), addMaintainence);
router.put('/editMaintainence/:maintainenceId', upload.single('receiptImage'), editMaintainence);
router.delete('/deleteMaintainence/:maintainenceId', deleteMaintainence);
router.get('/showMaintainence', showMaintenance);
router.get('/refuelings/:NWVehicleNo', showRefuelingForVehicle);
router.get('/maintenence/:NWVehicleNo', showMaintenanceForVehicle);
router.get('/vehicle-profile/:NWVehicleNo', getVehicleProfile);
router.get('/receipt/:NWVehicleNo', Receipt);


module.exports = router;