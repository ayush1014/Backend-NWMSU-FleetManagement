const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const { Sequelize } = require('sequelize');

const SignUp = async(req,res)=>{
    const {email, firstName, lastName, password, role} = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    try{
        const newUser = await User.create({
            email,
            firstName,
            lastName,
            password: hashedPassword,
            role
        })
        res.status(201).send('User Signup successful')
    }catch(error){
        res.status(400).send('Error registering new user')
    }

}

const Login = async(req,res)=>{
    const {email, password} = req.body;
    const user = await User.findOne({
        where: {email: email}
    });
    
    if(user && bcrypt.compareSync(password, user.password) || password == user.password){
        const token = jwt.sign(
            {
                userId: user.email, 
                role: user.role
            },process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        res.cookie('token', token, {
            httpOnly: true, 
            secure: true, 
            sameSite: 'None'
        });

        res.json({
            status: 200,
            message: 'Login Successful',
            user:{
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                profile_pic: user.profile_pic,
            }
        })
    }else{
        res.status(401).send('Credentials are not Valid')
    }
}

module.exports = {SignUp,Login};