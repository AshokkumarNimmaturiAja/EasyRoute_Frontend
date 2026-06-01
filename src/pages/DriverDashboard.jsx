import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import MyRateCardWidget from '../components/MyRateCardWidget';
import { STATES, CITIES_BY_STATE, LOCATIONS_BY_CITY } from '../utils/locations';
import { FaArrowRight, FaArrowUp, FaAward, FaBox, FaCalendarAlt, FaChartBar, FaChartLine, FaCheck, FaCheckCircle, FaChevronRight, FaClock, FaDollarSign, FaFileAlt, FaHeadset, FaMap, FaPhone, FaPlay, FaPlus, FaShieldAlt, FaSpinner, FaTruck, FaUser, FaWallet, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';

// ─── Weekly earnings mock data ─────────────────────────────────────────────────
const WEEKLY_DATA = [
  { day: 'Mon', amount: 4200 },
  { day: 'Tue', amount: 6800 },
  { day: 'Wed', amount: 3100 },
  { day: 'Thu', amount: 7500 },
  { day: 'Fri', amount: 5600 },
  { day: 'Sat', amount: 8200 },
  { day: 'Sun', amount: 4900 },
];
const WEEKLY_MAX = Math.max(...WEEKLY_DATA.map((d) => d.amount));

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatINR = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const TABS = ['Overview', 'My Vehicle', 'Active Jobs', 'Earnings', 'Support'];

// ─── Sub-components ────────────────────────────────────────────────────────────

/** A single stat card */
const StatCard = ({ emoji, label, value, accent }) => (
  <div
    className="stat-card"
    style={{
      background: 'var(--bg-card)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      borderTop: `3px solid ${accent || 'var(--color-primary)'}`,
    }}
  >
    <div
      className="stat-icon"
      style={{ background: `${accent || 'var(--color-primary)'}18`, fontSize: '1.6rem' }}
    >
      {emoji}
    </div>
    <div>
      <div className="stat-value" style={{ color: accent || 'var(--text-primary)', fontSize: '1.55rem' }}>
        {value}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

/** Weekly earnings bar chart (pure CSS) */
const WeeklyEarningsChart = () => (
  <div style={{ marginTop: '1rem' }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '0.6rem',
        height: 160,
        padding: '0 0.5rem',
      }}
    >
      {WEEKLY_DATA.map((d) => {
        const heightPct = Math.round((d.amount / WEEKLY_MAX) * 100);
        return (
          <div
            key={d.day}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
          >
            {/* Amount tooltip on hover via title */}
            <div
              title={formatINR(d.amount)}
              style={{
                width: '100%',
                height: `${heightPct}%`,
                background: 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: '6px 6px 2px 2px',
                transition: 'opacity 0.2s',
                cursor: 'default',
                minHeight: 8,
                boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
              }}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{d.day}</span>
          </div>
        );
      })}
    </div>
    {/* Y-axis hint */}
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '0.5rem',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        padding: '0 0.5rem',
      }}
    >
      <span>₹0</span>
      <span>{formatINR(WEEKLY_MAX / 2)}</span>
      <span>{formatINR(WEEKLY_MAX)}</span>
    </div>
  </div>
);

/** Horizontal status breakdown bar */
const StatusBreakdownBar = ({ delivered, inTransit, cancelled }) => {
  const total = delivered + inTransit + cancelled || 1;
  const dPct = Math.round((delivered / total) * 100);
  const tPct = Math.round((inTransit / total) * 100);
  const cPct = Math.round((cancelled / total) * 100);

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Stacked horizontal bar */}
      <div
        style={{
          display: 'flex',
          height: 22,
          borderRadius: 8,
          overflow: 'hidden',
          background: 'var(--border-light)',
        }}
      >
        {dPct > 0 && (
          <div
            style={{
              width: `${dPct}%`,
              background: '#10b981',
              transition: 'width 0.6s ease',
            }}
            title={`Delivered: ${dPct}%`}
          />
        )}
        {tPct > 0 && (
          <div
            style={{
              width: `${tPct}%`,
              background: '#06b6d4',
              transition: 'width 0.6s ease',
            }}
            title={`In Transit: ${tPct}%`}
          />
        )}
        {cPct > 0 && (
          <div
            style={{
              width: `${cPct}%`,
              background: '#ef4444',
              transition: 'width 0.6s ease',
            }}
            title={`Cancelled: ${cPct}%`}
          />
        )}
        {dPct === 0 && tPct === 0 && cPct === 0 && (
          <div style={{ width: '100%', background: 'var(--border-light)' }} />
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        {[
          { color: '#10b981', label: 'Delivered', pct: dPct, count: delivered },
          { color: '#06b6d4', label: 'In Transit', pct: tPct, count: inTransit },
          { color: '#ef4444', label: 'Cancelled', pct: cPct, count: cancelled },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: item.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {item.label}:{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {item.count} ({item.pct}%)
              </strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Platform deductions table */
const DeductionsTable = ({ grossEarnings }) => {
  const platformFeePct = 0.15;
  const platformFee = grossEarnings * platformFeePct;
  const netPayout = grossEarnings - platformFee;

  const rows = [
    { label: 'Gross Earnings (Total Delivered)', value: formatINR(grossEarnings), color: '#10b981', bold: false },
    { label: 'Platform Fee (15%)', value: `− ${formatINR(platformFee)}`, color: '#f59e0b', bold: false },
    { label: 'Net Payout (Your Earnings)', value: formatINR(netPayout), color: '#6366f1', bold: true },
  ];

  return (
    <div className="table-wrapper" style={{ marginTop: '1rem' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td style={{ color: 'var(--text-secondary)' }}>{r.label}</td>
              <td
                style={{
                  textAlign: 'right',
                  fontWeight: r.bold ? 800 : 600,
                  color: r.color,
                  fontSize: r.bold ? '1.05rem' : undefined,
                }}
              >
                {r.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Status badge helper ───────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    PENDING: ['badge-pending', 'Pending Assignment'],
    ASSIGNED: ['badge-assigned', 'Assigned to you'],
    PICKED: ['badge-picked', 'Cargo Loaded'],
    IN_TRANSIT: ['badge-transit', 'On Route'],
    DELIVERED: ['badge-delivered', 'Completed'],
    CANCELLED: ['badge-cancelled', 'Cancelled'],
  };
  const [cls, label] = map[status] || ['badge', status];
  return <span className={`badge ${cls}`}>{label}</span>;
};

// ─── Main Component ────────────────────────────────────────────────────────────
const DriverDashboard = () => {
  const { user } = useContext(AuthContext);

  // Core state
  const [trucks, setTrucks] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

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

  // ■ Truck registration ■form state
  const [regNum, setRegNum] = useState('');
  const [truckType, setTruckType] = useState('MINI');
  const [capacity, setCapacity] = useState(1.5);
  const [rcUrl, setRcUrl] = useState('');
  const [licenseUrl, setLicenseUrl] = useState('');
  const [insuranceUrl, setInsuranceUrl] = useState('');
  const [rateAccepted, setRateAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  // Multi-vehicle UI state
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [locationTarget, setLocationTarget] = useState(null);

  // Support Ticket state
  const [tickets, setTickets] = useState([]);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketCategory, setTicketCategory] = useState('OTHER');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketError, setTicketError] = useState('');

  // ── Pickup Partner state ──────────────────────────────────────────────────────
  const [partnerModalJob, setPartnerModalJob] = useState(null);
  const [pickupPartners, setPickupPartners] = useState([]);
  const [partnersLoading, setPartnersLoading] = useState(false);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Data fetching ─────────────────────────────────────────────────────────────
  const fetchDriverData = async () => {
    setLoading(true);
    let trucksData = [];
    let jobsData = [];

    // Fetch trucks
    try {
      const trucksRes = await api.get('/trucks/mine');
      trucksData = trucksRes.data?.data || [];
    } catch (err) {
      // Non-fatal – driver may not have a truck yet
      trucksData = [];
    }

    // Fetch jobs — backend filters by driver role in getMyShipments()
    try {
      const jobsRes = await api.get('/shipments');
      jobsData = jobsRes.data?.data || [];
    } catch (err) {
      // Show empty state instead of crashing
      jobsData = [];
    }

    setTrucks(trucksData);
    setJobs(jobsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchDriverData();
    fetchMyTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Support Tickets ─────────────────────────────────────────────────────────────
  const fetchMyTickets = async () => {
    try {
      const res = await api.get('/tickets/mine');
      setTickets(res.data?.data || []);
    } catch (err) {
      // non-fatal
    }
  };

  // ── Pickup Partners ─────────────────────────────────────────────────────────────
  const openPartnerModal = async (job) => {
    setPartnerModalJob(job);
    setPartnersLoading(true);
    setPickupPartners([]);
    try {
      const res = await api.get(`/trucks/pickup-partners?city=${job.pickupCity}`);
      setPickupPartners(res.data?.data || []);
    } catch {
      setPickupPartners([]);
    } finally {
      setPartnersLoading(false);
    }
  };

  const handleAssignPartner = async (partner) => {
    try {
      await api.put(`/shipments/${partnerModalJob.id}/pickup-partner?partnerId=${partner.ownerId}`);
      showToast('success', 'Pickup Partner Assigned Successfully');
      setPartnerModalJob(null);
      fetchDriverData();
    } catch (err) {
      showToast('error', 'Failed to assign partner');
    }
  };

  const handleRaiseTicket = async (e) => {
    e.preventDefault();
    setTicketError('');
    if (!ticketSubject.trim() || !ticketDesc.trim()) {
      setTicketError('Subject and description are required.');
      return;
    }
    setTicketSubmitting(true);
    try {
      await api.post('/tickets', {
        subject: ticketSubject,
        description: ticketDesc,
        category: ticketCategory,
      });
      showToast('success', 'Support ticket raised successfully!');
      setTicketSubject('');
      setTicketDesc('');
      setTicketCategory('OTHER');
      fetchMyTickets();
    } catch (err) {
      setTicketError(err.message || 'Failed to raise ticket');
    } finally {
      setTicketSubmitting(false);
    }
  };

  // ── FaTruck registration ────────────────────────────────────────────────────────
  const handleRegisterTruck = async (e) => {
    e.preventDefault();
    setError('');
    if (!regNum || !rcUrl || !licenseUrl || !rateAccepted || !privacyAccepted) {
      setError('Please fill in all required fields and accept the policies.');
      return;
    }
    if (!selectedState || !selectedCity || !selectedLocation) {
      setError('Please select your complete operating location.');
      return;
    }
    setSubmitting(true);
    const fullLocation = `${selectedLocation}, ${selectedCity}, ${selectedState}`;
    try {
      await api.post('/trucks/register', {
        registrationNumber: regNum,
        truckType,
        capacityTons: parseFloat(capacity),
        rcDocumentUrl: rcUrl,
        licenseUrl,
        insuranceUrl,
        rateCardAccepted: rateAccepted,
        currentRouteArea: fullLocation,
      });
      showToast('success', 'FaTruck registered! Awaiting administrator approval.');
      fetchDriverData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'FaTruck registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTruck = async (e) => {
    e.preventDefault();
    if (!editingTruck) return;
    setEditLoading(true);
    try {
      await api.put(`/trucks/${editingTruck.id}`, {
        capacityTons: parseFloat(capacity),
        rcDocumentUrl: rcUrl || editingTruck.rcDocumentUrl,
        licenseUrl: licenseUrl || editingTruck.licenseUrl
      });
      showToast('success', 'Truck updated successfully!');
      setEditingTruck(null);
      fetchDriverData();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update truck');
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
      fetchDriverData();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update location');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Availability toggle ───────────────────────────────────────────────────────
  const handleToggleAvailability = async (truckId) => {
    try {
      await api.put(`/trucks/${truckId}/availability`);
      showToast('success', 'Availability status updated');
      fetchDriverData();
    } catch (err) {
      showToast('error', 'Failed to toggle availability');
    }
  };

  // ── Shipment status progression ────────────────────────────────────────────────
  const handleProgressShipment = async (shipmentId, nextStatus) => {
    try {
      await api.put(`/shipments/${shipmentId}/status`, { status: nextStatus });
      showToast('success', `Shipment status updated to: ${nextStatus}`);
      fetchDriverData();
    } catch (err) {
      showToast('error', err.message || 'Failed to update status');
    }
  };

  // ── Computed stats ─────────────────────────────────────────────────────────────
  const totalTrips = jobs.filter((j) => j.status === 'DELIVERED').length;
  const activeJobs = jobs.filter(
    (j) => j.status === 'IN_TRANSIT' || j.status === 'ASSIGNED' || j.status === 'PICKED'
  ).length;
  const cancelledJobs = jobs.filter((j) => j.status === 'CANCELLED').length;
  const inTransitJobs = jobs.filter((j) => j.status === 'IN_TRANSIT').length;

  const grossEarnings = jobs
    .filter((j) => j.status === 'DELIVERED')
    .reduce((acc, j) => acc + (j.estimatedCost || 0), 0);
  const netEarnings = grossEarnings * 0.9;

  // Mock: first half paid, second half pending
  const paidOut = netEarnings * 0.6;
  const pendingPayout = netEarnings - paidOut;

  // ── Derived flags ──────────────────────────────────────────────────────────────
  const hasTruck = trucks.length > 0;
  const mainTruck = hasTruck ? trucks[0] : null;

  // ── Loading screen ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          gap: '1rem',
        }}
      >
        <FaSpinner
          size={40}
          style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }}
        />
        <p style={{ color: 'var(--text-secondary)' }}>Loading driver dashboard…</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB CONTENT RENDERERS
  // ─────────────────────────────────────────────────────────────────────────────

  /** Overview Tab: stat cards + financial charts */
  const renderOverview = () => (
    <>
      <MyRateCardWidget roleColor="#3b82f6" roleBg="#eff6ff" />
      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard emoji="🚛" label="Total Trips" value={totalTrips} accent="#6366f1" />
        <StatCard emoji="🔄" label="Active Jobs" value={activeJobs} accent="#06b6d4" />
        <StatCard emoji="💰" label="Estimated Earnings" value={formatINR(netEarnings)} accent="#10b981" />
        <StatCard emoji="💳" label="Pending Payout" value={formatINR(pendingPayout)} accent="#f59e0b" />
        <StatCard emoji="⭐" label="Average Rating" value="4.8 ⭐" accent="#f59e0b" />
        <StatCard emoji="❌" label="Cancellations" value={cancelledJobs} accent="#ef4444" />
      </div>

      {/* Financial Overview */}
      <div style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-primary)',
          }}
        >
          <FaChartBar size={20} style={{ color: 'var(--color-primary)' }} />
          Financial Overview
        </h2>

        <div className="grid-2" style={{ gap: '1.5rem' }}>
          {/* Weekly Earnings Bar Chart */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                marginBottom: '0.25rem',
                color: 'var(--text-primary)',
              }}
            >
              Weekly Earnings
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 0 }}>
              Mon → Sun this week (sample data)
            </p>
            <WeeklyEarningsChart />

            {/* Weekly total */}
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                background: 'rgba(99,102,241,0.07)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Week Total
              </span>
              <span style={{ fontWeight: 800, color: '#6366f1', fontSize: '1.1rem' }}>
                {formatINR(WEEKLY_DATA.reduce((a, d) => a + d.amount, 0))}
              </span>
            </div>
          </div>

          {/* Trip Status Breakdown */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                marginBottom: '0.25rem',
                color: 'var(--text-primary)',
              }}
            >
              Trip Status Breakdown
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 0 }}>
              Distribution across all your jobs
            </p>
            <StatusBreakdownBar
              delivered={totalTrips}
              inTransit={inTransitJobs}
              cancelled={cancelledJobs}
            />

            {/* Platform deductions */}
            <div style={{ marginTop: '1.5rem' }}>
              <h4
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <FaWallet size={14} style={{ color: '#f59e0b' }} />
                Platform Deductions
              </h4>
              <DeductionsTable grossEarnings={grossEarnings} />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  /** My Vehicle Tab */
  const renderMyVehicle = () => (
    <div>
      {/* Vehicle Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {trucks.map(truck => (
          <div key={truck.id} className="glass-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-secondary)', marginBottom: '0.15rem' }}>
                  {truck.registrationNumber}
                </h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {truck.truckType} &nbsp;|&nbsp; {truck.capacityTons} Tons
                </span>
                {truck.currentRouteArea && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', padding: '0.3rem 0.7rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '20px', width: 'fit-content' }}>
                    <FaMapMarkerAlt size={11} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>{truck.currentRouteArea}</span>
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
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {truck.rcDocumentUrl && (
                <a href={truck.rcDocumentUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary" style={{ fontSize: '0.78rem' }}>
                  <FaFileAlt size={12} style={{ marginRight: 4 }} /> RC File
                </a>
              )}
              {truck.licenseUrl && (
                <a href={truck.licenseUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary" style={{ fontSize: '0.78rem' }}>
                  <FaFileAlt size={12} style={{ marginRight: 4 }} /> License
                </a>
              )}
              {truck.insuranceUrl && (
                <a href={truck.insuranceUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary" style={{ fontSize: '0.78rem' }}>
                  <FaShieldAlt size={12} style={{ marginRight: 4 }} /> Insurance
                </a>
              )}
            </div>

            {/* Per-vehicle action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => {
                setEditingTruck(truck);
                setCapacity(String(truck.capacityTons || ''));
                setRcUrl(''); setLicenseUrl(''); setInsuranceUrl('');
              }}>
                Edit Truck Details
              </button>
              <button
                className="btn btn-sm"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none' }}
                onClick={() => {
                  setLocationTarget(truck);
                  setSelectedState(''); setSelectedCity(''); setSelectedLocation('');
                }}
              >
                <FaMapMarkerAlt size={12} style={{ marginRight: 5 }} />
                Update Location
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vehicle Button */}
      <button
        className="btn btn-primary"
        style={{ width: '100%', padding: '0.85rem', marginBottom: '1.5rem', background: showAddVehicle ? '#64748b' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: showAddVehicle ? 'none' : '0 4px 15px rgba(99,102,241,0.3)' }}
        onClick={() => { setShowAddVehicle(!showAddVehicle); setError(''); }}
      >
        {showAddVehicle ? '✕ Cancel' : `+ ${trucks.length > 0 ? 'Add Another Vehicle' : 'Register First Vehicle'}`}
      </button>

      {/* Add Vehicle Form */}
      {showAddVehicle && (
        <div className="glass-card">
          <h3 className="form-section-title">
            <FaTruck size={20} />
            <span>Register Transport Vehicle</span>
          </h3>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleRegisterTruck}>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Registration Number *</label>
                <input type="text" required placeholder="e.g. MH-12-AB-1234" className="form-input" value={regNum} onChange={(e) => setRegNum(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select className="form-select" value={truckType} onChange={(e) => setTruckType(e.target.value)}>
                  <option value="MINI">Mini Truck (&lt; 2 tons)</option>
                  <option value="MEDIUM">Medium Cargo (2-5 tons)</option>
                  <option value="LARGE">Large Lorry (5-10 tons)</option>
                  <option value="HEAVY">Heavy Multi-Axle (10+ tons)</option>
                </select>
              </div>
            </div>
            <div className="grid-2" style={{ gap: '1rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">Capacity (Tons) *</label>
                <input type="number" required step="0.1" min="0.1" className="form-input" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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
            </div>
            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">RC Document (PDF/Image) *</label>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="form-input" onChange={(e) => handleFileUpload(e.target.files[0], setRcUrl)} />
              {rcUrl && <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '0.25rem' }}>✓ Uploaded</p>}
            </div>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Driving License (PDF/Image) *</label>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="form-input" onChange={(e) => handleFileUpload(e.target.files[0], setLicenseUrl)} />
                {licenseUrl && <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '0.25rem' }}>✓ Uploaded</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Insurance (optional)</label>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="form-input" onChange={(e) => handleFileUpload(e.target.files[0], setInsuranceUrl)} />
                {insuranceUrl && <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '0.25rem' }}>✓ Uploaded</p>}
              </div>
            </div>
            <div className="form-group" style={{ margin: '1.5rem 0' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="checkbox" style={{ marginTop: 3 }} checked={rateAccepted} onChange={(e) => setRateAccepted(e.target.checked)} />
                <span>I accept the EasyRoute rate cards, platform commission (15%), and driver payout terms.</span>
              </label>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={submitting}>
              {submitting ? <><FaSpinner size={18} style={{ marginRight: 8, animation: 'spin 1s linear infinite' }} /><span>Submitting…</span></> : <span>Register Vehicle</span>}
            </button>
          </form>
        </div>
      )}

      {/* ── Edit Vehicle Modal ── */}
      {editingTruck && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '2rem', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Edit Truck Details</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setEditingTruck(null)}>✕</button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{editingTruck.registrationNumber}</p>
            <form onSubmit={handleEditTruck}>
              <div className="form-group">
                <label className="form-label">Capacity (Tons) *</label>
                <input type="number" required step="0.1" min="0.1" className="form-input" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">RC Document (upload new)</label>
                <input type="file" className="form-input" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileUpload(e.target.files[0], setRcUrl)} />
                {rcUrl && <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '0.25rem' }}>✓ New file uploaded</p>}
                {editingTruck.rcDocumentUrl && !rcUrl && <a href={editingTruck.rcDocumentUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>View current RC →</a>}
              </div>
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Driving License (upload new)</label>
                <input type="file" className="form-input" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileUpload(e.target.files[0], setLicenseUrl)} />
                {licenseUrl && <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '0.25rem' }}>✓ New file uploaded</p>}
                {editingTruck.licenseUrl && !licenseUrl && <a href={editingTruck.licenseUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>View current license →</a>}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingTruck(null)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editLoading} style={{ flex: 2 }}>
                  {editLoading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Update Location Modal ── */}
      {locationTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '2rem', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>Update Operating Location</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setLocationTarget(null)}>✕</button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{locationTarget.registrationNumber}</p>
            <form onSubmit={handleUpdateLocation}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <select className="form-select" disabled value="India"><option value="India">India</option></select>
                <select className="form-select" required value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); setSelectedLocation(''); }}>
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <select className="form-select" required value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); setSelectedLocation(''); }} disabled={!selectedState}>
                  <option value="">Select City</option>
                  {selectedState && CITIES_BY_STATE[selectedState]?.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="form-select" required value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} disabled={!selectedCity}>
                  <option value="">Select Area</option>
                  {selectedCity && LOCATIONS_BY_CITY[selectedCity]?.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setLocationTarget(null)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editLoading} style={{ flex: 2 }}>
                  {editLoading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  /** Active Jobs Tab */
  const renderActiveJobs = () => {
    if (!hasTruck) {
      return (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FaShieldAlt size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.1rem' }}>
            Awaiting Vehicle Registration
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Register your vehicle and get admin approval to receive cargo jobs.
          </p>
          <button
            className="btn btn-primary btn-sm"
            style={{ marginTop: '1.5rem' }}
            onClick={() => setActiveTab('My Vehicle')}
          >
            Register Vehicle <FaChevronRight size={14} />
          </button>
        </div>
      );
    }

    if (!mainTruck.verified) {
      return (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FaClock size={48} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.1rem' }}>
            Verification Pending
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            The administrator is reviewing your registration documents.
          </p>
        </div>
      );
    }

    if (jobs.length === 0) {
      return (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FaMap size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.1rem' }}>
            No Jobs Assigned
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            When the administrator assigns cargo bookings matching your vehicle, they will appear here.
          </p>
        </div>
      );
    }

    const activeList = jobs.filter(
      (j) => j.status === 'ASSIGNED' || j.status === 'PICKED' || j.status === 'IN_TRANSIT'
    );
    const otherList = jobs.filter(
      (j) => j.status !== 'ASSIGNED' && j.status !== 'PICKED' && j.status !== 'IN_TRANSIT'
    );
    const displayList = activeList.length > 0 ? activeList : otherList;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {activeList.length > 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
            Showing {activeList.length} active job{activeList.length > 1 ? 's' : ''}
          </p>
        )}

        {displayList.map((job) => (
          <div
            key={job.id}
            className="glass-card"
            style={{
              padding: '1.4rem',
              borderLeft: job.status === 'IN_TRANSIT'
                ? '4px solid #06b6d4'
                : job.status === 'ASSIGNED'
                ? '4px solid #3399ff'
                : job.status === 'PICKED'
                ? '4px solid #e650ff'
                : '4px solid var(--border-light)',
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.75rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    display: 'block',
                    fontFamily: 'monospace',
                    marginBottom: '0.2rem',
                  }}
                >
                  JOB {job.trackingNumber || '#' + job.id?.substring(0, 8)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{job.pickupCity}</span>
                  <FaArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{job.dropCity}</span>
                </div>
              </div>
              <StatusBadge status={job.status} />
            </div>

            {/* Details */}
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
                borderTop: '1px solid var(--border-light)',
                paddingTop: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Pickup:</strong> {job.pickupAddress}
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Delivery:</strong> {job.dropAddress}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.35rem',
                  flexWrap: 'wrap',
                  gap: '0.25rem',
                }}
              >
                <span>
                  <FaBox size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Weight: {job.totalWeightKg} kg
                </span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>
                  Your Earnings: {formatINR((job.estimatedCost || 0) * 0.9)} (90%)
                </span>
              </div>
            </div>

            {/* Customer info */}
            <div
              style={{
                background: 'rgba(0,0,0,0.025)',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <FaUser size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500, flex: 1 }}>
                {job.customerName}
              </span>
              <FaPhone size={12} style={{ color: 'var(--text-muted)' }} />
              <span>{job.customerPhone}</span>
            </div>

            {/* Progression actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
              {job.status === 'ASSIGNED' && !job.pickupPartnerId && (
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => openPartnerModal(job)}
                >
                  <FaTruck size={12} /> Assign Pickup Partner
                </button>
              )}
              {job.status === 'ASSIGNED' && (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleProgressShipment(job.id, 'PICKED')}
                >
                  <FaPlay size={12} /> Confirm Cargo Loaded
                </button>
              )}
              {job.status === 'PICKED' && (
                <button
                  className="btn btn-accent btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleProgressShipment(job.id, 'IN_TRANSIT')}
                >
                  <FaPlay size={12} /> Depart &amp; Begin Route (In Transit)
                </button>
              )}
              {job.status === 'IN_TRANSIT' && (
                <button
                  className="btn btn-sm"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                  }}
                  onClick={() => handleProgressShipment(job.id, 'DELIVERED')}
                >
                  <FaCheck size={12} /> Handover &amp; Complete Delivery
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /** Earnings Tab: detailed breakdown of all DELIVERED jobs */
  const renderEarnings = () => {
    const deliveredJobs = jobs.filter((j) => j.status === 'DELIVERED');

    return (
      <>
        {/* Summary strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {[
            { label: 'Gross Earnings', val: formatINR(grossEarnings), color: '#10b981', emoji: '💵' },
            { label: 'Platform Fee (15%)', val: formatINR(grossEarnings * 0.15), color: '#f59e0b', emoji: '🏦' },
            { label: 'Net Payout', val: formatINR(netEarnings), color: '#6366f1', emoji: '💰' },
            { label: 'Pending Payout', val: formatINR(pendingPayout), color: '#ef4444', emoji: '💳' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${s.color}30`,
                borderTop: `3px solid ${s.color}`,
                borderRadius: 'var(--radius-md)',
                padding: '1.1rem 1.25rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ fontSize: '1.2rem', marginBottom: 2 }}>{s.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: '1.3rem', color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Job-level earnings table */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3
            className="form-section-title"
            style={{ marginBottom: '1rem' }}
          >
            <FaArrowUp size={18} />
            Delivered Jobs — Earnings Breakdown
          </h3>

          {deliveredJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              <FaAward size={40} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
              <p>No completed deliveries yet. Earn your first badge by completing a trip!</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job ID</th>
                    <th>Route</th>
                    <th>Weight</th>
                    <th style={{ textAlign: 'right' }}>Gross</th>
                    <th style={{ textAlign: 'right' }}>Platform Fee</th>
                    <th style={{ textAlign: 'right' }}>Your Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveredJobs.map((job) => {
                    const gross = job.estimatedCost || 0;
                    const fee = gross * 0.15;
                    const net = gross * 0.85;
                    return (
                      <tr key={job.id}>
                        <td>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {job.trackingNumber || '#' + job.id?.substring(0, 8)}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontWeight: 600 }}>{job.pickupCity}</span>
                            <FaArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ fontWeight: 600 }}>{job.dropCity}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{job.totalWeightKg} kg</td>
                        <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                          {formatINR(gross)}
                        </td>
                        <td style={{ textAlign: 'right', color: '#f59e0b', fontWeight: 600 }}>
                          − {formatINR(fee)}
                        </td>
                        <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>
                          {formatINR(net)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      Total ({deliveredJobs.length} trips)
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      {formatINR(grossEarnings)}
                    </td>
                    <td style={{ textAlign: 'right', color: '#f59e0b', fontWeight: 700 }}>
                      − {formatINR(grossEarnings * 0.15)}
                    </td>
                    <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 800, fontSize: '1rem' }}>
                      {formatINR(netEarnings)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  /** Support Tab */
  const renderSupport = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Raise Ticket Form */}
      <div className="glass-card">
        <h3 className="form-section-title">
          <FaPlus size={18} style={{ color: '#6366f1' }} />
          <span>Raise a Support Ticket</span>
        </h3>
        {ticketError && (
          <div
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#ef4444',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              fontSize: '0.88rem',
            }}
          >
            {ticketError}
          </div>
        )}
        <form onSubmit={handleRaiseTicket}>
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
              >
                <option value="PAYMENT">💳 Payment / Earnings</option>
                <option value="SHIPMENT">📦 Shipment / Job Issue</option>
                <option value="VEHICLE">🚛 Vehicle / Registration</option>
                <option value="OTHER">❓ Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Brief description of your issue"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              className="form-input"
              rows={4}
              style={{ resize: 'vertical', lineHeight: 1.6 }}
              placeholder="Describe your issue in detail…"
              value={ticketDesc}
              onChange={(e) => setTicketDesc(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
            disabled={ticketSubmitting}
          >
            {ticketSubmitting ? (
              <><FaSpinner size={16} style={{ marginRight: 8, animation: 'spin 1s linear infinite' }} />Submitting…</>
            ) : (
              <><FaHeadset size={16} style={{ marginRight: 8 }} />Submit Ticket</>
            )}
          </button>
        </form>
      </div>

      {/* My Tickets List */}
      <div className="glass-card">
        <h3 className="form-section-title">
          <FaHeadset size={18} style={{ color: '#6366f1' }} />
          <span>My Tickets ({tickets.length})</span>
        </h3>

        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <FaHeadset size={40} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
            <p>No tickets raised yet. Use the form above to get help.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tickets.map((ticket) => {
              const statusColor = {
                OPEN: '#3b82f6',
                IN_PROGRESS: '#f59e0b',
                RESOLVED: '#10b981',
                CLOSED: '#6b7280',
              }[ticket.status] || '#6b7280';
              const statusLabel = {
                OPEN: '🟦 Open',
                IN_PROGRESS: '🟡 In Progress',
                RESOLVED: '✅ Resolved',
                CLOSED: '⬛ Closed',
              }[ticket.status] || ticket.status;
              return (
                <div
                  key={ticket.id}
                  style={{
                    border: '1px solid var(--border-light)',
                    borderLeft: `4px solid ${statusColor}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    background: 'var(--bg-dark)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                          color: 'var(--text-muted)',
                          display: 'block',
                          marginBottom: '0.2rem',
                        }}
                      >
                        #{ticket.id?.substring(0, 8)} · {ticket.category}
                      </span>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{ticket.subject}</strong>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: statusColor,
                        background: `${statusColor}18`,
                        padding: '0.25rem 0.65rem',
                        borderRadius: 50,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0', lineHeight: 1.6 }}>
                    {ticket.description}
                  </p>
                  {ticket.adminReply && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem 1rem',
                        background: 'rgba(16,185,129,0.07)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#10b981',
                          marginBottom: '0.3rem',
                        }}
                      >
                        🛡 Admin Reply:
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                        {ticket.adminReply}
                      </p>
                    </div>
                  )}
                  <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.6rem', marginBottom: 0 }}>
                    Raised on: {new Date(ticket.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ─── Main render ───────────────────────────────────────────────────────────────
  return (
    <div className="container dashboard-container">
      {/* Toast notifications */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span style={{ fontSize: '1.1rem' }}>{toast.type === 'success' ? '✓' : '✗'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Dashboard header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Transporter Dashboard{' '}
            <span style={{ fontSize: '1.5rem' }}>🚛</span>
          </h1>
          <p className="dashboard-subtitle">
            Welcome back,{' '}
            <strong style={{ color: 'var(--color-secondary)' }}>
              {user?.name || user?.email || 'Driver'}
            </strong>
            ! Manage your routes, earnings &amp; vehicle from one place.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {mainTruck?.id && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: mainTruck.isAvailable ? '#6366f1' : 'var(--text-muted)' }}>
                {mainTruck.isAvailable ? 'ON DUTY' : 'OFF DUTY'}
              </span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={mainTruck.isAvailable}
                  onChange={() => handleToggleAvailability(mainTruck.id)}
                />
                <span className="toggle-slider" style={mainTruck.isAvailable ? { backgroundColor: '#6366f1' } : {}}></span>
              </label>
            </div>
          )}

          {/* Quick status pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 50,
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <FaChartLine size={14} style={{ color: activeJobs > 0 ? '#10b981' : 'var(--text-muted)' }} />
            <span style={{ color: activeJobs > 0 ? '#10b981' : 'var(--text-muted)' }}>
              {activeJobs > 0 ? `${activeJobs} Job${activeJobs > 1 ? 's' : ''} Active` : 'No Active Jobs'}
            </span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tabs-container">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'Overview' && <FaChartBar size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
            {tab === 'My Vehicle' && <FaTruck size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
            {tab === 'Active Jobs' && <FaCalendarAlt size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
            {tab === 'Earnings' && <FaDollarSign size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
            {tab === 'Support' && <FaHeadset size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
            {tab}
            {tab === 'Active Jobs' && activeJobs > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: 50,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  lineHeight: 1.4,
                }}
              >
                {activeJobs}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'My Vehicle' && renderMyVehicle()}
        {activeTab === 'Active Jobs' && renderActiveJobs()}
        {activeTab === 'Earnings' && renderEarnings()}
        {activeTab === 'Support' && renderSupport()}
      </div>

      {/* Pickup Partner Modal */}
      {partnerModalJob && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Assign Pickup Partner</h3>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ minWidth: 'auto', padding: '0.25rem 0.5rem' }} 
                onClick={() => setPartnerModalJob(null)}
              >
                <FaTimes size={16} />
              </button>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Select a 2-wheeler partner in <strong>{partnerModalJob.pickupCity}</strong> to handle the warehouse handover.
            </p>

            {partnersLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <FaSpinner size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
              </div>
            ) : pickupPartners.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <FaTruck size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p>No available pickup partners in this city.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pickupPartners.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.ownerName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.registrationNumber}</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => handleAssignPartner(p)}>
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default DriverDashboard;
