import React from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaShieldAlt, FaQuestionCircle } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border-light)',
      padding: '4rem 2rem 2rem 2rem',
      marginTop: 'auto',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div className="grid-3" style={{ gap: '3rem', marginBottom: '3rem' }}>
          
          {/* Brand Info */}
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="gradient-text">EasyRoute</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Optimizing cargo transport with smart load consolidation, reducing carrier empty runs, and saving shipping costs for a greener planet.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600 }}>
              <FaShieldAlt size={16} />
              <span>ISO 9001:2015 Certified Logistics</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Platform
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
                <li><Link to="/" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Home</Link></li>
                <li><Link to="/login" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Client Portal</Link></li>
                <li><Link to="/register" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Operations
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
                <li><a href="#calculator" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Pricing Calculator</a></li>
                <li><a href="#services" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Services Pool</a></li>
                <li><a href="#fleet" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Verified Fleets</a></li>
              </ul>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Contact Details
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0 }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <FaPhone size={18} style={{ color: 'var(--color-primary)', marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Toll-Free Support Line</span>
                  <a href="tel:+18005550199" style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>+1 (800) 555-0199</a>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <FaEnvelope size={18} style={{ color: 'var(--color-secondary)', marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Support Email</span>
                  <a href="mailto:support@easyroute.com" style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>support@easyroute.com</a>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <FaMapMarkerAlt size={18} style={{ color: 'var(--color-accent)', marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Corporate HQ Address</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Suite 400, Tech Park Road, Whitefield, Bengaluru, Karnataka, 560066, India
                  </span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-light)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            &copy; {new Date().getFullYear()} EasyRoute Logistics Platforms Private Limited. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#terms" style={{ color: 'var(--text-muted)' }}>Terms of Service</a>
            <a href="#privacy" style={{ color: 'var(--text-muted)' }}>Privacy Policy</a>
            <a href="#security" style={{ color: 'var(--text-muted)' }}>Security Standards</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
