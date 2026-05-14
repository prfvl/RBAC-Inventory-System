import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser, setToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await api.post('/auth/register', { name, email, password, role: 'Viewer' });
        setIsRegistering(false);
        setError('');
        alert('Registration successful! Please login.');
      } else {
        const { data } = await api.post('/auth/login', { email, password });
        setToken(data.accessToken);
        localStorage.setItem('token', data.accessToken);
        setUser(data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || (isRegistering ? 'Registration failed' : 'Login failed'));
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>{isRegistering ? 'Register Account' : 'Login to Inventory System'}</h2>
        {error && <div className="error">{error}</div>}
        
        {isRegistering && (
          <input 
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        )}

        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        
        <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
          {isRegistering ? 'Already have an account? ' : 'Need an account? '}
          <button 
            type="button" 
            onClick={() => setIsRegistering(!isRegistering)} 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
          >
            {isRegistering ? 'Login here' : 'Register here'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
