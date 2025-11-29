const User = require('../models/User');
const Post = require('../models/Post');
const Payment = require('../models/Payment');

const buildRoleBreakdown = (roleStats = []) => {
  const roles = roleStats.reduce((acc, cur) => {
    if (!cur?._id) return acc;
    acc[cur._id] = cur.count;
    return acc;
  }, {});

  return [
    { name: 'user', value: roles.user || 0 },
    { name: 'admin', value: roles.admin || 0 },
    { name: 'partner', value: roles.partner || 0 },
  ];
};

const fetchDashboardData = async () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalUsers,
    roleStats,
    userGrowth,
    totalPosts,
    totalRevenueAggregation,
    revenueTrend,
    recentPayments,
    recentUsers,
    paidInvoicesCount,
  ] = await Promise.all([
    User.countDocuments(),
    User.aggregate([
      {
        $group: {
          _id: '$Role',
          count: { $sum: 1 },
        },
      },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id',
          count: 1,
        },
      },
    ]),
    Post.countDocuments(),
    Payment.aggregate([
      { $match: { Status: 'PAID' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$Amount' },
        },
      },
    ]),
    Payment.aggregate([
      {
        $match: {
          Status: 'PAID',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' },
          },
          total: { $sum: '$Amount' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id',
          total: 1,
        },
      },
    ]),
    Payment.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('User', 'Name Email')
      .populate('Plan', 'Name')
      .lean(),
    User.find()
      .select('Name Email Role createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Payment.countDocuments({ Status: 'PAID' }),
  ]);

  const overview = {
    totalUsers,
    totalPosts,
    totalRevenue: totalRevenueAggregation[0]?.total || 0,
    totalPaidInvoices: paidInvoicesCount,
  };

  return {
    overview,
    roleBreakdown: buildRoleBreakdown(roleStats),
    userGrowth,
    revenueTrend,
    recentPayments: recentPayments.map((payment) => ({
      id: payment._id,
      userName: payment.User?.Name || 'Không rõ',
      userEmail: payment.User?.Email || '',
      planName: payment.Plan?.Name || 'Không rõ',
      amount: payment.Amount,
      status: payment.Status,
      createdAt: payment.createdAt,
    })),
    recentUsers: recentUsers.map((user) => ({
      id: user._id,
      name: user.Name,
      email: user.Email,
      role: user.Role,
      createdAt: user.createdAt,
    })),
  };
};

const emitDashboardUpdate = async (io) => {
  if (!io) return;
  const payload = await fetchDashboardData();
  io.to('admins').emit('admin_dashboard_update', payload);
};

const queueDashboardUpdate = (app) => {
  if (!app) return;
  const io = app.get('socketio');
  if (!io) return;

  emitDashboardUpdate(io).catch((err) =>
    console.error('emitDashboardUpdate error:', err)
  );
};

module.exports = {
  fetchDashboardData,
  emitDashboardUpdate,
  queueDashboardUpdate,
};

