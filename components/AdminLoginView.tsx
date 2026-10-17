'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User, Lock, Check, AlertCircle, X, Info } from 'lucide-react';
import { AdminUser, SAWAHLUNTO_LOGO_URL } from '@/lib/bajamba-data';

interface AdminLoginViewProps {
  adminUsers: AdminUser[];
  onLogin: (user: AdminUser) => void;
  onSwitchToPublic: () => void;
}

export default function AdminLoginView({
  adminUsers,
  onLogin,
  onSwitchToPublic,
}: AdminLoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Harap masukkan username dan password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const matched = adminUsers.find(
        (u) =>
          u.username.toLowerCase() === cleanUser && u.password === cleanPass
      );

      if (matched) {
        onLogin(matched);
      } else {
        setErrorMsg('Username atau password yang Anda masukkan tidak valid.');
        setIsLoading(false);
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#8FBBE6] via-[#BBA6D8] to-[#E580BD]">
      {/* Floating Card - Exactly matching the reference image */}
      <div className="w-full max-w-[370px] bg-white rounded-[36px] px-8 pt-9 pb-8 shadow-2xl shadow-indigo-950/25 transition-all">
        {/* Top Centered Circular Badge with Sawahlunto Logo */}
        <div className="flex justify-center mb-7">
          <div className="w-24 h-24 rounded-full bg-[#C584B7] flex items-center justify-center p-1.5 shadow-md shadow-pink-900/10">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-2.5 overflow-hidden shadow-inner">
              <Image
                src={SAWAHLUNTO_LOGO_URL}
                alt="Lambang Kota Sawahlunto"
                width={80}
                height={80}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                priority
              />
            </div>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-200/80 px-3.5 py-2 text-center text-xs text-rose-700 flex items-center justify-center gap-1.5 animate-in fade-in">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input - Rounded Pill */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full rounded-full border border-slate-200/90 pl-11 pr-5 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#C584B7] focus:ring-2 focus:ring-[#C584B7]/20 transition-all bg-white"
            />
          </div>

          {/* Password Input - Rounded Pill */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full rounded-full border border-slate-200/90 pl-11 pr-5 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#C584B7] focus:ring-2 focus:ring-[#C584B7]/20 transition-all bg-white"
            />
          </div>

          {/* Large Pill LOGIN Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[#C584B7] hover:bg-[#B673A7] active:scale-[0.99] text-white py-3.5 text-sm font-bold tracking-widest uppercase transition-all shadow-md shadow-pink-900/15 disabled:opacity-75 cursor-pointer"
            >
              {isLoading ? 'MEMPROSES...' : 'LOGIN'}
            </button>
          </div>

          {/* Bottom Row: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-500 hover:text-slate-700">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                  rememberMe
                    ? 'bg-slate-500 border-slate-500 text-white'
                    : 'bg-white border-slate-300'
                }`}
              >
                {rememberMe && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <span className="text-[12px] text-slate-500 font-normal">
                Remember me
              </span>
            </label>

            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-[12px] italic text-slate-400 hover:text-slate-600 transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        </form>
      </div>

      {/* Subtle Link back to Guest Portal */}
      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={onSwitchToPublic}
          className="text-white/85 hover:text-white text-xs font-medium tracking-wide transition-colors underline underline-offset-4 decoration-white/40 hover:decoration-white"
        >
          &larr; Buka Portal Pendaftaran &amp; Tiket Tamu
        </button>
      </div>

      {/* Modal Forgot Password Info */}
      {showForgotModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
              <Info className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E194D]">
                Informasi Reset Kata Sandi
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Untuk keamanan operasional acara Makan Bajamba, silakan hubungi
                administrator utama Dinas Kebudayaan atau gunakan akun Superadmin
                (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#1E194D] font-bold">admindisbud</code>)
                untuk mengatur ulang kata sandi petugas di menu Kelola Petugas Admin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full rounded-full bg-[#C584B7] hover:bg-[#B673A7] text-white py-2.5 text-xs font-bold transition-all"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
