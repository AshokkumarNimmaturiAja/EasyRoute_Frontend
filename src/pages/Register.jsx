import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaTag, FaTruck, FaIdCard, FaFileAlt, FaSpinner } from 'react-icons/fa';
import logo from '../assets/logo.png';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_CUSTOMER');
  
  // Driver specific fields
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [truckType, setTruckType] = useState('MINI');
  const [capacityTons, setCapacityTons] = useState('');
  const [rcDocumentUrl, setRcDocumentUrl] = useState('');
  const [licenseUrl, setLicenseUrl] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a fully qualified email address (e.g., user@domain.com or .co)');
      return;
    }

    setLoading(true);

    try {
      if (role === 'ROLE_DRIVER') {
        await register(name, email, phone, password, role, {
          registrationNumber, truckType, capacityTons: parseFloat(capacityTons), rcDocumentUrl, licenseUrl
        });
      } else {
        await register(name, email, phone, password, role);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
      <div className="glass-card" style={{ maxWidth: '480px', width: '100%', borderRadius: 'var(--radius-lg)' }}>
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
          <h2 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join the EasyRoute Platform</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 50, 50, 0.12)',
            border: '1px solid rgba(255, 50, 50, 0.25)',
            color: '#ff6b6b',
            padding: '0.8rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(0, 230, 100, 0.12)',
            border: '1px solid rgba(0, 230, 100, 0.25)',
            color: '#00e664',
            padding: '0.8rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <FaUser size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                id="name"
                type="text"
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

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
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1rem', marginBottom: '0.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <FaPhone size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  id="phone"
                  type="text"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">Platform Role</label>
              <div style={{ position: 'relative' }}>
                <FaTag size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <select
                  id="role"
                  className="form-select"
                  style={{ paddingLeft: '2.5rem' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="ROLE_CUSTOMER">Customer</option>
                  <option value="ROLE_DRIVER">Driver / Transporter</option>
                  <option value="ROLE_PICKUP">Pickup Partner</option>
                </select>
              </div>
            </div>
          </div>

          {role === 'ROLE_DRIVER' && (
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-light)' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--color-primary)' }}>Vehicle Details</h4>
              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="regNo">Vehicle Registration Number</label>
                  <div style={{ position: 'relative' }}>
                    <FaIdCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input id="regNo" type="text" required className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="e.g. MH12AB1234" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="truckType">Truck Type</label>
                  <div style={{ position: 'relative' }}>
                    <FaTruck size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <select id="truckType" className="form-select" style={{ paddingLeft: '2.5rem' }} value={truckType} onChange={(e) => setTruckType(e.target.value)}>
                      <option value="MINI">Mini Truck</option>
                      <option value="MEDIUM">Medium Duty</option>
                      <option value="LARGE">Large Duty</option>
                      <option value="HEAVY">Heavy Duty</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="capacity">Capacity (Tons)</label>
                <div style={{ position: 'relative' }}>
                  <FaTruck size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input id="capacity" type="number" step="0.1" min="0.1" required className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="e.g. 5.5" value={capacityTons} onChange={(e) => setCapacityTons(e.target.value)} />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="rcDoc">RC Document (Image)</label>
                  <div style={{ position: 'relative' }}>
                    <FaFileAlt size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input id="rcDoc" type="file" accept="image/*" required className="form-input" style={{ paddingLeft: '2.5rem', paddingTop: '0.6rem' }} onChange={(e) => handleFileChange(e, setRcDocumentUrl)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="licDoc">License Document (Image)</label>
                  <div style={{ position: 'relative' }}>
                    <FaFileAlt size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input id="licDoc" type="file" accept="image/*" required className="form-input" style={{ paddingLeft: '2.5rem', paddingTop: '0.6rem' }} onChange={(e) => handleFileChange(e, setLicenseUrl)} />
                  </div>
                </div>
              </div>
            </div>
          )}

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
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginBottom: '1.5rem' }}
            disabled={loading || success}
          >
            {loading ? (
              <>
                <FaSpinner size={18} className="pulse-icon" style={{ marginRight: 8, animation: 'spin 1s linear infinite' }} />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Sign Up</span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign In
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

export default Register;
