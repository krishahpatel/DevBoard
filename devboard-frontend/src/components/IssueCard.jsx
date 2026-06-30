import { Draggable } from '@hello-pangea/dnd';

const priorityColors = {
  low: { bg: '#dcfce7', text: '#166534' },
  medium: { bg: '#fef3c7', text: '#92400e' },
  high: { bg: '#fee2e2', text: '#991b1b' },
};

const IssueCard = ({ issue, index, onClick }) => {
  const colors = priorityColors[issue.priority] || priorityColors.medium;

  return (
    <Draggable draggableId={issue.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...styles.card,
            ...provided.draggableProps.style,
            boxShadow: snapshot.isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.04)',
          }}
          onClick={() => onClick(issue)}
        >
          <p style={styles.title}>{issue.title}</p>

          <div style={styles.footer}>
            <span style={{ ...styles.badge, backgroundColor: colors.bg, color: colors.text }}>
              {issue.priority}
            </span>

            {issue.assignee_name && (
              <span style={styles.assignee} title={issue.assignee_name}>
                {issue.assignee_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

const styles = {
  card: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '10px',
    cursor: 'pointer',
  },
  title: { fontSize: '14px', fontWeight: '500', margin: '0 0 10px', lineHeight: '1.4' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '999px',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  assignee: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '11px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default IssueCard;