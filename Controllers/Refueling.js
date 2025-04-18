const { Sequelize, Op } = require('sequelize');
const Refueling = require('../Models/Refueling');
const Users = require('../Models/User');
const Vehicle = require('../Models/Vehicle');

const addRefueling = async (req, res) => {
  try {
    const { NWVehicleNo, date, currentMileage, fuelAdded, fuelCost, refueledBy } = req.body;


    const userExists = await Users.findByPk(refueledBy);
    if (!userExists) {
      return res.status(404).send('User not found');
    }


    const vehicleExists = await Vehicle.findByPk(NWVehicleNo);
    if (!vehicleExists) {
      return res.status(404).send('Vehicle not found');
    }


    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).send('Invalid date format');
    }
    const dateUTC = dateObj.toISOString();


    const newRefueling = await Refueling.create({
      NWVehicleNo,
      date: dateUTC,
      currentMileage,
      fuelAdded,
      fuelCost,
      refueledBy,
      receiptImage: req.file ? req.file.location : null
    });

    res.status(201).json(newRefueling);
  } catch (error) {
    console.error('Error adding refueling data:', error);
    res.status(500).send('Internal Server Error');
  }
};


const editRefueling = async (req, res) => {
  const { refuelingId } = req.params;

  const refueledBy = req.body.refueledBy || req.user?.email || 'default@email.com';

  const {
    NWVehicleNo,
    currentMileage,
    fuelAdded,
    fuelCost,
    date
  } = req.body;

  const payload = {
    NWVehicleNo,
    currentMileage,
    fuelAdded,
    fuelCost,
    date,
    refueledBy,
  };

  if (req.file) {
    payload.receiptImage = req.file.path || req.file.location;
  }

  try {
    const updated = await Refueling.update(payload, {
      where: { refuelingId }
    });

    if (updated[0] > 0) {
      const updatedRefueling = await Refueling.findByPk(refuelingId);
      res.json(updatedRefueling);
    } else {
      res.status(404).send('Refueling not found');
    }
  } catch (error) {
    console.error('Error updating refueling data:', error);
    res.status(500).send('Internal Server Error');
  }
};


const deleteRefueling = async (req, res) => {
  const { refuelingId } = req.params;
  try {
    const deleted = await Refueling.destroy({
      where: { refuelingId: refuelingId }
    });
    if (deleted) {
      res.send('Refueling deleted');
    } else {
      res.status(404).send('Refueling not found');
    }
  } catch (error) {
    console.error('Error deleting refueling:', error);
    res.status(500).send('Internal Server Error');
  }
};

const showRefueling = async (req, res) => {
  try {
    const refuelings = await Refueling.findAll({
      include: [
        {
          model: Users,
        },
        {
          model: Vehicle,
        }
      ]
    });

    if (refuelings.length > 0) {
      res.status(200).json(refuelings);
    } else {
      res.status(404).send('No refueling records found');
    }
  } catch (error) {
    console.error('Error fetching refueling records:', error);
    res.status(500).send('Internal Server Error');
  }
};

const showRefuelingForVehicle = async (req, res) => {
  const { NWVehicleNo } = req.params;

  try {
    const refuelings = await Refueling.findAll({
      include: [
        {
          model: Users,
          attributes: ['email', 'firstName', 'lastName', 'profile_pic'],
        },
        {
          model: Vehicle
        }
      ],
      where: { NWVehicleNo: NWVehicleNo }
    });

    if (refuelings.length > 0) {
      res.status(200).json(refuelings);
    } else {
      res.status(404).send('No refueling records found for the specified vehicle');
    }
  } catch (error) {
    console.error('Error fetching refueling records for vehicle:', error);
    res.status(500).send('Internal Server Error');
  }
};

const getRefuelingById = async (req, res) => {
  const { refuelingId } = req.params;

  try {
    const refueling = await Refueling.findByPk(refuelingId, {
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

    if (!refueling) {
      return res.status(404).send('Refueling not found');
    }

    res.status(200).json(refueling);
  } catch (error) {
    console.error('Error fetching refueling by ID:', error);
    res.status(500).send('Internal Server Error');
  }
};

const getAvailableYears = async (req, res) => {
  try {
    const refueling = await Refueling.findAll({
      attributes: ['date']
    });

    const fiscalYearsSet = new Set();

    refueling.forEach(record => {
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
    console.error('Error fetching refueling years:', error);
    res.status(500).send('Internal Server Error');
  }
};


const getMonthlyRefuelingData = async (req, res) => {
  const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

  try {
    // Fiscal Year: Aug YYYY → Jul YYYY+1
    const startDate = new Date(year, 6, 1);      // August 1st of selected year
    const endDate = new Date(year + 1, 5, 31);   // July 31st of the next year

    const refuelings = await Refueling.findAll({
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col('date')), 'year'],
        [Sequelize.fn('MONTH', Sequelize.col('date')), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('refuelingId')), 'refuelingsCount'],
        [Sequelize.fn('SUM', Sequelize.col('fuelCost')), 'totalFuelCost']
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

    res.json(refuelings.map(item => ({
      year: item.dataValues.year,
      month: `${item.dataValues.year}-${item.dataValues.month}`,
      totalFuelCost: item.dataValues.totalFuelCost,
      refuelingsCount: item.dataValues.refuelingsCount
    })));
  } catch (error) {
    console.error('Error fetching monthly refueling data:', error);
    res.status(500).send('Internal Server Error');
  }
};


const getPaginatedRefuelingReport = async (req, res) => {
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

    const { count, rows } = await Refueling.findAndCountAll({
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
      refuelings: rows,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Error fetching paginated refueling report:', error);
    res.status(500).send('Internal Server Error');
  }
};





module.exports = { addRefueling, editRefueling, deleteRefueling, showRefueling, showRefuelingForVehicle, getMonthlyRefuelingData, getAvailableYears, getPaginatedRefuelingReport, getRefuelingById }