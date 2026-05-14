import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshAccessToken();
  }, []);

  const refreshAccessToken = async () => {
    try {
      const { data } = await api.post('/auth/refresh');
      setToken(data.accessToken);
      localStorage.setItem('token', data.accessToken);
      const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
      setUser({ id: payload.userId, name: payload.name, role: payload.role });
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      async (err) => {
        if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED') {
          await refreshAccessToken();
          const newToken = localStorage.getItem('token');
          if (newToken) {
            err.config.headers.Authorization = `Bearer ${newToken}`;
            return api(err.config);
          }
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, refreshAccessToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
