'use client';

import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Check,
  Users,
  Phone,
  MapPin,
  FileText,
  Tent,
} from 'lucide-react';
import {
  Guest,
  RsvpStatus,
  TentBlock,
  TableItem,
  DEFAULT_GROUP_ORIGINS,
} from '@/lib/bajamba-data';

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    guestData: Omit<
      Guest,
      'id' | 'ticketCode' | 'checkedIn' | 'checkedInAt' | 'updatedAt' | 'registeredAt' | 'avatarTheme'
    >,
    existingId?: string
  ) => void;
  editingGuest: Guest | null;
  existingGroups: string[];
  tents: TentBlock[];
  tables: TableItem[];
}

export default function GuestModal({
  isOpen,
  onClose,
  onSave,
  editingGuest,
  existingGroups,
  tents,
  tables,
}: GuestModalProps) {
  const allGroups = Array.from(new Set([...DEFAULT_GROUP_ORIGINS, ...existingGroups]));

  const [name, setName] = useState(editingGuest?.name ?? '');
  const [phone, setPhone] = useState(editingGuest?.phone ?? '');
  const [email, setEmail] = useState(editingGuest?.email ?? '');
  const [kategoriInstansi, setKategoriInstansi] = useState(editingGuest?.kategoriInstansi ?? 'Perangkat Daerah');
  const [kelompokKelas, setKelompokKelas] = useState(editingGuest?.kelompokKelas ?? 'VIP B');
  const [instansiAlamat, setInstansiAlamat] = useState(editingGuest?.instansiAlamat ?? '');
  const [membersCount, setMembersCount] = useState(editingGuest?.membersCount ?? 2);
  const [groupOrigin, setGroupOrigin] = useState(editingGuest?.groupOrigin ?? '');
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>(editingGuest?.rsvpStatus ?? 'Hadir');
  const [tentId, setTentId] = useState<string>(editingGuest?.tentId ?? '');
  const [tableId, setTableId] = useState<number | ''>(editingGuest?.tableId ?? '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const finalGroup = groupOrigin.trim();

    if (!trimmedName) {
      setError('Nama lengkap tamu wajib diisi.');
      return;
    }
    if (!phone.trim()) {
      setError('Nomor HP tamu wajib diisi.');
      return;
    }
    if (!finalGroup) {
      setError('Asal / Rombongan keluarga wajib diisi.');
      return;
    }

    onSave(
      {
        name: trimmedName,
        phone: phone.trim(),
        email: email.trim(),
        kategoriInstansi: kategoriInstansi.trim(),
        kelompokKelas: kelompokKelas.trim(),
        instansiAlamat: instansiAlamat.trim(),
        membersCount: Math.max(1, Number(membersCount) || 1),
        groupOrigin: finalGroup,
        rsvpStatus,
        tentId: tentId ? tentId : null,
        tableId: tableId ? Number(tableId) : null,
        notes: '',
      },
      editingGuest?.id
    );
    onClose();
  };

  const filteredTables = tentId ? tables.filter((t) => t.tentId === tentId) : tables;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#16122E]/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#F8F9FC]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#6355E5]">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1E194D]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                {editingGuest ? 'Edit Data Tamu & Tiket' : 'Tambah Tamu Undangan Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Lengkapi rombongan, alokasi tenda, dan kebutuhan khusus
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-600 font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#1E194D] mb-1.5">
                Nama Lengkap Tamu / Kepala Rombongan *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Datuk Paduko Alam Chaniago"
                className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#1E194D] mb-1.5">
                <Phone className="h-3.5 w-3.5 text-[#6355E5]" />
                Nomor WhatsApp *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#1E194D] font-mono tabular-nums focus:border-[#6355E5] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#1E194D] mb-1.5">
                <Users className="h-3.5 w-3.5 text-[#6355E5]" />
                Jumlah Jiwa Rombongan *
              </label>
              <input
                type="number"
                min={1}
                value={membersCount}
                onChange={(e) => setMembersCount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-3.5 py-2.5 text-sm font-bold text-[#1E194D] font-mono tabular-nums focus:border-[#6355E5] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#1E194D] mb-1.5">
                Email Aktif
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Kategori Instansi */}
            <div>
              <label className="block text-xs font-bold text-[#1E194D] mb-1.5">
                Kategori Instansi
              </label>
              <select
                value={kategoriInstansi}
                onChange={(e) => setKategoriInstansi(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none"
              >
                <option value="Perangkat Daerah">Perangkat Daerah</option>
                <option value="Umum / Nagari">Umum / Nagari</option>
                <option value="BUMN / Vertikal">BUMN / Vertikal</option>
                <option value="Forkopimda">Forkopimda</option>
              </select>
            </div>

            {/* Kelompok / Kelas */}
            <div>
              <label className="block text-xs font-bold text-[#1E194D] mb-1.5">
                Kelompok / Kelas
              </label>
              <select
                value={kelompokKelas}
                onChange={(e) => setKelompokKelas(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none"
              >
                <option value="VIP A">VIP A</option>
                <option value="VIP B">VIP B</option>
                <option value="Umum">Umum</option>
                <option value="Undangan Khusus">Undangan Khusus</option>
              </select>
            </div>

            {/* Instansi / Alamat */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#1E194D] mb-1.5">
                Instansi / Alamat
              </label>
              <input
                type="text"
                value={instansiAlamat}
                onChange={(e) => setInstansiAlamat(e.target.value)}
                placeholder="Contoh: Dinas Pendidikan Kota Sawahlunto"
                className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Asal Rombongan / Nagari (Free Text) */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#1E194D] mb-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#6355E5]" />
              Asal Nagari / Rombongan *
            </label>
            <input
              type="text"
              value={groupOrigin}
              onChange={(e) => setGroupOrigin(e.target.value)}
              placeholder="Contoh: Nagari Lunto Barat / Suku Chaniago"
              className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Alokasi Tenda & Meja */}
          <div className="rounded-2xl bg-[#F0EEFF]/50 border border-[#6355E5]/20 p-3.5 space-y-2.5">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#6355E5]">
              <Tent className="h-3.5 w-3.5" />
              Pemetaan Lokasi Tenda & Dudukan (Admin)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Pilih Blok Tenda
                </label>
                <select
                  value={tentId}
                  onChange={(e) => {
                    const newTent = e.target.value;
                    setTentId(newTent);
                    const matching = tables.filter((t) => t.tentId === newTent);
                    setTableId(matching[0]?.id || '');
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#1E194D] focus:outline-none"
                >
                  <option value="">-- Belum Dipetakan --</option>
                  {tents.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Pilih Nomor Meja Jamba
                </label>
                <select
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#1E194D] focus:outline-none"
                >
                  <option value="">-- Belum Ada Meja --</option>
                  {filteredTables.map((tbl) => (
                    <option key={tbl.id} value={tbl.id}>
                      {tbl.name} (Kap: {tbl.capacity})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status Kehadiran */}
          <div>
            <label className="block text-xs font-bold text-[#1E194D] mb-1.5">
              Status Kehadiran (RSVP)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'Hadir' as RsvpStatus, label: 'Hadir', cls: 'border-[#1E8E4E] bg-[#E6F6EC] text-[#1E8E4E]' },
                { val: 'Belum Konfirmasi' as RsvpStatus, label: 'Belum Pasti', cls: 'border-[#6355E5] bg-[#EFEFF6] text-[#1E194D]' },
                { val: 'Berhalangan' as RsvpStatus, label: 'Berhalangan', cls: 'border-[#C93B3B] bg-[#FDECEB] text-[#C93B3B]' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setRsvpStatus(opt.val)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    rsvpStatus === opt.val ? `${opt.cls} ring-2 ring-current` : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>



          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#6355E5] px-5 py-2 text-xs font-bold text-white hover:bg-[#5243D4] shadow-xs"
            >
              {editingGuest ? 'Simpan Perubahan' : 'Simpan Tamu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
