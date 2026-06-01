import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import MyRateCardWidget from '../components/MyRateCardWidget';
import { FaTimes, FaWallet, FaBox, FaChevronDown, FaClock, FaArrowRight, FaShieldVirus, FaCheckCircle, FaChevronUp, FaStar, FaCreditCard, FaTruck, FaSpinner, FaLocationArrow, FaChartBar, FaArrowUp, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaComment, FaPlus, FaTrash } from 'react-icons/fa';



// ─── Status order for the tracking stepper ──────────────────────────────────
const TRACKING_STEPS = [
  { key: 'PENDING',    label: 'Pending',    icon: FaClock },
  { key: 'ASSIGNED',   label: 'Assigned',   icon: FaTruck },
  { key: 'PICKED',     label: 'Picked Up',  icon: FaBox },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: FaLocationArrow },
  { key: 'DELIVERED',  label: 'Delivered',  icon: FaCheckCircle },
];

const STATUS_ORDER = ['PENDING', 'ASSIGNED', 'PICKED', 'IN_TRANSIT', 'DELIVERED'];

// ─── Mock month spending data (last 6 months) ─────────────────────────────
const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];

// ─── FAQ Data ─────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'How is the estimated shipment cost calculated?',
    a: 'Our pricing uses a base fare of ₹500 plus ₹2.50 per kg of total cargo weight. This estimate is shown before booking confirmation and reflects the final invoice amount.'
  },
  {
    q: 'Can I cancel a shipment after booking?',
    a: 'Yes, you can cancel a shipment while it is in PENDING or ASSIGNED status. Once a driver has picked up your cargo (PICKED or IN_TRANSIT), cancellation is no longer available.'
  },
  {
    q: 'How do I track my shipment in real time?',
    a: 'Navigate to the "Track Packages" tab. Each shipment card shows a live progress stepper with 5 stages: Pending → Assigned → Picked Up → In Transit → Delivered, updated automatically by our fleet.'
  },
  {
    q: 'When will the payment gateway be available?',
    a: 'Online payment integration (UPI, cards, net banking) is coming in the next platform update. Currently, billing is handled offline by your account manager.'
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const getStepIndex = (status) => STATUS_ORDER.indexOf(status);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

/** Horizontal tracking stepper for one shipment */
const TrackingStepper = ({ status }) => {
  const currentIdx = getStepIndex(status);
  const isCancelled = status === 'CANCELLED';

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '1rem 0 0.5rem' }}>
      {TRACKING_STEPS.map((step, idx) => {
        const completed = !isCancelled && currentIdx >= idx;
        const isDelivered = status === 'DELIVERED';
        const activeColor = isDelivered ? '#10b981' : 'var(--color-primary)';
        const fillColor = completed ? activeColor : 'var(--border-light)';
        const textColor = completed ? activeColor : 'var(--text-muted)';
        const isLast = idx === TRACKING_STEPS.length - 1;

        return (
          <React.Fragment key={step.key}>
            {/* Step node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', minWidth: 56 }}>
              <div style={{
                width: 32, height: 32,
                borderRadius: '50%',
                background: completed ? fillColor : 'transparent',
                border: `2px solid ${fillColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: completed ? `0 0 10px ${fillColor}55` : 'none',
              }}>
                {completed ? (
                  <FaCheckCircle size={16} color="#fff" />
                ) : (
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--border-light)' }} />
                )}
              </div>
              <span style={{
                fontSize: '0.65rem', fontWeight: 600, color: textColor,
                textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap'
              }}>
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div style={{
                flex: 1,
                height: 2,
                background: completed && currentIdx > idx ? fillColor : 'var(--border-light)',
                marginBottom: '1.2rem',
                transition: 'background 0.3s ease',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/** FAQ accordion item */
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-md)',
      marginBottom: '0.65rem',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '1rem 1.25rem',
          background: open ? 'var(--color-primary-glow)' : 'var(--bg-card)',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          fontFamily: 'var(--font-sans)', fontWeight: 600,
          fontSize: '0.92rem', color: 'var(--text-primary)',
          transition: 'background 0.2s ease',
        }}
      >
        <span>{question}</span>
        {open
          ? <FaChevronUp size={18} color="var(--color-primary)" />
          : <FaChevronDown size={18} color="var(--text-muted)" />
        }
      </button>
      {open && (
        <div style={{
          padding: '0.85rem 1.25rem 1rem',
          fontSize: '0.88rem', color: 'var(--text-secondary)',
          background: 'var(--bg-card)', lineHeight: 1.65,
          borderTop: '1px solid var(--border-light)',
        }}>
          {answer}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const CustomerDashboardInner = () => {
  const { user } = useContext(AuthContext);

  // ── Tab state ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(0);
  const TABS = ['Book Shipment', 'Track Packages', 'Payment History', 'Contact Support'];

  // ── Booking Form State ───────────────────────────────────────────────────
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCity, setPickupCity]       = useState('');
  const [dropAddress, setDropAddress]     = useState('');
  const [dropCity, setDropCity]           = useState('');
  const [distanceKm, setDistanceKm]       = useState(0);
  const [scheduledPickupTime, setScheduledPickupTime] = useState('');
  const [paymentMode, setPaymentMode] = useState('ONLINE');
  const [items, setItems] = useState([
    { itemName: '', quantity: 1, weightKg: 10, description: '', fragile: false }
  ]);

  // ── Shipments & global state ─────────────────────────────────────────────
  const [shipments, setShipments]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [toast, setToast]           = useState(null);

  // ── Track Packages filter ────────────────────────────────────────────────
  const [trackFilter, setTrackFilter] = useState('All');

  // ── Modals ────────────────────────────────────────────────────────────────  // Action states
  const [cancellingShipment, setCancellingShipment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [ratingShipment, setRatingShipment] = useState(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [selectedDetailedShipment, setSelectedDetailedShipment] = useState(null);

  // ── Support ticket state ──────────────────────────────────────────────────
  const [supportCategory, setSupportCategory] = useState('Technical');
  const [supportSubject, setSupportSubject]   = useState('');
  const [supportMessage, setSupportMessage]   = useState('');
  const [ticketId, setTicketId]               = useState(null);
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // ── Fetch shipments ───────────────────────────────────────────────────────
  const fetchShipments = async () => {
    try {
      const response = await api.get('/shipments');
      setShipments(response.data.data || []);
    } catch (err) {
      showToast('error', 'Failed to retrieve shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShipments(); }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const [estimatedCost, setEstimatedCost] = useState(0);

  const totalWeight = items.reduce((acc, item) => {
    return acc + (parseInt(item.quantity) || 0) * (parseFloat(item.weightKg) || 0);
  }, 0);

  useEffect(() => {
    const fetchEstimate = async () => {
      if (pickupCity && dropCity && items.length > 0) {
        try {
          const payload = {
            pickupCity,
            dropCity,
            items: items.map(it => ({
              itemName: it.itemName,
              quantity: parseInt(it.quantity) || 1,
              weightKg: parseFloat(it.weightKg) || 10,
              fragile: it.fragile
            }))
          };
          const res = await api.post('/shipments/estimate', payload);
          if (res.data?.data) {
            setDistanceKm(res.data.data.distanceKm);
            setEstimatedCost(res.data.data.estimatedCost);
          }
        } catch (error) {
          console.log('Estimate fetch failed:', error);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      fetchEstimate();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [pickupCity, dropCity, items]);

  // ── Item handlers ────────────────────────────────────────────────────────
  const handleAddItem = () =>
    setItems([...items, { itemName: '', quantity: 1, weightKg: 10, description: '', fragile: false }]);

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // ── Booking submit ────────────────────────────────────────────────────────



  const handleBookShipment = async (e) => {
    e.preventDefault();
    setError('');
    if (!pickupAddress || !pickupCity || !dropAddress || !dropCity || !scheduledPickupTime) {
      setError('Please fill in all routing and schedule fields');
      return;
    }
    const invalidItems = items.some(item => !item.itemName || item.quantity < 1 || item.weightKg <= 0);
    if (invalidItems) {
      setError('All items must have a name, quantity ≥ 1, and weight > 0');
      return;
    }
    setSubmitting(true);
    const pickupLat = (12.9 + Math.random() * 10).toFixed(6);
    const pickupLng = (77.5 + Math.random() * 10).toFixed(6);
    const dropLat   = (12.9 + Math.random() * 10).toFixed(6);
    const dropLng   = (77.5 + Math.random() * 10).toFixed(6);
    try {
      const payload = {
        pickupAddress, pickupCity, dropAddress, dropCity,
        pickupLat, pickupLng, dropLat, dropLng,
        distanceKm,
        paymentMode,
        scheduledPickupTime: new Date(scheduledPickupTime).toISOString().slice(0, 19),
        items: items.map(it => ({
          itemName:    it.itemName,
          quantity:    parseInt(it.quantity),
          weightKg:   parseFloat(it.weightKg),
          description: it.description,
          fragile:     it.fragile
        }))
      };
      const res = await api.post('/shipments', payload);
      const data = res.data.data;
      
      if (data.razorpayOrderId) {
        const options = {
          key: data.razorpayKey,
          amount: data.estimatedCost * 100, // paise
          currency: 'INR',
          name: 'Easy Route Logistics',
          description: 'Shipment Booking Payment',
          order_id: data.razorpayOrderId,
          handler: async function (response) {
            try {
              await api.post(`/shipments/${data.id}/verify-payment`, {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
              });
              showToast('success', 'Payment successful! Shipment booked.');
              fetchShipments();
              setActiveTab(1); // switch to Track Packages
            } catch (err) {
              showToast('error', 'Payment verification failed.');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          theme: {
            color: '#3b82f6'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          showToast('error', 'Payment Failed: ' + response.error.description);
        });
        rzp.open();
      } else {
        showToast('success', 'Shipment booked successfully!');
        fetchShipments();
        setActiveTab(1);
      }

      setPickupAddress(''); setPickupCity(''); setDropAddress(''); setDropCity(''); setDistanceKm(0);
      setScheduledPickupTime('');
      setItems([{ itemName: '', quantity: 1, weightKg: 10, description: '', fragile: false }]);
    } catch (err) {
      setError(err.message || 'Booking failed');
      showToast('error', err.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayNow = (shipment) => {
    const options = {
      key: shipment.razorpayKey,
      amount: shipment.estimatedCost * 100,
      currency: 'INR',
      name: 'Easy Route Logistics',
      description: 'Shipment Booking Payment',
      order_id: shipment.razorpayOrderId,
      handler: async function (response) {
        try {
          await api.post(`/shipments/${shipment.id}/verify-payment`, {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature
          });
          showToast('success', 'Payment successful!');
          fetchShipments();
        } catch (err) {
          showToast('error', 'Payment verification failed.');
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: {
        color: '#3b82f6'
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      showToast('error', 'Payment Failed: ' + response.error.description);
    });
    rzp.open();
  };

  // ── Cancel shipment ───────────────────────────────────────────────────────
  const handleCancelShipment = async () => {
    if (!cancelReason.trim()) {
      showToast('error', 'Cancellation reason is required');
      return;
    }
    try {
      await api.put(`/shipments/${cancellingShipment.id}/status`, {
        status: 'CANCELLED',
        cancellationReason: cancelReason
      });
      showToast('success', 'Shipment cancelled successfully');
      setCancellingShipment(null);
      setCancelReason('');
      fetchShipments();
    } catch (err) {
      showToast('error', err.message || 'Cancellation failed');
    }
  };

  // ── Rating submit ─────────────────────────────────────────────────────────
  const handleSubmitRating = () => {
    showToast('success', `Thank you! Rated driver ${ratingStars} stars.`);
    setRatingShipment(null);
    setRatingStars(5);
    setRatingComment('');
  };

  // ── Support ticket submit ─────────────────────────────────────────────────
  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) {
      showToast('error', 'Please fill in subject and message');
      return;
    }
    setSubmittingTicket(true);
    setTimeout(() => {
      const id = 'ER-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setTicketId(id);
      setSubmittingTicket(false);
      setSupportSubject('');
      setSupportMessage('');
      setSupportCategory('Technical');
    }, 1200);
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalBookings    = shipments.length;
  const activeShipments  = shipments.filter(s => ['PENDING','ASSIGNED','PICKED','IN_TRANSIT'].includes(s.status)).length;
  const deliveredCount   = shipments.filter(s => s.status === 'DELIVERED').length;
  const totalSpent       = shipments.reduce((acc, s) => acc + (parseFloat(s.estimatedCost) || 0), 0);

  // Payment tab derived
  const pendingCost      = shipments
    .filter(s => ['PENDING','ASSIGNED'].includes(s.status))
    .reduce((acc, s) => acc + (parseFloat(s.estimatedCost) || 0), 0);
  const completedPayment = shipments
    .filter(s => s.status === 'DELIVERED')
    .reduce((acc, s) => acc + (parseFloat(s.estimatedCost) || 0), 0);

  // Mock bar chart data — spread totalSpent across 6 months
  const mockMonthlyData = MONTHS.map((m, i) => ({
    month: m,
    amount: Math.max(500, Math.round((totalSpent / 6) * (0.6 + Math.random() * 0.8)))
  }));
  const maxMonthly = Math.max(...mockMonthlyData.map(d => d.amount), 1);

  // Track filter
  const filteredShipments = shipments.filter(s => {
    if (trackFilter === 'All') return true;
    if (trackFilter === 'Active') return ['PENDING','ASSIGNED','PICKED','IN_TRANSIT'].includes(s.status);
    if (trackFilter === 'Delivered') return s.status === 'DELIVERED';
    if (trackFilter === 'Cancelled') return s.status === 'CANCELLED';
    return true;
  });

  // ── Badge helper ─────────────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const map = {
      PENDING:    <span className="badge badge-pending">Pending</span>,
      ASSIGNED:   <span className="badge badge-assigned">Assigned</span>,
      PICKED:     <span className="badge badge-picked">Picked Up</span>,
      IN_TRANSIT: <span className="badge badge-transit">In Transit</span>,
      DELIVERED:  <span className="badge badge-delivered">Delivered</span>,
      CANCELLED:  <span className="badge badge-cancelled">Cancelled</span>,
    };
    return map[status] || <span className="badge">{status}</span>;
  };

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="container dashboard-container">

      {/* ── Toast ─────────────────────────────────────────────────────── */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span style={{ fontSize: '1.2rem' }}>{toast.type === 'success' ? '✓' : '✗'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="dashboard-subtitle">
            Manage your deliveries, track packages, and get support — all in one place.
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'var(--color-primary-glow)', padding: '0.6rem 1.1rem',
          borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary)',
        }}>
          <FaBox size={20} color="var(--color-primary)" />
          <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9rem' }}>
            EasyRoute Customer
          </span>
        </div>
      </div>

      {/* ── Stats Bar (always visible) ────────────────────────────────── */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        {/* Total Bookings */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-primary-glow)' }}>
            <FaBox size={22} color="var(--color-primary)" />
          </div>
          <div>
            <div className="stat-value">{loading ? '—' : totalBookings}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
        </div>

        {/* Active */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0, 174, 239, 0.1)' }}>
            <FaTruck size={22} color="var(--color-secondary)" />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--color-secondary)' }}>
              {loading ? '—' : activeShipments}
            </div>
            <div className="stat-label">Active Shipments</div>
          </div>
        </div>

        {/* Delivered */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <FaCheckCircle size={22} color="#10b981" />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#10b981' }}>
              {loading ? '—' : deliveredCount}
            </div>
            <div className="stat-label">Delivered</div>
          </div>
        </div>

        {/* Amount Spent */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255, 120, 0, 0.1)' }}>
            <FaCreditCard size={22} color="var(--color-accent)" />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--color-accent)' }}>
              {loading ? '—' : `₹${totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            </div>
            <div className="stat-label">Amount Spent</div>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="tabs-container" style={{ width: '100%', justifyContent: 'stretch' }}>
        {TABS.map((tab, i) => {
          const icons = [FaBox, FaLocationArrow, FaCreditCard, FaComment];
          const Icon  = icons[i];
          return (
            <button
              key={tab}
              className={`tab-btn${activeTab === i ? ' active' : ''}`}
              onClick={() => setActiveTab(i)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <Icon size={15} />
              <span>{tab}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB 0 — BOOK SHIPMENT
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 0 && (
        <>
          <MyRateCardWidget roleColor="#3b82f6" roleBg="#eff6ff" />
          <div className="grid-2">
            {/* Booking Form */}
          <div className="glass-card">
            <h3 className="form-section-title">
              <FaBox size={20} />
              <span>Book New Shipment</span>
            </h3>

            {error && (
              <div style={{
                background: 'rgba(255,50,50,0.08)', border: '1px solid rgba(255,50,50,0.2)',
                color: '#ef4444', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem', fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleBookShipment}>
              {/* Pickup row */}
              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Pickup Address</label>
                  <div style={{ position: 'relative' }}>
                    <FaMapMarkerAlt size={16} style={{ position: 'absolute', left: '10px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="text" required placeholder="123 Ware St"
                      className="form-input" style={{ paddingLeft: '2.2rem' }}
                      value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Pickup City</label>
                  <input type="text" required placeholder="e.g. Bangalore"
                    className="form-input" value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)} />
                </div>
              </div>

              {/* Drop row */}
              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Delivery Address</label>
                  <div style={{ position: 'relative' }}>
                    <FaLocationArrow size={16} style={{ position: 'absolute', left: '10px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="text" required placeholder="456 Drop Ave"
                      className="form-input" style={{ paddingLeft: '2.2rem' }}
                      value={dropAddress} onChange={(e) => setDropAddress(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery City</label>
                  <input type="text" required placeholder="e.g. Mumbai"
                    className="form-input" value={dropCity}
                    onChange={(e) => setDropCity(e.target.value)} />
                </div>
              </div>

              {/* Scheduled time */}
              <div className="form-group">
                <label className="form-label">Scheduled Pickup Date &amp; Time</label>
                <div style={{ position: 'relative' }}>
                  <FaCalendarAlt size={16} style={{ position: 'absolute', left: '10px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="datetime-local" required className="form-input"
                    style={{ paddingLeft: '2.2rem' }}
                    value={scheduledPickupTime}
                    onChange={(e) => setScheduledPickupTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Cargo Items */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Cargo Items</h4>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem}
                    style={{ padding: '0.35rem 0.75rem' }}>
                    <FaPlus size={14} /> Add Item
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div key={idx} className="glass-card" style={{
                    padding: '1rem', marginBottom: '0.75rem',
                    background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-light)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Item #{idx + 1}</span>
                      {items.length > 1 && (
                        <button type="button" onClick={() => handleRemoveItem(idx)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                          <FaTrash size={15} />
                        </button>
                      )}
                    </div>

                    <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <input type="text" required placeholder="Item Name" className="form-input"
                        value={item.itemName} onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)} />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="number" required min="1" placeholder="Qty" className="form-input"
                          style={{ width: '40%' }} value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} />
                        <input type="number" required step="0.1" placeholder="Wt (kg)" className="form-input"
                          style={{ width: '60%' }} value={item.weightKg}
                          onChange={(e) => handleItemChange(idx, 'weightKg', e.target.value)} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input type="text" placeholder="Description (Optional)" className="form-input"
                        style={{ flex: 1, padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)} />
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.85rem', userSelect: 'none' }}>
                        <input type="checkbox" checked={item.fragile}
                          onChange={(e) => handleItemChange(idx, 'fragile', e.target.checked)} />
                        <span>Fragile</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Estimated cost preview */}
              {totalWeight > 0 && (
                <div className="glass-card" style={{
                  background: 'var(--color-primary-glow)', borderColor: 'var(--color-primary)',
                  padding: '1.25rem', marginBottom: '1.5rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>
                      Cargo Weight: {totalWeight.toFixed(1)} kg • Distance: {distanceKm.toFixed(1)} km
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Estimated Fare</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
                      ₹{estimatedCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Mode Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  Payment Method
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div
                    onClick={() => setPaymentMode('ONLINE')}
                    style={{
                      border: `2px solid ${paymentMode === 'ONLINE' ? 'var(--color-primary)' : 'var(--border-light)'}`,
                      borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center', cursor: 'pointer',
                      background: paymentMode === 'ONLINE' ? 'var(--color-primary-glow)' : 'transparent',
                      fontWeight: paymentMode === 'ONLINE' ? 700 : 500
                    }}>
                    <FaCreditCard size={18} style={{ display: 'block', margin: '0 auto 0.5rem', color: paymentMode === 'ONLINE' ? 'var(--color-primary)' : 'var(--text-muted)' }} />
                    Pay Online
                  </div>
                  <div
                    onClick={() => setPaymentMode('COD')}
                    style={{
                      border: `2px solid ${paymentMode === 'COD' ? 'var(--color-primary)' : 'var(--border-light)'}`,
                      borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center', cursor: 'pointer',
                      background: paymentMode === 'COD' ? 'var(--color-primary-glow)' : 'transparent',
                      fontWeight: paymentMode === 'COD' ? 700 : 500
                    }}>
                    <FaWallet size={18} style={{ display: 'block', margin: '0 auto 0.5rem', color: paymentMode === 'COD' ? 'var(--color-primary)' : 'var(--text-muted)' }} />
                    Cash on Delivery
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem' }} disabled={submitting}>
                {submitting ? (
                  <>
                    <FaSpinner size={18} style={{ marginRight: 8, animation: 'spin 1s linear infinite' }} />
                    <span>Processing Booking...</span>
                  </>
                ) : (
                  <span>Confirm Booking</span>
                )}
              </button>
            </form>
          </div>

          {/* Recent shipments snapshot */}
          <div className="glass-card" style={{ minHeight: 500 }}>
            <h3 className="form-section-title">
              <FaClock size={20} />
              <span>Your Delivery Requests</span>
            </h3>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: '1rem' }}>
                <FaSpinner size={36} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Retrieving bookings...</p>
              </div>
            ) : shipments.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, textAlign: 'center' }}>
                <FaBox size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No bookings recorded</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Submit the form on the left to request your first delivery.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: 680, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {shipments.filter(s => s.status !== 'CANCELLED').slice(0, 8).map((shipment) => (
                  <div key={shipment.id} className="glass-card" style={{
                    padding: '1.25rem', background: 'rgba(0,0,0,0.02)',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedDetailedShipment(shipment)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontFamily: 'monospace' }}>
                          ID: {shipment.trackingNumber || shipment.id?.substring(0, 8)}...
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <span style={{ fontWeight: 700 }}>{shipment.pickupCity}</span>
                          <FaArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontWeight: 700 }}>{shipment.dropCity}</span>
                        </div>
                      </div>
                      {getStatusBadge(shipment.status)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                      <span>Items: {shipment.items?.length || 0} ({shipment.totalWeightKg} kg)</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{shipment.estimatedCost}</span>
                    </div>

                    {shipment.truckRegistrationNumber && (
                      <div style={{ background: 'rgba(0,0,0,0.02)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '0.75rem', border: '1px solid var(--border-light)' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>ASSIGNED DRIVER &amp; TRUCK</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.15rem' }}>
                          <span>{shipment.driverName} ({shipment.driverPhone})</span>
                          <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>{shipment.truckRegistrationNumber}</span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      {(shipment.status === 'PENDING' || shipment.status === 'ASSIGNED') && (
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => setCancellingShipment(shipment)}>
                          Cancel Booking
                        </button>
                      )}
                      {shipment.status === 'DELIVERED' && (
                        <button type="button" className="btn btn-accent btn-sm" onClick={() => setRatingShipment(shipment)}>
                          <FaStar size={12} style={{ fill: 'currentColor' }} /> Rate Experience
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1 — TRACK PACKAGES
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 1 && (
        <div>
          {/* Filter bar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {['All', 'Active', 'Delivered', 'Cancelled'].map(f => (
              <button
                key={f}
                onClick={() => setTrackFilter(f)}
                className={trackFilter === f ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              >
                {f}
                <span style={{
                  marginLeft: '0.35rem', background: 'rgba(255,255,255,0.2)',
                  padding: '0 0.35rem', borderRadius: '50px', fontSize: '0.75rem'
                }}>
                  {f === 'All' ? shipments.length
                    : f === 'Active' ? shipments.filter(s => ['PENDING','ASSIGNED','PICKED','IN_TRANSIT'].includes(s.status)).length
                    : f === 'Delivered' ? shipments.filter(s => s.status === 'DELIVERED').length
                    : shipments.filter(s => s.status === 'CANCELLED').length}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: '1rem' }}>
              <FaSpinner size={36} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Loading shipments...</p>
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <FaBox size={52} style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No shipments found</p>
              <p style={{ fontSize: '0.88rem', marginTop: '0.35rem' }}>
                {trackFilter !== 'All' ? `No "${trackFilter}" shipments yet.` : 'Book your first shipment to see tracking here.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredShipments.map((shipment) => {
                const isCancelled = shipment.status === 'CANCELLED';
                return (
                  <div key={shipment.id} className="glass-card" style={{ padding: '1.5rem' }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{shipment.pickupCity}</span>
                          <FaArrowRight size={16} color="var(--color-primary)" />
                          <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{shipment.dropCity}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {shipment.trackingNumber || '#' + shipment.id?.substring(0, 12)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {getStatusBadge(shipment.status)}
                        
                        {shipment.paymentStatus === 'PENDING' && shipment.razorpayOrderId && shipment.status !== 'CANCELLED' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handlePayNow(shipment)}>
                            Pay Now
                          </button>
                        )}

                        {(shipment.status === 'PENDING' || shipment.status === 'ASSIGNED') && (
                          <button className="btn btn-danger btn-sm" onClick={() => setCancellingShipment(shipment)}>
                            Cancel
                          </button>
                        )}
                        {shipment.status === 'DELIVERED' && (
                          <button className="btn btn-accent btn-sm" onClick={() => setRatingShipment(shipment)}>
                            <FaStar size={12} style={{ fill: 'currentColor' }} /> Rate
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tracking Stepper */}
                    {!isCancelled ? (
                      <TrackingStepper status={shipment.status} />
                    ) : (
                      <div style={{
                        marginTop: '1rem', padding: '0.75rem 1rem',
                        background: 'rgba(255,50,50,0.06)', borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(255,50,50,0.15)',
                        color: '#ef4444', fontSize: '0.88rem', fontWeight: 600,
                      }}>
                        🚫 This shipment was cancelled.
                      </div>
                    )}

                    {/* Info row */}
                    <div style={{
                      marginTop: '1rem', paddingTop: '1rem',
                      borderTop: '1px solid var(--border-light)',
                      display: 'flex', flexWrap: 'wrap', gap: '1.5rem',
                    }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Est. Cost</div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-accent)' }}>₹{shipment.estimatedCost}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Weight</div>
                        <div style={{ fontWeight: 700 }}>{shipment.totalWeightKg} kg</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Items</div>
                        <div style={{ fontWeight: 700 }}>{shipment.items?.length || '—'}</div>
                      </div>
                      {shipment.truckRegistrationNumber && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Driver</div>
                          <div style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>
                            {shipment.driverName} · <span style={{ color: 'var(--text-secondary)' }}>{shipment.truckRegistrationNumber}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2 — PAYMENT HISTORY
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Summary stats */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(130,80,250,0.1)' }}>
                <FaArrowUp size={22} color="var(--color-primary)" />
              </div>
              <div>
                <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                  ₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div className="stat-label">Total Spent</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(255,170,0,0.1)' }}>
                <FaClock size={22} color="#ffa31a" />
              </div>
              <div>
                <div className="stat-value" style={{ color: '#ffa31a' }}>
                  ₹{pendingCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
                <FaCheckCircle size={22} color="#10b981" />
              </div>
              <div>
                <div className="stat-value" style={{ color: '#10b981' }}>
                  ₹{completedPayment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div className="stat-label">Completed Payments</div>
              </div>
            </div>
          </div>

          {/* Spending bar chart */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="form-section-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <FaChartBar size={20} />
                <span>Monthly Spending (Last 6 Months)</span>
              </h3>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => showToast('info', 'Payment gateway coming soon!')}
              >
                <FaCreditCard size={14} /> Make Payment
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 140, padding: '0 0.5rem' }}>
              {mockMonthlyData.map((d) => {
                const pct = (d.amount / maxMonthly) * 100;
                return (
                  <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      ₹{(d.amount / 1000).toFixed(1)}k
                    </span>
                    <div style={{
                      width: '100%', height: `${Math.max(pct, 8)}%`,
                      background: 'linear-gradient(180deg, var(--color-primary), hsl(250,75%,70%))',
                      borderRadius: '6px 6px 2px 2px',
                      transition: 'height 0.4s ease',
                      minHeight: 8,
                    }} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment table */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="form-section-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <FaCreditCard size={20} />
                <span>Shipment Billing History</span>
              </h3>
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '1rem' }}>
                <FaSpinner size={28} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Loading history...</span>
              </div>
            ) : shipments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <FaCreditCard size={44} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                <p>No payment records found.</p>
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Route</th>
                      <th>Weight</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((s) => (
                      <tr key={s.id}>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {formatDate(s.scheduledPickupTime || s.createdAt)}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                            <span>{s.pickupCity}</span>
                            <FaArrowRight size={13} color="var(--text-muted)" />
                            <span>{s.dropCity}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{s.totalWeightKg} kg</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-accent)' }}>₹{s.estimatedCost}</td>
                        <td>{getStatusBadge(s.status)}</td>
                        <td>
                          {s.status === 'DELIVERED' ? (
                            <button className="btn btn-accent btn-sm" onClick={() => setRatingShipment(s)}>
                              <FaStar size={12} style={{ fill: 'currentColor' }} /> Rate Driver
                            </button>
                          ) : s.status === 'CANCELLED' ? (
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>—</span>
                          ) : s.paymentStatus === 'SUCCESS' ? (
                            <span style={{ fontSize: '0.82rem', color: 'var(--color-success)', fontWeight: 'bold' }}>PAID ONLINE</span>
                          ) : s.paymentMode === 'COD' ? (
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Pay on Delivery</span>
                          ) : s.razorpayOrderId ? (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handlePayNow(s)}
                            >
                              <FaCreditCard size={12} /> Pay Now
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Payment Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 3 — CONTACT SUPPORT
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 3 && (
        <div className="contact-grid">
          {/* Left: Ticket form + FAQ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Support ticket form */}
            <div className="glass-card">
              <h3 className="form-section-title">
                <FaComment size={20} />
                <span>Submit a Support Ticket</span>
              </h3>

              {ticketId ? (
                <div style={{
                  textAlign: 'center', padding: '2rem',
                  background: 'rgba(16,185,129,0.06)', borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(16,185,129,0.2)'
                }}>
                  <FaCheckCircle size={52} color="#10b981" style={{ marginBottom: '1rem' }} />
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Ticket Submitted!</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Your support request has been received. Our team will respond within 24 hours.
                  </p>
                  <div style={{
                    display: 'inline-block', background: 'var(--color-primary-glow)',
                    border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem 1.25rem', fontFamily: 'monospace',
                    fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)',
                    letterSpacing: '0.1em', marginBottom: '1.5rem'
                  }}>
                    {ticketId}
                  </div>
                  <br />
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setTicketId(null)}
                  >
                    Submit Another Ticket
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={supportCategory}
                      onChange={(e) => setSupportCategory(e.target.value)}
                    >
                      <option value="Technical">Technical Issue</option>
                      <option value="Billing">Billing &amp; Payment</option>
                      <option value="Shipment">Shipment Problem</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. My package is delayed"
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-textarea"
                      rows={5}
                      placeholder="Describe your issue in detail. Include shipment IDs if applicable..."
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      required
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={submittingTicket}
                  >
                    {submittingTicket ? (
                      <>
                        <FaSpinner size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaComment size={16} />
                        Submit Ticket
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* FAQ Accordion */}
            <div className="glass-card">
              <h3 className="form-section-title">
                <FaChevronDown size={20} />
                <span>Frequently Asked Questions</span>
              </h3>
              {FAQ_ITEMS.map((faq, i) => (
                <FAQItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>

          {/* Right: Emergency contacts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Contact card */}
            <div className="glass-card" style={{ background: 'var(--color-primary-glow)', borderColor: 'var(--color-primary)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaShieldVirus size={18} /> Emergency &amp; Contact
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* FaPhone */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.9rem',
                  padding: '0.9rem 1rem', background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)'
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaPhone size={18} color="#10b981" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Helpline</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>+91 1800 555 0199</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Toll free · 24 hours</div>
                  </div>
                </div>

                {/* Email */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.9rem',
                  padding: '0.9rem 1rem', background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)'
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(130,80,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaEnvelope size={18} color="var(--color-primary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Email Support</div>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem' }}>support@easyroute.com</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Reply within 24 hours</div>
                  </div>
                </div>

                {/* Hours */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.9rem',
                  padding: '0.9rem 1rem', background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)'
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,170,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaClock size={18} color="#ffa31a" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Support Hours</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Mon – Sat, 9 AM – 6 PM</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>IST · Closed on national holidays</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick tips */}
            <div className="glass-card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaStar size={16} color="#ffa31a" style={{ fill: '#ffa31a' }} /> Quick Tips
              </h3>
              {[
                'Include your shipment ID for faster resolution',
                'For urgent shipments, call the helpline directly',
                'Billing disputes are resolved within 3 business days',
                'Screenshot any app errors and attach them in your message',
              ].map((tip, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                  marginBottom: '0.65rem', fontSize: '0.87rem', color: 'var(--text-secondary)',
                }}>
                  <FaCheckCircle size={15} color="var(--color-primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{tip}</span>
                </div>
              ))}
            </div>

            {/* Escalation card */}
            <div className="glass-card" style={{ background: 'rgba(255,50,50,0.04)', borderColor: 'rgba(255,50,50,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <FaShieldVirus size={18} color="#ef4444" />
                <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.95rem' }}>Escalation Path</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                If your issue is not resolved within <strong>48 hours</strong>, escalate to{' '}
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>escalations@easyroute.com</span>{' '}
                with your ticket ID.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL — Cancel Shipment
      ══════════════════════════════════════════════════════════════════ */}
      {cancellingShipment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaShieldVirus size={22} /> Confirm Cancellation
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Are you sure you want to cancel the shipment from{' '}
              <strong>{cancellingShipment.pickupCity}</strong> to{' '}
              <strong>{cancellingShipment.dropCity}</strong>?{' '}
              This action cannot be undone.
            </p>

            <div className="form-group">
              <label className="form-label">Reason for Cancellation</label>
              <textarea
                required rows={3}
                className="form-textarea"
                placeholder="e.g. Schedule changed, booked another service..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => { setCancellingShipment(null); setCancelReason(''); }}>
                Dismiss
              </button>
              <button className="btn btn-danger" onClick={handleCancelShipment}>
                Cancel Shipment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL — Rate Driver
      ══════════════════════════════════════════════════════════════════ */}
      {ratingShipment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--color-secondary)' }}>Rate Driver &amp; Delivery</h3>
              <button onClick={() => setRatingShipment(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <FaTimes size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Your delivery by <strong>{ratingShipment.driverName || 'your driver'}</strong> has been completed. Please rate your experience.
            </p>

            <div className="form-group" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ marginBottom: '0.75rem' }}>FaStar Rating</label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRatingStars(star)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <FaStar size={32} style={{
                      color: star <= ratingStars ? '#ffa31a' : 'var(--text-muted)',
                      fill: star <= ratingStars ? '#ffa31a' : 'none',
                      transition: 'color 0.2s'
                    }} />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Review Comments</label>
              <textarea rows={3} className="form-textarea"
                placeholder="Share your experience with the driver..."
                value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} />
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleSubmitRating}>
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL — Detailed Shipment View
      ══════════════════════════════════════════════════════════════════ */}
      {selectedDetailedShipment && (
        <div className="modal-overlay" onClick={() => setSelectedDetailedShipment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Shipment Details</h3>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {selectedDetailedShipment.id}</span>
              </div>
              <button onClick={() => setSelectedDetailedShipment(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <FaTimes size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{selectedDetailedShipment.pickupCity}</span>
                <FaArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{selectedDetailedShipment.dropCity}</span>
              </div>
              {getStatusBadge(selectedDetailedShipment.status)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>PICKUP ADDRESS</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0 }}>{selectedDetailedShipment.pickupAddress}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>{selectedDetailedShipment.pickupCity}</p>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>DROP ADDRESS</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0 }}>{selectedDetailedShipment.dropAddress}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>{selectedDetailedShipment.dropCity}</p>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Cargo Items</span>
              {selectedDetailedShipment.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: idx !== selectedDetailedShipment.items.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.itemName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>x{item.quantity}</span>
                    {item.fragile && <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '12px', marginLeft: '0.5rem' }}>Fragile</span>}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.weightKg} kg</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-primary-glow)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-primary)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, display: 'block' }}>TOTAL AMOUNT</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>₹{selectedDetailedShipment.estimatedCost}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>PAYMENT STATUS</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: selectedDetailedShipment.paymentStatus === 'SUCCESS' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                  {selectedDetailedShipment.paymentStatus === 'SUCCESS' ? 'PAID' : selectedDetailedShipment.paymentMode === 'COD' ? 'Cash on Delivery' : 'Unpaid'}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerDashboardInner;
