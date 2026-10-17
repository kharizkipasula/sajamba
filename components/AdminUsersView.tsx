'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Pencil,
  Trash2,
  Lock,
  User,
  KeyRound,
  Shield,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
  Check,
  Search,
} from 'lucide-react';
import { AdminUser, formatIndonesianTime } from '@/lib/bajamba-data';

interface AdminUsersViewProps {
  adminUsers: AdminUser[];
  currentAdmin: AdminUser | null;
  onSaveAdmin: (adminData: Omit<AdminUser, 'id' | 'createdAt'>, existingId?: string) => void;
  onDeleteAdmin: (adminId: string) => void;
}

export default function AdminUsersView({
  adminUsers,
  currentAdmin,
  onSaveAdmin,
  onDeleteAdmin,
}: AdminUsersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminUser['role']>('ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);

  // Reveal password for specific card
  const [revealedPasswordId, setRevealedPasswordId] = useState<string | null>(null);

  const filteredAdmins = adminUsers.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const openAddModal = () => {
    setEditingAdmin(null);
    setUsername('');
    setDisplayName('');
    setPassword('');
    setRole('ADMIN');
    setShowPassword(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setUsername(admin.username);
    setDisplayName(admin.displayName);
    setPassword(admin.password);
    setRole(admin.role);
    setShowPassword(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanUser = username.trim().toLowerCase();
    const cleanName = displayName.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanName || !cleanPass) {
      setFormError('Semua kolom wajib diisi lengkap.');
      return;
    }

    if (cleanUser.length < 3) {
      setFormError('Username minimal 3 karakter.');
      return;
    }

    // Check if username already exists for different user
    const existing = adminUsers.find(
      (u) =>
        u.username.toLowerCase() === cleanUser &&
        (!editingAdmin || u.id !== editingAdmin.id)
    );
    if (existing) {
      setFormError(`Username "${cleanUser}" sudah terdaftar! Gunakan username lain.`);
      return;
    }

    onSaveAdmin(
      {
        username: cleanUser,
        displayName: cleanName,
        password: cleanPass,
        role,
        lastLoginAt: editingAdmin ? editingAdmin.lastLoginAt : null,
      },
      editingAdmin?.id
    );

    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (!adminToDelete) return;
    if (currentAdmin && adminToDelete.id === currentAdmin.id) {
      return;
    }
    onDeleteAdmin(adminToDelete.id);
    setAdminToDelete(null);
  };

  const getRoleBadge = (r: AdminUser['role']) => {
    switch (r) {
      case 'SUPERADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
            <Shield className="h-3 w-3" />
            SUPERADMIN
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <ShieldCheck className="h-3 w-3" />
            ADMIN
          </span>
        );
      case 'OPERATOR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <User className="h-3 w-3" />
            OPERATOR
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#1E194D] text-[#EAB308]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1E194D]">
                Manajemen Akun Admin &amp; Petugas
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola hak akses, username, dan kata sandi petugas Makan Bajamba
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1E194D] to-[#2B244D] hover:from-[#2B244D] hover:to-[#372E61] text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all"
        >
          <UserPlus className="h-4 w-4 text-[#EAB308]" />
          <span>Tambah Akun Petugas</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama, username, atau role..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-[#1E194D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6355E5]"
          />
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-3">
          <span>
            Total: <strong className="text-[#1E194D]">{adminUsers.length}</strong> akun terdaftar
          </span>
          <span className="text-slate-300">&bull;</span>
          <span>
            Aktif login:{' '}
            <strong className="text-[#6355E5]">
              {currentAdmin?.displayName || currentAdmin?.username || 'Petugas'}
            </strong>
          </span>
        </div>
      </div>

      {/* Admin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAdmins.map((admin) => {
          const isCurrentUser = currentAdmin?.id === admin.id;
          const isPasswordVisible = revealedPasswordId === admin.id;

          return (
            <div
              key={admin.id}
              className={`rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                isCurrentUser
                  ? 'bg-gradient-to-br from-indigo-50/40 via-white to-amber-50/30 border-[#6355E5]/50 ring-2 ring-[#6355E5]/20 shadow-md'
                  : 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header Row: Role & Current Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>{getRoleBadge(admin.role)}</div>
                  {isCurrentUser && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6355E5] bg-white px-2 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
                      <Check className="h-3 w-3" />
                      Anda Saat Ini
                    </span>
                  )}
                </div>

                {/* Name & Username */}
                <h3 className="font-bold text-[#1E194D] text-base">
                  {admin.displayName}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-mono text-slate-700 font-semibold">
                    @{admin.username}
                  </span>
                </div>

                {/* Password display section */}
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <KeyRound className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <div className="text-xs">
                      <span className="text-[10px] text-slate-400 block leading-tight">
                        Kata Sandi:
                      </span>
                      <span className="font-mono font-bold text-[#1E194D] tracking-wider text-xs">
                        {isPasswordVisible ? admin.password : '••••••••'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setRevealedPasswordId(
                        isPasswordVisible ? null : admin.id
                      )
                    }
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                    title={isPasswordVisible ? 'Sembunyikan sandi' : 'Lihat sandi'}
                  >
                    {isPasswordVisible ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* Timestamp info */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-slate-300" />
                    <span>Dibuat: {admin.createdAt}</span>
                  </div>
                  {admin.lastLoginAt && (
                    <div className="flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span>Terakhir login: {admin.lastLoginAt}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(admin)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#6355E5] hover:text-[#6355E5] transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Ubah Data / Sandi</span>
                </button>

                <button
                  type="button"
                  disabled={isCurrentUser || adminUsers.length <= 1}
                  onClick={() => setAdminToDelete(admin)}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    isCurrentUser || adminUsers.length <= 1
                      ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                      : 'border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300'
                  }`}
                  title={
                    isCurrentUser
                      ? 'Tidak dapat menghapus akun yang sedang aktif login'
                      : adminUsers.length <= 1
                      ? 'Minimal harus ada 1 akun admin'
                      : 'Hapus akun'
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#1E194D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#EAB308]" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingAdmin ? 'Ubah Akun & Sandi Petugas' : 'Tambah Akun Petugas Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white rounded-lg p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 flex items-start gap-2 text-xs text-rose-800">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#1E194D] mb-1">
                  Nama Lengkap Petugas *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Contoh: Bpk. Sutan Marajo (Panitia)"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-[#1E194D] focus:outline-none focus:ring-2 focus:ring-[#6355E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E194D] mb-1">
                  Username Akun *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admindisbud atau operator1"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono text-[#1E194D] focus:outline-none focus:ring-2 focus:ring-[#6355E5]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Digunakan untuk login (huruf kecil, tanpa spasi).
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#1E194D]">
                    Kata Sandi (Password) *
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi baru"
                    className="w-full rounded-xl border border-slate-200 px-3.5 pr-10 py-2 text-xs font-mono text-[#1E194D] focus:outline-none focus:ring-2 focus:ring-[#6355E5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E194D] mb-1">
                  Peran / Hak Akses (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminUser['role'])}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#1E194D] focus:outline-none focus:ring-2 focus:ring-[#6355E5]"
                >
                  <option value="SUPERADMIN">SUPERADMIN (Akses Penuh Seluruh Menu)</option>
                  <option value="ADMIN">ADMIN (Manajemen Tamu &amp; Tenda)</option>
                  <option value="OPERATOR">OPERATOR (Meja Registrasi &amp; Check-In)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#1E194D] hover:bg-[#2B244D] text-white px-5 py-2 text-xs font-bold shadow-sm"
                >
                  {editingAdmin ? 'Simpan Perubahan' : 'Buat Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#1E194D] text-base">Hapus Akun Petugas?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus akun{' '}
                <strong className="text-[#1E194D]">@{adminToDelete.username}</strong> ({adminToDelete.displayName})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAdminToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-sm"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
