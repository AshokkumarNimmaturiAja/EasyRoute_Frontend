import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaShieldAlt, FaCalculator, FaArrowRight, FaLocationArrow, FaLayerGroup, FaMapMarkerAlt, FaTachometerAlt, FaAward, FaCheckCircle } from 'react-icons/fa';
import logo from '../assets/logo.png';
import logisticsTruckHero from '../assets/logistics_truck_hero.png';
import freightCarrierVan from '../assets/freight_carrier_van.png';

const Landing = () => {
  // Estimate Calculator States
  const [weight, setWeight] = useState(100);
  const [distance, setDistance] = useState(50);
  const [estimatedCost, setEstimatedCost] = useState(1400);

  const calculateEstimate = (w, d) => {
    // Pricing logic: Base 500 + 2.5 per kg + 15 per km
    const cost = 500 + parseFloat(w || 0) * 2.5 + parseFloat(d || 0) * 15;
    setEstimatedCost(cost);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', gap: '5rem' }}>
      
      {/* Hero Section */}
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div className="grid-2" style={{ gap: '3rem', alignItems: 'center' }}>
          
          {/* Hero Copy */}
          <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'var(--color-primary-glow)',
              borderRadius: '50px',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-light)'
            }}>
              <FaAward size={16} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Next-Gen Smart Logistics
              </span>
            </div>
            
            <h1 style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Consolidate Freight. <br/>
              <span className="gradient-text">Cut Shipping Costs.</span>
            </h1>
            
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1.15rem', 
              lineHeight: 1.6, 
              marginBottom: '2.5rem',
              maxWidth: '600px'
            }}>
              EasyRoute connects corporate shippers with pre-verified logistics carriers. We pool smaller consignments along matching routes, optimizing empty carriage spaces to cut shipping costs by up to 40%.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '1rem' }}>
                <span>Get Started</span>
                <FaArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.9rem 2.2rem', fontSize: '1rem' }}>
                <span>Client Portal Sign In</span>
              </Link>
            </div>
          </div>

          {/* Hero Image Block */}
          <div style={{
            position: 'relative',
            animation: 'fadeInUp 0.8s ease-out',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '-15px',
              width: '100%',
              height: '100%',
              background: 'var(--color-primary-glow)',
              borderRadius: 'var(--radius-lg)',
              zIndex: 1
            }}></div>
            <img 
              src={logisticsTruckHero} 
              alt="EasyRoute Cargo Truck" 
              style={{
                width: '100%',
                maxHeight: '440px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 2,
                position: 'relative',
                border: '1px solid var(--border-light)'
              }} 
            />
          </div>
        </div>
      </div>

      {/* Feature Grid & Rate Calculator */}
      <div id="calculator" style={{ background: 'rgba(0, 0, 0, 0.01)', padding: '5rem 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>Automated Route Estimator</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Compare rates instantly based on trip distance and load metrics. We combine partial loads onto consolidated fleets for optimized dispatching.
            </p>
          </div>

          <div className="grid-2" style={{ gap: '3rem', alignItems: 'stretch' }}>
            
            {/* Features Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Why Choose EasyRoute?</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Our unified digital registry eliminates brokerage margins. Get direct carrier pairing with full workflow status transparency.
              </p>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ 
                  background: 'var(--color-primary-glow)', 
                  color: 'var(--color-primary)',
                  padding: '0.65rem',
                  borderRadius: '12px',
                  display: 'flex'
                }}>
                  <FaLayerGroup size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', fontWeight: 700 }}>Smart Load Consolidation</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    Our system matches smaller bookings going to identical sorting hubs. Consolidate your cargo onto a shared driver run to pay fraction rates.
                  </p>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ 
                  background: 'var(--color-secondary-glow)', 
                  color: 'var(--color-secondary)',
                  padding: '0.65rem',
                  borderRadius: '12px',
                  display: 'flex'
                }}>
                  <FaShieldAlt size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', fontWeight: 700 }}>100% Pre-Verified Carriers</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    Vehicles must upload active registration certificates, commercial driver licenses, and cargo liability policies.
                  </p>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ 
                  background: 'rgba(255, 120, 0, 0.1)', 
                  color: 'var(--color-accent)',
                  padding: '0.65rem',
                  borderRadius: '12px',
                  display: 'flex'
                }}>
                  <FaLocationArrow size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', fontWeight: 700 }}>End-to-End Tracking</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    From dispatch confirmation to pickup partner handovers and final gate delivery, every waypoint updates live in the dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Calculator Card */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--bg-input)' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ 
                  display: 'inline-flex', 
                  padding: '0.75rem', 
                  background: 'var(--color-primary-glow)', 
                  borderRadius: '50%',
                  marginBottom: '0.75rem',
                  color: 'var(--color-primary)'
                }}>
                  <FaCalculator size={26} />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Estimate Your Rate</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Get transparent base pricing estimates immediately</p>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cargo Weight</span>
                  <strong style={{ color: 'var(--color-primary)' }}>{weight} kg</strong>
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="5000" 
                  step="10" 
                  value={weight} 
                  onChange={(e) => {
                    setWeight(e.target.value);
                    calculateEstimate(e.target.value, distance);
                  }}
                  style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Trip Distance</span>
                  <strong style={{ color: 'var(--color-secondary)' }}>{distance} km</strong>
                </label>
                <input 
                  type="range" 
                  min="5" 
                  max="1000" 
                  step="5" 
                  value={distance} 
                  onChange={(e) => {
                    setDistance(e.target.value);
                    calculateEstimate(weight, e.target.value);
                  }}
                  style={{ width: '100%', accentColor: 'var(--color-secondary)', cursor: 'pointer' }}
                />
              </div>

              <div style={{
                background: 'var(--bg-card)',
                border: '1px dashed var(--border-light)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Estimated Cost
                </span>
                <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '1.6rem', color: 'var(--text-secondary)' }}>₹</span>
                  <span>{estimatedCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Base Charge ₹500 + Weight Rate ₹2.5/kg + Distance Rate ₹15/km
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Fleet & Services Section */}
      <div id="fleet" className="container" style={{ maxWidth: '1200px' }}>
        <div className="grid-2" style={{ gap: '4rem', alignItems: 'center' }}>
          
          {/* Left: Images & Graphic */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              bottom: '-15px',
              right: '-15px',
              width: '100%',
              height: '100%',
              background: 'var(--color-secondary-glow)',
              borderRadius: 'var(--radius-lg)',
              zIndex: 1
            }}></div>
            <img 
              src={freightCarrierVan} 
              alt="EasyRoute Delivery Fleet" 
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 2,
                position: 'relative',
                border: '1px solid var(--border-light)'
              }}
            />
          </div>

          {/* Right: Fleet Copy */}
          <div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1.25rem' }}>Flexible Verified Carrier Fleet</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              We register a wide array of transporter vehicles configured for specific transit routes. This allows shippers to scale capacity on-demand.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaCheckCircle size={20} style={{ color: '#00e664', flexShrink: 0 }} />
                <span style={{ fontWeight: 600 }}>Light Commercial Vehicles (LCVs):</span>
                <span style={{ color: 'var(--text-secondary)' }}>Max 1.5 - 3.5 Tons (Intra-city deliveries)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaCheckCircle size={20} style={{ color: '#00e664', flexShrink: 0 }} />
                <span style={{ fontWeight: 600 }}>Medium Duty Trucks (MDTs):</span>
                <span style={{ color: 'var(--text-secondary)' }}>Max 5 - 12 Tons (Inter-city hubs)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaCheckCircle size={20} style={{ color: '#00e664', flexShrink: 0 }} />
                <span style={{ fontWeight: 600 }}>Heavy Duty Freighters:</span>
                <span style={{ color: 'var(--text-secondary)' }}>Up to 25 Tons (Long-haul highway routes)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaCheckCircle size={20} style={{ color: '#00e664', flexShrink: 0 }} />
                <span style={{ fontWeight: 600 }}>Refrigerated Cargo Units:</span>
                <span style={{ color: 'var(--text-secondary)' }}>Climate control for perishables</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Trust & Quality Statistics */}
      <div id="services" style={{ background: 'rgba(0, 0, 0, 0.01)', padding: '5rem 0', borderTop: '1px solid var(--border-light)' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>Engineered for Performance</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              We hold our pickup partners and driver networks to high service agreements.
            </p>
          </div>

          <div className="grid-3" style={{ gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', borderTop: '4px solid var(--color-primary)' }}>
              <FaTachometerAlt size={32} style={{ color: 'var(--color-primary)', marginBottom: '1.25rem' }} />
              <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>99.8%</h3>
              <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>On-Time Dispatch Rate</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Routes map instantly to active available haulers, meaning minimal processing delay in hubs.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', borderTop: '4px solid var(--color-secondary)' }}>
              <FaShieldAlt size={32} style={{ color: 'var(--color-secondary)', marginBottom: '1.25rem' }} />
              <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>100%</h3>
              <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Verified Documentation</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Mandatory background verification checks for every driver profile and carrier insurance record.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', borderTop: '4px solid #00e664' }}>
              <FaMapMarkerAlt size={32} style={{ color: '#00e664', marginBottom: '1.25rem' }} />
              <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>50+</h3>
              <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Consolidation Hubs</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Strategically mapped pickup sorting points across major commercial corridors.
              </p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Landing;
