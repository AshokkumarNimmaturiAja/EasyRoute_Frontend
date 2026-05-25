import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { FaUser, FaUsers, FaEye, FaQuestionCircle, FaClock, FaPhone, FaEdit, FaArrowRight, FaSpinner, FaCalendarAlt, FaLayerGroup, FaChartLine, FaSearch, FaShieldVirus, FaBox, FaCheck, FaInfoCircle, FaExclamationCircle, FaTruck, FaTimes, FaShieldAlt, FaCheckCircle, FaEnvelope, FaDollarSign, FaBan, FaUnlock, FaCodeBranch, FaSyncAlt, FaExternalLinkAlt, FaHeadset, FaReply } from 'react-icons/fa';
const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  // Navigation Tabs: 'metrics' | 'profile' | 'users' | 'trucks' | 'fleet' | 'pairings' | 'track' | 'logs'
  const [activeTab, setActiveTab] = useState('metrics');
  
  // Data States
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [pendingTrucks, setPendingTrucks] = useState([]);
  const [pendingShipments, setPendingShipments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [allShipments, setAllShipments] = useState([]);
  const [globalRates, setGlobalRates] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);

  // Support Ticket reply state
  const [ticketReplyMap, setTicketReplyMap] = useState({});
  const [ticketStatusMap, setTicketStatusMap] = useState({});
  const [ticketReplyLoading, setTicketReplyLoading] = useState({});

  // FaSearch/Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  
  // Fleet FaSearch/Filters
  const [fleetSearch, setFleetSearch] = useState('');
  const [fleetTypeFilter, setFleetTypeFilter] = useState('');
  const [fleetVerifiedFilter, setFleetVerifiedFilter] = useState('');

  // Shipment Tracker FaSearch/Filters
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState('');

  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Consolidation / Pairing States
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [consolidationCandidates, setConsolidationCandidates] = useState([]);
  const [selectedConsolidationIds, setSelectedConsolidationIds] = useState([]);
  const [selectedTruckId, setSelectedTruckId] = useState('');
  const [loadingConsolidation, setLoadingConsolidation] = useState(false);
  const [routeSearch, setRouteSearch] = useState('');

  // Modal notes states
  const [openVerifyModal, setOpenVerifyModal] = useState(null);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [openSuspendModal, setOpenSuspendModal] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');

  // Shipment Detail & Override states
  const [selectedDetailedShipment, setSelectedDetailedShipment] = useState(null);
  const [statusOverrideTarget, setStatusOverrideTarget] = useState('');
  const [cancellationReasonText, setCancellationReasonText] = useState('');

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Summary Metrics
      const summaryRes = await api.get('/admin/dashboard');
      setSummary(summaryRes.data.data);

      // 2. Fetch FaUsers
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data.data || []);

      // 3. Fetch Pending Trucks
      const pendingTrucksRes = await api.get('/admin/trucks/pending');
      setPendingTrucks(pendingTrucksRes.data.data || []);

      // 4. Fetch All Trucks
      const trucksRes = await api.get('/admin/trucks/all');
      setTrucks(trucksRes.data.data || []);

      // 5. Fetch Pending Shipments
      const shipmentsRes = await api.get('/shipments?status=PENDING');
      setPendingShipments(shipmentsRes.data.data || []);

      // 6. Fetch Audit Logs
      const logsRes = await api.get('/admin/audit-logs');
      setAuditLogs(logsRes.data.data || []);

      // 7. Fetch All Shipments
      const allShipmentsRes = await api.get('/shipments');
      setAllShipments(allShipmentsRes.data.data || []);
      
      // 8. Fetch Global Rates
      const ratesRes = await api.get('/rates/global');
      setGlobalRates(ratesRes.data || []);

      // 9. Fetch Support Tickets
      const ticketsRes = await api.get('/tickets/admin/all');
      setSupportTickets(ticketsRes.data.data || []);
      
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      showToast('error', `Failed to retrieve administrative data: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // Status Override handler
  const handleOverrideShipmentStatus = async (shipmentId) => {
    if (!statusOverrideTarget) {
      showToast('error', 'Please select a status to override');
      return;
    }
    setActionLoading(true);
    try {
      await api.put(`/shipments/${shipmentId}/status`, {
        status: statusOverrideTarget,
        cancellationReason: statusOverrideTarget === 'CANCELLED' ? cancellationReasonText || 'Override by Admin' : ''
      });
      showToast('success', `Shipment status successfully updated to ${statusOverrideTarget}`);
      setSelectedDetailedShipment(null);
      setStatusOverrideTarget('');
      setCancellationReasonText('');
      fetchDashboardData();
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message || 'Status override failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRate = async (rateId, payload) => {
    setActionLoading(true);
    try {
      await api.put(`/rates/${rateId}`, payload);
      showToast('success', 'Rate card updated successfully');
      fetchDashboardData();
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to update rate card');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Suspend/Reinstate FaUser Action
  const handleSuspendUser = async () => {
    if (!openSuspendModal) return;
    const { userObj, suspend } = openSuspendModal;

    if (suspend && !suspendReason.trim()) {
      showToast('error', 'Please provide a suspension reason');
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/admin/users/${userObj.id}/suspend`, {
        suspend,
        reason: suspend ? suspendReason : 'Reinstated by admin'
      });
      showToast('success', suspend ? 'User suspended successfully' : 'User account reinstated');
      setOpenSuspendModal(null);
      setSuspendReason('');
      fetchDashboardData();
    } catch (err) {
      showToast('error', err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Verify FaTruck Action
  const handleVerifyTruck = async (approve) => {
    if (!openVerifyModal) return;
    const truckId = openVerifyModal.id;

    setActionLoading(true);
    try {
      await api.put(`/admin/trucks/${truckId}/verify`, {
        verify: approve,
        notes: verifyNotes || (approve ? 'Verified and Approved' : 'Rejected verification')
      });
      showToast('success', approve ? 'Truck approved' : 'Truck rejected');
      setOpenVerifyModal(null);
      setVerifyNotes('');
      fetchDashboardData();
    } catch (err) {
      showToast('error', err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Select shipment for pairing & find consolidation candidates
  const handleSelectPairing = async (shipment) => {
    setSelectedShipment(shipment);
    setSelectedConsolidationIds([]);
    setConsolidationCandidates([]);
    setSelectedTruckId('');
    setRouteSearch(shipment.pickupCity || shipment.pickupAddress || '');
    
    setLoadingConsolidation(true);
    try {
      const res = await api.get(`/shipments/${shipment.id}/consolidation`);
      setConsolidationCandidates(res.data.data || []);
    } catch (err) {
      showToast('error', 'Error loading consolidation candidates');
    } finally {
      setLoadingConsolidation(false);
    }
  };

  // Perform Pairing Assignment
  const handleAssignPairing = async () => {
    if (!selectedTruckId) {
      showToast('error', 'Please select a vehicle to assign');
      return;
    }

    setActionLoading(true);
    try {
      if (selectedConsolidationIds.length > 0) {
        // Bulk Assign (Consolidated Batch)
        const shipmentIds = [selectedShipment.id, ...selectedConsolidationIds];
        await api.put('/admin/shipments/bulk-assign', {
          shipmentIds,
          truckId: selectedTruckId
        });
        showToast('success', 'Consolidated batch assigned successfully');
      } else {
        // Single Assign
        await api.put(`/admin/shipments/${selectedShipment.id}/assign`, {
          truckId: selectedTruckId
        });
        showToast('success', 'Truck assigned to shipment successfully');
      }
      setSelectedShipment(null);
      setSelectedConsolidationIds([]);
      setSelectedTruckId('');
      fetchDashboardData();
    } catch (err) {
      showToast('error', err.message || 'Assignment failed');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleConsolidationSelection = (id) => {
    if (selectedConsolidationIds.includes(id)) {
      setSelectedConsolidationIds(selectedConsolidationIds.filter(x => x !== id));
    } else {
      setSelectedConsolidationIds([...selectedConsolidationIds, id]);
    }
  };

  // Filter users based on input
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter ? u.role === userRoleFilter : true;
    return matchesSearch && matchesRole;
  });

  // Filter verified, available trucks for pairing
  const availableTrucks = trucks.filter(t => t.verified && t.available);

  // Filter fleet registry
  const filteredFleet = trucks.filter(truck => {
    const matchesSearch = truck.registrationNumber.toLowerCase().includes(fleetSearch.toLowerCase()) || 
                          truck.ownerName.toLowerCase().includes(fleetSearch.toLowerCase());
    const matchesType = fleetTypeFilter ? truck.truckType === fleetTypeFilter : true;
    
    let matchesVerified = true;
    if (fleetVerifiedFilter === 'verified') {
      matchesVerified = truck.verified;
    } else if (fleetVerifiedFilter === 'unverified') {
      matchesVerified = !truck.verified;
    }
    
    return matchesSearch && matchesType && matchesVerified;
  });

  // Filter shipments tracker
  const filteredShipments = allShipments.filter(ship => {
    const matchesSearch = ship.id.toLowerCase().includes(shipmentSearch.toLowerCase()) || 
                          ship.pickupCity.toLowerCase().includes(shipmentSearch.toLowerCase()) || 
                          ship.dropCity.toLowerCase().includes(shipmentSearch.toLowerCase()) || 
                          (ship.customerName && ship.customerName.toLowerCase().includes(shipmentSearch.toLowerCase())) ||
                          (ship.customerPhone && ship.customerPhone.toLowerCase().includes(shipmentSearch.toLowerCase()));
    
    const matchesStatus = shipmentStatusFilter ? ship.status === shipmentStatusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container dashboard-container">
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span style={{ fontSize: '1.2rem' }}>
              {toast.type === 'success' ? '✓' : '✗'}
            </span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Platform Operations Board</h1>
          <p className="dashboard-subtitle">Suspend profiles, verify haulage documents, and consolidated route assignments</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchDashboardData} disabled={loading}>
          <FaSyncAlt size={16} className={loading ? 'pulse-icon' : ''} />
          <span>Sync Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
        <button className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`} onClick={() => setActiveTab('metrics')}>
          <FaChartLine size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Metrics
        </button>
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <FaUser size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> My Admin Profile
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <FaUsers size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Users Manager ({users.length})
        </button>
        <button className={`tab-btn ${activeTab === 'fleet' ? 'active' : ''}`} onClick={() => setActiveTab('fleet')}>
          <FaTruck size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Fleet Registry ({trucks.length})
        </button>
        <button className={`tab-btn ${activeTab === 'trucks' ? 'active' : ''}`} onClick={() => setActiveTab('trucks')}>
          <FaShieldVirus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Approvals ({pendingTrucks.length})
        </button>
        <button className={`tab-btn ${activeTab === 'track' ? 'active' : ''}`} onClick={() => setActiveTab('track')}>
          <FaBox size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Track Shipments ({allShipments.length})
        </button>
        <button className={`tab-btn ${activeTab === 'pairings' ? 'active' : ''}`} onClick={() => setActiveTab('pairings')}>
          <FaLayerGroup size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Consolidation ({pendingShipments.length})
        </button>
        <button className={`tab-btn ${activeTab === 'rates' ? 'active' : ''}`} onClick={() => setActiveTab('rates')}>
          <FaDollarSign size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Rate Management
        </button>
        <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          <FaShieldAlt size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Audit Logs
        </button>
        <button className={`tab-btn ${activeTab === 'support' ? 'active' : ''}`} onClick={() => setActiveTab('support')}>
          <FaHeadset size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Support Tickets {supportTickets.filter(t => t.status === 'OPEN').length > 0 && <span style={{ marginLeft: 4, background: '#ef4444', color: '#fff', borderRadius: 50, fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px' }}>{supportTickets.filter(t => t.status === 'OPEN').length}</span>}
        </button>
      </div>

      {loading && !summary ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '1rem' }}>
          <FaSpinner size={40} className="pulse-icon" style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Compiling platform aggregates...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: METRICS */}
          {activeTab === 'metrics' && summary && (
            <div>
              {/* Financial Summary */}
              <div className="stat-grid">
                <div className="stat-card" style={{ borderLeft: '4px solid var(--color-secondary)' }}>
                  <div className="stat-icon" style={{ background: 'var(--color-secondary-glow)', color: 'var(--color-secondary)' }}>
                    <FaDollarSign size={20} />
                  </div>
                  <div>
                    <span className="stat-label">Total Revenue</span>
                    <div className="stat-value">₹{summary.totalRevenue.toFixed(2)}</div>
                  </div>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                  <div className="stat-icon" style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}>
                    <FaDollarSign size={20} />
                  </div>
                  <div>
                    <span className="stat-label">Driver Payouts</span>
                    <div className="stat-value">₹{summary.totalPayouts.toFixed(2)}</div>
                  </div>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
                  <div className="stat-icon" style={{ background: 'rgba(255, 120, 0, 0.15)', color: 'var(--color-accent)' }}>
                    <FaDollarSign size={20} />
                  </div>
                  <div>
                    <span className="stat-label">Platform Profit</span>
                    <div className="stat-value">₹{summary.platformProfit.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Operations Stats */}
              <h4 style={{ margin: '2rem 0 1rem 0', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.88rem' }}>
                Delivery Log Metrics
              </h4>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                    <FaBox size={20} />
                  </div>
                  <div>
                    <span className="stat-label">Total Bookings</span>
                    <div className="stat-value">{summary.totalShipments}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}>
                    <FaLayerGroup size={20} />
                  </div>
                  <div>
                    <span className="stat-label">Unassigned cargo</span>
                    <div className="stat-value">{summary.pendingShipments}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(0, 230, 180, 0.1)', color: '#00e6b4' }}>
                    <FaChartLine size={20} />
                  </div>
                  <div>
                    <span className="stat-label">Active Transits</span>
                    <div className="stat-value">{summary.activeShipments}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(0, 230, 100, 0.1)', color: '#00e664' }}>
                    <FaCheck size={20} />
                  </div>
                  <div>
                    <span className="stat-label">Completed</span>
                    <div className="stat-value">{summary.completedShipments}</div>
                  </div>
                </div>
              </div>

              {/* Users & Haulage Stats */}
              <h4 style={{ margin: '2rem 0 1rem 0', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.88rem' }}>
                Registration Metrics
              </h4>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                    <FaUsers size={20} />
                  </div>
                  <div>
                    <span className="stat-label">Platform Accounts</span>
                    <div className="stat-value">{summary.totalUsers}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'var(--color-secondary-glow)', color: 'var(--color-secondary)' }}>
                    <FaUsers size={20} />
                  </div>
                  <div>
                    <span className="stat-label">Transporters</span>
                    <div className="stat-value">{summary.totalDrivers}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(255, 170, 0, 0.1)', color: '#ffa31a' }}>
                    <FaTruck size={20} />
                  </div>
                  <div>
                    <span className="stat-label">Awaiting approvals</span>
                    <div className="stat-value">{summary.pendingTrucks}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(0, 230, 100, 0.1)', color: '#00e664' }}>
                    <FaTruck size={20} />
                  </div>
                  <div>
                    <span className="stat-label">Active Haulers</span>
                    <div className="stat-value">{summary.activeTrucks}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROFILE OVERVIEW */}
          {activeTab === 'profile' && (
            <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-primary-glow)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-primary)' }}>
                  <FaShieldAlt size={40} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</h3>
                  <span className="badge badge-pending" style={{ marginTop: '0.25rem' }}>
                    <FaShieldAlt size={12} style={{ marginRight: 4 }} /> Platform Operations Board Director
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-2">
                <div style={{ background: 'rgba(0, 0, 0, 0.02)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaInfoCircle size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>Administrative Credentials</span>
                  </h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div><strong>Registered Email:</strong> {user?.email}</div>
                    <div><strong>Matched Phone:</strong> {users.find(u => u.email === user?.email)?.phone || 'N/A'}</div>
                    <div><strong>User ID Reference:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{user?.id}</span></div>
                    <div><strong>Access Rights:</strong> Full Read-Write Board Operations</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(0, 0, 0, 0.02)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaShieldAlt size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>Control Guidelines</span>
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    As an administrator, you hold complete access to platform transactions. You can approve transporter fleet registrations, suspend user accounts, consolidation bookings, and override delivery states.
                  </p>
                  <Link to="/profile" className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>
                    <FaEdit size={12} />
                    <span>Edit Profile Settings & Password</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS MANAGER */}
          {activeTab === 'users' && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <FaSearch size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <select
                  className="form-select"
                  style={{ maxWidth: '200px' }}
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="ROLE_CUSTOMER">Customer</option>
                  <option value="ROLE_DRIVER">Driver</option>
                  <option value="ROLE_PICKUP">Pickup Partner</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Account Name</th>
                      <th>Email ID</th>
                      <th>Phone</th>
                      <th>Access Level</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.phone}</td>
                        <td>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: u.role === 'ROLE_ADMIN' ? 'var(--color-primary-glow)' : 'rgba(255,255,255,0.05)',
                            color: u.role === 'ROLE_ADMIN' ? 'var(--color-primary)' : 'var(--text-primary)'
                          }}>
                            {u.role.replace('ROLE_', '')}
                          </span>
                        </td>
                        <td>
                          {u.active ? (
                            <span className="badge badge-delivered">Active</span>
                          ) : (
                            <span className="badge badge-cancelled">Suspended</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {/* Admin cannot suspend themselves */}
                          {u.email !== user.email ? (
                            u.active ? (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => setOpenSuspendModal({ userObj: u, suspend: true })}
                              >
                                <FaBan size={12} /> Suspend
                              </button>
                            ) : (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setOpenSuspendModal({ userObj: u, suspend: false })}
                              >
                                <FaUnlock size={12} /> Reinstate
                              </button>
                            )
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Self (Active)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENT APPROVALS */}
          {activeTab === 'trucks' && (
            <div className="glass-card">
              <h3 className="form-section-title">
                <FaTruck size={20} />
                <span>Pending Vehicle Approvals</span>
              </h3>

              {pendingTrucks.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px' }}>
                  <FaCheck size={40} style={{ color: '#00e664', marginBottom: '0.5rem' }} />
                  <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Approvals clean!</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No transporter vehicles are currently awaiting document review.</p>
                </div>
              ) : (
                <div className="grid-2" style={{ gap: '1.5rem' }}>
                  {pendingTrucks.map(truck => (
                    <div key={truck.id} className="glass-card" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Transporter ID: {truck.id.substring(0, 8)}...</span>
                          <h4 style={{ fontSize: '1.25rem', color: 'var(--color-secondary)' }}>{truck.registrationNumber}</h4>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Type: {truck.truckType} | Load: {truck.capacityTons} Tons</span>
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        marginBottom: '1.25rem',
                        border: '1px solid rgba(255,255,255,0.04)'
                      }}>
                        <div><strong>Owner:</strong> {truck.ownerName} ({truck.ownerPhone})</div>
                        <div><strong>Operating Area:</strong> {truck.currentRouteArea || 'Not specified'}</div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <a href={truck.rcDocumentUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                          <FaEye size={12} /> View RC
                        </a>
                        <a href={truck.licenseUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                          <FaEye size={12} /> View License
                        </a>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => setOpenVerifyModal({ id: truck.id, approve: false })}
                        >
                          <FaTimes size={12} /> Reject
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => setOpenVerifyModal({ id: truck.id, approve: true })}
                        >
                          <FaCheck size={12} /> Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONSOLIDATION & PAIRING BOARD */}
          {activeTab === 'pairings' && (
            <div className="grid-2">
              {/* Unassigned Shipments List */}
              <div className="glass-card">
                <h3 className="form-section-title">
                  <FaBox size={20} />
                  <span>Unassigned Bookings ({pendingShipments.length})</span>
                </h3>

                {pendingShipments.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                    <FaCheck size={40} style={{ color: '#00e664', marginBottom: '0.5rem' }} />
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>All Cargo Assigned</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Every booked shipment has been successfully mapped to a transporter.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '550px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    {pendingShipments.map(ship => (
                      <div 
                        key={ship.id} 
                        className={`glass-card`} 
                        style={{
                          padding: '1rem',
                          background: selectedShipment?.id === ship.id ? 'var(--color-primary-glow)' : 'rgba(0,0,0,0.15)',
                          borderColor: selectedShipment?.id === ship.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleSelectPairing(ship)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ fontFamily: 'monospace' }}>ID: {ship.trackingNumber || ship.id.substring(0,8)}...</span>
                          <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>₹{ship.estimatedCost}</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.35rem 0', fontWeight: 600 }}>
                          <span>{ship.pickupCity}</span>
                          <FaArrowRight size={12} />
                          <span>{ship.dropCity}</span>
                        </div>
                        
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Weight: {ship.totalWeightKg} kg</span>
                          <span>Items: {ship.items?.length || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignment & Consolidation Configuration Pane */}
              <div className="glass-card">
                <h3 className="form-section-title">
                  <FaCodeBranch size={20} />
                  <span>Consolidation & Truck Pairing</span>
                </h3>

                {!selectedShipment ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', textAlign: 'center' }}>
                    <FaQuestionCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Select a Booking</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.25rem' }}>Select a shipment booking from the left to search for matching consolidation runs and assign vehicles.</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>SELECTED BASE BOOKING</span>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
                        <span>{selectedShipment.pickupCity}</span>
                        <FaArrowRight size={14} />
                        <span>{selectedShipment.dropCity}</span>
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                          Total cargo weight: <strong>{selectedShipment.totalWeightKg} kg</strong> | Fare: ₹{selectedShipment.estimatedCost}
                        </p>
                        <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-primary)' }}>Customer Details</span>
                          <span>{selectedShipment.customerName}</span> <br/>
                          <span style={{ fontFamily: 'monospace' }}>{selectedShipment.customerPhone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Consolidation Candidates */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Consolidation candidates (Same route & cities)
                      </span>
                      {loadingConsolidation ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
                          <FaSpinner size={16} className="pulse-icon" style={{ animation: 'spin 1s linear infinite' }} />
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Scanning logs...</span>
                        </div>
                      ) : consolidationCandidates.length === 0 ? (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', padding: '0.75rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
                          No other pending bookings match this specific route for consolidation.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                          {consolidationCandidates.map(cand => (
                            <label 
                              key={cand.id} 
                              className="glass-card" 
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.6rem 0.8rem',
                                background: selectedConsolidationIds.includes(cand.id) ? 'rgba(0, 230, 180, 0.08)' : 'rgba(0,0,0,0.1)',
                                borderColor: selectedConsolidationIds.includes(cand.id) ? 'var(--color-secondary)' : 'var(--border-light)',
                                cursor: 'pointer'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedConsolidationIds.includes(cand.id)}
                                onChange={() => toggleConsolidationSelection(cand.id)}
                              />
                              <div style={{ flex: 1, fontSize: '0.82rem' }}>
                                <div><strong>ID:</strong> {cand.trackingNumber || cand.id.substring(0,8)}... | Cargo: {cand.totalWeightKg} kg</div>
                                <div style={{ color: 'var(--text-secondary)' }}>Val: ₹{cand.estimatedCost} | {cand.pickupAddress}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Truck selection */}
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Search Route / Location</label>
                      <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          className="form-input"
                          style={{ paddingLeft: '2.5rem' }}
                          placeholder="Search by city or area..."
                          value={routeSearch}
                          onChange={(e) => setRouteSearch(e.target.value)}
                        />
                      </div>

                      <label className="form-label">Assign Approved Carrier</label>
                      <select
                        className="form-select"
                        value={selectedTruckId}
                        onChange={(e) => setSelectedTruckId(e.target.value)}
                      >
                        <option value="">Select available verified truck...</option>
                        {availableTrucks
                          .filter(tr => {
                            if (!routeSearch) return true;
                            const searchStr = routeSearch.toLowerCase();
                            const routeArea = (tr.currentRouteArea || '').toLowerCase();
                            
                            if (routeArea.includes(searchStr)) return true;
                            
                            // Smart alias matching (e.g., "hyderabad" matches "hyd")
                            if (searchStr.length >= 3 && routeArea.includes(searchStr.substring(0, 3))) return true;
                            
                            // Check if routeArea words match searchStr words
                            const searchWords = searchStr.split(/[\s,.-]+/);
                            const routeWords = routeArea.split(/[\s,.-]+/);
                            
                            for (let sw of searchWords) {
                              if (sw.length >= 3) {
                                for (let rw of routeWords) {
                                  if (rw.includes(sw.substring(0,3)) || sw.includes(rw.substring(0,3))) {
                                    return true;
                                  }
                                }
                              }
                            }
                            return false;
                          })
                          .map(tr => {
                          const capacityKg = tr.capacityTons * 1000;
                          return (
                            <option key={tr.id} value={tr.id}>
                              {tr.registrationNumber} ({tr.ownerName}) - Route: {tr.currentRouteArea || 'N/A'} (Max: {tr.capacityTons}T)
                            </option>
                          );
                        })}
                      </select>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                        *Only approved, verified carriers matching the location are shown.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedShipment(null)}>
                        Cancel
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 2 }}
                        onClick={handleAssignPairing}
                        disabled={actionLoading || !selectedTruckId}
                      >
                        {actionLoading ? (
                          <>
                            <FaSpinner size={16} className="pulse-icon" style={{ marginRight: 6, animation: 'spin 1s linear infinite' }} />
                            <span>Pairing Carrier...</span>
                          </>
                        ) : (
                          <span>
                            {selectedConsolidationIds.length > 0 ? `Assign Consolidated Batch (${selectedConsolidationIds.length + 1})` : 'Assign Carrier'}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: FLEET REGISTRY */}
          {activeTab === 'fleet' && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <FaSearch size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search by registration or owner..."
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={fleetSearch}
                    onChange={(e) => setFleetSearch(e.target.value)}
                  />
                </div>
                <select
                  className="form-select"
                  style={{ maxWidth: '200px' }}
                  value={fleetTypeFilter}
                  onChange={(e) => setFleetTypeFilter(e.target.value)}
                >
                  <option value="">All Vehicle Types</option>
                  <option value="MINI">Mini Truck</option>
                  <option value="MEDIUM">Medium Cargo</option>
                  <option value="LARGE">Large Lorry</option>
                  <option value="HEAVY">Heavy Multi-Axle</option>
                </select>
                <select
                  className="form-select"
                  style={{ maxWidth: '200px' }}
                  value={fleetVerifiedFilter}
                  onChange={(e) => setFleetVerifiedFilter(e.target.value)}
                >
                  <option value="">All Verification States</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Pending Approvals</option>
                </select>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Reg Number</th>
                      <th>Owner Name</th>
                      <th>Type & Capacity</th>
                      <th>Operating Area</th>
                      <th>Duty Status</th>
                      <th>Verification</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFleet.map(truck => (
                      <tr key={truck.id}>
                        <td style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>{truck.registrationNumber}</td>
                        <td>{truck.ownerName}</td>
                        <td>{truck.truckType} ({truck.capacityTons} Tons)</td>
                        <td>{truck.currentRouteArea || 'All Routes'}</td>
                        <td>
                          {truck.available ? (
                            <span className="badge badge-delivered">Online</span>
                          ) : (
                            <span className="badge">Offline</span>
                          )}
                        </td>
                        <td>
                          {truck.verified ? (
                            <span className="badge badge-delivered">Approved</span>
                          ) : (
                            <span className="badge badge-pending">Pending</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                            <a href={truck.rcDocumentUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem' }}>
                              <FaEye size={12} /> RC
                            </a>
                            {!truck.verified && (
                              <>
                                <button
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '0.2rem 0.5rem' }}
                                  onClick={() => setOpenVerifyModal({ id: truck.id, approve: false })}
                                >
                                  <FaTimes size={12} />
                                </button>
                                <button
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '0.2rem 0.5rem' }}
                                  onClick={() => setOpenVerifyModal({ id: truck.id, approve: true })}
                                >
                                  <FaCheck size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: TRACK SHIPMENTS */}
          {activeTab === 'track' && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <FaSearch size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search by ID, route, customer details..."
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={shipmentSearch}
                    onChange={(e) => setShipmentSearch(e.target.value)}
                  />
                </div>
                <select
                  className="form-select"
                  style={{ maxWidth: '200px' }}
                  value={shipmentStatusFilter}
                  onChange={(e) => setShipmentStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending Assignment</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="PICKED">Picked Up / Loaded</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Shipment ID</th>
                      <th>Customer Details</th>
                      <th>Route</th>
                      <th>Cargo Weight</th>
                      <th>Cost</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.map(ship => (
                      <tr key={ship.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{ship.trackingNumber || ship.id.substring(0, 8)}...</td>
                        <td>
                          <div>{ship.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ship.customerPhone}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                            <span>{ship.pickupCity}</span>
                            <FaArrowRight size={12} />
                            <span>{ship.dropCity}</span>
                          </div>
                        </td>
                        <td>{ship.totalWeightKg} kg</td>
                        <td style={{ fontWeight: 600 }}>₹{ship.estimatedCost}</td>
                        <td>
                          <span className={`badge ${
                            ship.status === 'DELIVERED' ? 'badge-delivered' :
                            ship.status === 'CANCELLED' ? 'badge-cancelled' :
                            ship.status === 'PENDING' ? 'badge-pending' :
                            ship.status === 'ASSIGNED' ? 'badge-assigned' :
                            ship.status === 'PICKED' ? 'badge-picked' : 'badge-transit'
                          }`}>
                            {ship.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedDetailedShipment(ship);
                              setStatusOverrideTarget(ship.status);
                              setCancellationReasonText('');
                            }}
                          >
                            <FaInfoCircle size={12} /> Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="glass-card">
              <h3 className="form-section-title">
                <FaShieldAlt size={20} />
                <span>Platform Audit Log Viewer</span>
              </h3>

              <div className="table-wrapper" style={{ maxHeight: '550px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Admin Name</th>
                      <th>Operation Logged</th>
                      <th>Object Type</th>
                      <th>Ref ID</th>
                      <th>Context Details</th>
                      <th>Host IP</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontWeight: 600 }}>{log.userEmail}</td>
                        <td>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: log.action.includes('REJECT') || log.action.includes('SUSPEND') ? 'rgba(255, 50, 50, 0.1)' : 'rgba(0, 230, 100, 0.1)',
                            color: log.action.includes('REJECT') || log.action.includes('SUSPEND') ? '#ff4d4d' : '#00cc55'
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td>{log.entityType}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.entityId ? log.entityId.substring(0, 8) + '...' : 'N/A'}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.notes}</td>
                        <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{log.ipAddress}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SUPPORT TICKETS */}
          {activeTab === 'support' && (
            <div className="glass-card">
              <h3 className="form-section-title">
                <FaHeadset size={20} />
                <span>Support Tickets ({supportTickets.length} total &middot; {supportTickets.filter(t => t.status === 'OPEN').length} open)</span>
              </h3>

              {supportTickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <FaHeadset size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>No support tickets yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {supportTickets.map(ticket => {
                    const statusColor = {
                      OPEN: '#3b82f6',
                      IN_PROGRESS: '#f59e0b',
                      RESOLVED: '#10b981',
                      CLOSED: '#6b7280',
                    }[ticket.status] || '#6b7280';
                    const roleColor = {
                      ROLE_DRIVER: '#6366f1',
                      ROLE_CUSTOMER: '#10b981',
                      ROLE_PICKUP: '#f59e0b',
                      ROLE_ADMIN: '#ef4444',
                    }[ticket.raisedByRole] || '#6b7280';
                    const replyText = ticketReplyMap[ticket.id] ?? ticket.adminReply ?? '';
                    const replyStatus = ticketStatusMap[ticket.id] ?? ticket.status;
                    return (
                      <div
                        key={ticket.id}
                        style={{
                          border: '1px solid var(--border-light)',
                          borderLeft: `4px solid ${statusColor}`,
                          borderRadius: 'var(--radius-md)',
                          padding: '1.25rem',
                          background: 'rgba(0,0,0,0.08)',
                        }}
                      >
                        {/* Header row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                              #{ticket.id?.substring(0, 8)} &middot; {ticket.category} &middot; {new Date(ticket.createdAt).toLocaleString('en-IN')}
                            </span>
                            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{ticket.subject}</strong>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.73rem', fontWeight: 700, color: roleColor, background: `${roleColor}18`, padding: '0.2rem 0.6rem', borderRadius: 50 }}>
                              {ticket.raisedByRole?.replace('ROLE_', '')}
                            </span>
                            <span style={{ fontSize: '0.73rem', fontWeight: 700, color: statusColor, background: `${statusColor}18`, padding: '0.2rem 0.6rem', borderRadius: 50 }}>
                              {ticket.status}
                            </span>
                          </div>
                        </div>

                        {/* User info */}
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>{ticket.raisedByName}</strong> &middot; {ticket.raisedByEmail}
                        </div>

                        {/* Description */}
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 1rem 0', padding: '0.75rem', background: 'rgba(0,0,0,0.06)', borderRadius: 'var(--radius-sm)' }}>
                          {ticket.description}
                        </p>

                        {/* Reply section */}
                        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                          <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: '0.4rem', display: 'block' }}>
                            <FaReply size={12} style={{ marginRight: 4, color: '#6366f1' }} />
                            Admin Reply
                          </label>
                          <textarea
                            className="form-input"
                            rows={3}
                            style={{ resize: 'vertical', fontSize: '0.88rem', lineHeight: 1.6 }}
                            placeholder="Type your reply to this ticket..."
                            value={replyText}
                            onChange={(e) => setTicketReplyMap(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                          />
                          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <select
                              className="form-select"
                              style={{ flex: 1, minWidth: 150 }}
                              value={replyStatus}
                              onChange={(e) => setTicketStatusMap(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                            >
                              <option value="OPEN">🟦 Open</option>
                              <option value="IN_PROGRESS">🟡 In Progress</option>
                              <option value="RESOLVED">✅ Resolved</option>
                              <option value="CLOSED">⬛ Closed</option>
                            </select>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ whiteSpace: 'nowrap' }}
                              disabled={ticketReplyLoading[ticket.id]}
                              onClick={async () => {
                                setTicketReplyLoading(prev => ({ ...prev, [ticket.id]: true }));
                                try {
                                  const res = await api.put(`/tickets/admin/${ticket.id}/reply`, {
                                    adminReply: replyText,
                                    status: replyStatus,
                                  });
                                  // Update in list
                                  setSupportTickets(prev => prev.map(t => t.id === ticket.id ? res.data.data : t));
                                  showToast('success', 'Ticket updated successfully');
                                } catch (err) {
                                  showToast('error', err.message || 'Failed to update ticket');
                                } finally {
                                  setTicketReplyLoading(prev => ({ ...prev, [ticket.id]: false }));
                                }
                              }}
                            >
                              {ticketReplyLoading[ticket.id] ? <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <><FaReply size={14} style={{ marginRight: 4 }} />Update Ticket</>}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: RATE MANAGEMENT */}
          {activeTab === 'rates' && (
            <div className="glass-card">
              <h3 className="form-section-title">
                <FaDollarSign size={20} />
                <span>Global Rate & Revenue Split Management</span>
              </h3>
              
              <div className="grid-2" style={{ gap: '1.5rem' }}>
                {globalRates.map(rate => (
                  <div key={rate.id} className="glass-card" style={{ background: 'rgba(0,0,0,0.15)' }}>
                    <h4 style={{ color: 'var(--color-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                      {rate.name} ({rate.targetRole})
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Base Fare (₹)</label>
                        <input type="number" className="form-input" 
                          value={rate.baseFare || 0} 
                          onChange={(e) => {
                            const newRates = [...globalRates];
                            const idx = newRates.findIndex(r => r.id === rate.id);
                            newRates[idx].baseFare = e.target.value;
                            setGlobalRates(newRates);
                          }} 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Commission Percentage (%)</label>
                        <input type="number" className="form-input" 
                          value={rate.commissionPercentage || 0} 
                          onChange={(e) => {
                            const newRates = [...globalRates];
                            const idx = newRates.findIndex(r => r.id === rate.id);
                            newRates[idx].commissionPercentage = e.target.value;
                            setGlobalRates(newRates);
                          }} 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Fixed Fee (₹)</label>
                        <input type="number" className="form-input" 
                          value={rate.fixedFee || 0} 
                          onChange={(e) => {
                            const newRates = [...globalRates];
                            const idx = newRates.findIndex(r => r.id === rate.id);
                            newRates[idx].fixedFee = e.target.value;
                            setGlobalRates(newRates);
                          }} 
                        />
                      </div>
                      
                      <button className="btn btn-primary" disabled={actionLoading} onClick={() => handleUpdateRate(rate.id, rate)}>
                        {actionLoading ? 'Saving...' : 'Update Rate Config'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Verification Dialog Overlay */}
      {openVerifyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1.25rem' }}>
              {openVerifyModal.approve ? 'Approve Transporter Documentation' : 'Reject Transporter Documentation'}
            </h3>
            <div className="form-group">
              <label className="form-label">Review Notes / Reasons</label>
              <textarea
                rows="3"
                className="form-textarea"
                placeholder={openVerifyModal.approve ? 'Documents validated, carrier active...' : 'RC document resolution is poor, insurance page missing...'}
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => { setOpenVerifyModal(null); setVerifyNotes(''); }} disabled={actionLoading}>
                Cancel
              </button>
              <button 
                className={openVerifyModal.approve ? 'btn btn-primary' : 'btn-danger'} 
                onClick={() => handleVerifyTruck(openVerifyModal.approve)}
                disabled={actionLoading}
              >
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspension Dialog Overlay */}
      {openSuspendModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1.25rem', color: openSuspendModal.suspend ? '#ff4d4d' : 'var(--color-secondary)' }}>
              {openSuspendModal.suspend ? 'Suspend Platform Account' : 'Reactivate Platform Account'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              You are updating access status for <strong>{openSuspendModal.userObj.name}</strong> ({openSuspendModal.userObj.email}).
            </p>
            {openSuspendModal.suspend && (
              <div className="form-group">
                <label className="form-label">Reason for Suspension</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="e.g. Failure to comply with carrier rate agreements..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                />
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => { setOpenSuspendModal(null); setSuspendReason(''); }} disabled={actionLoading}>
                Cancel
              </button>
              <button 
                className={openSuspendModal.suspend ? 'btn btn-danger' : 'btn-primary'} 
                onClick={handleSuspendUser}
                disabled={actionLoading}
              >
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipment Details Dialog Overlay */}
      {selectedDetailedShipment && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0 }}>Shipment #{selectedDetailedShipment.trackingNumber || selectedDetailedShipment.id.substring(0, 8)} Details</h3>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ minWidth: 'auto', padding: '0.25rem 0.5rem' }} 
                onClick={() => setSelectedDetailedShipment(null)}
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }} className="grid-2">
              {/* Left Column - Route & Customer */}
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Route & Address</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div>
                    <strong>Pickup:</strong>
                    <div style={{ marginLeft: '0.5rem' }}>{selectedDetailedShipment.pickupAddress}, {selectedDetailedShipment.pickupCity}</div>
                  </div>
                  <div>
                    <strong>Dropoff:</strong>
                    <div style={{ marginLeft: '0.5rem' }}>{selectedDetailedShipment.dropAddress}, {selectedDetailedShipment.dropCity}</div>
                  </div>
                </div>

                <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Customer Contact</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div>{selectedDetailedShipment.customerName}</div>
                  <div style={{ fontFamily: 'monospace' }}>{selectedDetailedShipment.customerPhone}</div>
                </div>
              </div>

              {/* Right Column - Status & Carrier */}
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Cargo Information</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div><strong>Total Weight:</strong> {selectedDetailedShipment.totalWeightKg} kg</div>
                  <div><strong>Estimated Cost:</strong> ₹{selectedDetailedShipment.estimatedCost}</div>
                  <div><strong>Status:</strong> <span className={`badge ${
                    selectedDetailedShipment.status === 'DELIVERED' ? 'badge-delivered' :
                    selectedDetailedShipment.status === 'CANCELLED' ? 'badge-cancelled' :
                    selectedDetailedShipment.status === 'PENDING' ? 'badge-pending' :
                    selectedDetailedShipment.status === 'ASSIGNED' ? 'badge-assigned' :
                    selectedDetailedShipment.status === 'PICKED' ? 'badge-picked' : 'badge-transit'
                  }`}>{selectedDetailedShipment.status}</span></div>
                  {selectedDetailedShipment.cancellationReason && (
                    <div style={{ color: 'var(--color-accent)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      <strong>Cancel Reason:</strong> {selectedDetailedShipment.cancellationReason}
                    </div>
                  )}
                </div>

                <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Assigned Carrier</h4>
                {selectedDetailedShipment.truckId ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div><strong>Truck Reg:</strong> {selectedDetailedShipment.truckRegistrationNumber}</div>
                    <div><strong>Driver Name:</strong> {selectedDetailedShipment.driverName}</div>
                    <div><strong>Driver Phone:</strong> {selectedDetailedShipment.driverPhone}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Unassigned cargo (Awaiting route consolidation or single carrier pair).
                  </div>
                )}
              </div>
            </div>

            {/* Packages Itemization */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Cargo Packages</h4>
              <div className="table-wrapper">
                <table className="data-table" style={{ fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Qty</th>
                      <th>Weight</th>
                      <th>Fragile</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDetailedShipment.items?.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600 }}>{item.itemName}</td>
                        <td>{item.quantity}</td>
                        <td>{item.weightKg} kg</td>
                        <td>
                          {item.fragile ? (
                            <span className="badge badge-cancelled" style={{ fontSize: '0.7rem', padding: '0.1rem 0.3rem' }}>fragile</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>No</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{item.description || 'N/A'}</td>
                      </tr>
                    ))}
                    {!selectedDetailedShipment.items?.length && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No items listed.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status Override Panel */}
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                <FaShieldVirus size={16} style={{ color: 'var(--color-primary)' }} />
                <span>Administrative Override Control</span>
              </h4>
              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Override Status To</label>
                  <select 
                    className="form-select"
                    value={statusOverrideTarget}
                    onChange={(e) => setStatusOverrideTarget(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    <option value="">Select Target Status...</option>
                    <option value="PENDING">PENDING</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="PICKED">PICKED</option>
                    <option value="IN_TRANSIT">IN_TRANSIT</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
              {statusOverrideTarget === 'CANCELLED' && (
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Reason for Cancellation</label>
                  <textarea
                    rows="2"
                    className="form-textarea"
                    placeholder="Enter reason for cancelling this shipment..."
                    value={cancellationReasonText}
                    onChange={(e) => setCancellationReasonText(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleOverrideShipmentStatus(selectedDetailedShipment.id)}
                  disabled={actionLoading || !statusOverrideTarget}
                >
                  {actionLoading ? 'Applying...' : 'Apply Status Override'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
