import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import userApi from '../../api/userApi';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b'];

const Dashboard = () => {
  const [userStats, setUserStats] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);

  useEffect(() => {
    fetchUserStats();
    fetchRecentUsers();
    fetchUserGrowth(); // giả sử bạn có API lấy user theo thời gian
  }, []);

  const fetchUserStats = async () => {
    try {
      const data = await userApi.getUserStats();
      const formatted = [
        { name: 'User', value: data.roles.user || 0 },
        { name: 'Admin', value: data.roles.admin || 0 },
        { name: 'Partner', value: data.roles.partner || 0 }
      ];
      setUserStats(formatted);
    } catch (error) {
      console.error("Error fetching stats", error);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const res = await userApi.getAllUsers({ page: 1, limit: 5 });
      setRecentUsers(res.data);
    } catch (error) {
      console.error("Error fetching recent users", error);
    }
  };

  const fetchUserGrowth = async () => {
    try {
      // 👉 Bạn phải tạo API trả về dữ liệu user theo tháng (hoặc ngày)
      const res = await userApi.getUserGrowth(); // ví dụ [{month: 'Sep', count: 30}, ...]
      setUserGrowth(res);
    } catch (error) {
      console.error("Error fetching growth", error);
    }
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

        {/* Biểu đồ thống kê vai trò */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">User Roles Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {userStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ tăng trưởng user theo tháng */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">User Growth (Monthly)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Danh sách người dùng gần đây */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h2>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.Avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{user.Name}</p>
                    <p className="text-sm text-gray-500">{user.Email}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 capitalize">{user.Role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
