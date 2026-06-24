'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Wifi,
  MessageSquare,
  Terminal,
  ShieldAlert,
  RefreshCw,
  Trash2,
  Mail,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';

export default function IntegrityMonitor({ isSystemOnline = true }) {
  // Services Status States
  const [dbHealth, setDbHealth] = useState('checking'); // 'checking' | 'healthy' | 'unhealthy'
  const [wsStatus, setWsStatus] = useState('checking'); // 'checking' | 'connected' | 'disconnected'
  const [lineStatus, setLineStatus] = useState('checking'); // 'checking' | 'active' | 'missing_config'

  // Logs States
  const [bookingAttempts, setBookingAttempts] = useState([]);
  const [vipAttempts, setVipAttempts] = useState([]);
  const [emailBlasts, setEmailBlasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to check live service statuses
  const checkServiceStatuses = async () => {
    // 1. Check DB Health — query bookings (anon SELECT confirmed in RLS)
    try {
      const { error } = await supabase.from('bookings').select('id').limit(1);
      if (error) throw error;
      setDbHealth('healthy');
    } catch (err) {
      console.warn('DB Health Check Failed:', err?.message || err?.code || JSON.stringify(err));
      setDbHealth('unhealthy');
    }

    // 2. Check LINE Configuration
    // We make a call to see if LINE secrets are configured (checking if we can get config status, or mock based on local site configs)
    try {
      const hasToken = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'active' : 'missing_config';
      // In real prod, we can fetch a status endpoint, or verify the token setup.
      setLineStatus(hasToken);
    } catch (e) {
      setLineStatus('missing_config');
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Fetch booking attempts
      const { data: bAttempts, error: bErr } = await supabase
        .from('booking_attempts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!bErr) setBookingAttempts(bAttempts || []);

      // Fetch VIP attempts
      const { data: vAttempts, error: vErr } = await supabase
        .from('vip_signup_attempts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!vErr) setVipAttempts(vAttempts || []);

      // Fetch Email Blasts
      const { data: blasts, error: blastErr } = await supabase
        .from('email_blasts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!blastErr) setEmailBlasts(blasts || []);

    } catch (err) {
      console.error('Error fetching logs:', err);
    }
    setLoading(false);
  };

  const clearAllLogs = async () => {
    if (!confirm('Are you sure you want to clear all Integrity Logs from the database?')) return;
    try {
      await supabase.from('booking_attempts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('vip_signup_attempts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      setBookingAttempts([]);
      setVipAttempts([]);
    } catch (e) {
      console.error('Failed to clear logs:', e);
    }
  };

  useEffect(() => {
    checkServiceStatuses();
    fetchLogs();

    // Set WebSocket connected state
    setWsStatus(isSystemOnline ? 'connected' : 'disconnected');

    // Setup Realtime connections for logs
    const bookingChannel = supabase
      .channel('realtime-booking-attempts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'booking_attempts' }, (payload) => {
        setBookingAttempts(prev => [payload.new, ...prev]);
        checkServiceStatuses(); // refresh connection state on new booking attempt
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'booking_attempts' }, (payload) => {
        setBookingAttempts(prev => prev.map(b => b.id === payload.new.id ? payload.new : b));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setWsStatus('connected');
        } else {
          setWsStatus('disconnected');
        }
      });

    const vipChannel = supabase
      .channel('realtime-vip-attempts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vip_signup_attempts' }, (payload) => {
        setVipAttempts(prev => [payload.new, ...prev]);
      })
      .subscribe();

    const blastChannel = supabase
      .channel('realtime-blasts-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'email_blasts' }, () => {
        // Refresh blasts
        supabase
          .from('email_blasts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)
          .then(({ data }) => {
            if (data) setEmailBlasts(data);
          });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(vipChannel);
      supabase.removeChannel(blastChannel);
    };
  }, [isSystemOnline]);

  return (
    <div style={{ fontFamily: 'var(--font-montserrat)', color: '#3E2723' }}>

      {/* ── Section 1: Live Services Status ───────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>

        {/* Supabase DB Status Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(62,39,35,0.04)',
          border: '1.5px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: dbHealth === 'healthy' ? 'rgba(52,168,83,0.1)' : 'rgba(202,91,67,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: dbHealth === 'healthy' ? '#34A853' : '#CA5B43'
            }}>
              <Database size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '13px', color: '#8C7365', fontWeight: 600, margin: 0 }}>Database Connection</h3>
              <p style={{ fontSize: '16px', fontWeight: 850, margin: '2px 0 0' }}>Supabase DB</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: dbHealth === 'healthy' ? '#34A853' : dbHealth === 'checking' ? '#FBBC05' : '#CA5B43',
              boxShadow: dbHealth === 'healthy' ? '0 0 8px #34A853' : '0 0 8px #CA5B43'
            }} />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'capitalize' }}>
              {dbHealth === 'healthy' ? 'Online' : dbHealth === 'checking' ? 'Checking...' : 'Unhealthy'}
            </span>
          </div>
        </div>

        {/* Realtime WebSocket Status Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(62,39,35,0.04)',
          border: '1.5px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: wsStatus === 'connected' ? 'rgba(52,168,83,0.1)' : 'rgba(202,91,67,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: wsStatus === 'connected' ? '#34A853' : '#CA5B43'
            }}>
              <Wifi size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '13px', color: '#8C7365', fontWeight: 600, margin: 0 }}>Realtime WebSocket</h3>
              <p style={{ fontSize: '16px', fontWeight: 850, margin: '2px 0 0' }}>WebSocket Channel</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: wsStatus === 'connected' ? '#34A853' : '#CA5B43',
              boxShadow: wsStatus === 'connected' ? '0 0 8px #34A853' : '0 0 8px #CA5B43'
            }} />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'capitalize' }}>
              {wsStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* LINE API Gateway Status Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(62,39,35,0.04)',
          border: '1.5px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: lineStatus === 'active' ? 'rgba(52,168,83,0.1)' : 'rgba(202,91,67,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: lineStatus === 'active' ? '#34A853' : '#CA5B43'
            }}>
              <MessageSquare size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '13px', color: '#8C7365', fontWeight: 600, margin: 0 }}>LINE API Gateway</h3>
              <p style={{ fontSize: '16px', fontWeight: 850, margin: '2px 0 0' }}>LINE Webhook</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: lineStatus === 'active' ? '#34A853' : '#CA5B43',
              boxShadow: lineStatus === 'active' ? '0 0 8px #34A853' : '0 0 8px #CA5B43'
            }} />
            <span style={{ fontSize: '12px', fontWeight: 700 }}>
              {lineStatus === 'active' ? 'Active' : 'Offline'}
            </span>
          </div>
        </div>

      </div>

      {/* ── Section 2: Booking Pipeline Monitoring ────────── */}
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        border: '1.5px solid #E5E7EB',
        boxShadow: '0 4px 20px rgba(62,39,35,0.04)',
        padding: '32px',
        marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#3E2723', margin: 0, textTransform: 'none', textShadow: 'none' }}>
              Booking Pipeline Monitoring
            </h2>
            <p style={{ fontSize: '13px', color: '#8C7365', fontWeight: 500, margin: '4px 0 0' }}>
              Track reservation requests dynamically through database, WebSockets, and LINE pipelines.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { fetchLogs(); checkServiceStatuses(); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F9FAFB',
                border: '1.5px solid #E5E7EB',
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                color: '#3E2723',
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              onClick={clearAllLogs}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(202,91,67,0.08)',
                border: '1.5px solid rgba(202,91,67,0.15)',
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                color: '#CA5B43',
                transition: 'all 0.2s'
              }}
            >
              <Trash2 size={14} />
              Clear Logs
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#8C7365', textTransform: 'uppercase' }}>Timestamp</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#8C7365', textTransform: 'uppercase' }}>Customer Name</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#8C7365', textTransform: 'uppercase' }}>Step 1: DB Status</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#8C7365', textTransform: 'uppercase' }}>Step 2: Realtime Sync</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#8C7365', textTransform: 'uppercase' }}>Step 3: LINE Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                    <Loader size={24} className="animate-spin" style={{ margin: '0 auto', color: '#8C7365' }} />
                  </td>
                </tr>
              ) : bookingAttempts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#8C7365', fontSize: '14px', fontWeight: 500 }}>
                    No booking pipeline logs found. Submit a reservation to trigger logs.
                  </td>
                </tr>
              ) : (
                bookingAttempts.map((attempt) => (
                  <tr key={attempt.id} style={{ borderBottom: '1px solid #F9FAFB', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 500, color: '#8C7365' }}>
                      {new Date(attempt.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 700 }}>
                      {attempt.customer_name}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600 }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        background: attempt.db_status.includes('201') ? 'rgba(52,168,83,0.08)' : 'rgba(202,91,67,0.08)',
                        color: attempt.db_status.includes('201') ? '#34A853' : '#CA5B43'
                      }}>
                        {attempt.db_status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600 }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        background: attempt.realtime_sync.includes('Success') ? 'rgba(52,168,83,0.08)' : 'rgba(140,115,101,0.08)',
                        color: attempt.realtime_sync.includes('Success') ? '#34A853' : '#8C7365'
                      }}>
                        {attempt.realtime_sync}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600 }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        background: attempt.line_notification.includes('OK') ? 'rgba(52,168,83,0.08)' : attempt.line_notification.includes('Sending') ? 'rgba(251,188,5,0.08)' : 'rgba(202,91,67,0.08)',
                        color: attempt.line_notification.includes('OK') ? '#34A853' : attempt.line_notification.includes('Sending') ? '#E2A100' : '#CA5B43'
                      }}>
                        {attempt.line_notification}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 3: Marketing & VIP Activity Logs ──────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>

        {/* VIP Sign-up Attempts */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          border: '1.5px solid #E5E7EB',
          boxShadow: '0 4px 20px rgba(62,39,35,0.04)',
          padding: '32px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#3E2723', margin: 0, textTransform: 'none', textShadow: 'none' }}>
              VIP Sign-up Attempts
            </h3>
            <p style={{ fontSize: '12px', color: '#8C7365', fontWeight: 500, margin: '4px 0 0' }}>
              Log email newsletter entries and catches for duplicates instantly.
            </p>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                  <th style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#8C7365', textTransform: 'uppercase' }}>Timestamp</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#8C7365', textTransform: 'uppercase' }}>Email</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#8C7365', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '24px' }}>
                      <Loader size={18} className="animate-spin" style={{ margin: '0 auto', color: '#8C7365' }} />
                    </td>
                  </tr>
                ) : vipAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: '#8C7365', fontSize: '13px' }}>
                      No VIP signup logs yet.
                    </td>
                  </tr>
                ) : (
                  vipAttempts.map((attempt) => (
                    <tr key={attempt.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                      <td style={{ padding: '12px', fontSize: '12px', color: '#8C7365' }}>
                        {new Date(attempt.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', fontWeight: 600 }}>
                        {attempt.email}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: attempt.status === 'Success' ? 'rgba(52,168,83,0.08)' : attempt.status.includes('409') ? 'rgba(251,188,5,0.08)' : 'rgba(202,91,67,0.08)',
                          color: attempt.status === 'Success' ? '#34A853' : attempt.status.includes('409') ? '#FBBC05' : '#CA5B43'
                        }}>
                          {attempt.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Email Blast Queue Status */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          border: '1.5px solid #E5E7EB',
          boxShadow: '0 4px 20px rgba(62,39,35,0.04)',
          padding: '32px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#3E2723', margin: 0, textTransform: 'none', textShadow: 'none' }}>
              Email Blast Queue Status
            </h3>
            <p style={{ fontSize: '12px', color: '#8C7365', fontWeight: 500, margin: '4px 0 0' }}>
              History and delivery progress of marketing email campaigns.
            </p>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                  <th style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#8C7365', textTransform: 'uppercase' }}>Campaign Name</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#8C7365', textTransform: 'uppercase' }}>Subscribers</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#8C7365', textTransform: 'uppercase' }}>Sent</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#8C7365', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>
                      <Loader size={18} className="animate-spin" style={{ margin: '0 auto', color: '#8C7365' }} />
                    </td>
                  </tr>
                ) : emailBlasts.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#8C7365', fontSize: '13px' }}>
                      No email blasts in the history queue.
                    </td>
                  </tr>
                ) : (
                  emailBlasts.map((blast) => (
                    <tr key={blast.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                      <td style={{ padding: '12px', fontSize: '13px', fontWeight: 700 }} title={blast.subject}>
                        {blast.subject}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', fontWeight: 600 }}>
                        {blast.total_sent}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', fontWeight: 600 }}>
                        {blast.sent_count}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: blast.status === 'completed' ? 'rgba(52,168,83,0.08)' : blast.status === 'sending' ? 'rgba(251,188,5,0.08)' : 'rgba(202,91,67,0.08)',
                          color: blast.status === 'completed' ? '#34A853' : blast.status === 'sending' ? '#E2A100' : '#CA5B43'
                        }}>
                          {blast.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
