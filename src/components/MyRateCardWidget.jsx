import React, { useState, useEffect } from 'react';
import { FaAward } from 'react-icons/fa';
import api from '../api';

const MyRateCardWidget = ({ roleColor = '#10b981', roleBg = '#ecfdf5' }) => {
  const [rateCard, setRateCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await api.get('/rates/my-rate');
        setRateCard(res.data);
      } catch (e) {
        console.warn("Could not fetch rate card", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRate();
  }, []);

  if (loading) return null;
  if (!rateCard) return null;

  return (
    <div style={{ marginTop: '2rem', marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FaAward size={18} style={{ color: roleColor }} /> My Active Rate Card
      </h4>
      <div className="glass-card" style={{ background: roleBg, border: `1px solid ${roleColor}40`, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Base Fare</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{rateCard.baseFare}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Commission</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rateCard.commissionPercentage}%</div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fixed Fee</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{rateCard.fixedFee}</div>
        </div>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
        * This is your currently active rate card configuration for the platform.
      </p>
    </div>
  );
};

export default MyRateCardWidget;
