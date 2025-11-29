import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from './Layout';
import adminApi from '../../api/adminApi';
import socket from '../../socket';
import ErrorToast from '../../components/ErrorToast/ErrorToast';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const ROLE_COLORS = ['#2563eb', '#059669', '#f97316'];
const STATUS_BADGES = {
  PAID: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  PENDING: 'text-amber-700 bg-amber-50 border-amber-200',
  FAILED: 'text-rose-700 bg-rose-50 border-rose-200',
};

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '--';

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="text-2xl font-semibold text-gray-900">{value}</p>
    {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [roleBreakdown, setRoleBreakdown] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const applyDashboardPayload = useCallback((data) => {
    setOverview(data.overview);
    setRoleBreakdown(data.roleBreakdown);
    setUserGrowth(data.userGrowth);
    setRevenueTrend(data.revenueTrend);
    setRecentPayments(data.recentPayments);
    setRecentUsers(data.recentUsers);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getDashboard();
        if (!isMounted) return;
        applyDashboardPayload(data);
      } catch (err) {
        if (!isMounted) return;
        console.error('Dashboard load error:', err);
        setError('Cannot load dashboard data');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, [applyDashboardPayload]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleDashboardUpdate = (data) => {
      applyDashboardPayload(data);
    };

    socket.on('admin_dashboard_update', handleDashboardUpdate);

    return () => {
      socket.off('admin_dashboard_update', handleDashboardUpdate);
    };
  }, [applyDashboardPayload]);

  const combinedTrend = useMemo(() => {
    if (!userGrowth?.length && !revenueTrend?.length) return [];
    const dataMap = new Map();

    userGrowth.forEach((entry) => {
      dataMap.set(entry.month, { month: entry.month, users: entry.count, revenue: 0 });
    });

    revenueTrend.forEach((entry) => {
      const existing = dataMap.get(entry.month) || { month: entry.month, users: 0 };
      dataMap.set(entry.month, { ...existing, revenue: entry.total });
    });

    return Array.from(dataMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  }, [userGrowth, revenueTrend]);

  if (loading) {
    return (
      <Layout>
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading data...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <p className="text-rose-600">Unable to load dashboard data</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Users" value={overview?.totalUsers ?? 0} />
          <StatCard label="Total Posts" value={overview?.totalPosts ?? 0} />
          <StatCard label="Total Revenue" value={formatCurrency(overview?.totalRevenue ?? 0)} />
          <StatCard label="Paid Transactions" value={overview?.totalPaidInvoices ?? 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Role Distribution
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={roleBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {roleBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={ROLE_COLORS[index % ROLE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              User & Revenue Trend
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={combinedTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis
                  yAxisId="left"
                  stroke="#94a3b8"
                  tickFormatter={(value) => `${value}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#94a3b8"
                  tickFormatter={(value) =>
                    value >= 1000000 ? `${value / 1000000}tr` : value
                  }
                />
                <Tooltip
                  formatter={(value, name) =>
                    name === 'Users' ? value : formatCurrency(value)
                  }
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="users"
                  name="Users"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Payments
            </h2>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-3 last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {payment.userName}
                    </p>
                    <p className="text-sm text-gray-500">{payment.userEmail}</p>
                  </div>
                  <div className="mt-2 md:mt-0 md:text-right">
                    <p className="text-sm text-gray-500">{payment.planName}</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full border ${STATUS_BADGES[payment.status] || 'text-gray-700 bg-gray-100 border-gray-200'
                        }`}
                    >
                      {payment.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(payment.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
              {!recentPayments.length && (
                <p className="text-sm text-gray-500">
                  No recent transactions.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              New Users
            </h2>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="border-b pb-3 last:border-b-0">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
                    <span className="capitalize">{user.role}</span>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              ))}
              {!recentUsers.length && (
                <p className="text-sm text-gray-500">
                  No new users.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <ErrorToast error={error} onClose={() => setError('')} />
    </Layout>
  );
};

export default Dashboard;
