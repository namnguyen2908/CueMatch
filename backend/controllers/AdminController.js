const { fetchDashboardData } = require('../services/adminDashboardService');

const AdminController = {
  getDashboardOverview: async (_req, res) => {
    try {
      const payload = await fetchDashboardData();
      res.status(200).json(payload);
    } catch (error) {
      console.error('getDashboardOverview error:', error);
      res.status(500).json({ message: 'Unable to fetch dashboard data' });
    }
  },
};

module.exports = AdminController;

