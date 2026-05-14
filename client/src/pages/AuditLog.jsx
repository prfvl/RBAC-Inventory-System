import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

const fetchAuditLogs = async () => {
  const { data } = await api.get('/audit');
  return data;
};

const AuditLog = () => {
  const { data, isLoading } = useQuery({ queryKey: ['audit'], queryFn: fetchAuditLogs });

  if (isLoading) return <div>Loading audit logs...</div>;

  return (
    <div>
      <h2>Audit Logs</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>User</th>
            <th>Role</th>
            <th>Action</th>
            <th>Target</th>
          </tr>
        </thead>
        <tbody>
          {data?.logs?.map(log => (
            <tr key={log._id}>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
              <td>{log.userName}</td>
              <td>{log.userRole}</td>
              <td><span className={`badge ${log.action.toLowerCase()}`}>{log.action}</span></td>
              <td>{log.targetModel} - {log.targetName || log.targetId}</td>
            </tr>
          ))}
          {(!data?.logs || data.logs.length === 0) && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>No logs found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLog;
