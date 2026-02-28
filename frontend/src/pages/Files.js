import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { Upload, Download, Trash2, File as FileIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const Files = () => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('files', () =>
    api.get('/files').then(res => res.data)
  );

  const uploadMutation = useMutation(
    (formData) => api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('files');
        toast.success('File uploaded successfully');
        setIsUploading(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Upload failed');
        setIsUploading(false);
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/files/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('files');
        toast.success('File deleted successfully');
      }
    }
  );

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and PDF files are allowed');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);
  };

  const handleDownload = async (file) => {
    try {
      const response = await api.get(`/files/${file.id}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Files</h1>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {data?.files?.length === 0 ? (
            <li className="px-6 py-4 text-gray-500">No files uploaded yet.</li>
          ) : (
            data?.files?.map((file) => (
              <li key={file.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <FileIcon className="h-8 w-8 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{file.originalName}</h3>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {file.mimeType.split('/')[1].toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Files;
