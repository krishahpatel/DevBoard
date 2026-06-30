import { useState } from 'react';

const AddMemberModal = ({ onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInviting(true);
    setError('');

    const result = await onInvite(email);
    if (result?.error) {
      setError(result.error);
    } else {
      setEmail('');
    }
    setInviting(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Invite member</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              required
            />
          </div>

          <div style={styles.footer}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Close
            </button>
            <button type="submit" style={styles.inviteBtn} disabled={inviting}>
              {inviting ? 'Inviting...' : 'Send invite'}
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
    maxWidth: '420px',
  },
  title: { fontSize: '20px', fontWeight: '600', margin: '0 0 1.5rem' },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '16px',
  },
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
  inviteBtn: {
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

export default AddMemberModal;