import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaSignOutAlt, FaUser, FaTruck, FaBox, FaShieldAlt, FaLocationArrow, FaHome, FaColumns } from 'react-icons/fa';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <span className="badge badge-pending" style={{ marginRight: 8 }}><FaShieldAlt size={12} style={{ marginRight: 4 }} /> Admin</span>;
      case 'ROLE_DRIVER':
        return <span className="badge badge-assigned" style={{ marginRight: 8 }}><FaTruck size={12} style={{ marginRight: 4 }} /> Driver</span>;
      case 'ROLE_PICKUP':
        return <span className="badge badge-picked" style={{ marginRight: 8 }}><FaLocationArrow size={12} style={{ marginRight: 4 }} /> Pickup Partner</span>;
      case 'ROLE_CUSTOMER':
      default:
        return <span className="badge badge-transit" style={{ marginRight: 8 }}><FaUser size={12} style={{ marginRight: 4 }} /> Customer</span>;
    }
  };

  const getDashboardRoute = (role) => {
    if (role === 'ROLE_ADMIN') return '/admin';
    if (role === 'ROLE_DRIVER') return '/driver';
    if (role === 'ROLE_PICKUP') return '/pickup';
    return '/customer';
  };

  return (
    <nav className="navbar" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <Link to="/" className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <img src={logo} alt="EasyRoute Logo" style={{ height: '36px', width: '36px', objectFit: 'contain', borderRadius: '6px' }} className="pulse-icon" />
        <span className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: 800 }}>EasyRoute</span>
      </Link>

      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Navigation Links */}
        {location.pathname !== '/' && (
          <Link 
            to="/" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              fontWeight: 500, 
              fontSize: '0.95rem',
              color: 'var(--text-secondary)'
            }}
          >
            <FaHome size={16} />
            <span>Home</span>
          </Link>
        )}

        {user ? (
          <>
            {/* Logged In Navigation */}
            <Link 
              to={getDashboardRoute(user.role)} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem', 
                fontWeight: 500, 
                fontSize: '0.95rem',
                color: location.pathname === getDashboardRoute(user.role) ? 'var(--color-primary)' : 'var(--text-secondary)'
              }}
            >
              <FaColumns size={16} />
              <span>Dashboard</span>
            </Link>

            <Link 
              to="/profile" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem', 
                fontWeight: 500, 
                fontSize: '0.95rem',
                color: location.pathname === '/profile' ? 'var(--color-primary)' : 'var(--text-secondary)'
              }}
            >
              <FaUser size={16} />
              <span>Profile</span>
            </Link>

            <Link to="/profile" className="nav-user" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 0, 0, 0.03)', padding: '0.4rem 0.8rem', borderRadius: '50px', border: '1px solid var(--border-light)', textDecoration: 'none', cursor: 'pointer', transition: 'var(--transition)' }}>
              {getRoleBadge(user.role)}
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.name}</span>
            </Link>
            
            <button className="btn btn-secondary btn-sm" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <FaSignOutAlt size={14} />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <>
            {/* Guest Navigation */}
            <Link to="/login" className="btn btn-secondary btn-sm" style={{ padding: '0.5rem 1rem' }}>
              <span>Sign In</span>
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm" style={{ padding: '0.5rem 1rem' }}>
              <span>Get Started</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
