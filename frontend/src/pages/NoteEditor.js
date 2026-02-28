import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import notesService from '../services/notes.service';

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchNote();
    }
  }, [id]);

  const fetchNote = async () => {
    try {
      const response = await notesService.getById(id);
      setTitle(response.data.note.title);
      setContent(response.data.note.content);
    } catch (err) {
      setError('Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (isEditing) {
        await notesService.update(id, { title, content });
      } else {
        await notesService.create({ title, content });
      }
      navigate('/notes');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save note');
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1>{isEditing ? 'Edit Note' : 'New Note'}</h1>

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}
          required
        />

        <textarea
          placeholder="Note Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            width: '100%',
            height: '400px',
            padding: '0.75rem',
            marginBottom: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            resize: 'vertical',
            fontFamily: 'monospace'
          }}
          required
        />

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '0.75rem 2rem',
              background: '#1a1a2e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            {saving ? 'Saving...' : 'Save Note'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/notes')}
            style={{
              padding: '0.75rem 2rem',
              background: 'white',
              color: '#1a1a2e',
              border: '1px solid #1a1a2e',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#e0f2fe', borderRadius: '4px', fontSize: '0.875rem' }}>
        <strong>🔐 Security Note:</strong> All content is encrypted with AES-256 before being stored in the database.
      </div>
    </div>
  );
};

export default NoteEditor;
