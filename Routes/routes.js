const express = require('express');
const router = express.Router();
const {SignUp, Login} =  require('../Controllers/Authentication');
const {AddUser, ShowUsers} = require('../Controllers/Users');
const {AddVehicle, GetAllVehicles, GetRecentVehicles} = require('../Controllers/Vehicle');
const { addRefueling, editRefueling, deleteRefueling } = require('../Controllers/Refueling');
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




module.exports = router;