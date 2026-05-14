import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleGate from '../guards/RoleGate';
import api from '../api/axios';
import Inventory from './Inventory';
import AuditLog from './AuditLog';
import UserManagement from './UserManagement';
import Unauthorized from './Unauthorized';

const Dashboard = () => {
  const { user, setToken, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>InvSys</h2>
          <p>Welcome, {user?.name}</p>
          <span className="badge">{user?.role}</span>
        </div>
        <nav>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Inventory</Link>
          <RoleGate allowedRoles={['Manager', 'Admin']}>
            <Link to="/audit" className={location.pathname === '/audit' ? 'active' : ''}>Audit Logs</Link>
          </RoleGate>
          <RoleGate allowedRoles={['Admin']}>
            <Link to="/users" className={location.pathname === '/users' ? 'active' : ''}>Users</Link>
          </RoleGate>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%' }}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Inventory />} />
          <Route path="/audit" element={<AuditLog />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
