import { useState } from 'react';

const CreateIssueModal = ({ members, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee_id: '',
    due_date: '',
  });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    await onCreate(formData);
    setCreating(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Create issue</h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Title</label>
            <input
              style={styles.input}
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Fix login bug"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              style={{ ...styles.input, height: '70px', resize: 'vertical' }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional details"
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Priority</label>
              <select
                style={styles.input}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Assignee</label>
              <select
                style={styles.input}
                value={formData.assignee_id}
                onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Due date</label>
            <input
              style={styles.input}
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div style={styles.footer}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.createBtn} disabled={creating}>
              {creating ? 'Creating...' : 'Create issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
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
    maxWidth: '480px',
  },
  title: { fontSize: '20px', fontWeight: '600', margin: '0 0 1.5rem' },
  field: { marginBottom: '16px' },
  row: { display: 'flex', gap: '12px' },
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
  footer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' },
  cancelBtn: {
    padding: '10px 18px',
    backgroundColor: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
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
};

export default CreateIssueModal;