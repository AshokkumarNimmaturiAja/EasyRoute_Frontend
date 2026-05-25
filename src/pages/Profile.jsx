import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { FaUser, FaHashtag, FaChartLine, FaTimes, FaBox, FaChevronDown, FaEdit, FaArrowRight, FaInfoCircle, FaLock, FaShieldVirus, FaCheck, FaCheckCircle, FaChevronUp, FaStar, FaCreditCard, FaTruck, FaEye, FaSpinner, FaEyeSlash, FaExclamationCircle, FaExclamationTriangle, FaBookOpen, FaChartBar, FaAward, FaArrowUp, FaBriefcase, FaCalendarAlt, FaQuestionCircle, FaBuilding, FaPaperPlane, FaPhone, FaEnvelope, FaMapMarkerAlt, FaSave, FaShieldAlt } from 'react-icons/fa';

// ─── Constants ─────────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  ROLE_CUSTOMER: { label: 'Customer', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: '🛍️' },
  ROLE_DRIVER:   { label: 'Driver',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: '🚛' },
  ROLE_PICKUP:   { label: 'Pickup Partner', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '📦' },
  ROLE_ADMIN:    { label: 'Admin',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: '⚡' },
};

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry','Other'
];

const FAQ_ITEMS = [
  { question: 'How do I book a new shipment?', answer: 'Log in as a Customer and navigate to the "Book Shipment" tab on your dashboard. Enter cargo details, weight, and pickup/drop locations. The platform auto-calculates routing and pricing.', roles: ['ROLE_CUSTOMER'] },
  { question: 'How can I track my active orders?', answer: 'Go to your dashboard and check the "Active Shipments" section. You can see real-time status updates from PENDING through DELIVERED for every booking.', roles: ['ROLE_CUSTOMER', 'ROLE_DRIVER', 'ROLE_PICKUP', 'ROLE_ADMIN'] },
  { question: 'What documents are required for truck verification?', answer: 'Drivers must upload a valid Registration Certificate (RC), a commercial driving licence, and optionally insurance documents. Admin reviews and approves within 24–48 hours.', roles: ['ROLE_DRIVER'] },
  { question: 'How does smart route consolidation work?', answer: 'Admins can group multiple shipments on the same pickup→drop city route onto one truck, reducing per-shipment cost by up to 40% and maximising truck utilisation.', roles: ['ROLE_ADMIN', 'ROLE_PICKUP'] },
  { question: 'How do I toggle my vehicle availability?', answer: 'From your Driver dashboard, toggle the "Available / Offline" switch in the top stats bar. Only online, verified drivers receive new shipment assignments.', roles: ['ROLE_DRIVER'] },
  { question: 'When do I receive my earnings payout?', answer: 'Your wallet is automatically credited when a shipment status changes to DELIVERED. You can request a bank withdrawal from your profile once your balance exceeds the minimum threshold.', roles: ['ROLE_DRIVER', 'ROLE_PICKUP'] },
  { question: 'How are cancellations handled?', answer: 'Customers can cancel PENDING or ASSIGNED shipments. Admins can cancel any shipment at any time with a reason. All cancellations are logged in the audit trail.', roles: ['ROLE_CUSTOMER', 'ROLE_ADMIN'] },
  { question: 'Who do I contact for billing discrepancies?', answer: 'Use the "Contact Admin" tab on this page and select "Payment & Billing" as the category. You can also email billing@easyroute.com directly.', roles: ['ROLE_CUSTOMER', 'ROLE_DRIVER', 'ROLE_PICKUP', 'ROLE_ADMIN'] },
];

// ─── Helper: Profile Completeness ───────────────────────────────────────────

function calcCompleteness(profile, role) {
  const fields = ['name', 'phone', 'profilePhotoUrl', 'address', 'city', 'state', 'pincode', 'bio'];
  if (role === 'ROLE_CUSTOMER')  fields.push('gstin');
  if (role === 'ROLE_DRIVER' || role === 'ROLE_PICKUP') fields.push('emergencyContacts', 'bankDetails', 'preferredRouteArea');
  const filled = fields.filter(f => profile[f] && profile[f].trim && profile[f].trim() !== '');
  return Math.round((filled.length / fields.length) * 100);
}

// ─── Helper: Initials Avatar ────────────────────────────────────────────────

function InitialsAvatar({ name, role, photoUrl, size = 88 }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.ROLE_CUSTOMER;
  const initials = (name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: photoUrl ? 'transparent' : `linear-gradient(135deg, ${cfg.color}cc, ${cfg.color})`,
      border: `3px solid ${cfg.color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 0 4px ${cfg.bg}, 0 8px 24px rgba(0,0,0,0.12)`,
      overflow: 'hidden', flexShrink: 0, margin: '0 auto',
      fontSize: size / 3, fontWeight: 800, color: '#fff',
      letterSpacing: '-0.02em'
    }}>
      {photoUrl ? <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('personal');

  // ── Profile form state ────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '', phone: '', profilePhotoUrl: '',
    address: '', city: '', state: '', pincode: '', bio: '',
    gstin: '', emergencyContacts: '', bankDetails: '', preferredRouteArea: '',
  });

  const [myRateCard, setMyRateCard] = useState(null);

  // ── Password form state ───────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwStrength, setPwStrength] = useState(0);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({ subject: '', category: 'Technical Support', message: '' });
  const [contactTicket, setContactTicket] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Photo upload state
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  // ── Fetch profile on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        const data = res.data.data;
        const merged = {
          name: data.name || '',
          phone: data.phone || '',
          profilePhotoUrl: data.profilePhotoUrl || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          bio: data.bio || '',
          gstin: data.gstin || '',
          emergencyContacts: data.emergencyContacts || '',
          bankDetails: data.bankDetails || '',
          preferredRouteArea: data.preferredRouteArea || '',
        };
        setForm(merged);
        updateProfile(merged);
      } catch {
        showToast('error', 'Could not sync profile from server');
      } 
      
      try {
        const rateRes = await api.get('/rates/my-rate');
        setMyRateCard(rateRes.data);
      } catch (e) {
        console.warn("Could not fetch rate card", e);
      }
      
      setPageLoading(false);
    };
    if (user) fetchProfile();
  }, []);

  // ── Password strength meter ────────────────────────────────────────────────
  useEffect(() => {
    const p = pwForm.newPassword;
    let score = 0;
    if (p.length >= 6)  score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    setPwStrength(score);
  }, [pwForm.newPassword]);

  const pwStrengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][pwStrength];
  const pwStrengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][pwStrength];

  // ── FaSave profile ───────────────────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      showToast('error', 'Name and phone number are required');
      return;
    }
    setLoading(true);
    try {
      const res = await api.put('/auth/me', form);
      const data = res.data.data;
      const updated = {
        name: data.name, phone: data.phone, profilePhotoUrl: data.profilePhotoUrl,
        address: data.address || '', city: data.city || '', state: data.state || '',
        pincode: data.pincode || '', bio: data.bio || '', gstin: data.gstin || '',
        emergencyContacts: data.emergencyContacts || '', bankDetails: data.bankDetails || '',
        preferredRouteArea: data.preferredRouteArea || '',
      };
      setForm(prev => ({ ...prev, ...updated }));
      updateProfile(updated);
      setEditMode(false);
      showToast('success', 'Profile updated successfully');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Change password ────────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/me', { ...form, password: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('success', '🔒 Password changed successfully! Keep it safe.');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // ── Contact submit ────────────────────────────────────────────────────────
  const handleContact = (e) => {
    e.preventDefault();
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      showToast('error', 'Subject and message are required');
      return;
    }
    const ticket = 'ER-' + Math.floor(100000 + Math.random() * 900000);
    setContactTicket(ticket);
    setContactForm({ subject: '', category: 'Technical Support', message: '' });
    showToast('success', `Support ticket ${ticket} submitted`);
  };

  // ── Profile Photo Upload ─────────────────────────────────────────────────────
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'Image must be less than 10MB');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload to backend
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = res.data?.data?.url || '';
      setForm(prev => ({ ...prev, profilePhotoUrl: uploadedUrl }));
      updateProfile({ profilePhotoUrl: uploadedUrl });
      showToast('success', 'Profile photo updated successfully!');
    } catch (err) {
      showToast('error', err?.message || 'Photo upload failed. Please try again.');
      setPhotoPreview(null);
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const role = user?.role;
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.ROLE_CUSTOMER;
  const completeness = calcCompleteness(form, role);
  const filteredFaqs = FAQ_ITEMS.filter(f =>
    f.roles.includes(role) &&
    (f.question.toLowerCase().includes(faqSearch.toLowerCase()) || f.answer.toLowerCase().includes(faqSearch.toLowerCase()))
  );

  const tabDefs = [
    { id: 'personal',      label: 'Personal Info',   icon: FaUser },
    { id: 'professional',  label: 'Professional',    icon: FaBriefcase },
    { id: 'security',      label: 'Security',        icon: FaLock },
    { id: 'stats',         label: 'Statistics',        icon: FaChartBar },
    { id: 'help',          label: 'Help & FAQ',      icon: FaBookOpen },
    { id: 'contact',       label: 'Contact Admin',   icon: FaEnvelope },
  ];

  if (pageLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <FaSpinner size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '4rem', maxWidth: '1100px' }}>

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`} style={{ minWidth: 280 }}>
            <span style={{ fontSize: '1.1rem' }}>{toast.type === 'success' ? '✓' : '✗'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ── Profile Hero Card ──────────────────────────────────────────────── */}
      <div className="glass-card" style={{
        marginBottom: '1.5rem', padding: '2rem',
        background: `linear-gradient(135deg, ${cfg.bg} 0%, rgba(255,255,255,0.9) 60%)`,
        borderTop: `3px solid ${cfg.color}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar — clickable to upload */}
          <div
            style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
            title="Click to change profile photo"
            onClick={() => fileInputRef.current?.click()}
          >
            <InitialsAvatar
              name={form.name}
              role={role}
              photoUrl={photoPreview || form.profilePhotoUrl}
              size={88}
            />
            {/* Camera overlay */}
            <div
              className="photo-upload-overlay"
              style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                opacity: photoUploading ? 1 : 0,
                transition: 'opacity 0.2s',
                color: '#fff', fontSize: '0.62rem', fontWeight: 700, gap: 2,
              }}
            >
              {photoUploading
                ? <><span style={{ fontSize: '1.1rem' }}>⏳</span>Uploading…</>
                : <><span style={{ fontSize: '1.3rem' }}>📷</span>Change</>}
            </div>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
              <h1 style={{ fontSize: '1.6rem', margin: 0 }}>{form.name || user?.name}</h1>
              <span style={{
                background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`,
                borderRadius: 50, padding: '0.2rem 0.8rem', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em'
              }}>
                {cfg.icon} {cfg.label}
              </span>
              {user?.emailVerified && (
                <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 50, padding: '0.2rem 0.7rem', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FaCheck size={11} /> Verified
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.75rem 0' }}>
              {user?.email} {form.phone ? `· ${form.phone}` : ''} {form.city ? `· ${form.city}` : ''}
            </p>

            {/* Profile completeness bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ flex: 1, height: 6, background: 'var(--border-light)', borderRadius: 99, overflow: 'hidden', maxWidth: 200 }}>
                <div style={{
                  height: '100%', borderRadius: 99, transition: 'width 0.6s ease',
                  width: `${completeness}%`,
                  background: completeness >= 80 ? '#10b981' : completeness >= 50 ? '#f59e0b' : '#ef4444'
                }} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: completeness >= 80 ? '#10b981' : completeness >= 50 ? '#f59e0b' : '#ef4444' }}>
                {completeness}% Complete
              </span>
              {completeness < 100 && (
                <button onClick={() => { setActiveTab('personal'); setEditMode(true); }}
                  style={{ fontSize: '0.75rem', color: cfg.color, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', padding: 0 }}>
                  Complete Now →
                </button>
              )}
            </div>
          </div>

          {/* Member Since */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member Since</div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Recently Joined'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Layout ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── Sidebar Navigation ──────────────────────────────────────────── */}
        <div className="glass-card" style={{ padding: '0.75rem', position: 'sticky', top: '90px' }}>
          {tabDefs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)',
                  border: 'none', cursor: 'pointer', marginBottom: '0.2rem',
                  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.88rem',
                  background: isActive ? `linear-gradient(135deg, ${cfg.color}18, ${cfg.color}08)` : 'transparent',
                  color: isActive ? cfg.color : 'var(--text-secondary)',
                  borderLeft: isActive ? `3px solid ${cfg.color}` : '3px solid transparent',
                  transition: 'all 0.2s ease',
                }}>
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Content Pane ────────────────────────────────────────────────── */}
        <div>

          {/* ════════════════════════════════════════════════════════════════
              TAB 1: PERSONAL INFO
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'personal' && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="form-section-title" style={{ margin: 0, border: 'none', paddingBottom: 0 }}>
                  <FaUser size={20} /> Personal Information
                </h3>
                {!editMode ? (
                  <button onClick={() => setEditMode(true)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaEdit size={14} /> Edit Profile
                  </button>
                ) : (
                  <button onClick={() => setEditMode(false)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444' }}>
                    <FaTimes size={14} /> Cancel
                  </button>
                )}
              </div>

              {!editMode ? (
                /* ── View Mode ──────────────────────────────────────────── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {[
                    { label: 'Full Name', value: form.name, icon: FaUser },
                    { label: 'Email Address', value: user?.email, icon: FaEnvelope, note: 'Cannot be changed — primary account identifier' },
                    { label: 'Phone Number', value: form.phone, icon: FaPhone },
                    { label: 'Street Address', value: form.address || '—', icon: FaMapMarkerAlt },
                    { label: 'City', value: form.city || '—', icon: FaMapMarkerAlt },
                    { label: 'State', value: form.state || '—', icon: FaMapMarkerAlt },
                    { label: 'Pincode', value: form.pincode || '—', icon: FaHashtag },
                    { label: 'Bio', value: form.bio || '—', icon: FaInfoCircle },
                  ].map((field, i) => {
                    const Icon = field.icon;
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', padding: '0.85rem 0',
                        borderBottom: i < 7 ? '1px solid var(--border-light)' : 'none'
                      }}>
                        <div style={{ width: 180, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0 }}>
                          <Icon size={14} /> {field.label}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: 500 }}>{field.value}</div>
                          {field.note && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{field.note}</div>}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ marginTop: '1.25rem' }}>
                    <button onClick={() => setEditMode(true)} className="btn btn-primary">
                      <FaEdit size={16} /> Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Edit Mode ──────────────────────────────────────────── */
                <form onSubmit={handleSaveProfile}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Raj Kumar" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input className="form-input" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Email is your login identifier and cannot be changed.</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input className="form-input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="e.g. 42, MG Road, Koramangala" />
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input className="form-input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Bengaluru" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <select className="form-select" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))}>
                        <option value="">Select state...</option>
                        {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Pincode</label>
                      <input className="form-input" value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} placeholder="560001" maxLength={6} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Profile Photo</label>
                      {/* Photo upload zone */}
                      <div
                        style={{
                          border: `2px dashed ${photoUploading ? 'var(--color-primary)' : 'var(--border-light)'}`,
                          borderRadius: 'var(--radius-md)',
                          padding: '0.65rem 0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          cursor: photoUploading ? 'default' : 'pointer',
                          transition: 'all 0.2s',
                          background: photoUploading ? 'rgba(99,102,241,0.04)' : 'transparent',
                        }}
                        onClick={() => !photoUploading && fileInputRef.current?.click()}
                        onMouseEnter={e => { if (!photoUploading) e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                        onMouseLeave={e => { if (!photoUploading) e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                      >
                        {/* Mini avatar preview */}
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid var(--color-primary)',
                        }}>
                          {(photoPreview || form.profilePhotoUrl)
                            ? <img src={photoPreview || form.profilePhotoUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: '1.2rem' }}>👤</span>
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {photoUploading
                            ? <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>⏳ Uploading…</p>
                            : <>
                                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {(photoPreview || form.profilePhotoUrl) ? 'Click to change photo' : 'Click to upload photo'}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>JPG, PNG, WEBP · Max 10MB</p>
                              </>
                          }
                        </div>
                        <span style={{ fontSize: '1.2rem' }}>📷</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Bio / Short Description</label>
                    <textarea className="form-textarea" rows={3} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell others a bit about yourself or your business..." />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? <><FaSpinner size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><FaSave size={16} /> Save Changes</>}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 2: PROFESSIONAL DETAILS (ROLE-AWARE)
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'professional' && (
            <div className="glass-card">
              <h3 className="form-section-title" style={{ marginBottom: '1.5rem' }}>
                <FaBriefcase size={20} /> Professional Details
                <span style={{ fontSize: '0.78rem', marginLeft: 'auto', background: cfg.bg, color: cfg.color, padding: '0.2rem 0.7rem', borderRadius: 50, fontWeight: 700 }}>
                  {cfg.icon} {cfg.label} Profile
                </span>
              </h3>

              <form onSubmit={handleSaveProfile}>

                {/* CUSTOMER specific fields */}
                {role === 'ROLE_CUSTOMER' && (
                  <>
                    <div className="form-group">
                      <label className="form-label"><FaBuilding size={14} style={{ display: 'inline', marginRight: 4 }} /> GSTIN Number</label>
                      <input className="form-input" value={form.gstin} onChange={e => setForm(p => ({ ...p, gstin: e.target.value }))} placeholder="e.g. 29ABCDE1234F1Z5" maxLength={15} />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Required for business shipments and GST invoicing.</p>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Business Type</label>
                      <select className="form-select" value={form.preferredRouteArea} onChange={e => setForm(p => ({ ...p, preferredRouteArea: e.target.value }))}>
                        <option value="">Select type...</option>
                        <option>Individual / Personal</option>
                        <option>MSME / Small Business</option>
                        <option>Mid-size Enterprise</option>
                        <option>Large Corporate</option>
                        <option>E-commerce Seller</option>
                        <option>Manufacturer / Exporter</option>
                      </select>
                    </div>
                  </>
                )}

                {/* DRIVER specific fields */}
                {role === 'ROLE_DRIVER' && (
                  <>
                    <div className="form-group">
                      <label className="form-label"><FaTruck size={14} style={{ display: 'inline', marginRight: 4 }} /> Preferred Operating Route / Area</label>
                      <input className="form-input" value={form.preferredRouteArea} onChange={e => setForm(p => ({ ...p, preferredRouteArea: e.target.value }))} placeholder="e.g. Bengaluru → Chennai, Pune → Mumbai" />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Admins use this to match you with same-route shipments for consolidation.</p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Emergency Contact (Name & FaPhone)</label>
                      <input className="form-input" value={form.emergencyContacts} onChange={e => setForm(p => ({ ...p, emergencyContacts: e.target.value }))} placeholder="e.g. Priya Kumar — 9876543210" />
                    </div>
                  </>
                )}

                {/* PICKUP specific fields */}
                {role === 'ROLE_PICKUP' && (
                  <>
                    <div className="form-group">
                      <label className="form-label"><FaBox size={14} style={{ display: 'inline', marginRight: 4 }} /> Service Area / City</label>
                      <input className="form-input" value={form.preferredRouteArea} onChange={e => setForm(p => ({ ...p, preferredRouteArea: e.target.value }))} placeholder="e.g. Indiranagar, Koramangala — Bengaluru" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Emergency Contact (Name & FaPhone)</label>
                      <input className="form-input" value={form.emergencyContacts} onChange={e => setForm(p => ({ ...p, emergencyContacts: e.target.value }))} placeholder="e.g. Ramesh — 9123456789" />
                    </div>
                  </>
                )}

                {/* ADMIN specific fields */}
                {role === 'ROLE_ADMIN' && (
                  <div className="form-group">
                    <label className="form-label"><FaShieldAlt size={14} style={{ display: 'inline', marginRight: 4 }} /> Department / Region Managed</label>
                    <input className="form-input" value={form.preferredRouteArea} onChange={e => setForm(p => ({ ...p, preferredRouteArea: e.target.value }))} placeholder="e.g. South Zone — Karnataka & Tamil Nadu" />
                  </div>
                )}

                {/* Bank Payout Setup — for Drivers and Pickup Partners */}
                {(role === 'ROLE_DRIVER' || role === 'ROLE_PICKUP') && (
                  <>
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaCreditCard size={16} style={{ color: cfg.color }} /> Bank Payout Setup
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Required to withdraw your wallet balance to your bank account.</p>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Bank Account Number & IFSC</label>
                      <input className="form-input" value={form.bankDetails} onChange={e => setForm(p => ({ ...p, bankDetails: e.target.value }))} placeholder="e.g. HDFC · 50100123456789 · HDFC0001234" />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        Format: Bank Name · Account Number · IFSC Code. This information is stored securely.
                      </p>
                    </div>
                  </>
                )}

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><FaSpinner size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><FaSave size={16} /> Save Professional Details</>}
                </button>
              </form>

              {/* My Rate Card Widget */}
              {myRateCard && (
                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaAward size={18} style={{ color: cfg.color }} /> My Active Rate Card
                  </h4>
                  <div className="glass-card" style={{ background: cfg.bg, border: `1px solid ${cfg.color}40`, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Base Fare</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{myRateCard.baseFare}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Commission</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{myRateCard.commissionPercentage}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fixed Fee</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{myRateCard.fixedFee}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                    * This is your currently active rate card configuration. It determines your payouts for every completed shipment.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 3: SECURITY & PASSWORD
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Change Password Card */}
              <div className="glass-card">
                <h3 className="form-section-title" style={{ marginBottom: '1.5rem' }}>
                  <FaLock size={20} /> Change Password
                </h3>

                <form onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="form-input"
                        type={showPw.new ? 'text' : 'password'}
                        value={pwForm.newPassword}
                        onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                        placeholder="Minimum 6 characters"
                        style={{ paddingRight: '2.75rem' }}
                      />
                      <button type="button" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        {showPw.new ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>

                    {/* Strength Meter */}
                    {pwForm.newPassword && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '0.25rem' }}>
                          {[1,2,3,4,5].map(i => (
                            <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= pwStrength ? pwStrengthColor : 'var(--border-light)', transition: 'background 0.3s' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: pwStrengthColor, fontWeight: 600 }}>
                          {pwStrengthLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Confirm New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="form-input"
                        type={showPw.confirm ? 'text' : 'password'}
                        value={pwForm.confirmPassword}
                        onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        placeholder="Re-enter new password"
                        style={{ paddingRight: '2.75rem', borderColor: pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword ? '#ef4444' : undefined }}
                      />
                      <button type="button" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        {showPw.confirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                    {pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword && (
                      <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <FaTimes size={12} /> Passwords do not match
                      </p>
                    )}
                    {pwForm.confirmPassword && pwForm.confirmPassword === pwForm.newPassword && (
                      <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <FaCheck size={12} /> Passwords match
                      </p>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading || (pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword)}>
                    {loading ? <><FaSpinner size={16} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</> : <><FaLock size={16} /> Change Password</>}
                  </button>
                </form>
              </div>

              {/* Security Info Card */}
              <div className="glass-card">
                <h3 className="form-section-title" style={{ marginBottom: '1.25rem' }}>
                  <FaShieldAlt size={20} /> Account Security
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { label: 'Email Verification', value: user?.emailVerified ? 'Verified ✓' : 'Not Verified', ok: user?.emailVerified },
                    { label: 'Account Status', value: user?.isActive !== false ? 'Active & In Good Standing' : 'Suspended', ok: user?.isActive !== false },
                    { label: 'Auth Method', value: 'Email / Password (JWT)', ok: true },
                    { label: 'Two-Factor Auth', value: 'Not Enabled  (Coming in Phase 3)', ok: false },
                    { label: 'Role', value: cfg.label, ok: true },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: i < 4 ? '1px solid var(--border-light)' : 'none' }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: item.ok ? '#10b981' : 'var(--text-secondary)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="glass-card" style={{ borderLeft: '3px solid #ef4444' }}>
                <h3 className="form-section-title" style={{ marginBottom: '1rem', color: '#ef4444', border: 'none', paddingBottom: 0 }}>
                  <FaExclamationTriangle size={20} /> Danger Zone
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  If you believe your account has been compromised, contact your administrator immediately.
                </p>
                <button className="btn btn-secondary btn-sm" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => setActiveTab('contact')}>
                  <FaEnvelope size={14} /> Report Security Issue
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 4: ACTIVITY STATISTICS
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'stats' && (
            <div className="glass-card">
              <h3 className="form-section-title" style={{ marginBottom: '1.5rem' }}>
                <FaChartBar size={20} /> Statistics Overview
              </h3>

              {/* Stats cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {role === 'ROLE_CUSTOMER' && [
                  { icon: '📦', label: 'Total Shipments', value: '—', note: 'All bookings' },
                  { icon: '✅', label: 'Delivered', value: '—', note: 'Successfully delivered' },
                  { icon: '❌', label: 'Cancelled', value: '—', note: 'Cancelled orders' },
                  { icon: '💰', label: 'Amount Spent', value: '₹ —', note: 'Platform lifetime' },
                ].map((s, i) => <StatCard key={i} {...s} color={cfg.color} />)}

                {role === 'ROLE_DRIVER' && [
                  { icon: '🚛', label: 'Deliveries Made', value: '—', note: 'Completed runs' },
                  { icon: '⭐', label: 'Average Rating', value: '—', note: 'Customer ratings' },
                  { icon: '💵', label: 'Total Earnings', value: '₹ —', note: 'Wallet credits' },
                  { icon: '🔄', label: 'Active Shipments', value: '—', note: 'In transit now' },
                ].map((s, i) => <StatCard key={i} {...s} color={cfg.color} />)}

                {role === 'ROLE_PICKUP' && [
                  { icon: '📦', label: 'Pickups Done', value: '—', note: 'Confirmed collections' },
                  { icon: '🤝', label: 'Handovers', value: '—', note: 'Goods handed to driver' },
                  { icon: '💵', label: 'Total Earned', value: '₹ —', note: 'Wallet credits' },
                  { icon: '🔄', label: 'Current Job', value: 'None', note: 'Active pickup' },
                ].map((s, i) => <StatCard key={i} {...s} color={cfg.color} />)}

                {role === 'ROLE_ADMIN' && [
                  { icon: '⚡', label: 'Audit Actions', value: '—', note: 'Total logged actions' },
                  { icon: '✅', label: 'Trucks Verified', value: '—', note: 'Approved this month' },
                  { icon: '🚦', label: 'Shipments Assigned', value: '—', note: 'Total assignments' },
                  { icon: '🏢', label: 'Platform Revenue', value: '₹ —', note: 'All-time fees' },
                ].map((s, i) => <StatCard key={i} {...s} color={cfg.color} />)}
              </div>

              <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px dashed var(--border-light)', textAlign: 'center' }}>
                <FaArrowUp size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Detailed analytics and charts will be available in Phase 3 with the live tracking dashboard.
                </p>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 5: HELP & FAQ
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'help' && (
            <div className="glass-card">
              <h3 className="form-section-title" style={{ marginBottom: '1rem' }}>
                <FaBookOpen size={20} /> Help Centre & FAQ
              </h3>

              <input
                className="form-input"
                placeholder="🔍 Search FAQ guides..."
                value={faqSearch}
                onChange={e => setFaqSearch(e.target.value)}
                style={{ marginBottom: '1.25rem' }}
              />

              {filteredFaqs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <FaInfoCircle size={32} style={{ marginBottom: '0.5rem' }} />
                  <p>No guides match your search.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {filteredFaqs.map((faq, i) => (
                    <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{
                        border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)',
                        overflow: 'hidden', cursor: 'pointer',
                        borderLeft: openFaq === i ? `3px solid ${cfg.color}` : '3px solid transparent',
                        transition: 'all 0.2s ease'
                      }}>
                      <div style={{ padding: '0.9rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '0.92rem' }}>
                        <span>{faq.question}</span>
                        {openFaq === i ? <FaChevronUp size={16} style={{ color: cfg.color }} /> : <FaChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                      </div>
                      {openFaq === i && (
                        <div style={{ padding: '0 1rem 0.9rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border-light)' }}>
                          <p style={{ marginTop: '0.75rem' }}>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: `${cfg.bg}`, borderRadius: 'var(--radius-md)', border: `1px solid ${cfg.color}30` }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Still need help?
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('contact')} style={{ background: cfg.color }}>
                  <FaEnvelope size={14} /> Contact Admin Team
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 6: CONTACT ADMIN
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'contact' && (
            <div className="glass-card">
              <h3 className="form-section-title" style={{ marginBottom: '1.25rem' }}>
                <FaShieldVirus size={20} /> Contact Platform Support
              </h3>

              {contactTicket ? (
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <FaCheckCircle size={40} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
                  <h4 style={{ fontWeight: 800, marginBottom: '0.25rem', color: '#10b981' }}>Request Submitted!</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Your ticket ID is</p>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', background: 'rgba(0,0,0,0.04)', padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-sm)', display: 'inline-block' }}>
                    {contactTicket}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.75rem' }}>The admin team will reach out within 24 hours.</p>
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }} onClick={() => setContactTicket('')}>
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
                  <form onSubmit={handleContact}>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-select" value={contactForm.category} onChange={e => setContactForm(p => ({ ...p, category: e.target.value }))}>
                        <option>Technical Support</option>
                        <option>Payment &amp; Billing</option>
                        <option>Shipment Issue</option>
                        <option>Account Moderation</option>
                        <option>Security Concern</option>
                        <option>Feature Request</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <input className="form-input" value={contactForm.subject} onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))} placeholder="Brief summary of your request..." required />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Message</label>
                      <textarea rows={5} className="form-textarea" value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} placeholder="Describe your issue in detail..." required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                      <FaPaperPlane size={16} /> Submit Request
                    </button>
                  </form>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { icon: FaPhone, label: 'Helpline', value: '+91 1800 555 0199', sub: 'Mon–Sat, 9am–6pm IST' },
                      { icon: FaEnvelope, label: 'Email', value: 'support@easyroute.com', sub: 'Response within 24 hrs' },
                      { icon: FaMapMarkerAlt, label: 'HQ', value: 'Tower C, Outer Ring Road', sub: 'Bengaluru, KA 560103' },
                    ].map(({ icon: Icon, label, value, sub }, i) => (
                      <div key={i} style={{ background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          <Icon size={14} style={{ color: cfg.color }} /> {label}
                        </div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{value}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ─── Stat Card Helper Component ─────────────────────────────────────────────

const StatCard = ({ icon, label, value, note, color }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center',
    transition: 'all 0.2s ease',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = color + '40'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
  >
    <div style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>{icon}</div>
    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{note}</div>
  </div>
);

export default Profile;
