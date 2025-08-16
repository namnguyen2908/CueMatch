import React, { useState } from 'react';
import { 
  Users, 
  MessageCircle, 
  Trophy, 
  Target, 
  Activity, 
  Settings, 
  Bell, 
  Search, 
  TrendingUp, 
  Calendar,
  Flag,
  UserCheck,
  DollarSign,
  MapPin,
  Play,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data với màu tối hơn
  const statsData = [
    { name: 'T2', users: 1200, matches: 45, posts: 89, revenue: 15.2 },
    { name: 'T3', users: 1350, matches: 52, posts: 95, revenue: 18.4 },
    { name: 'T4', users: 1100, matches: 38, posts: 67, revenue: 12.8 },
    { name: 'T5', users: 1450, matches: 61, posts: 102, revenue: 22.1 },
    { name: 'T6', users: 1680, matches: 78, posts: 134, revenue: 28.5 },
    { name: 'T7', users: 1920, matches: 89, posts: 156, revenue: 32.7 },
    { name: 'CN', users: 2100, matches: 95, posts: 178, revenue: 35.9 }
  ];

  const userTypeData = [
    { name: 'Người chơi thường', value: 65, color: '#4f46e5' },
    { name: 'Người chơi pro', value: 25, color: '#059669' },
    { name: 'Chủ club', value: 8, color: '#d97706' },
    { name: 'Admin', value: 2, color: '#dc2626' }
  ];

  const monthlyData = [
    { month: 'T1', matches: 450, revenue: 125.5 },
    { month: 'T2', matches: 520, revenue: 142.8 },
    { month: 'T3', matches: 380, revenue: 105.2 },
    { month: 'T4', matches: 610, revenue: 168.9 },
    { month: 'T5', matches: 720, revenue: 195.4 },
    { month: 'T6', matches: 850, revenue: 225.7 }
  ];

  const recentUsers = [
    { id: 1, name: 'Nguyễn Văn A', email: 'nva@email.com', type: 'Pro Player', status: 'active', joinDate: '2024-08-10', matches: 45 },
    { id: 2, name: 'Trần Thị B', email: 'ttb@email.com', type: 'Regular', status: 'active', joinDate: '2024-08-09', matches: 12 },
    { id: 3, name: 'Lê Văn C', email: 'lvc@email.com', type: 'Club Owner', status: 'pending', joinDate: '2024-08-08', matches: 28 },
    { id: 4, name: 'Phạm Thị D', email: 'ptd@email.com', type: 'Regular', status: 'active', joinDate: '2024-08-07', matches: 8 }
  ];

  const recentMatches = [
    { id: 1, player1: 'Nguyễn Văn A', player2: 'Trần Thị B', result: '3-2', type: '8-Ball', date: '2024-08-14 10:30', status: 'completed' },
    { id: 2, player1: 'Lê Văn C', player2: 'Phạm Thị D', result: '4-1', type: '9-Ball', date: '2024-08-14 09:15', status: 'completed' },
    { id: 3, player1: 'Hoàng Văn E', player2: 'Vũ Thị F', result: '2-3', type: '8-Ball', date: '2024-08-13 16:45', status: 'live' }
  ];

  const StatCard = ({ icon: Icon, title, value, change, color, bgGradient, chartData, chartType = 'line' }) => (
    <div className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${bgGradient} p-6 border border-white/10`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold ${
              change > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <h3 className="text-white/80 text-sm font-medium mb-1">{title}</h3>
          <p className="text-white text-3xl font-bold">{value}</p>
        </div>

        {/* Mini Chart */}
        {chartData && (
          <div className="h-16 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(255,255,255,0.3)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="rgba(255,255,255,0.1)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="rgba(255,255,255,0.8)" 
                    strokeWidth={2}
                    fill={`url(#gradient-${color})`}
                  />
                </AreaChart>
              ) : (
                <LineChart data={chartData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="rgba(255,255,255,0.8)" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      {/* Glassmorphism effect */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </div>
  );

  const ChartCard = ({ title, children, className = "" }) => (
    <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
        <span>{title}</span>
      </h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  BilliardsNet Admin
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm..." 
                  className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-64 backdrop-blur-sm transition-all duration-300"
                />
              </div>
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-semibold">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 min-h-screen">
          <div className="p-6">
            <div className="space-y-2">
              {[
                { id: 'overview', label: 'Tổng quan', icon: Activity },
                { id: 'users', label: 'Người dùng', icon: Users },
                { id: 'matches', label: 'Trận đấu', icon: Trophy },
                { id: 'content', label: 'Nội dung', icon: MessageCircle },
                { id: 'clubs', label: 'Câu lạc bộ', icon: MapPin },
                { id: 'reports', label: 'Báo cáo', icon: Flag }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    activeTab === item.id 
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  icon={Users} 
                  title="Tổng người dùng" 
                  value="12,453" 
                  change={8.2}
                  color="blue"
                  bgGradient="bg-gradient-to-br from-blue-600 to-blue-800"
                  chartData={[{value: 1200}, {value: 1350}, {value: 1450}, {value: 1680}, {value: 1920}, {value: 2100}]}
                  chartType="area"
                />
                <StatCard 
                  icon={Trophy} 
                  title="Trận đấu hôm nay" 
                  value="89" 
                  change={-2.1}
                  color="green"
                  bgGradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
                  chartData={[{value: 45}, {value: 52}, {value: 61}, {value: 78}, {value: 89}, {value: 95}]}
                />
                <StatCard 
                  icon={MessageCircle} 
                  title="Bài đăng mới" 
                  value="234" 
                  change={12.5}
                  color="purple"
                  bgGradient="bg-gradient-to-br from-purple-600 to-purple-800"
                  chartData={[{value: 89}, {value: 95}, {value: 102}, {value: 134}, {value: 156}, {value: 178}]}
                  chartType="area"
                />
                <StatCard 
                  icon={DollarSign} 
                  title="Doanh thu tháng" 
                  value="₫45.2M" 
                  change={15.3}
                  color="orange"
                  bgGradient="bg-gradient-to-br from-orange-600 to-red-600"
                  chartData={[{value: 15.2}, {value: 18.4}, {value: 22.1}, {value: 28.5}, {value: 32.7}, {value: 35.9}]}
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Chart */}
                <ChartCard title="Hoạt động trong tuần" className="lg:col-span-2">
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={statsData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151', 
                          borderRadius: '12px',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }} 
                      />
                      <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fill="url(#colorUsers)" />
                      <Area type="monotone" dataKey="matches" stroke="#10b981" strokeWidth={2} fill="url(#colorMatches)" />
                      <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex items-center space-x-6 mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-slate-300 text-sm">Người dùng</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-slate-300 text-sm">Trận đấu</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-slate-300 text-sm">Doanh thu (M)</span>
                    </div>
                  </div>
                </ChartCard>

                {/* User Types Chart */}
                <ChartCard title="Phân loại người dùng">
                  <div className="h-48 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {userTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #374151', 
                            borderRadius: '8px' 
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-3">
                    {userTypeData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: item.color }}></div>
                          <span className="text-slate-300 text-sm">{item.name}</span>
                        </div>
                        <span className="text-white text-sm font-semibold bg-slate-700/50 px-2 py-1 rounded-lg">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>

              {/* Monthly Revenue Chart */}
              <ChartCard title="Thống kê theo tháng">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyData}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151', 
                        borderRadius: '12px' 
                      }} 
                    />
                    <Bar 
                      dataKey="matches" 
                      fill="url(#barGradient)" 
                      radius={[8, 8, 0, 0]}
                      className="hover:opacity-80 transition-opacity duration-200"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <ChartCard title="Người dùng mới">
                  <div className="space-y-4">
                    {recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all duration-300 border border-slate-600/30">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-semibold">{user.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{user.name}</p>
                            <p className="text-sm text-slate-400">{user.type} • {user.matches} trận</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {user.status === 'active' ? 'Hoạt động' : 'Chờ duyệt'}
                        </span>
                      </div>
                    ))}
                  </div>
                </ChartCard>

                {/* Recent Matches */}
                <ChartCard title="Trận đấu gần đây">
                  <div className="space-y-4">
                    {recentMatches.map((match) => (
                      <div key={match.id} className="p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all duration-300 border border-slate-600/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-white">{match.player1}</span>
                            <span className="text-slate-400">vs</span>
                            <span className="font-medium text-white">{match.player2}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-blue-400 bg-blue-500/20 px-2 py-1 rounded-lg">
                              {match.result}
                            </span>
                            {match.status === 'live' && (
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-3 py-1 bg-slate-600/50 text-slate-300 rounded-full">
                            {match.type}
                          </span>
                          <span className="text-xs text-slate-400">{match.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">Quản lý người dùng</h2>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg">
                  Thêm người dùng
                </button>
              </div>
              
              <ChartCard title="Danh sách người dùng" className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Người dùng</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Loại</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Trận đấu</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Ngày tham gia</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-700/30 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">{user.name.charAt(0)}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">{user.name}</div>
                                <div className="text-sm text-slate-400">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-300">{user.type}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status === 'active' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {user.status === 'active' ? 'Hoạt động' : 'Chờ duyệt'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-white bg-slate-700/50 px-2 py-1 rounded-lg">{user.matches}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                            {user.joinDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500/20 rounded-lg transition-colors duration-200">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-slate-400 hover:text-slate-300 p-2 hover:bg-slate-500/20 rounded-lg transition-colors duration-200">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200">
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button className="text-slate-400 hover:text-slate-300 p-2 hover:bg-slate-500/20 rounded-lg transition-colors duration-200">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ChartCard>
            </div>
          )}

          {(activeTab === 'matches' || activeTab === 'content' || activeTab === 'clubs' || activeTab === 'reports') && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-600/30">
                {activeTab === 'matches' && <Trophy className="w-10 h-10 text-slate-400" />}
                {activeTab === 'content' && <MessageCircle className="w-10 h-10 text-slate-400" />}
                {activeTab === 'clubs' && <MapPin className="w-10 h-10 text-slate-400" />}
                {activeTab === 'reports' && <Flag className="w-10 h-10 text-slate-400" />}
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                {activeTab === 'matches' && 'Quản lý trận đấu'}
                {activeTab === 'content' && 'Quản lý nội dung'}
                {activeTab === 'clubs' && 'Quản lý câu lạc bộ'}
                {activeTab === 'reports' && 'Quản lý báo cáo'}
              </h3>
              <p className="text-slate-400 text-lg">Tính năng đang được phát triển...</p>
              <div className="mt-8">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 rounded-xl border border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300">
                  Sẽ có sẵn sớm
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;