const AuditLog = require('../models/auditLog.model');
const { Op } = require('sequelize');

const auditController = {
  getMyLogs: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const { count, rows: logs } = await AuditLog.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      res.json({
        logs,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getAllLogs: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      const { count, rows: logs } = await AuditLog.findAndCountAll({
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        include: [{
          model: require('../models/user.model'),
          as: 'User',
          attributes: ['id', 'email', 'role']
        }]
      });

      res.json({
        logs,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = auditController;
