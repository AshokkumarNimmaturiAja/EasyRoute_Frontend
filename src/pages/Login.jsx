import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa';
import logo from '../assets/logo.png';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Route based on role
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if (user.role === 'ROLE_DRIVER') {
        navigate('/driver');
      } else if (user.role === 'ROLE_PICKUP') {
        navigate('/pickup');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 80px)',
      padding: '2rem 1rem'
    }}>
      <div className="glass-card" style={{ maxWidth: '440px', width: '100%', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.6rem',
            background: 'var(--color-primary-glow)',
            borderRadius: '16px',
            marginBottom: '1rem'
          }}>
            <img src={logo} alt="EasyRoute Logo" style={{ height: '48px', width: '48px', objectFit: 'contain' }} />
          </div>
          <h2 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Sign In to EasyRoute</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enter your credentials to access your dashboard</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 50, 50, 0.12)',
            border: '1px solid rgba(255, 50, 50, 0.25)',
            color: '#ff6b6b',
            padding: '0.8rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            lineHeight: '1.4'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                id="email"
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                id="password"
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginBottom: '1.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner size={18} className="pulse-icon" style={{ marginRight: 8, animation: 'spin 1s linear infinite' }} />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
