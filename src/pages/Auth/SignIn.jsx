/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import { Key, ArrowRight, Eye, EyeOff } from 'lucide-react';
import snsLogo from '../../assets/logos/app-logo.png';

/* ─── Floating orb decoration ─────────────────────────────────────────────── */
function Orb({ className }) {
  return <div className={`absolute rounded-full pointer-events-none ${className}`} />;
}

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Force light mode — strip 'dark' class from <html> while this page is mounted
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.remove('dark');
    return () => { if (wasDark) root.classList.add('dark'); };
  }, []);

  const isDark = false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Ensure email contains @
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    // Forward email + password to POST /api/auth/sso-login → external Okrion SSO
    const res = await login({ email, password });
    setIsLoading(false);
    if (res.success) {

      if (res.user.role?.toLowerCase() === 'developer') {

        navigate('/developer/assign-role');

      } else if (
        res.user.admin === true ||
        res.user.temp_admin === true
      ) {

        navigate('/admin/dashboard');

      } else {

        navigate('/faculty/upload');

      }

    } else {

      setError(res.error);

    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8">

      {/* ── Animated background ──────────────────────────────────────────── */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #0a0a0a 0%, #121212 40%, #1a1a1a 70%, #0a0a0a 100%)'
            : 'linear-gradient(135deg, #e8edf5 0%, #dde4f0 40%, #e4e8f8 70%, #edf0fa 100%)',
        }}
      />

      {/* Mesh hex pattern overlay */}
      <div className="absolute inset-0 hex-grid opacity-60 pointer-events-none" />

      {/* Animated orbs */}
      <Orb className={`w-120 h-120 -top-30 -left-20 animate-float-slow
        ${isDark
          ? 'bg-emerald-900/10 blur-[100px]'
          : 'bg-indigo-200/50 blur-[90px]'}`}
      />
      <Orb className={`w-90 h-90 -bottom-20 -right-15 animate-float-med
        ${isDark
          ? 'bg-slate-800/30 blur-[90px]'
          : 'bg-violet-200/40 blur-[80px]'}`}
      />
      <Orb className={`w-55 h-55 top-[30%] right-[10%] animate-float-fast
        ${isDark
          ? 'bg-emerald-900/10 blur-[70px]'
          : 'bg-blue-200/35 blur-[60px]'}`}
      />



      {/* ── Glass card ───────────────────────────────────────────────────── */}
      <div
        className="relative z-10 w-full max-w-sm sm:max-w-md animate-card-entrance rounded-3xl"
        style={{
          background: isDark
            ? 'rgba(18, 18, 18, 0.72)'
            : 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(28px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
          border: isDark
            ? '1px solid rgba(255,255,255,0.05)'
            : '1px solid rgba(255,255,255,0.9)',
          boxShadow: isDark
            ? '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.03)'
            : '0 32px 80px rgba(100,116,139,0.18), 0 0 0 1px rgba(255,255,255,0.6), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {/* Shimmer top edge — own overflow-hidden so it clips to rounded corners */}
        <div className="h-0.5 w-full overflow-hidden rounded-t-3xl">
          <div className="h-full w-full gradient-strip opacity-60" />
        </div>

        {/* ── Header brand section ─────────────────────────────────────── */}
        <div className="pt-8 pb-6 px-8 text-center relative">
          {/* Glow behind logo */}
          <div
            className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />

          {/* SNS Logo — real asset, www text naturally absent in stored file */}
          <div className="relative inline-block mb-4">
            <div
              className="p-3 rounded-2xl inline-flex animate-pulse-ring"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
                boxShadow: isDark
                  ? '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)'
                  : '0 4px 24px rgba(100,116,139,0.12), inset 0 1px 0 rgba(255,255,255,1)',
              }}
            >
              <img
                src={snsLogo}
                alt="SNS Institutions"
                className="w-32 sm:w-40 h-auto object-contain drop-shadow-sm"
                draggable={false}
              />
            </div>
          </div>

          {/* Tagline */}
          <p
            className="text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase mt-1"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
          >
            Research Publication Management
          </p>

          {/* Divider */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest px-2"
              style={{ color: isDark ? '#334155' : '#cbd5e1' }}>Secure Portal</span>
            <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }} />
          </div>
        </div>

        {/* ── Form section ─────────────────────────────────────────────── */}
        <div className="px-6 sm:px-8 pb-8">

          {/* Error alert */}
          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold animate-fade-up"
              style={{
                background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: isDark ? '#f87171' : '#dc2626',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5 animate-fade-up-d1">
              <label
                className="text-[10px] font-bold uppercase tracking-[0.15em] ml-1"
                style={{ color: isDark ? '#475569' : '#94a3b8' }}
              >
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                value={email}
                autoComplete="username"
                onChange={(e) => setEmail(e.target.value)}
                className="signin-input w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300"
                placeholder="e.g. kumar@snsgroups.com"
                required
              />
            </div>

            {/* Password field */}
            <div className="space-y-1.5 animate-fade-up-d2">
              <label
                className="block text-[10px] font-bold uppercase tracking-[0.15em] ml-1"
                style={{ color: isDark ? '#475569' : '#94a3b8' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="signin-input w-full px-4 py-3.5 pr-12 rounded-xl text-sm font-medium transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors cursor-pointer"
                  style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end">
                <a
                  href="https://app.okrion.ai/forgot-password"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold uppercase tracking-[0.05em] text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            </div>


            {/* Submit button */}
            <div className="animate-fade-up-d3 pt-2">
              <button
                id="signin-submit"
                type="submit"
                disabled={isLoading}
                className="shimmer-btn w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-bold text-sm text-white transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: isDark
                    ? (isLoading
                      ? 'linear-gradient(135deg, #047857, #064e3b)'
                      : 'linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)')
                    : (isLoading
                      ? 'linear-gradient(135deg, #059669, #047857)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'),
                  boxShadow: isDark
                    ? '0 8px 32px rgba(4,120,87,0.3), 0 2px 8px rgba(4,120,87,0.1)'
                    : '0 8px 32px rgba(5,150,105,0.4), 0 2px 8px rgba(5,150,105,0.2)',
                  color: '#ffffff',
                }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span>Authenticating…</span>
                  </>
                ) : (
                  <>
                    <Key size={15} className="opacity-80" />
                    <span>Authenticate Session</span>
                    <ArrowRight size={15} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* SSO hint */}
          <p
            className="mt-6 text-center text-xs font-semibold animate-fade-up-d4"
            style={{ color: isDark ? '#94a3b8' : '#475569' }}
          >
            Use Okrion Credentials
          </p>
        </div>
      </div>
    </div>
  );
}
