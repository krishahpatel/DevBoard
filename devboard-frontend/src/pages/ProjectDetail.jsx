import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import IssueCard from '../components/IssueCard';
import CreateIssueModal from '../components/CreateIssueModal';
import AddMemberModal from '../components/AddMemberModal';
import MembersBar from '../components/MembersBar';

const columns = [
  { key: 'todo', label: 'Todo' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [projectRes, issuesRes, membersRes] = await Promise.all([
        api.get(`/api/projects/${id}`),
        api.get(`/api/projects/${id}/issues`),
        api.get(`/api/projects/${id}/members`),
      ]);
      setProject(projectRes.data.project);
      setIssues(issuesRes.data.issues);
      setMembers(membersRes.data.members);
    } catch (err) {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateIssue = async (formData) => {
    try {
      const payload = {
        ...formData,
        assignee_id: formData.assignee_id || null,
        due_date: formData.due_date || null,
      };
      await api.post(`/api/projects/${id}/issues`, payload);
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create issue');
    }
  };

  const handleInviteMember = async (email) => {
    try {
      await api.post(`/api/projects/${id}/members`, { email });
      fetchData();
      return { success: true };
    } catch (err) {
      return { error: err.response?.data?.error || 'Failed to invite member' };
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;

    try {
      await api.delete(`/api/projects/${id}/members/${userId}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove member');
    }
  };

  const getIssuesByStatus = (status) => {
    return issues.filter((issue) => issue.status === status);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <p style={{ padding: '2rem', color: '#666' }}>Loading project...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{project?.name}</h1>
            <p style={styles.subtitle}>{project?.description || 'No description'}</p>
          </div>
          <button style={styles.createBtn} onClick={() => setShowModal(true)}>
            + New Issue
          </button>
        </div>

        <MembersBar
          members={members}
          isOwner={project?.your_role === 'owner'}
          onAddClick={() => setShowMemberModal(true)}
          onRemove={handleRemoveMember}
        />

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.board}>
          {columns.map((col) => {
            const colIssues = getIssuesByStatus(col.key);
            return (
              <div key={col.key} style={styles.column}>
                <div style={styles.columnHeader}>
                  <span style={styles.columnTitle}>{col.label}</span>
                  <span style={styles.columnCount}>{colIssues.length}</span>
                </div>

                <div style={styles.columnBody}>
                  {colIssues.length === 0 ? (
                    <p style={styles.emptyCol}>No issues</p>
                  ) : (
                    colIssues.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} onClick={() => {}} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <CreateIssueModal
          members={members}
          onClose={() => setShowModal(false)}
          onCreate={handleCreateIssue}
        />
      )}

      {showMemberModal && (
        <AddMemberModal
          onClose={() => setShowMemberModal(false)}
          onInvite={handleInviteMember}
        />
      )}
      
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f9fafb' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  title: { fontSize: '26px', fontWeight: '700', margin: '0 0 4px' },
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
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  column: {
    backgroundColor: '#f1f3f5',
    borderRadius: '8px',
    padding: '12px',
    minHeight: '400px',
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    padding: '0 4px',
  },
  columnTitle: { fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em' },
  columnCount: {
    fontSize: '12px',
    color: '#6b7280',
    backgroundColor: 'white',
    padding: '2px 8px',
    borderRadius: '999px',
  },
  columnBody: { maxHeight: '600px', overflowY: 'auto' },
  emptyCol: { fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '2rem 0' },
};

export default ProjectDetail;