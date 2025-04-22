const Maintainence = require('../Models/Maintainence');
const Users = require('../Models/User');
const Vehicle = require('../Models/Vehicle');
const { Sequelize, Op } = require('sequelize');

const addMaintainence = async (req, res) => {
  try {
    const {
      NWVehicleNo,
      date,
      currentMileage,
      maintainenceDescription,
      maintainenceCost,
      maintainenceBy
    } = req.body;

    const userExists = await Users.findByPk(maintainenceBy);
    if (!userExists) {
      return res.status(404).send('User not found');
    }

    const vehicle = await Vehicle.findByPk(NWVehicleNo);
    if (!vehicle) {
      return res.status(404).send('Vehicle not found');
    }

    if (currentMileage < vehicle.currentMileage) {
      return res.status(400).send('New mileage cannot be less than current vehicle mileage');
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).send('Invalid date format');
    }
    const dateUTC = dateObj.toISOString();

    const newMaintainence = await Maintainence.create({
      NWVehicleNo,
      date: dateUTC,
      currentMileage,
      maintainenceDescription,
      maintainenceCost,
      maintainenceBy,
      receiptImage: req.file ? req.file.location : null
    });

    await Vehicle.update(
      { currentMileage },
      { where: { NWVehicleNo } }
    );

    res.status(201).json(newMaintainence);
  } catch (error) {
    console.error('Error adding maintainence data:', error);
    res.status(500).send('Internal Server Error');
  }
};


const editMaintainence = async (req, res) => {
  const { maintainenceId } = req.params;
  const {
    NWVehicleNo,
    currentMileage,
    maintainenceDescription,
    maintainenceCost,
    date,
    maintainenceBy
  } = req.body;

  try {
    const vehicle = await Vehicle.findByPk(NWVehicleNo);
    if (!vehicle) {
      return res.status(404).send('Vehicle not found');
    }

    if (currentMileage < vehicle.currentMileage) {
      return res.status(400).send('New mileage cannot be less than current vehicle mileage');
    }

    const updateData = {
      NWVehicleNo,
      currentMileage,
      maintainenceDescription,
      maintainenceCost,
      date,
      maintainenceBy,
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.receiptImage = req.file.location || req.file.path;
    }

    const updated = await Maintainence.update(updateData, {
      where: { maintainenceId }
    });

    if (updated[0]) {
      await Vehicle.update(
        { currentMileage },
        { where: { NWVehicleNo } }
      );

      const updatedMaintainence = await Maintainence.findByPk(maintainenceId);
      res.json(updatedMaintainence);
    } else {
      res.status(404).send('Maintainence not found');
    }
  } catch (error) {
    console.error('Error updating maintainence data:', error);
    res.status(500).send('Internal Server Error');
  }
};



const getMaintenanceById = async (req, res) => {
  const { maintenanceId } = req.params;

  try {
    const maintenance = await Maintainence.findByPk(maintenanceId, {
      include: [
        {
          model: Users,
          attributes: ['email', 'firstName', 'lastName', 'profile_pic']
        },
        {
          model: Vehicle
        }
      ]
    });

    if (!maintenance) {
      return res.status(404).send('Maintenance not found');
    }

    res.status(200).json(maintenance);
  } catch (error) {
    console.error('Error fetching Maintenance by ID:', error);
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
      const fiscalYear = month >= 6 ? year : year - 1;

      fiscalYearsSet.add(fiscalYear);
    });

    const fiscalYears = Array.from(fiscalYearsSet).sort((a, b) => b - a);
    res.json({
      years: Array.from(fiscalYearsSet)
        .sort((a, b) => b - a)
        .map(year => ({
          label: `July ${year} - June ${year + 1}`,
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
    const startDate = new Date(year, 6, 1);       // August 1st of selected fiscal year
    const endDate = new Date(year + 1, 5, 31);    // July 31st of the next year

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

const getPaginatedMaintenanceReport = async (req, res) => {
  try {
    const { page = 1, limit = 20, fiscalYear, months } = req.body;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const selectedMonths = Array.isArray(months) && months.length > 0 ? months : [];

    const year = parseInt(fiscalYear) || new Date().getFullYear();
    const startDate = new Date(`${year}-07-01`);
    const endDate = new Date(`${year + 1}-06-30`);

    const whereClause = {
      date: {
        [Op.between]: [startDate, endDate]
      }
    };

    if (selectedMonths.length > 0) {
      whereClause[Op.and] = [
        Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('date')), {
          [Op.in]: selectedMonths
        })
      ];
    }

    const { count, rows } = await Maintainence.findAndCountAll({
      include: [
        { model: Users, attributes: ['firstName', 'lastName', 'email'] },
        { model: Vehicle, attributes: ['make', 'model', 'vehType', 'vehDescription'] }
      ],
      where: whereClause,
      offset,
      limit: parseInt(limit),
      order: [['date', 'DESC']]
    });

    res.status(200).json({
      maintenances: rows,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Error fetching paginated maintenance report:', error);
    res.status(500).send('Internal Server Error');
  }
};




module.exports = { addMaintainence, editMaintainence, deleteMaintainence, showMaintenance, showMaintenanceForVehicle, getAvailableMaintenanceYears, getMonthlyMaintenanceData, getPaginatedMaintenanceReport, getMaintenanceById }