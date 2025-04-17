const express = require('express');
const router = express.Router();
const {SignUp, Login} =  require('../Controllers/Authentication');
const {AddUser, ShowUsers, showUserProfile, editUser, changePassword, passCheck} = require('../Controllers/Users');
const {AddVehicle, GetAllVehicles, GetRecentVehicles, getVehicleProfile, deleteVehicle, editVehicle, getVehicleRefuelingDataByYear, getVehicleMaintenanceDataByYear, checkVehicleExists, getVehicleReport,  getVehicleInfoReport} = require('../Controllers/Vehicle');
const { addRefueling, editRefueling, deleteRefueling, showRefueling, showRefuelingForVehicle, getMonthlyRefuelingData, getAvailableYears, getPaginatedRefuelingReport, getRefuelingById } = require('../Controllers/Refueling');
const { addMaintainence, editMaintainence, deleteMaintainence, showMaintenance, showMaintenanceForVehicle, getMonthlyMaintenanceData, getAvailableMaintenanceYears, getPaginatedMaintenanceReport, getMaintenanceById} = require('../Controllers/Maintainence');
const {Receipt} = require('../Controllers/ReceiptDownload')
const { upload, makePublicRead } = require('../Controllers/S3Service');



router.post('/signup', SignUp);
router.post('/login', Login);
router.post('/addUser', upload.single('profile_pic'), AddUser);
router.get('/showUsers', ShowUsers);
router.get('/userProfile/:email', showUserProfile);
router.put('/edit-user/:email', upload.single('profile_pic'), editUser);
router.put('/change-password/:email', changePassword);
router.post(`/password-check/:email`, passCheck)
router.post('/addVehicle', upload.single('vehicle_pic'), AddVehicle);
router.get('/vehicles', GetAllVehicles);
router.get('/recentVehicles', GetRecentVehicles);
router.post('/addRefueling', upload.single('receiptImage'), addRefueling);
router.put('/editRefueling/:refuelingId', upload.single('receiptImage'), editRefueling);
router.delete('/deleteRefueling/:refuelingId', deleteRefueling);
router.get('/showRefueling', showRefueling);
router.get('/refueling/yearly', getMonthlyRefuelingData);
router.get('/refueling/years', getAvailableYears);
router.post('/addMaintainence', upload.single('receiptImage'), addMaintainence);
router.put('/editMaintainence/:maintainenceId', upload.single('receiptImage'), editMaintainence);
router.delete('/deleteMaintainence/:maintainenceId', deleteMaintainence);
router.get('/showMaintainence', showMaintenance);
router.get('/refuelings/:NWVehicleNo', showRefuelingForVehicle);
router.get('/maintenence/:NWVehicleNo', showMaintenanceForVehicle);
router.get('/vehicle-profile/:NWVehicleNo', getVehicleProfile);
router.delete('/vehicles/:NWVehicleNo', deleteVehicle);
router.put('/vehicles/:NWVehicleNo', upload.single('vehiclePic'), editVehicle);
router.get('/receipt/:NWVehicleNo', Receipt);
router.get('/maintenance/years', getAvailableMaintenanceYears);
router.get('/maintenance/yearly', getMonthlyMaintenanceData);
router.get('/refueling/vehicle/:NWVehicleNo', getVehicleRefuelingDataByYear);
router.get('/maintenance/vehicle/:NWVehicleNo', getVehicleMaintenanceDataByYear);
router.get('/vehiclesCheck/:NWVehicleNo', checkVehicleExists);
router.post('/vehicle/report', getVehicleReport)
router.get('/vehicleInfo/info', getVehicleInfoReport)
router.post('/refueling/report', getPaginatedRefuelingReport);
router.post('/maintenance/report', getPaginatedMaintenanceReport);
router.get('/refueling/:refuelingId', getRefuelingById);
router.get('/maintenance/:maintenanceId', getMaintenanceById);


module.exports = router;