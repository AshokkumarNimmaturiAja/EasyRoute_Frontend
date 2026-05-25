import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  FaColumns, FaUser, FaSignOutAlt, FaTruck, FaBox, FaShieldAlt,
  FaLocationArrow, FaChevronRight, FaBars, FaTimes, FaHome, FaCog
} from 'react-icons/fa';
import logo from '../assets/logo.png';

const ROLE_CONFIG = {
  ROLE_CUSTOMER: { label: 'Customer', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: '🛍️', route: '/customer' },
  ROLE_DRIVER:   { label: 'Driver',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: '🚛', route: '/driver' },
  ROLE_PICKUP:   { label: 'Pickup Partner', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '📦', route: '/pickup' },
  ROLE_ADMIN:    { label: 'Admin',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: '⚡', route: '/admin' },
};

const AppSidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const cfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.ROLE_CUSTOMER;
  const initials = (user.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const navItems = [
    { to: cfg.route, label: 'Dashboard', icon: FaColumns },
    { to: '/profile', label: 'My Profile', icon: FaUser },
  ];

  if (user.role === 'ROLE_CUSTOMER' || user.role === 'ROLE_ADMIN') {
    navItems.push({ to: '/pricing-calculator', label: 'Pricing Calculator', icon: FaBox });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div 
      style={{
        width: '100%',
        height: '70px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0,
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        zIndex: 50, flexShrink: 0, overflow: 'hidden',
        padding: '0 24px'
      }}
    >
      {/* Header / Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/" style={{ 
          display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none'
        }}>
          <img src={logo} alt="EasyRoute Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span style={{ 
            fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' 
          }}>
            EasyRoute
          </span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: 50, textDecoration: 'none',
              background: isActive ? `linear-gradient(135deg, ${cfg.color}15, ${cfg.color}08)` : 'transparent',
              color: isActive ? cfg.color : 'var(--text-secondary)',
              fontWeight: isActive ? 700 : 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
            }}>
              <Icon size={16} style={{ color: isActive ? cfg.color : 'var(--text-muted)' }} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right Actions & User Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${cfg.color}cc, ${cfg.color})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.85rem', color: '#fff',
            border: `2px solid ${cfg.color}40`
          }}>
            {user.profilePhotoUrl
              ? <img src={user.profilePhotoUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {user.name.split(' ')[0]}
            </div>
            <div style={{ 
              color: cfg.color, fontSize: '0.7rem', fontWeight: 700
            }}>
              {cfg.label}
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.1)' }} />

        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#ef4444', fontWeight: 600, fontSize: '0.9rem',
          transition: 'all 0.2s ease',
        }}>
          <FaSignOutAlt size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AppSidebar;
