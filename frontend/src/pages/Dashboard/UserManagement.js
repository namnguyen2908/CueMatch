import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import userApi from '../../api/userApi';
import { toast } from 'react-toastify';
import { FaSearch, FaTrash, FaUser, FaEnvelope, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await userApi.getAllUsers({
        page,
        limit: 20,
        search,
      });
      setUsers(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(userId);
      await userApi.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers(currentPage, searchTerm);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadge = (role) => {
    const badges = {
      user: 'bg-blue-100 text-blue-800 border-blue-200',
      partner: 'bg-purple-100 text-purple-800 border-purple-200',
      admin: 'bg-red-100 text-red-800 border-red-200',
    };
    return badges[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage and monitor all users in the system</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 px-6 bg-indigo-600 text-white rounded-r-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </form>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500 mb-1">Total Users</p>
            <p className="text-2xl font-semibold text-gray-900">{pagination.total}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500 mb-1">Current Page</p>
            <p className="text-2xl font-semibold text-gray-900">
              {pagination.page} / {pagination.totalPages || 1}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500 mb-1">Users Per Page</p>
            <p className="text-2xl font-semibold text-gray-900">{pagination.limit}</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <FaUser className="mx-auto text-gray-400 text-4xl mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id || user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={user.Avatar || 'https://via.placeholder.com/40'}
                              alt={user.Name}
                              className="h-10 w-10 rounded-full object-cover mr-3"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.Name || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <FaEnvelope className="mr-2 text-gray-400" />
                            {user.Email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(
                              user.Role
                            )}`}
                          >
                            <FaShieldAlt className="mr-1" />
                            {user.Role ? user.Role.charAt(0).toUpperCase() + user.Role.slice(1) : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <FaCalendarAlt className="mr-2 text-gray-400" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDelete(user._id || user.id, user.Name)}
                            disabled={deletingId === (user._id || user.id)}
                            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              deletingId === (user._id || user.id)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            }`}
                          >
                            <FaTrash className="mr-2" />
                            {deletingId === (user._id || user.id) ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pagination.totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement;

