import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import { FileText, File, Clock, Shield } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState({
    notes: 0,
    files: 0,
    recentActivity: []
  });

  const { data: notesData } = useQuery('dashboardNotes', () => 
    api.get('/notes?limit=1').then(res => res.data)
  );

  const { data: filesData } = useQuery('dashboardFiles', () => 
    api.get('/files').then(res => res.data)
  );

  const { data: logsData } = useQuery('dashboardLogs', () => 
    api.get('/audit/my-logs?limit=5').then(res => res.data)
  );

  useEffect(() => {
    setStats({
      notes: notesData?.pagination?.total || 0,
      files: filesData?.files?.length || 0,
      recentActivity: logsData?.logs || []
    });
  }, [notesData, filesData, logsData]);

  const statCards = [
    { name: 'Total Notes', value: stats.notes, icon: FileText, color: 'bg-blue-500' },
    { name: 'Uploaded Files', value: stats.files, icon: File, color: 'bg-green-500' },
    { name: 'Security Status', value: 'Active', icon: Shield, color: 'bg-purple-500' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.name} className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <card.icon className={`h-6 w-6 text-white ${card.color} rounded-md p-1`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">{card.name}</dt>
                    <dd className="text-lg font-medium text-gray-900">{card.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {stats.recentActivity.length === 0 ? (
              <li className="px-4 py-4 text-sm text-gray-500">No recent activity</li>
            ) : (
              stats.recentActivity.map((log) => (
                <li key={log.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.action}</p>
                        <p className="text-sm text-gray-500">{log.description}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">
                      {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
