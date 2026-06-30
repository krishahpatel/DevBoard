const MembersBar = ({ members, isOwner, onAddClick, onRemove }) => {
  return (
    <div style={styles.container}>
      <div style={styles.avatars}>
        {members.map((m) => (
          <div key={m.user_id} style={styles.avatarWrapper} title={`${m.name} (${m.role})`}>
            <div style={m.role === 'owner' ? styles.ownerAvatar : styles.avatar}>
              {m.name.charAt(0).toUpperCase()}
            </div>
            {isOwner && m.role !== 'owner' && (
              <button
                style={styles.removeBtn}
                onClick={() => onRemove(m.user_id)}
                title={`Remove ${m.name}`}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {isOwner && (
        <button style={styles.addBtn} onClick={onAddClick}>
          + Add member
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '1.5rem',
  },
  avatars: { display: 'flex', gap: '8px' },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#6b7280',
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid white',
  },
  ownerAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid white',
  },
  removeBtn: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    fontSize: '11px',
    cursor: 'pointer',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    padding: '6px 14px',
    backgroundColor: 'transparent',
    color: '#2563eb',
    border: '1px solid #2563eb',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
};

export default MembersBar;