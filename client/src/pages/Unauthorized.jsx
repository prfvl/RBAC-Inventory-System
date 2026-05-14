import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>403 - Unauthorized</h1>
      <p>You do not have permission to view this page.</p>
      <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
        Return to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;
