import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import MyRateCardWidget from '../components/MyRateCardWidget';
import { STATES, CITIES_BY_STATE, LOCATIONS_BY_CITY } from '../utils/locations';
import { FaChartBar, FaUser, FaSpinner, FaArrowUp, FaBox, FaChevronDown, FaShieldVirus, FaClock, FaLocationArrow, FaPhone, FaArrowRight, FaEnvelope, FaMapMarkerAlt, FaCreditCard, FaChevronUp, FaCheckCircle, FaComment, FaExternalLinkAlt, FaWallet, FaTruck } from 'react-icons/fa';

// ─── Constants ────────────────────────────────────────────────────────────────
const PICKUP_GREEN = '#10b981';
const PICKUP_GREEN_GLOW = 'rgba(16, 185, 129, 0.12)';
const PICKUP_GREEN_BORDER = 'rgba(16, 185, 129, 0.25)';
const PAYOUT_PER_JOB = 150;
const WEEKLY_DATA = [800, 1200, 600, 1500, 900, 1800, 750];
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_BAR_HEIGHT = 200;

const FAQ_ITEMS = [
  {
    q: 'How does the payout system work?',
    a: `You earn ₹${PAYOUT_PER_JOB} fixed per completed delivery job. Payouts are processed every Friday for all jobs marked DELIVERED during that week. Funds are credited directly to your registered bank account within 2 business days. You can view your payout history in the Earnings Overview tab.`,
  },
  {
    q: 'How do I confirm the warehouse handover?',
    a: 'Once a job is ASSIGNED to you, visit the warehouse, collect the shipment, and click "Confirm Warehouse Pickup" in the Active Jobs tab. This updates the status to PICKED, notifying the driver that the parcel is ready for collection. Always verify the shipment details against the job card before confirming.',
  },
  {
    q: "What should I do if the driver doesn't arrive?",
    a: "If the assigned driver doesn't arrive within 2 hours of the scheduled pickup time, please contact our support team immediately via the Contact Support tab. Raise a ticket with Category: Driver Issue and include the Job ID. Our operations team will reassign the shipment to an available driver within 4 hours.",
  },
];

// ─── Helper utilities ─────────────────────────────────────────────────────────
const generateTicketId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'ER-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'PENDING':    return <span className="badge badge-pending">Pending Assignment</span>;
    case 'ASSIGNED':  return <span className="badge badge-assigned">Assigned</span>;
    case 'PICKED':    return <span className="badge badge-picked">Picked Up</span>;
    case 'IN_TRANSIT':return <span className="badge badge-transit">In Transit</span>;
    case 'DELIVERED': return <span className="badge badge-delivered">Completed</span>;
    case 'CANCELLED': return <span className="badge badge-cancelled">Cancelled</span>;
    default:           return <span className="badge">{status}</span>;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return '—'; }
};

const isThisMonth = (dateStr) => {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  } catch { return false; }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Stat card with coloured icon box */
const StatCard = ({ icon: Icon, label, value, accent, sub }) => (
  <div className="stat-card" style={{ borderTop: `3px solid ${accent || PICKUP_GREEN}` }}>
    <div
      className="stat-icon"
      style={{ background: `${accent || PICKUP_GREEN}18`, color: accent || PICKUP_GREEN }}
    >
      <Icon size={22} />
    </div>
    <div>
      <div className="stat-value" style={{ color: accent || PICKUP_GREEN }}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{sub}</div>}
    </div>
  </div>
);

/** Single job card */
const JobCard = ({ job, onAction, actionLoading }) => {
  const isActionLoading = actionLoading === job.id;

  const actionConfig = {
    ASSIGNED: {
      label: 'Confirm Warehouse Pickup',
      nextStatus: 'PICKED',
      style: { background: `linear-gradient(135deg, ${PICKUP_GREEN}, #059669)`, color: '#fff' },
    },
    PICKED: {
      label: 'Complete Driver Handover',
      nextStatus: 'IN_TRANSIT',
      style: { background: 'linear-gradient(135deg, var(--color-accent), hsl(32, 85%, 45%))', color: '#fff' },
    },
  };

  const cfg = actionConfig[job.status];

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        borderLeft: `3px solid ${
          job.status === 'DELIVERED' ? '#00e664' :
          job.status === 'IN_TRANSIT' ? '#00e6b4' :
          job.status === 'PICKED' ? '#e650ff' :
          job.status === 'ASSIGNED' ? PICKUP_GREEN :
          'var(--border-light)'
        }`,
        transition: 'var(--transition)',
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
            display: 'block',
            marginBottom: '0.25rem',
          }}>
            {job.trackingNumber || '#' + job.id?.substring(0, 10).toUpperCase()}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {job.pickupCity}
            </span>
            <FaArrowRight size={14} style={{ color: PICKUP_GREEN }} />
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {job.dropCity}
            </span>
          </div>
        </div>
        {getStatusBadge(job.status)}
      </div>

      {/* Customer Info */}
      <div style={{
        background: 'rgba(16,185,129,0.04)',
        border: `1px solid ${PICKUP_GREEN_BORDER}`,
        borderRadius: 'var(--radius-sm)',
        padding: '0.6rem 0.85rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.85rem',
      }}>
        <FaUser size={14} style={{ color: PICKUP_GREEN, flexShrink: 0 }} />
        <span style={{ fontWeight: 600, flex: 1, color: 'var(--text-primary)' }}>
          {job.customerName || 'Customer'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
          <FaPhone size={12} />
          <span>{job.customerPhone || '—'}</span>
        </div>
      </div>

      {/* Details */}
      <div style={{
        fontSize: '0.83rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
        borderTop: '1px solid var(--border-light)',
        paddingTop: '0.65rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
          <FaMapMarkerAlt size={13} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
          <span><strong style={{ color: 'var(--text-primary)' }}>Pickup:</strong> {job.pickupAddress}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.15rem' }}>
          <span>
            <FaLocationArrow size={12} style={{ color: 'var(--text-muted)', marginRight: '0.3rem', verticalAlign: 'middle' }} />
            <strong style={{ color: 'var(--text-primary)' }}>Weight:</strong> {job.totalWeightKg} kg
          </span>
          <span style={{ color: PICKUP_GREEN, fontWeight: 700 }}>₹{PAYOUT_PER_JOB}</span>
        </div>
      </div>

      {/* Action */}
      <div style={{ marginTop: 'auto' }}>
        {cfg && (
          <button
            className="btn btn-sm"
            style={{ width: '100%', ...cfg.style, justifyContent: 'center' }}
            disabled={isActionLoading}
            onClick={() => onAction(job.id, cfg.nextStatus)}
          >
            {isActionLoading ? (
              <>
                <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Updating...</span>
              </>
            ) : (
              cfg.label
            )}
          </button>
        )}
        {job.status === 'IN_TRANSIT' && (
          <button className="btn btn-sm btn-secondary" style={{ width: '100%', cursor: 'not-allowed', opacity: 0.7 }} disabled>
            <FaCheckCircle size={14} style={{ color: '#00e6b4' }} />
            Handed Over ✓
          </button>
        )}
        {job.status === 'DELIVERED' && (
          <div style={{
            textAlign: 'center',
            padding: '0.45rem',
            fontWeight: 700,
            fontSize: '0.88rem',
            color: '#00e664',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
          }}>
            <FaCheckCircle size={15} />
            ✓ Completed
          </div>
        )}
      </div>
    </div>
  );
};

/** Weekly earnings bar chart — pure CSS */
const EarningsBarChart = () => {
  const maxVal = Math.max(...WEEKLY_DATA);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', height: `${MAX_BAR_HEIGHT + 40}px`, padding: '0 0.5rem' }}>
        {WEEKLY_DATA.map((val, i) => {
          const barH = Math.round((val / maxVal) * MAX_BAR_HEIGHT);
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                ₹{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
              </span>
              <div
                title={`${WEEK_DAYS[i]}: ₹${val}`}
                style={{
                  width: '100%',
                  height: `${barH}px`,
                  background: `linear-gradient(180deg, ${PICKUP_GREEN} 0%, #059669 100%)`,
                  borderRadius: '6px 6px 2px 2px',
                  transition: 'all 0.35s ease',
                  cursor: 'pointer',
                  boxShadow: `0 4px 12px ${PICKUP_GREEN_GLOW}`,
                  position: 'relative',
                  opacity: 0.85,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'scaleY(1.04)';
                  e.currentTarget.style.boxShadow = `0 8px 20px rgba(16,185,129,0.35)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = '0.85';
                  e.currentTarget.style.transform = 'scaleY(1)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${PICKUP_GREEN_GLOW}`;
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {WEEK_DAYS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** FAQ accordion item */
const FaqItem = ({ faq }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        transition: 'var(--transition)',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          background: open ? PICKUP_GREEN_GLOW : 'var(--bg-card)',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: '0.95rem',
          color: open ? PICKUP_GREEN : 'var(--text-primary)',
          textAlign: 'left',
          transition: 'var(--transition)',
        }}
      >
        <span>{faq.q}</span>
        {open
          ? <FaChevronUp size={18} style={{ color: PICKUP_GREEN, flexShrink: 0 }} />
          : <FaChevronDown size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div style={{
          padding: '1rem 1.25rem 1.25rem',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          background: 'var(--bg-card)',
          borderTop: `1px solid ${PICKUP_GREEN_BORDER}`,
        }}>
          {faq.a}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PickupDashboard = () => {
  const { user } = useContext(AuthContext);

  // ── Global state ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // job id
  const [toast, setToast] = useState(null);

  // ── My Vehicles state ──────────────────────────────────────────────────────
  const [trucks, setTrucks] = useState([]);
  const [truckLoading, setTruckLoading] = useState(true);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [locationTarget, setLocationTarget] = useState(null);

  // Add/Edit form state
  const [regNum, setRegNum] = useState('');
  const [capacity, setCapacity] = useState(0.1);
  const [capacityUnit, setCapacityUnit] = useState('kgs');
  const [rcUrl, setRcUrl] = useState('');
  const [licenseUrl, setLicenseUrl] = useState('');
  const [rateAccepted, setRateAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // ■ File Upload Helper ■
  const handleFileUpload = async (file, setUrlState) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_V1_URL}/upload/document`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setUrlState(data.data.url);
        showToast('success', 'Document uploaded successfully!');
      } else {
        showToast('error', 'Failed to upload document');
      }
    } catch (err) {
      showToast('error', 'Error uploading document');
    }
  };
  const [vehicleSubmitting, setVehicleSubmitting] = useState(false);
  const [vehicleError, setVehicleError] = useState('');

  // ── Support form ──────────────────────────────────────────────────────────
  const [supportCategory, setSupportCategory] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [supportError, setSupportError] = useState('');

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch jobs ────────────────────────────────────────────────────────────
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shipments');
      setJobs(res.data?.data || []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTruck = async () => {
    try {
      setTruckLoading(true);
      const res = await api.get('/trucks/mine');
      const data = res.data?.data || [];
      setTrucks(Array.isArray(data) ? data : [data].filter(Boolean));
    } catch {
      setTrucks([]);
    } finally {
      setTruckLoading(false);
    }
  };

  useEffect(() => { 
    fetchJobs(); 
    fetchMyTruck();
  }, []);

  const handleRegisterVehicle = async (e) => {
    e.preventDefault();
    setVehicleError('');
    if (!regNum || !rcUrl || !licenseUrl || !rateAccepted || !privacyAccepted) {
      setVehicleError('Please fill in all required fields and accept the policies.');
      return;
    }
    setVehicleSubmitting(true);
    try {
      let capacityInKgs = capacityUnit === 'kgs' ? parseFloat(capacity) : parseFloat(capacity) * 1000;
      if (capacityInKgs > 15) {
        setVehicleError('Bikes have a maximum weight capacity of 15 kgs');
        setVehicleSubmitting(false);
        return;
      }
      if (!selectedState || !selectedCity || !selectedLocation) {
        setVehicleError('Please select your complete operating location');
        setVehicleSubmitting(false);
        return;
      }
      const fullLocation = `${selectedLocation}, ${selectedCity}, ${selectedState}`;
      await api.post('/bikes/register', {
        registrationNumber: regNum,
        capacityKgs: capacityInKgs,
        rcDocumentUrl: rcUrl,
        licenseUrl: licenseUrl,
        currentRouteArea: fullLocation,
        rateCardAccepted: rateAccepted
      });
      showToast('success', 'Vehicle registered successfully!');
      setShowAddVehicle(false);
      setRegNum(''); setCapacity(0.1); setRcUrl(''); setLicenseUrl('');
      setRateAccepted(false); setPrivacyAccepted(false);
      setSelectedState(''); setSelectedCity(''); setSelectedLocation('');
      fetchMyTruck();
    } catch (err) {
      setVehicleError(err.message || 'Registration failed');
    } finally {
      setVehicleSubmitting(false);
    }
  };

  const handleEditVehicle = async (e) => {
    e.preventDefault();
    if (!editingTruck) return;
    setEditLoading(true);
    try {
      let capacityInKgs = capacityUnit === 'kgs' ? parseFloat(capacity) : parseFloat(capacity) * 1000;
      if (capacityInKgs > 15) {
        showToast('error', 'Bikes have a maximum weight capacity of 15 kgs');
        setEditLoading(false);
        return;
      }
      await api.put(`/trucks/${editingTruck.id}`, {
        capacityTons: capacityInKgs / 1000,
        rcDocumentUrl: rcUrl || editingTruck.rcDocumentUrl,
        licenseUrl: licenseUrl || editingTruck.licenseUrl
      });
      showToast('success', 'Vehicle updated successfully!');
      setEditingTruck(null);
      fetchMyTruck();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update vehicle');
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    if (!locationTarget) return;
    setEditLoading(true);
    try {
      if (!selectedState || !selectedCity || !selectedLocation) {
        showToast('error', 'Please select your complete operating location');
        setEditLoading(false);
        return;
      }
      const fullLocation = `${selectedLocation}, ${selectedCity}, ${selectedState}`;
      await api.put(`/trucks/${locationTarget.id}`, { currentRouteArea: fullLocation });
      showToast('success', 'Location updated successfully!');
      setLocationTarget(null);
      setSelectedState(''); setSelectedCity(''); setSelectedLocation('');
      fetchMyTruck();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update location');
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleDuty = async (truck) => {
    if (!truck || !truck.id) return;
    try {
      setTrucks(prev => prev.map(t => t.id === truck.id ? { ...t, isAvailable: !t.isAvailable } : t));
      await api.put(`/trucks/${truck.id}/availability`);
      showToast('success', 'Duty status updated');
    } catch (err) {
      setTrucks(prev => prev.map(t => t.id === truck.id ? { ...t, isAvailable: !t.isAvailable } : t));
      showToast('error', 'Failed to update duty status');
    }
  };

  // ── Job action ────────────────────────────────────────────────────────────
  const handleJobAction = async (jobId, nextStatus) => {
    setActionLoading(jobId);
    try {
      await api.put(`/shipments/${jobId}/status`, { status: nextStatus });
      showToast('success', `Status updated to: ${nextStatus.replace('_', ' ')}`);
      fetchJobs();
    } catch (err) {
      showToast('error', err?.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Support submit ────────────────────────────────────────────────────────
  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setSupportError('');
    if (!supportCategory || !supportSubject.trim() || !supportMessage.trim()) {
      setSupportError('Please fill in all fields before submitting.');
      return;
    }
    setSupportSubmitting(true);
    await new Promise(r => setTimeout(r, 1200)); // simulate network
    setTicketId(generateTicketId());
    setSupportSubmitting(false);
    setSupportCategory('');
    setSupportSubject('');
    setSupportMessage('');
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalJobs       = jobs.length;
  const completedJobs   = jobs.filter(j => j.status === 'DELIVERED').length;
  const inProgressJobs  = jobs.filter(j => ['ASSIGNED', 'PICKED', 'IN_TRANSIT'].includes(j.status)).length;
  const todayEarnings   = jobs.filter(j => {
    if (j.status !== 'DELIVERED') return false;
    const d = new Date(j.updatedAt || j.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length * PAYOUT_PER_JOB;

  const totalEarned    = completedJobs * PAYOUT_PER_JOB;
  const thisMonthJobs  = jobs.filter(j => j.status === 'DELIVERED' && isThisMonth(j.updatedAt || j.createdAt));
  const thisMonthEarned = thisMonthJobs.length * PAYOUT_PER_JOB;
  const cancelledJobs  = jobs.filter(j => j.status === 'CANCELLED').length;

  const completedPct  = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
  const inProgressPct = totalJobs > 0 ? Math.round((inProgressJobs / totalJobs) * 100) : 0;
  const cancelledPct  = totalJobs > 0 ? Math.round((cancelledJobs / totalJobs) * 100) : 0;

  const deliveredJobs = jobs.filter(j => j.status === 'DELIVERED');

  // ─── Tab definitions ───────────────────────────────────────────────────────
  const TABS = ['Active Jobs', 'My Vehicle', 'Earnings Overview', 'Contact Support'];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container dashboard-container">
      {/* ── Toast ── */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span style={{ fontSize: '1.2rem' }}>{toast.type === 'success' ? '✓' : '✗'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ── Always-visible header ── */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${PICKUP_GREEN}, #059669)`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 6px 18px ${PICKUP_GREEN_GLOW}`,
            }}>
              <FaBox size={24} color="#fff" />
            </span>
            Pickup Partner Board
          </h1>
          <p className="dashboard-subtitle" style={{ marginTop: '0.3rem' }}>
            Warehouse operations &amp; pickup coordination —&nbsp;
            <strong style={{ color: PICKUP_GREEN }}>
              {user?.name || 'Partner'}
            </strong>
          </p>
        </div>

        {/* Right side header tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {trucks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: trucks[0].isAvailable ? PICKUP_GREEN : 'var(--text-muted)' }}>
                {trucks[0].isAvailable ? 'ON DUTY' : 'OFF DUTY'}
              </span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={trucks[0].isAvailable}
                  onChange={() => handleToggleDuty(trucks[0])}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          )}

          <div style={{
            background: PICKUP_GREEN_GLOW,
            border: `1px solid ${PICKUP_GREEN_BORDER}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1.25rem',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Today's Earnings
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: PICKUP_GREEN, lineHeight: 1.2 }}>
              ₹{todayEarnings}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats bar (always shown) ── */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <StatCard icon={FaBox}      label="Total Jobs"      value={totalJobs}     accent="var(--color-primary)" />
        <StatCard icon={FaCheckCircle} label="Completed"       value={completedJobs} accent={PICKUP_GREEN} />
        <StatCard icon={FaLocationArrow}   label="In Progress"     value={inProgressJobs} accent="var(--color-accent)" />
        <StatCard icon={FaWallet}       label="Today's Earnings" value={`₹${todayEarnings}`} accent="#00e6b4" />
      </div>

      {/* ── Tabs ── */}
      <div className="tabs-container">
        {TABS.map((tab, i) => (
          <button
            key={i}
            className={`tab-btn ${activeTab === i ? 'active' : ''}`}
            onClick={() => setActiveTab(i)}
            style={activeTab === i ? { color: PICKUP_GREEN } : {}}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAB 0 — Active Jobs
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 0 && (
        <>
          <MyRateCardWidget roleColor="#10b981" roleBg="#ecfdf5" />
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
              <FaSpinner size={40} style={{ color: PICKUP_GREEN, animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Fetching your jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <FaBox size={56} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No Jobs Assigned Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                The admin will assign warehouse pickup jobs to you. Check back soon — jobs will appear here as card tiles.
              </p>
            </div>
          ) : (
            <div className="grid-3">
              {jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onAction={handleJobAction}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 1 — My Vehicles
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 1 && (
        <div>
          {truckLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <FaSpinner size={30} style={{ animation: 'spin 1s linear infinite', color: PICKUP_GREEN }} />
            </div>
          ) : (
            <>
              {/* Vehicle Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {trucks.map(truck => (
                  <div key={truck.id} className="glass-card" style={{ borderLeft: `4px solid ${PICKUP_GREEN}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-secondary)', marginBottom: '0.2rem' }}>
                          {truck.registrationNumber}
                        </h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Type: {truck.truckType} &nbsp;|&nbsp; Capacity: {truck.capacityTons ? `${(truck.capacityTons * 1000).toFixed(0)} kg` : '—'}
                        </span>
                        {truck.currentRouteArea && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', padding: '0.3rem 0.7rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '20px', width: 'fit-content' }}>
                            <FaMapMarkerAlt size={11} style={{ color: PICKUP_GREEN }} />
                            <span style={{ fontSize: '0.8rem', color: PICKUP_GREEN, fontWeight: 600 }}>{truck.currentRouteArea}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        {truck.verified
                          ? <span className="badge badge-delivered" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FaCheckCircle size={11} /> Approved</span>
                          : <span className="badge badge-pending">Pending Approval</span>
                        }
                      </div>
                    </div>

                    {/* Documents */}
                    <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      {truck.rcDocumentUrl && (
                        <a href={truck.rcDocumentUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary" style={{ fontSize: '0.78rem' }}>
                          <FaCreditCard size={12} style={{ marginRight: 5 }} /> RC Doc
                        </a>
                      )}
                      {truck.licenseUrl && (
                        <a href={truck.licenseUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary" style={{ fontSize: '0.78rem' }}>
                          <FaCreditCard size={12} style={{ marginRight: 5 }} /> License
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => {
                        setEditingTruck(truck);
                        setCapacity((truck.capacityTons * 1000).toFixed(0));
                        setCapacityUnit('kgs');
                        setRcUrl('');
                        setLicenseUrl('');
                      }}>
                        <FaComment size={12} style={{ marginRight: 5 }} /> Edit Vehicle Details
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => {
                        setLocationTarget(truck);
                        setSelectedState(''); setSelectedCity(''); setSelectedLocation('');
                      }}>
                        <FaMapMarkerAlt size={12} style={{ marginRight: 5 }} /> Update Location
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Another Vehicle Button */}
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', marginBottom: '1.5rem', background: showAddVehicle ? '#64748b' : `linear-gradient(135deg, ${PICKUP_GREEN}, #059669)`, boxShadow: showAddVehicle ? 'none' : `0 4px 15px rgba(16,185,129,0.3)` }}
                onClick={() => { setShowAddVehicle(!showAddVehicle); setVehicleError(''); }}
              >
                {showAddVehicle ? '✕ Cancel' : `+ ${trucks.length > 0 ? 'Add Another Vehicle' : 'Register First Vehicle'}`}
              </button>

              {/* Add Vehicle Form */}
              {showAddVehicle && (
                <div className="glass-card">
                  <h3 className="form-section-title">
                    <FaTruck size={20} style={{ marginRight: '8px' }} />
                    <span>Register 2-Wheeler</span>
                  </h3>
                  {vehicleError && (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                      {vehicleError}
                    </div>
                  )}
                  <form onSubmit={handleRegisterVehicle}>
                    <div className="grid-2" style={{ gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Registration Number *</label>
                        <input type="text" required placeholder="e.g. MH-12-AB-1234" className="form-input" value={regNum} onChange={(e) => setRegNum(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Capacity *</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input type="number" required step="0.01" min="0.01" className="form-input" style={{ flex: 1 }} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                          <select className="form-select" style={{ width: '90px' }} value={capacityUnit} onChange={(e) => setCapacityUnit(e.target.value)}>
                            <option value="kgs">kgs</option>
                            <option value="Tons">Tons</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label className="form-label">Operating Location *</label>
                      <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                        <select className="form-select" disabled value="India"><option value="India">India</option></select>
                        <select className="form-select" required value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); setSelectedLocation(''); }}>
                          <option value="">Select State</option>
                          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="grid-2" style={{ gap: '1rem' }}>
                        <select className="form-select" required value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); setSelectedLocation(''); }} disabled={!selectedState}>
                          <option value="">Select City</option>
                          {selectedState && CITIES_BY_STATE[selectedState]?.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select className="form-select" required value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} disabled={!selectedCity}>
                          <option value="">Select Area</option>
                          {selectedCity && LOCATIONS_BY_CITY[selectedCity]?.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label className="form-label">RC Document (PDF/Image) *</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input type="file" accept="image/*,.pdf" required={!rcUrl} onChange={(e) => handleFileUpload(e.target.files[0], setRcUrl)} style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '6px' }} />
                        {rcUrl && <span style={{ color: 'green', fontSize: '0.9rem' }}>&#10003; Uploaded</span>}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Driving License (PDF/Image) *</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input type="file" accept="image/*,.pdf" required={!licenseUrl} onChange={(e) => handleFileUpload(e.target.files[0], setLicenseUrl)} style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '6px' }} />
                        {licenseUrl && <span style={{ color: 'green', fontSize: '0.9rem' }}>&#10003; Uploaded</span>}
                      </div>
                    </div>
                    <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-light)', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={rateAccepted} onChange={(e) => setRateAccepted(e.target.checked)} />
                        I accept the standard rate cards and payout terms.
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} />
                        I have read and agree to the Privacy & Policy.
                      </label>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }} disabled={vehicleSubmitting}>
                      {vehicleSubmitting ? <><FaSpinner size={18} style={{ marginRight: 8, animation: 'spin 1s linear infinite' }} /><span>Submitting…</span></> : <span>Register Vehicle</span>}
                    </button>
                  </form>
                </div>
              )}

              {/* Edit Vehicle Modal */}
              {editingTruck && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '2rem', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ margin: 0 }}>Edit Vehicle Details</h3>
                      <button className="btn btn-sm btn-secondary" onClick={() => setEditingTruck(null)}>✕</button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{editingTruck.registrationNumber}</p>
                    <form onSubmit={handleEditVehicle}>
                      <div className="form-group">
                        <label className="form-label">Capacity *</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input type="number" required step="0.01" min="0.01" className="form-input" style={{ flex: 1 }} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                          <select className="form-select" style={{ width: '90px' }} value={capacityUnit} onChange={(e) => setCapacityUnit(e.target.value)}>
                            <option value="kgs">kgs</option>
                            <option value="Tons">Tons</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label">RC Document (upload new) *</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e.target.files[0], setRcUrl)} style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '6px' }} />
                          {rcUrl && <span style={{ color: 'green', fontSize: '0.9rem' }}>&#10003; New uploaded</span>}
                        </div>
                        {editingTruck.rcDocumentUrl && !rcUrl && <a href={editingTruck.rcDocumentUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: PICKUP_GREEN }}>View current RC →</a>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Driving License (upload new) *</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e.target.files[0], setLicenseUrl)} style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '6px' }} />
                          {licenseUrl && <span style={{ color: 'green', fontSize: '0.9rem' }}>&#10003; New uploaded</span>}
                        </div>
                        {editingTruck.licenseUrl && !licenseUrl && <a href={editingTruck.licenseUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: PICKUP_GREEN }}>View current license →</a>}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setEditingTruck(null)} style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={editLoading} style={{ flex: 2 }}>
                          {editLoading ? <FaSpinner size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Update Location Modal */}
              {locationTarget && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '2rem', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0 }}>Update Operating Location</h3>
                      <button className="btn btn-sm btn-secondary" onClick={() => setLocationTarget(null)}>✕</button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{locationTarget.registrationNumber}</p>
                    <form onSubmit={handleUpdateLocation}>
                      <div className="form-group">
                        <label className="form-label">Operating Location *</label>
                        <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                          <select className="form-select" disabled value="India"><option value="India">India</option></select>
                          <select className="form-select" required value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); setSelectedLocation(''); }}>
                            <option value="">Select State</option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="grid-2" style={{ gap: '1rem' }}>
                          <select className="form-select" required value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); setSelectedLocation(''); }} disabled={!selectedState}>
                            <option value="">Select City</option>
                            {selectedState && CITIES_BY_STATE[selectedState]?.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <select className="form-select" required value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} disabled={!selectedCity}>
                            <option value="">Select Area</option>
                            {selectedCity && LOCATIONS_BY_CITY[selectedCity]?.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setLocationTarget(null)} style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={editLoading} style={{ flex: 2 }}>
                          {editLoading ? <FaSpinner size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Location'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}



      {/* ════════════════════════════════════════════════════════════════════
          TAB 2 — Earnings Overview
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* ── Earnings summary cards ── */}
          <div className="stat-grid">
            <div className="stat-card" style={{ borderTop: `3px solid ${PICKUP_GREEN}` }}>
              <div className="stat-icon" style={{ background: PICKUP_GREEN_GLOW, color: PICKUP_GREEN }}>
                <FaArrowUp size={22} />
              </div>
              <div>
                <div className="stat-value" style={{ color: PICKUP_GREEN }}>₹{totalEarned}</div>
                <div className="stat-label">Total Earned</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  {completedJobs} jobs × ₹{PAYOUT_PER_JOB}
                </div>
              </div>
            </div>
            <div className="stat-card" style={{ borderTop: '3px solid var(--color-secondary)' }}>
              <div className="stat-icon" style={{ background: 'var(--color-secondary-glow)', color: 'var(--color-secondary)' }}>
                <FaChartBar size={22} />
              </div>
              <div>
                <div className="stat-value" style={{ color: 'var(--color-secondary)' }}>₹{thisMonthEarned}</div>
                <div className="stat-label">This Month</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  {thisMonthJobs.length} jobs delivered
                </div>
              </div>
            </div>
            <div className="stat-card" style={{ borderTop: '3px solid var(--color-accent)' }}>
              <div className="stat-icon" style={{ background: 'rgba(255,120,0,0.1)', color: 'var(--color-accent)' }}>
                <FaClock size={22} />
              </div>
              <div>
                <div className="stat-value" style={{ color: 'var(--color-accent)' }}>
                  ₹{inProgressJobs * PAYOUT_PER_JOB}
                </div>
                <div className="stat-label">Pending Release</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  {inProgressJobs} in-progress jobs
                </div>
              </div>
            </div>
            <div className="stat-card" style={{ borderTop: '3px solid #a78bfa' }}>
              <div className="stat-icon" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>
                <FaExternalLinkAlt size={22} />
              </div>
              <div>
                <div className="stat-value" style={{ color: '#a78bfa' }}>₹0</div>
                <div className="stat-label">Withdrawn</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  Next payout: Friday
                </div>
              </div>
            </div>
          </div>

          {/* ── Bar chart + breakdown row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Weekly Bar Chart */}
            <div className="glass-card">
              <h3 className="form-section-title">
                <FaChartBar size={18} style={{ color: PICKUP_GREEN }} />
                Weekly Earnings (This Week)
              </h3>
              <div style={{ marginTop: '1rem' }}>
                <EarningsBarChart />
              </div>
              <div style={{
                marginTop: '0.75rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
              }}>
                Total this week: <strong style={{ color: PICKUP_GREEN }}>
                  ₹{WEEKLY_DATA.reduce((a, b) => a + b, 0).toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Job Completion Breakdown */}
            <div className="glass-card">
              <h3 className="form-section-title">
                <FaCheckCircle size={18} style={{ color: PICKUP_GREEN }} />
                Job Completion Breakdown
              </h3>

              {totalJobs === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>
                  No jobs recorded yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem' }}>
                  {/* Completed */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Completed</span>
                      <span style={{ fontWeight: 700, color: PICKUP_GREEN }}>{completedJobs} ({completedPct}%)</span>
                    </div>
                    <div style={{ height: '10px', background: 'var(--border-light)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${completedPct}%`,
                        background: `linear-gradient(90deg, ${PICKUP_GREEN}, #059669)`,
                        borderRadius: '99px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>

                  {/* In Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>In Progress</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{inProgressJobs} ({inProgressPct}%)</span>
                    </div>
                    <div style={{ height: '10px', background: 'var(--border-light)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${inProgressPct}%`,
                        background: 'linear-gradient(90deg, var(--color-accent), hsl(32, 85%, 45%))',
                        borderRadius: '99px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>

                  {/* Cancelled */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Cancelled</span>
                      <span style={{ fontWeight: 700, color: '#ff3333' }}>{cancelledJobs} ({cancelledPct}%)</span>
                    </div>
                    <div style={{ height: '10px', background: 'var(--border-light)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${cancelledPct}%`,
                        background: 'linear-gradient(90deg, #ff3333, #cc0000)',
                        borderRadius: '99px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>

                  {/* Legend */}
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem',
                    flexWrap: 'wrap',
                  }}>
                    <span>Total: <strong style={{ color: 'var(--text-primary)' }}>{totalJobs}</strong></span>
                    <span>Fixed rate: <strong style={{ color: PICKUP_GREEN }}>₹{PAYOUT_PER_JOB}/job</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Bank account reminder ── */}
          {(!user?.bankAccount && !user?.upiId) && (
            <div className="glass-card" style={{
              border: `1px solid rgba(255,170,0,0.3)`,
              background: 'rgba(255,170,0,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,170,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <FaCreditCard size={22} style={{ color: '#ffa31a' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Bank Account Not Linked</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Add your bank account or UPI ID in your Profile to receive automated payouts every Friday.
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => window.location.href = '/profile'}
                  style={{ flexShrink: 0 }}
                >
                  <FaExternalLinkAlt size={14} /> Setup
                </button>
              </div>
            </div>
          )}

          {/* ── Earnings table ── */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 className="form-section-title">
              <FaWallet size={18} style={{ color: PICKUP_GREEN }} />
              Earnings Ledger
            </h3>

            {deliveredJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                <FaCheckCircle size={36} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                <p style={{ fontSize: '0.9rem' }}>No completed jobs yet. Complete a delivery to see earnings here.</p>
              </div>
            ) : (
              <div className="table-wrapper" style={{ marginTop: '1rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Job ID</th>
                      <th>Route</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveredJobs.map(job => (
                      <tr key={job.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {job.trackingNumber || '#' + job.id?.substring(0, 10).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                            {job.pickupCity}
                            <FaArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                            {job.dropCity}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {formatDate(job.updatedAt || job.createdAt)}
                        </td>
                        <td>
                          <strong style={{ color: PICKUP_GREEN, fontSize: '1rem' }}>₹{PAYOUT_PER_JOB}</strong>
                        </td>
                        <td>
                          <span className="badge badge-delivered">Earned</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ fontWeight: 700, paddingTop: '1rem', color: 'var(--text-secondary)' }}>
                        Total ({deliveredJobs.length} jobs)
                      </td>
                      <td style={{ fontWeight: 800, fontSize: '1.1rem', color: PICKUP_GREEN, paddingTop: '1rem' }}>
                        ₹{totalEarned}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 3 — Contact Support
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>

          {/* Left: Support form + FAQ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Support Ticket Form */}
            <div className="glass-card">
              <h3 className="form-section-title">
                <FaComment size={18} style={{ color: PICKUP_GREEN }} />
                Raise a Support Ticket
              </h3>

              {ticketId ? (
                <div style={{
                  background: PICKUP_GREEN_GLOW,
                  border: `1px solid ${PICKUP_GREEN_BORDER}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem',
                  textAlign: 'center',
                }}>
                  <FaCheckCircle size={48} style={{ color: PICKUP_GREEN, marginBottom: '1rem' }} />
                  <h4 style={{ color: PICKUP_GREEN, marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                    Ticket Submitted!
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    Your ticket ID is:
                  </p>
                  <div style={{
                    background: 'var(--bg-card)',
                    border: `2px dashed ${PICKUP_GREEN_BORDER}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1.5rem',
                    fontFamily: 'monospace',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: PICKUP_GREEN,
                    letterSpacing: '0.1em',
                    marginBottom: '1.25rem',
                    display: 'inline-block',
                  }}>
                    {ticketId}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    Our support team will respond within 4–6 business hours. Save your ticket ID for reference.
                  </p>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '1.25rem' }}
                    onClick={() => setTicketId(null)}
                  >
                    Submit Another Ticket
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} style={{ marginTop: '1rem' }}>
                  {supportError && (
                    <div style={{
                      background: 'rgba(255,50,50,0.1)',
                      border: '1px solid rgba(255,50,50,0.25)',
                      color: '#ff6b6b',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.25rem',
                      fontSize: '0.88rem',
                    }}>
                      {supportError}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={supportCategory}
                      onChange={e => setSupportCategory(e.target.value)}
                      required
                    >
                      <option value="">— Select a category —</option>
                      <option value="PAYOUT">Payout / Earnings Issue</option>
                      <option value="DRIVER">Driver Didn't Arrive</option>
                      <option value="HANDOVER">Handover Confirmation Problem</option>
                      <option value="JOB_ASSIGNMENT">Job Assignment Issue</option>
                      <option value="ACCOUNT">Account / Profile</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Brief summary of your issue..."
                      value={supportSubject}
                      onChange={e => setSupportSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Detailed Message</label>
                    <textarea
                      rows={5}
                      className="form-textarea"
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.95rem',
                        resize: 'vertical',
                        transition: 'var(--transition)',
                      }}
                      placeholder="Include job IDs, dates, or any other relevant details..."
                      value={supportMessage}
                      onChange={e => setSupportMessage(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      background: `linear-gradient(135deg, ${PICKUP_GREEN}, #059669)`,
                      boxShadow: `0 8px 24px -6px ${PICKUP_GREEN_GLOW}`,
                    }}
                    disabled={supportSubmitting}
                  >
                    {supportSubmitting ? (
                      <>
                        <FaSpinner size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Submitting Ticket...
                      </>
                    ) : (
                      <>
                        <FaShieldVirus size={16} />
                        Submit Support Ticket
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* FAQ Accordion */}
            <div className="glass-card">
              <h3 className="form-section-title">
                <FaComment size={18} style={{ color: PICKUP_GREEN }} />
                Frequently Asked Questions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {FAQ_ITEMS.map((faq, i) => (
                  <FaqItem key={i} faq={faq} />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Contact info card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card">
              <h3 className="form-section-title">
                <FaPhone size={18} style={{ color: PICKUP_GREEN }} />
                Contact Information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem' }}>
                {/* FaPhone */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  background: PICKUP_GREEN_GLOW,
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${PICKUP_GREEN_BORDER}`,
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-sm)',
                    background: `${PICKUP_GREEN}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FaPhone size={18} style={{ color: PICKUP_GREEN }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '0.15rem' }}>Partner Helpline</div>
                    <div style={{ color: PICKUP_GREEN, fontWeight: 800, fontSize: '1.1rem' }}>
                      1800-EASYROUTE
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Toll-free · 24 × 7 support
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'var(--color-secondary-glow)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(0,120,200,0.12)',
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0,120,200,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FaEnvelope size={18} style={{ color: 'var(--color-secondary)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '0.15rem' }}>Email Support</div>
                    <div style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>
                      partners@easyroute.in
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Response within 4–6 hours
                    </div>
                  </div>
                </div>

                {/* Office Hours */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'rgba(255,170,0,0.07)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,170,0,0.2)',
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,170,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FaClock size={18} style={{ color: '#ffa31a' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '0.15rem' }}>Office Hours</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Mon – Sat</div>
                    <div style={{ color: '#ffa31a', fontWeight: 700, fontSize: '0.95rem' }}>9:00 AM – 8:00 PM IST</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Sundays · Emergency line only
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick-tips card */}
            <div className="glass-card" style={{
              background: PICKUP_GREEN_GLOW,
              borderColor: PICKUP_GREEN_BORDER,
            }}>
              <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', color: PICKUP_GREEN, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                <FaShieldVirus size={16} /> When contacting support
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>Include your <strong>Job ID</strong> (found on each job card)</li>
                <li>Mention the <strong>date &amp; time</strong> of the issue</li>
                <li>Attach a screenshot if possible</li>
                <li>Payout issues should quote your <strong>bank account</strong> or UPI ID</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupDashboard;
