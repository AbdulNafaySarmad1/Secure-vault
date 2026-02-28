import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Notes = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(['notes', page], () =>
    api.get(`/notes?page=${page}&limit=10`).then(res => res.data)
  );

  const createMutation = useMutation(
    (data) => api.post('/notes', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notes');
        toast.success('Note created successfully');
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create note');
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/notes/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notes');
        toast.success('Note updated successfully');
        resetForm();
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/notes/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notes');
        toast.success('Note deleted successfully');
      }
    }
  );

  const resetForm = () => {
    setIsEditing(false);
    setCurrentNote(null);
    setFormData({ title: '', content: '' });
  };

  const handleEdit = async (note) => {
    try {
      const response = await api.get(`/notes/${note.id}`);
      setCurrentNote(note);
      setFormData({
        title: response.data.note.title,
        content: response.data.note.content
      });
      setIsEditing(true);
    } catch (error) {
      toast.error('Failed to load note');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentNote) {
      updateMutation.mutate({ id: currentNote.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Notes</h1>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </button>
      </div>

      {isEditing && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">
              {currentNote ? 'Edit Note' : 'Create New Note'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {currentNote ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {data?.notes?.length === 0 ? (
            <li className="px-6 py-4 text-gray-500">No notes yet. Create your first note!</li>
          ) : (
            data?.notes?.map((note) => (
              <li key={note.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{note.title}</h3>
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
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

export default Notes;
