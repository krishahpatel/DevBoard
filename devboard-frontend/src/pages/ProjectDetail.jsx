import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ProjectDetail = () => {
  const { id } = useParams();

  return (
    <div>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h1>Project {id}</h1>
        <p style={{ color: '#666' }}>Kanban board coming soon.</p>
      </div>
    </div>
  );
};

export default ProjectDetail;