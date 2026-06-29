import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects');
      setProjects(res.data.projects);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      await api.post('/api/projects', formData);
      setFormData({ name: '', description: '' });
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (projectId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project? This cannot be undone.')) return;

    try {
      await api.delete(`/api/projects/${projectId}`);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete project');
    }
  };

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Projects</h1>
            <p style={styles.subtitle}>Manage all your projects in one place</p>
          </div>
          <button style={styles.createBtn} onClick={() => setShowModal(true)}>
            + New Project
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <p style={styles.muted}>Loading projects...</p>
        ) : projects.length === 0 ? (
          <div style={styles.empty}>
            <p>No projects yet.</p>
            <button style={styles.createBtn} onClick={() => setShowModal(true)}>
              Create your first project
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {projects.map((project) => (
              <div
                key={project.id}
                style={styles.card}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{project.name}</h3>
                  <span style={
                    project.role === 'owner' ? styles.ownerBadge : styles.memberBadge
                  }>
                    {project.role}
                  </span>
                </div>

                <p style={styles.cardDesc}>
                  {project.description || 'No description'}
                </p>

                <div style={styles.cardFooter}>
                  <span style={styles.cardDate}>
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                  {project.role === 'owner' && (
                    <button
                      style={styles.deleteBtn}
                      onClick={(e) => handleDelete(project.id, e)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Create new project</h2>

            <form onSubmit={handleCreate}>
              <div style={styles.field}>
                <label style={styles.label}>Project name</label>
                <input
                  style={styles.input}
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My awesome project"
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Description (optional)</label>
                <textarea
                  style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this project about?"
                />
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={creating ? styles.buttonDisabled : styles.createBtn}
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f9fafb' },
  container: { maxWidth: '1000px', margin: '0 auto', padding: '2rem' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  title: { fontSize: '28px', fontWeight: '700', margin: '0 0 4px' },
  subtitle: { color: '#666', fontSize: '14px', margin: 0 },
  createBtn: {
    padding: '10px 18px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  muted: { color: '#666', fontSize: '14px' },
  empty: { textAlign: 'center', padding: '4rem 0', color: '#666' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  cardTitle: { fontSize: '16px', fontWeight: '600', margin: 0 },
  ownerBadge: {
    fontSize: '11px',
    padding: '2px 8px',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    borderRadius: '999px',
    fontWeight: '500',
  },
  memberBadge: {
    fontSize: '11px',
    padding: '2px 8px',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    borderRadius: '999px',
    fontWeight: '500',
  },
  cardDesc: { fontSize: '13px', color: '#666', margin: '0 0 12px', lineHeight: '1.5' },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: { fontSize: '12px', color: '#9ca3af' },
  deleteBtn: {
    padding: '4px 10px',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid #ef4444',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    width: '100%',
    maxWidth: '460px',
  },
  modalTitle: { fontSize: '20px', fontWeight: '600', margin: '0 0 1.5rem' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' },
  cancelBtn: {
    padding: '10px 18px',
    backgroundColor: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  buttonDisabled: {
    padding: '10px 18px',
    backgroundColor: '#93c5fd',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'not-allowed',
    fontSize: '14px',
  },
};

export default Dashboard;