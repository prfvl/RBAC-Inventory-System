import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

const fetchUsers = async () => {
  const { data } = await api.get('/users');
  return data;
};

const UserManagement = () => {
  const { data: users, isLoading, refetch } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

  const handleRoleChange = async (id, role) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      refetch();
    } catch (e) {
      console.error(e);
      alert('Failed to change role');
    }
  };

  if (isLoading) return <div>Loading users...</div>;

  return (
    <div>
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users?.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select 
                  value={user.role} 
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  style={{ padding: '0.25rem', borderRadius: '4px' }}
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </td>
              <td>{user.isActive ? 'Active' : 'Inactive'}</td>
              <td>
                <button className="btn btn-danger" disabled>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
