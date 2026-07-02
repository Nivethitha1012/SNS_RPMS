/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { Eye, EyeOff, Key, ArrowRight } from 'lucide-react';
import snsLogo from '../../assets/logos/sns-logo.png';

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
  const { theme } = useTheme();
  const navigate = useNavigate();

  const isDark = theme === 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500)); // micro-delay for feel
    const res = await login(email, password);
    setIsLoading(false);
    if (res.success) {
      if (res.user.role === 'Admin') navigate('/admin/dashboard');
      else navigate('/faculty/publications');
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
            ? 'linear-gradient(135deg, #060b14 0%, #0f172a 40%, #1a0f3a 70%, #0c1220 100%)'
            : 'linear-gradient(135deg, #e8edf5 0%, #dde4f0 40%, #e4e8f8 70%, #edf0fa 100%)',
        }}
      />

      {/* Mesh hex pattern overlay */}
      <div className="absolute inset-0 hex-grid opacity-60 pointer-events-none" />

      {/* Animated orbs */}
      <Orb className={`w-120 h-120 -top-30 -left-20 animate-float-slow
        ${isDark
          ? 'bg-indigo-900/30 blur-[100px]'
          : 'bg-indigo-200/50 blur-[90px]'}`}
      />
      <Orb className={`w-90 h-90 -bottom-20 -right-15 animate-float-med
        ${isDark
          ? 'bg-violet-900/25 blur-[90px]'
          : 'bg-violet-200/40 blur-[80px]'}`}
      />
      <Orb className={`w-55 h-55 top-[30%] right-[10%] animate-float-fast
        ${isDark
          ? 'bg-blue-900/20 blur-[70px]'
          : 'bg-blue-200/35 blur-[60px]'}`}
      />



      {/* ── Glass card ───────────────────────────────────────────────────── */}
      <div
        className="relative z-10 w-full max-w-sm sm:max-w-md animate-card-entrance rounded-3xl"
        style={{
          background: isDark
            ? 'rgba(15, 23, 42, 0.72)'
            : 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(28px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
          border: isDark
            ? '1px solid rgba(255,255,255,0.09)'
            : '1px solid rgba(255,255,255,0.9)',
          boxShadow: isDark
            ? '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)'
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
                Email / Faculty ID
              </label>
              <input
                id="signin-email"
                type="text"
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
                className="text-[10px] font-bold uppercase tracking-[0.15em] ml-1"
                style={{ color: isDark ? '#475569' : '#94a3b8' }}
              >
                Secure Password
              </label>
              <div className="relative">
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="signin-input w-full px-4 py-3.5 pr-12 rounded-xl text-sm font-medium transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors duration-200"
                  style={{ color: isDark ? '#475569' : '#94a3b8' }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
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
                  background: isLoading
                    ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                    : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%)',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.4), 0 2px 8px rgba(99,102,241,0.2)',
                }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
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

          {/* Credential hint */}
          <p
            className="mt-6 text-center text-xs font-semibold animate-fade-up-d4"
            style={{ color: isDark ? '#94a3b8' : '#475569' }}
          >
            Login with your okrion credentials
          </p>
        </div>
      </div>
    </div>
  );
}
