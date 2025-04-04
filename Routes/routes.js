const express = require('express');
const router = express.Router();
const {SignUp, Login} =  require('../Controllers/Authentication');
const {AddUser, ShowUsers, showUserProfile, editUser, changePassword, passCheck} = require('../Controllers/Users');
const {AddVehicle, GetAllVehicles, GetRecentVehicles, getVehicleProfile, deleteVehicle, editVehicle} = require('../Controllers/Vehicle');
const { addRefueling, editRefueling, deleteRefueling, showRefueling, showRefuelingForVehicle } = require('../Controllers/Refueling');
const { addMaintainence, editMaintainence, deleteMaintainence, showMaintenance, showMaintenanceForVehicle} = require('../Controllers/Maintainence');
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


module.exports = router;