import { useAuth } from '../context/AuthContext';

const RoleGate = ({ allowedRoles, children, fallback = null }) => {
  const { user } = useAuth();
  return user && allowedRoles.includes(user.role) ? children : fallback;
};

export default RoleGate;
