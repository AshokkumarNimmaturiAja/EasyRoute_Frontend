import React, { useState } from 'react';
import { FaCalculator, FaBox, FaMapMarkerAlt, FaTruck, FaRupeeSign, FaSpinner } from 'react-icons/fa';
import api from '../api';

const PricingCalculator = () => {
  const [formData, setFormData] = useState({
    pickupPincode: '',
    deliveryPincode: '',
    actualWeight: '',
    length: '',
    breadth: '',
    height: '',
    paymentMode: 'PREPAID',
    codAmount: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const payload = {
        ...formData,
        actualWeight: parseFloat(formData.actualWeight),
        length: parseFloat(formData.length) || 0,
        breadth: parseFloat(formData.breadth) || 0,
        height: parseFloat(formData.height) || 0,
        codAmount: formData.paymentMode === 'COD' ? parseFloat(formData.codAmount || 0) : 0,
      };

      const res = await api.post('/pricing/calculate', payload);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to calculate pricing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout" style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
        <FaCalculator size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Dynamic Pricing Calculator
      </h2>

      <div className="grid-2" style={{ gap: '2rem' }}>
        <div className="glass-card">
          <h3 className="form-section-title">Shipment Details</h3>
          <form onSubmit={handleCalculate}>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label"><FaMapMarkerAlt size={12} /> Pickup Pincode</label>
                <input type="text" name="pickupPincode" required className="form-input" value={formData.pickupPincode} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label"><FaMapMarkerAlt size={12} /> Delivery Pincode</label>
                <input type="text" name="deliveryPincode" required className="form-input" value={formData.deliveryPincode} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label"><FaBox size={12} /> Actual Weight (kg)</label>
              <input type="number" step="0.01" name="actualWeight" required className="form-input" value={formData.actualWeight} onChange={handleChange} />
            </div>

            <div className="grid-3" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">L (cm) <span style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>(opt)</span></label>
                <input type="number" step="0.1" name="length" className="form-input" value={formData.length} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">B (cm) <span style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>(opt)</span></label>
                <input type="number" step="0.1" name="breadth" className="form-input" value={formData.breadth} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">H (cm) <span style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>(opt)</span></label>
                <input type="number" step="0.1" name="height" className="form-input" value={formData.height} onChange={handleChange} />
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select name="paymentMode" className="form-select" value={formData.paymentMode} onChange={handleChange}>
                  <option value="PREPAID">Prepaid</option>
                  <option value="COD">Cash on Delivery (COD)</option>
                </select>
              </div>
              {formData.paymentMode === 'COD' && (
                <div className="form-group">
                  <label className="form-label">COD Amount (₹)</label>
                  <input type="number" name="codAmount" required className="form-input" value={formData.codAmount} onChange={handleChange} />
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? <FaSpinner className="pulse-icon" /> : 'Calculate Shipping'}
            </button>
            {error && <div style={{ color: 'red', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</div>}
          </form>
        </div>

        <div>
          {result ? (
            <div className="glass-card fade-in">
              <h3 className="form-section-title">Pricing Results</h3>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Detected Zone</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{result.zone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Volumetric Wt.</div>
                  <div style={{ fontWeight: 700 }}>{result.volumetricWeight} kg</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chargeable Wt.</div>
                  <div style={{ fontWeight: 700 }}>{result.chargeableWeight} kg</div>
                </div>
              </div>

              <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Top Courier Recommendations</h4>
              {result.courierOptions && result.courierOptions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {result.courierOptions.map((opt, idx) => (
                    <div key={idx} style={{ 
                      border: idx === 0 ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                      borderRadius: 8, padding: '1rem', position: 'relative'
                    }}>
                      {idx === 0 && <span className="badge badge-assigned" style={{ position: 'absolute', top: -10, right: 10 }}>Best Option</span>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}><FaTruck style={{ marginRight: 6 }} /> {opt.courierName}</div>
                        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-primary)' }}>₹{opt.total}</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <div>Freight: ₹{opt.freight}</div>
                        <div>Fuel: ₹{opt.fuelCharge}</div>
                        <div>COD: ₹{opt.codCharge}</div>
                        <div>GST: ₹{opt.gstCharge}</div>
                        <div>Remote: ₹{opt.remoteCharge}</div>
                        <div style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>ETA: {opt.etaDays} Days</div>
                      </div>
                      
                      {/* Revenue Splits Display */}
                      {(opt.driverPayout !== undefined || opt.pickupPayout !== undefined) && (
                        <div style={{ marginTop: '1rem', borderTop: '1px dashed var(--border-light)', paddingTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <FaTruck style={{ color: 'var(--color-secondary)' }} /> Driver Payout: <strong style={{ color: 'var(--text-primary)' }}>₹{opt.driverPayout}</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <FaBox style={{ color: '#10b981' }} /> Pickup Payout: <strong style={{ color: 'var(--text-primary)' }}>₹{opt.pickupPayout}</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ color: '#ef4444' }}>⚡</span> Admin Margin: <strong style={{ color: 'var(--text-primary)' }}>₹{opt.adminMargin}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No courier options found for this route and weight.</div>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300, color: 'var(--text-muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <FaRupeeSign size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Enter shipment details and click calculate to view pricing options.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
