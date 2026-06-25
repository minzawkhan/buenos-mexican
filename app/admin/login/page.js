'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError('Incorrect email or password.');
      setLoading(false);
    } else {
      router.push('/admin');
    }
  };

  const F = "'Inter', 'Helvetica Neue', Arial, sans-serif";

  return (
    <div style={{
      minHeight: '100vh', background: '#FAF6F2',
      fontFamily: F, WebkitFontSmoothing: 'antialiased',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', background: '#fff',
        borderRadius: '20px', border: '1px solid #E8E0D8',
        boxShadow: '0 4px 32px rgba(62,39,35,0.08)', padding: '40px 36px',
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 400, color: '#FF3333', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Buenos Mexican
          </h1>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 400, color: '#A08070', letterSpacing: '0.03em' }}>
            Admin · Sign in
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700, color: '#5D4037' }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com" required autoComplete="email" autoFocus
              style={{ padding: '13px 16px', borderRadius: '10px', border: '1.5px solid #D6C9BE', fontSize: '15px', fontWeight: 500, color: '#3E2723', fontFamily: 'inherit', outline: 'none', background: '#FAF6F2', transition: 'border-color 0.15s, box-shadow 0.15s' }}
              onFocus={e => { e.target.style.borderColor = '#8C7365'; e.target.style.boxShadow = '0 0 0 3px rgba(140,115,101,0.12)'; e.target.style.background = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = '#D6C9BE'; e.target.style.boxShadow = 'none'; e.target.style.background = '#FAF6F2'; }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700, color: '#5D4037' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••" required autoComplete="current-password"
                style={{ width: '100%', padding: '13px 48px 13px 16px', borderRadius: '10px', border: '1.5px solid #D6C9BE', fontSize: '15px', fontWeight: 500, color: '#3E2723', fontFamily: 'inherit', outline: 'none', background: '#FAF6F2', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                onFocus={e => { e.target.style.borderColor = '#8C7365'; e.target.style.boxShadow = '0 0 0 3px rgba(140,115,101,0.12)'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#D6C9BE'; e.target.style.boxShadow = 'none'; e.target.style.background = '#FAF6F2'; }}
              />
              <button
                type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#A0897C', padding: '4px', lineHeight: 1 }}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', fontSize: '14px', fontWeight: 600, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{ marginTop: '4px', padding: '14px', borderRadius: '12px', border: 'none', background: loading ? '#C4A99A' : '#3E2723', color: '#FDF6EE', fontSize: '16px', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em', boxShadow: loading ? 'none' : '0 4px 16px rgba(62,39,35,0.22)', transition: 'background 0.15s' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
