const bcrypt = require('bcryptjs');
const User = require('../Models/User');
const Vehicle = require('../Models/Vehicle');
const Maintainence = require('../Models/Maintainence');
const Refueling = require('../Models/Refueling');
const { sendEmail } = require('./PasswordSMTP');
const { upload, makePublicRead } = require('./S3Service');

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
        res.status(200).send('User added successfully. A temporary password has been sent to your email.');
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


module.exports = { AddUser, ShowUsers }