'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS = {
  confirmed: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', bar: '#16a34a', label: 'Confirmed' },
  pending:   { bg: '#fffbeb', color: '#b45309', border: '#fde68a', bar: '#f59e0b', label: 'Pending'   },
  cancelled: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', bar: '#ef4444', label: 'Cancelled' },
};

export default function AdminDashboard({ onPendingCount }) {
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [dateFilter, setDateFilter]   = useState('all');       // 'all' | 'today'
  const [statusFilter, setStatusFilter] = useState('all');     // 'all' | 'pending' | 'confirmed' | 'cancelled'
  const [search, setSearch]           = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);   // { id, action: 'confirming'|'cancelling' }
  const [maxSlot, setMaxSlot]       = useState(null);
  const [maxInput, setMaxInput]     = useState('');
  const [maxEditing, setMaxEditing] = useState(false);
  const [maxSaving, setMaxSaving]   = useState(false);
  const audioRef = useRef(null);

  const getBangkokToday = () =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());

  useEffect(() => {
    fetch('/api/admin/booking-settings')
      .then(r => r.json())
      .then(d => { if (d.max_bookings_per_slot) { setMaxSlot(d.max_bookings_per_slot); setMaxInput(String(d.max_bookings_per_slot)); } });
  }, []);

  const saveMaxSlot = async () => {
    const val = parseInt(maxInput, 10);
    if (!val || val < 1 || val > 500) return;
    setMaxSaving(true);
    const res = await fetch('/api/admin/booking-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ max_bookings_per_slot: val }),
    });
    const data = await res.json();
    if (data.success) { setMaxSlot(data.max_bookings_per_slot); setMaxEditing(false); }
    else alert('Failed: ' + (data.error || 'unknown error'));
    setMaxSaving(false);
  };

  useEffect(() => {
    supabase.from('bookings').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => { if (!error) setBookings(data ?? []); setLoading(false); });

    const refetch = () =>
      supabase.from('bookings').select('*').order('created_at', { ascending: false })
        .then(({ data }) => { if (data) setBookings(data); });

    const ch = supabase.channel('admin-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, ({ eventType, new: n, old: o }) => {
        if      (eventType === 'INSERT') { setBookings(p => [n, ...p]); audioRef.current?.play().catch(() => {}); }
        else if (eventType === 'UPDATE') { setBookings(p => p.map(b => b.id === n.id ? n : b)); }
        else if (eventType === 'DELETE') { setBookings(p => p.filter(b => b.id !== o.id)); }
      })
      .subscribe(status => {
        // Refetch on reconnect to catch any events missed while offline
        if (status === 'SUBSCRIBED') refetch();
      });

    return () => supabase.removeChannel(ch);
  }, []);

  const updateStatus = async (id, status) => {
    setActionLoading({ id, action: status === 'confirmed' ? 'confirming' : 'cancelling' });
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) alert('Update failed: ' + error.message);
    setActionLoading(null);
  };

  const deleteBooking = async (id) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) alert('Delete failed: ' + error.message);
    setConfirmDelete(null);
  };

  const toggleStatusFilter = (s) => setStatusFilter(prev => prev === s ? 'all' : s);

  const filtered = bookings
    .filter(b => dateFilter === 'today' ? b.date === getBangkokToday() : true)
    .filter(b => statusFilter === 'all' ? true : b.status === statusFilter)
    .filter(b => {
      if (!search) return true;
      const q = search.toLowerCase();
      return b.name?.toLowerCase().includes(q) || b.email?.toLowerCase().includes(q) || b.phone?.includes(q);
    });

  const counts = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  useEffect(() => { onPendingCount?.(counts.pending); }, [counts.pending]);

  const F = 'var(--font-montserrat)';

  const STATS = [
    { key: 'all',       label: 'Total',     value: counts.total,     accent: '#3E2723', ring: '#3E2723', light: '#F9FAFB' },
    { key: 'pending',   label: 'Pending',   value: counts.pending,   accent: '#b45309', ring: '#f59e0b', light: '#fffbeb' },
    { key: 'confirmed', label: 'Confirmed', value: counts.confirmed, accent: '#15803d', ring: '#16a34a', light: '#f0fdf4' },
    { key: 'cancelled', label: 'Cancelled', value: counts.cancelled, accent: '#b91c1c', ring: '#ef4444', light: '#fef2f2' },
  ];

  return (
    <div className="admin-dash" style={{ fontFamily: F, background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #E5E7EB', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <style>{`
        @media (max-width: 768px) {
          .admin-dash { padding: 16px !important; border-radius: 12px !important; }
          .admin-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .admin-cards-grid { grid-template-columns: 1fr !important; }
          .admin-toolbar { flex-direction: column !important; }
          .admin-capacity { flex-wrap: wrap !important; }
        }
        @media (max-width: 480px) {
          .admin-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 6px !important; }
          .admin-stats-grid button { padding: 12px 14px !important; }
          .admin-stats-grid button p:last-child { font-size: 24px !important; }
        }
      `}</style>
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />

      {/* ── Booking Capacity Setting ── */}
      <div className="admin-capacity" style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px',
        padding: '12px 18px', marginBottom: '20px',
      }}>
        <span style={{ fontSize: '16px' }}>⚙️</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#374151' }}>Max bookings per time slot: </span>
          {maxEditing ? (
            <input
              type="number" min="1" max="500"
              value={maxInput}
              onChange={e => setMaxInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveMaxSlot(); if (e.key === 'Escape') { setMaxEditing(false); setMaxInput(String(maxSlot)); } }}
              autoFocus
              style={{
                width: '64px', padding: '3px 8px', borderRadius: '6px',
                border: '1.5px solid #3E2723', fontFamily: F, fontSize: '13px',
                fontWeight: 800, color: '#3E2723', outline: 'none',
              }}
            />
          ) : (
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#3E2723' }}>
              {maxSlot ?? '…'}
            </span>
          )}
          <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '6px' }}>bookings / slot</span>
        </div>
        {maxEditing ? (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={saveMaxSlot} disabled={maxSaving} style={{
              padding: '5px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer',
              background: '#15803d', color: '#fff', fontSize: '12px', fontWeight: 800, fontFamily: F,
            }}>
              {maxSaving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => { setMaxEditing(false); setMaxInput(String(maxSlot)); }} style={{
              padding: '5px 12px', borderRadius: '7px', cursor: 'pointer',
              background: '#fff', border: '1px solid #E5E7EB', color: '#6B7280',
              fontSize: '12px', fontWeight: 700, fontFamily: F,
            }}>
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setMaxEditing(true)} style={{
            padding: '5px 14px', borderRadius: '7px', cursor: 'pointer',
            background: '#fff', border: '1.5px solid #E5E7EB', color: '#374151',
            fontSize: '12px', fontWeight: 700, fontFamily: F,
          }}>
            ✏️ Edit
          </button>
        )}
      </div>

      {/* ── Stats (clickable filters) ── */}
      <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
        {STATS.map(s => {
          const active = statusFilter === s.key;
          return (
            <button
              key={s.key}
              onClick={() => toggleStatusFilter(s.key)}
              style={{
                background: active ? s.light : '#fff',
                border: active ? `2px solid ${s.ring}` : '1.5px solid #E5E7EB',
                borderRadius: '14px',
                padding: '16px 20px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: active ? `0 0 0 3px ${s.ring}22` : 'none',
                fontFamily: F,
              }}
            >
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
              <p style={{ margin: '6px 0 0', fontSize: '30px', fontWeight: 900, color: s.accent, lineHeight: 1 }}>{s.value}</p>
              {active && s.key !== 'all' && (
                <p style={{ margin: '4px 0 0', fontSize: '10px', fontWeight: 700, color: s.accent }}>● Filtering active</p>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="admin-toolbar" style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', pointerEvents: 'none', opacity: 0.4 }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 38px', border: '1.5px solid #E5E7EB',
              borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#111827',
              fontFamily: F, outline: 'none', background: '#F9FAFB', boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '10px', padding: '4px', gap: '4px' }}>
          {[['all', 'All Time'], ['today', 'Today']].map(([val, label]) => (
            <button key={val} onClick={() => setDateFilter(val)} style={{
              padding: '7px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontFamily: F, fontSize: '12px', fontWeight: 800, transition: 'all 0.15s',
              background: dateFilter === val ? '#111827' : 'transparent',
              color:      dateFilter === val ? '#fff'    : '#6B7280',
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter pill */}
      {statusFilter !== 'all' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>Showing:</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
            background: STATUS[statusFilter]?.bg, color: STATUS[statusFilter]?.color,
            border: `1px solid ${STATUS[statusFilter]?.border}`,
          }}>
            {STATUS[statusFilter]?.label} ({filtered.length})
            <button onClick={() => setStatusFilter('all')} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              color: STATUS[statusFilter]?.color, fontWeight: 900, fontSize: '13px', lineHeight: 1,
            }}>×</button>
          </span>
        </div>
      )}

      {/* ── Cards ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#6B7280' }}>
          <div style={{ width: '36px', height: '36px', borderTop: '3px solid #111827', borderRight: '3px solid #E5E7EB', borderBottom: '3px solid #E5E7EB', borderLeft: '3px solid #E5E7EB', borderRadius: '50%', animation: 'adminspin 0.7s linear infinite', margin: '0 auto 14px' }} />
          <p style={{ fontWeight: 700, fontSize: '13px', margin: 0 }}>Loading bookings…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 40px', border: '2px dashed #E5E7EB', borderRadius: '16px', background: '#F9FAFB' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌮</div>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>No bookings found</h3>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, fontWeight: 500 }}>
            {statusFilter !== 'all' ? `No ${statusFilter} bookings.` : dateFilter === 'today' ? 'No reservations today.' : search ? 'No results match your search.' : 'Waiting for the first reservation!'}
          </p>
        </div>
      ) : (
        <div className="admin-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
          <AnimatePresence mode="sync">
            {filtered.map(b => {
              const s = STATUS[b.status] || STATUS.pending;
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  style={{
                    background: '#fff',
                    borderRadius: '14px',
                    borderTop: `3px solid ${s.bar}`,
                    borderRight: '1.5px solid #E5E7EB',
                    borderBottom: '1.5px solid #E5E7EB',
                    borderLeft: '1.5px solid #E5E7EB',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  {/* Card body */}
                  <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>

                    {/* Name + Status badge */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                          background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '17px', fontWeight: 900, color: s.color,
                        }}>
                          {b.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#111827' }}>{b.name}</p>
                          <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>Guest</p>
                        </div>
                      </div>
                      <span style={{
                        padding: '3px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: 800,
                        textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0, marginTop: '2px',
                        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                      }}>
                        {s.label}
                      </span>
                    </div>

                    {/* Divider */}
                    <div style={{ borderTop: '1px solid #F3F4F6' }} />

                    {/* Contact */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <span style={{ fontSize: '12px', color: '#9CA3AF', flexShrink: 0 }}>✉</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', wordBreak: 'break-all' }}>{b.email}</span>
                      </div>
                      {b.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <span style={{ fontSize: '12px', color: '#9CA3AF', flexShrink: 0 }}>📞</span>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{b.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Date / Time / Guests */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { icon: '📅', val: b.date },
                        { icon: '🕐', val: b.time?.slice(0, 5) },
                        { icon: '👥', val: `${b.party_size} guests` },
                      ].map(({ icon, val }) => (
                        <span key={val} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '4px 10px', borderRadius: '7px',
                          background: '#F9FAFB', border: '1px solid #E5E7EB',
                          fontSize: '11px', fontWeight: 700, color: '#374151',
                        }}>
                          {icon} {val}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer – action buttons */}
                  {confirmDelete === b.id ? (
                    // Inline delete confirmation
                    <div style={{ padding: '10px 18px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#b91c1c', textAlign: 'center' }}>
                        Delete this booking?
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => deleteBooking(b.id)}
                          style={{
                            flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: '#b91c1c', color: '#fff', fontSize: '12px', fontWeight: 800, fontFamily: F,
                          }}
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          style={{
                            flex: 1, padding: '8px 0', borderRadius: '8px', cursor: 'pointer',
                            background: '#fff', color: '#374151', border: '1.5px solid #E5E7EB',
                            fontSize: '12px', fontWeight: 700, fontFamily: F,
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '10px 18px 14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {b.status !== 'confirmed' && (() => {
                        const busy = actionLoading?.id === b.id && actionLoading?.action === 'confirming';
                        return (
                          <button
                            onClick={() => updateStatus(b.id, 'confirmed')}
                            disabled={!!actionLoading?.id}
                            style={{
                              flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none',
                              cursor: actionLoading?.id ? 'not-allowed' : 'pointer',
                              background: '#15803d', color: '#fff', fontSize: '12px', fontWeight: 800,
                              fontFamily: F, letterSpacing: '0.03em',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                              opacity: actionLoading?.id && !busy ? 0.5 : 1,
                            }}
                          >
                            {busy
                              ? <span style={{ width: '13px', height: '13px', borderRadius: '50%', borderTop: '2px solid #fff', borderRight: '2px solid rgba(255,255,255,0.25)', borderBottom: '2px solid rgba(255,255,255,0.25)', borderLeft: '2px solid rgba(255,255,255,0.25)', animation: 'adminspin 0.6s linear infinite', display: 'inline-block' }} />
                              : '✓ Confirm'}
                          </button>
                        );
                      })()}
                      {b.status !== 'cancelled' && (() => {
                        const busy = actionLoading?.id === b.id && actionLoading?.action === 'cancelling';
                        return (
                          <button
                            onClick={() => updateStatus(b.id, 'cancelled')}
                            disabled={!!actionLoading?.id}
                            style={{
                              flex: 1, padding: '8px 0', borderRadius: '8px', cursor: actionLoading?.id ? 'not-allowed' : 'pointer',
                              fontSize: '12px', fontWeight: 800, fontFamily: F, letterSpacing: '0.03em',
                              background: '#fff', color: '#b91c1c', border: '1.5px solid #fecaca',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                              opacity: actionLoading?.id && !busy ? 0.5 : 1,
                            }}
                          >
                            {busy
                              ? <span style={{ width: '13px', height: '13px', borderRadius: '50%', borderTop: '2px solid #b91c1c', borderRight: '2px solid rgba(185,28,28,0.2)', borderBottom: '2px solid rgba(185,28,28,0.2)', borderLeft: '2px solid rgba(185,28,28,0.2)', animation: 'adminspin 0.6s linear infinite', display: 'inline-block' }} />
                              : '✕ Cancel'}
                          </button>
                        );
                      })()}
                      <button
                        onClick={() => setConfirmDelete(b.id)}
                        style={{
                          padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
                          background: '#fff', border: '1.5px solid #E5E7EB', color: '#9CA3AF',
                          fontSize: '14px', lineHeight: 1,
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <style>{`
        @keyframes adminspin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
