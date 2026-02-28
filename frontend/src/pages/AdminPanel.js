import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { Users, Shield, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: usersData, isLoading: usersLoading } = useQuery('adminUsers', () =>
    api.get('/users').then(res => res.data)
  );

  const { data: logsData, isLoading: logsLoading } = useQuery('adminLogs', () =>
    api.get('/audit/all?limit=50').then(res => res.data)
  );

  const updateUserMutation = useMutation(
    ({ id, data }) => api.put(`/users/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        toast.success('User updated successfully');
        setSelectedUser(null);
      }
    }
  );

  const handleRoleChange = (userId, newRole) => {
    updateUserMutation.mutate({ id: userId, data: { role: newRole } });
  };

  const handleStatusChange = (userId, isActive) => {
    updateUserMutation.mutate({ id: userId, data: { isActive } });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'guest': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Admin Panel</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Management */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Management
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usersLoading ? (
                  <tr><td colSpan="4" className="px-6 py-4 text-center">Loading...</td></tr>
                ) : (
                  usersData?.users?.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="mr-2 text-xs border rounded p-1"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="guest">Guest</option>
                        </select>
                        <button
                          onClick={() => handleStatusChange(user.id, !user.isActive)}
                          className={`p-1 rounded ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Live Audit Log
            </h3>
          </div>
          <div className="overflow-hidden max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logsLoading ? (
                  <tr><td colSpan="3" className="px-4 py-4 text-center">Loading...</td></tr>
                ) : (
                  logsData?.logs?.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{log.action}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{log.User?.email || 'System'}</td>
                      <td className="px-4 py-2 text-xs text-gray-400">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
