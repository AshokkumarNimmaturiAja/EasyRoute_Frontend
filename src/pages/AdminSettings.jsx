import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSave, FaSpinner, FaTools } from 'react-icons/fa';
import api from '../api';

const AdminSettings = () => {
  const [truckTypes, setTruckTypes] = useState([]);
  const [newTruckType, setNewTruckType] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchTruckTypes();
  }, []);

  const fetchTruckTypes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_V2_URL}/metadata/ui-config/TRUCK_TYPES`);
      const data = await response.json();
      setTruckTypes(data);
    } catch (err) {
      console.error('Failed to fetch truck types', err);
      setMessage({ text: 'Failed to connect to CMS database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!newTruckType.trim()) return;
    const formatted = newTruckType.trim().toUpperCase().replace(/\s+/g, '_');
    if (!truckTypes.includes(formatted)) {
      setTruckTypes([...truckTypes, formatted]);
    }
    setNewTruckType('');
  };

  const handleRemove = (typeToRemove) => {
    setTruckTypes(truckTypes.filter(t => t !== typeToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const response = await fetch(`${import.meta.env.VITE_API_V2_URL}/metadata/ui-config/TRUCK_TYPES`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(truckTypes)
      });
      
      if (response.ok) {
        setMessage({ text: 'CMS Database Updated Successfully!', type: 'success' });
      } else {
        setMessage({ text: 'Failed to update CMS Database.', type: 'error' });
      }
    } catch (err) {
      console.error('Error saving', err);
      setMessage({ text: 'Network error while saving.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <FaSpinner size={40} className="pulse-icon" style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--color-primary-glow)', padding: '0.8rem', borderRadius: '12px', marginRight: '1rem' }}>
          <FaTools size={24} color="var(--color-primary)" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>System Settings (CMS)</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage dynamic UI data live in the database</p>
        </div>
      </div>

      {message.text && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          background: message.type === 'error' ? 'rgba(255,50,50,0.1)' : 'rgba(0,230,100,0.1)',
          color: message.type === 'error' ? '#ff6b6b' : '#00e664',
          border: `1px solid ${message.type === 'error' ? 'rgba(255,50,50,0.2)' : 'rgba(0,230,100,0.2)'}`
        }}>
          {message.text}
        </div>
      )}

      <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Truck Types Configuration</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '2rem' }}>
          {truckTypes.map((type) => (
            <div key={type} style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-light)',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
            }}>
              <span style={{ color: 'var(--text-primary)', marginRight: '0.8rem', fontWeight: '500' }}>{type}</span>
              <FaTrash 
                size={14} 
                style={{ color: '#ff6b6b', cursor: 'pointer' }} 
                onClick={() => handleRemove(type)}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            className="form-input"
            placeholder="E.g. REFRIGERATED"
            value={newTruckType}
            onChange={(e) => setNewTruckType(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            style={{ maxWidth: '300px' }}
          />
          <button className="btn" style={{ background: 'var(--surface-light)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} onClick={handleAdd}>
            <FaPlus style={{ marginRight: '8px' }} /> Add
          </button>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '2rem 0' }} />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.8rem 2rem' }}>
            {saving ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <><FaSave style={{ marginRight: '8px' }} /> Save Changes to Database</>}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AdminSettings;
