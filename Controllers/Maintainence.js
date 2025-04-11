const Maintainence = require('../Models/Maintainence');
const Users = require('../Models/User');
const Vehicle = require('../Models/Vehicle');
const { Sequelize, Op } = require('sequelize');

const addMaintainence = async (req, res) => {
    try {
        const { NWVehicleNo, date, currentMileage, maintainenceDescription, maintainenceCost, maintainenceBy } = req.body;
        const userExists = await Users.findByPk(maintainenceBy);
        if (!userExists) {
            return res.status(404).send('User not found');
        }


        const dateObj = new Date(date);

        if (isNaN(dateObj.getTime())) {
            return res.status(400).send('Invalid date format');
        }

        const dateUTC = dateObj.toISOString();

        const newMaintainence = await Maintainence.create({
            NWVehicleNo,
            date:dateUTC,
            currentMileage,
            maintainenceDescription,
            maintainenceCost,
            maintainenceBy,
            receiptImage: req.file ? req.file.location : null 
        });

        res.status(201).json(newMaintainence);
    } catch (error) {
        console.error('Error adding maintainence data:', error);
        res.status(500).send('Internal Server Error');
    }
};

const editMaintainence = async (req, res) => {
    const { maintainenceId } = req.params;
    try {
        const updated = await Maintainence.update(req.body, {
            where: { maintainenceId: maintainenceId }
        });
        if (updated) {
            const updateMaintainence = await Maintainence.findByPk(maintainenceId);
            res.json(updateMaintainence);
        } else {
            res.status(404).send('Maintainence not found');
        }
    } catch (error) {
        console.error('Error updating maintainence data:', error);
        res.status(500).send('Internal Server Error');
    }
};

const deleteMaintainence = async (req, res) => {
    const { maintainenceId } = req.params;
    try {
        const deleted = await Maintainence.destroy({
            where: { maintainenceId: maintainenceId }
        });
        if (deleted) {
            res.send('Maintainence deleted');
        } else {
            res.status(404).send('Maintainence not found');
        }
    } catch (error) {
        console.error('Error deleting maintainence:', error);
        res.status(500).send('Internal Server Error');
    }
};

const showMaintenance = async (req, res) => {
    try {
        const maintenances = await Maintainence.findAll({
            include: [
                { model: Users },  
                { model: Vehicle } 
            ]
        });

        if (maintenances.length > 0) {
            res.status(200).json(maintenances);
        } else {
            res.status(404).send('No maintenance records found');
        }
    } catch (error) {
        console.error('Error fetching maintenance records:', error);
        res.status(500).send('Internal Server Error');
    }
};

const showMaintenanceForVehicle = async (req, res) => {
    const { NWVehicleNo } = req.params;  

    try {
        const maintenances = await Maintainence.findAll({
            include: [
                {
                    model: Users,
                },
                {
                    model: Vehicle
                }
            ],
            where: { NWVehicleNo: NWVehicleNo }  
        });

        if (maintenances.length > 0) {
            res.status(200).json(maintenances);
        } else {
            res.status(404).send('No maintenance records found for the specified vehicle');
        }
    } catch (error) {
        console.error('Error fetching maintenance records for vehicle:', error);
        res.status(500).send('Internal Server Error');
    }
};

const getAvailableMaintenanceYears = async (req, res) => {
    try {
      const maintenances = await Maintainence.findAll({
        attributes: ['date']
      });
  
      const fiscalYearsSet = new Set();
  
      maintenances.forEach(record => {
        const date = new Date(record.date);
        const month = date.getMonth(); 
        const year = date.getFullYear();
        const fiscalYear = month >= 7 ? year : year - 1;
  
        fiscalYearsSet.add(fiscalYear);
      });
  
      const fiscalYears = Array.from(fiscalYearsSet).sort((a, b) => b - a);
      res.json({
        years: Array.from(fiscalYearsSet)
          .sort((a, b) => b - a)
          .map(year => ({
            label: `Aug ${year} - Jul ${year + 1}`,
            value: year
          }))
      });      
    } catch (error) {
      console.error('Error fetching maintenance years:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  
  
  

  const getMonthlyMaintenanceData = async (req, res) => {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
  
    try {
      // Fiscal year: Aug of selected year → Jul of next year
      const startDate = new Date(year, 7, 1);       // August 1st of selected fiscal year
      const endDate = new Date(year + 1, 6, 31);    // July 31st of the next year
  
      const maintenances = await Maintainence.findAll({
        attributes: [
          [Sequelize.fn('YEAR', Sequelize.col('date')), 'year'],
          [Sequelize.fn('MONTH', Sequelize.col('date')), 'month'],
          [Sequelize.fn('COUNT', Sequelize.col('maintainenceId')), 'maintenanceCount'],
          [Sequelize.fn('SUM', Sequelize.col('maintainenceCost')), 'totalMaintenanceCost']
        ],
        where: {
          date: {
            [Op.between]: [startDate, endDate]
          }
        },
        group: [
          Sequelize.fn('YEAR', Sequelize.col('date')),
          Sequelize.fn('MONTH', Sequelize.col('date'))
        ],
        order: [
          [Sequelize.fn('YEAR', Sequelize.col('date')), 'ASC'],
          [Sequelize.fn('MONTH', Sequelize.col('date')), 'ASC']
        ]
      });
  
      res.json(maintenances.map(item => ({
        year: item.dataValues.year,
        month: `${item.dataValues.year}-${item.dataValues.month}`,
        totalMaintenanceCost: item.dataValues.totalMaintenanceCost,
        maintenanceCount: item.dataValues.maintenanceCount
      })));
    } catch (error) {
      console.error('Error fetching monthly maintenance data:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  



module.exports = { addMaintainence, editMaintainence, deleteMaintainence, showMaintenance, showMaintenanceForVehicle, getAvailableMaintenanceYears, getMonthlyMaintenanceData }