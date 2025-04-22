const bcrypt = require('bcryptjs');
const User = require('../Models/User');
const Vehicle = require('../Models/Vehicle');
const Maintainence = require('../Models/Maintainence');
const Refueling = require('../Models/Refueling');
const { sendEmail } = require('./PasswordSMTP');
const { upload, makePublicRead } = require('./S3Service');
const { where } = require('sequelize');

const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

const AddUser = async (req, res) => {
    const { firstName, lastName, email, role } = req.body;
    try {
        const userExists = await User.findOne({ where: { email: email } });
        if (userExists) {
            return res.status(409).send('User already exists, Please try with another email.');
        }

        const tempPassword = generatePassword();
        const hashedPassword = bcrypt.hashSync(tempPassword, 10);

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            role,
            password: hashedPassword,
            profile_pic: req.file ? req.file.location : null
        });

        await sendEmail(email, tempPassword);
        console.log('Email sent successfully');
        res.status(200).json(newUser);
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(400).send('Technical Issue, Internal Server Error');
    }
};


const ShowUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Refueling,
                    include: [
                        {
                            model: Vehicle,
                        }
                    ]
                },
                {
                    model: Maintainence,
                    include: [
                        {
                            model: Vehicle,
                        }
                    ]
                },
                {
                    model: Vehicle
                }
            ]

        }
        );
        res.status(200).json(users);
    } catch (error) {
        console.error('Error showing the users due to technical error:', error);
        res.status(500).send('Failed to retrieve users');
    }
}

const showUserProfile = async(req,res)=>{
    const {email} = req.params;
    try{
        const userProfile = await User.findOne({
            where:{
                email: email
            },
            include: [
                {
                    model: Refueling,
                    include: [
                        {
                            model: Vehicle,
                        }
                    ]
                },
                {
                    model: Maintainence,
                    include: [
                        {
                            model: Vehicle,
                        }
                    ]
                },
                {
                    model: Vehicle
                }
            ]
        })
        res.status(200).json(userProfile);
    }catch(error){
        console.log('error fetching the user profile: ', error)
        res.status(500).send('Unable to find user profile');
    }
};

const editUser = async (req, res) => {
    const { email } = req.params;
    try {
        const currentUser = await User.findOne({
            where: { email }
        });

        if (!currentUser) {
            return res.status(404).send('User not found');
        }

        let updateData = {
            ...currentUser.dataValues,
            ...req.body
        };

        if (req.file) {
            updateData.profile_pic = req.file.location;
        }

        const updatedUser = await User.update(updateData, {
            where: { email }
        });

        if (updatedUser[0] === 0) {
            return res.status(404).send('No changes applied or user not found');
        }

        res.status(200).send('User updated successfully');
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
    }
};

const changePassword = async (req, res) => {
    const { email } = req.params;
    const { password } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
        await User.update({ password: hashedPassword }, { where: { email } });
        res.send('Password updated successfully');
    } catch (error) {
        console.error('Failed to update password:', error);
        res.status(500).send('Internal Server Error');
    }
};

const passCheck = async (req, res) => {
    const { curPassword } = req.body;
    const { email } = req.params;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(200).json({ passwordMatch: false, message: 'User not found.' });
        }

        const isMatch = await bcrypt.compareSync(curPassword, user.password) || curPassword == user.password;
        
         
        if (!isMatch) {
            return res.status(200).json({ passwordMatch: false, message: 'Current password is incorrect.' });
        }

        return res.status(200).json({ passwordMatch: true, message: 'Password verified successfully.' });
    } catch (error) {
        console.log('Internal server error', error);
        return res.status(500).send('Internal Server Error');
    }
};



module.exports = { AddUser, ShowUsers, showUserProfile, editUser, changePassword, passCheck }