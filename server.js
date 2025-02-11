const express = require('express');
const cors = require('cors');
const http = require('http');
const {Sequelize} = require('sequelize');
const db = require('./DBConfig/db_config');
const routes = require('./Routes/routes')

const User = require('./Models/User');


const app = express();

app.use(cors({
    origin: process.env.ORIGIN,
}));

app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));

app.use('/nwmsu/fleet_management', routes);

app.get('/',(req,res)=>{
    res.json({
        message: 'NWMSU Fleet Management Backend Server is running well and good; All the api\'s are working prefectly and smooth'
    })
});

db.sync().then(()=>{
        console.log('database is synced and running well');
});

const server = http.createServer(app);
const PORT = process.env.PORT || 8000;
server.listen(PORT,()=>{
        console.log(`Server is running well on PORT ${PORT}`)
    }
);

module.exports = (req, res) => {
    app(req,res);
}