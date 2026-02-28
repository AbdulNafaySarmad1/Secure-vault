import React, { useState } from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import { History } from 'lucide-react';

const AuditLog = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(['auditLog', page], () =>
    api.get(`/audit/my-logs?page=${page}&limit=20`).then(res => res.data)
  );

  const getActionColor = (action) => {
    if (action.includes('LOGIN')) return 'text-green-600';
    if (action.includes('FAILED')) return 'text-red-600';
    if (action.includes('DELETE')) return 'text-red-600';
    if (action.includes('CREATE')) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <History className="h-6 w-6 mr-2 text-gray-600" />
        <h1 className="text-2xl font-semibold text-gray-900">My Activity Log</h1>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : data?.logs?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No activity recorded yet.</td>
                </tr>
              ) : (
                data?.logs?.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{log.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ipAddress}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data?.pagination?.totalPages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {page} of {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
            disabled={page === data.pagination.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
