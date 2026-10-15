'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  Download,
  Pencil,
  Trash2,
  QrCode,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  RotateCcw,
} from 'lucide-react';
import {
  Guest,
  TentBlock,
  TableItem,
  RsvpStatus,
  AVATAR_STYLES,
  exportToCsv,
} from '@/lib/bajamba-data';
import DigitalTicketCard from './DigitalTicketCard';

interface GuestListViewProps {
  guests: Guest[];
  tents: TentBlock[];
  tables: TableItem[];
  onOpenAddModal: () => void;
  onEditGuest: (guest: Guest) => void;
  onDeleteGuest: (guestId: string) => void;
  onQuickStatusChange: (guestId: string, status: RsvpStatus) => void;
  onQuickTentChange: (guestId: string, tentId: string | null) => void;
}

type SortOption = 'name_asc' | 'souls_desc' | 'origin_asc' | 'status';

export default function GuestListView({
  guests,
  tents,
  tables,
  onOpenAddModal,
  onEditGuest,
  onDeleteGuest,
  onQuickStatusChange,
  onQuickTentChange,
}: GuestListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tentFilter, setTentFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');
  const [selectedTicketGuest, setSelectedTicketGuest] = useState<Guest | null>(null);

  const filteredAndSortedGuests = useMemo(() => {
    const list = guests.filter((g) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.ticketCode.toLowerCase().includes(q) ||
        g.phone.toLowerCase().includes(q) ||
        g.groupOrigin.toLowerCase().includes(q) ||
        g.notes.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || g.rsvpStatus === statusFilter;
      const matchesTent =
        tentFilter === 'ALL'
          ? true
          : tentFilter === 'UNASSIGNED'
          ? !g.tentId
          : g.tentId === tentFilter;

      return matchesSearch && matchesStatus && matchesTent;
    });

    return list.sort((a, b) => {
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'souls_desc') {
        return b.membersCount - a.membersCount;
      }
      if (sortBy === 'origin_asc') {
        return a.groupOrigin.localeCompare(b.groupOrigin);
      }
      if (sortBy === 'status') {
        const order: Record<RsvpStatus, number> = { Hadir: 1, 'Belum Konfirmasi': 2, Berhalangan: 3 };
        return order[a.rsvpStatus] - order[b.rsvpStatus];
      }
      return 0;
    });
  }, [guests, searchQuery, statusFilter, tentFilter, sortBy]);

  const counts = useMemo(() => {
    return {
      all: guests.length,
      hadir: guests.filter((g) => g.rsvpStatus === 'Hadir').length,
      pending: guests.filter((g) => g.rsvpStatus === 'Belum Konfirmasi').length,
      declined: guests.filter((g) => g.rsvpStatus === 'Berhalangan').length,
      totalSoulsAttending: guests
        .filter((g) => g.rsvpStatus === 'Hadir')
        .reduce((acc, g) => acc + g.membersCount, 0),
    };
  }, [guests]);

  const handleExportCsv = () => {
    const headers = [
      'Kode Tiket',
      'Nama Tamu',
      'No. WhatsApp',
      'Jumlah Jiwa',
      'Asal Rombongan',
      'Status RSVP',
      'Blok Tenda',
      'Nomor Meja',
      'Status Check-in',
      'Waktu Tiba',
      'Catatan',
    ];
    const rows = filteredAndSortedGuests.map((g) => {
      const tentObj = tents.find((t) => t.id === g.tentId);
      const tableObj = tables.find((t) => t.id === g.tableId);
      return [
        g.ticketCode,
        g.name,
        g.phone,
        String(g.membersCount),
        g.groupOrigin,
        g.rsvpStatus,
        tentObj ? tentObj.name : 'Belum Ditentukan',
        tableObj ? tableObj.name : 'Belum Ada Meja',
        g.checkedIn ? 'Tiba di Lokasi' : 'Belum Tiba',
        g.checkedInAt || '-',
        g.notes || '-',
      ];
    });
    exportToCsv('daftar-tamu-makan-bajamba.csv', [headers, ...rows]);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setTentFilter('ALL');
    setSortBy('name_asc');
  };

  return (
    <div className="space-y-6">
      {/* Header Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E194D]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Buku Tamu & Daftar Rombongan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola konfirmasi RSVP, pemetaan tenda jamba, dan e-tiket QR dengan tampilan terstruktur.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#1E194D] hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Download className="h-4 w-4 text-[#6355E5]" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6355E5] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#5243D4] transition-colors shadow-xs whitespace-nowrap"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Tambah Tamu</span>
          </button>
        </div>
      </div>

      {/* Statistics Banner Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`rounded-2xl p-4 text-left border transition-all ${
            statusFilter === 'ALL'
              ? 'bg-[#6355E5] text-white border-[#6355E5] shadow-md'
              : 'bg-white text-[#1E194D] border-slate-200/80 hover:border-[#6355E5]/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'ALL' ? 'text-indigo-100' : 'text-slate-400'}`}>
              Semua Rombongan
            </span>
            <Users className={`h-4 w-4 ${statusFilter === 'ALL' ? 'text-indigo-200' : 'text-[#6355E5]'}`} />
          </div>
          <div className="text-xl font-extrabold font-mono">{counts.all}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Hadir')}
          className={`rounded-2xl p-4 text-left border transition-all ${
            statusFilter === 'Hadir'
              ? 'bg-white text-[#1E194D] border-[#1E8E4E] ring-2 ring-[#1E8E4E]/20 shadow-sm'
              : 'bg-white text-[#1E194D] border-slate-200/80 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Hadir ({counts.totalSoulsAttending} Jiwa)
            </span>
            <CheckCircle2 className="h-4 w-4 text-[#1E8E4E]" />
          </div>
          <div className="text-xl font-extrabold font-mono">{counts.hadir}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Belum Konfirmasi')}
          className={`rounded-2xl p-4 text-left border transition-all ${
            statusFilter === 'Belum Konfirmasi'
              ? 'bg-white text-[#1E194D] border-[#E5A100] ring-2 ring-[#E5A100]/20 shadow-sm'
              : 'bg-white text-[#1E194D] border-slate-200/80 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Belum Konfirmasi
            </span>
            <Clock className="h-4 w-4 text-[#E5A100]" />
          </div>
          <div className="text-xl font-extrabold font-mono">{counts.pending}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Berhalangan')}
          className={`rounded-2xl p-4 text-left border transition-all ${
            statusFilter === 'Berhalangan'
              ? 'bg-white text-[#1E194D] border-[#C93B3B] ring-2 ring-[#C93B3B]/20 shadow-sm'
              : 'bg-white text-[#1E194D] border-slate-200/80 hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Berhalangan
            </span>
            <XCircle className="h-4 w-4 text-[#C93B3B]" />
          </div>
          <div className="text-xl font-extrabold font-mono">{counts.declined}</div>
        </button>
      </div>

      {/* Main Table Container with Single-Row Instant Search & Sort Bar */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Single-Row Search, Filter & Sort Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-[#F8F9FC]/60 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode tiket (BJB-XXXXXX), nama, nomor WA, atau asal nagari..."
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-medium text-[#1E194D] placeholder:text-slate-400 focus:border-[#6355E5] focus:outline-none shadow-2xs"
            />
          </div>

          {/* Controls Bar: Status Filter, Tent Filter, Sort By */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#1E194D] focus:outline-none shadow-2xs"
            >
              <option value="ALL">Status: Semua</option>
              <option value="Hadir">Hadir</option>
              <option value="Belum Konfirmasi">Belum Konfirmasi</option>
              <option value="Berhalangan">Berhalangan</option>
            </select>

            {/* Tent Dropdown */}
            <select
              value={tentFilter}
              onChange={(e) => setTentFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#1E194D] focus:outline-none shadow-2xs"
            >
              <option value="ALL">Tenda: Semua Blok</option>
              <option value="UNASSIGNED">-- Belum Ditentukan --</option>
              {tents.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#1E194D] focus:outline-none shadow-2xs flex items-center gap-1"
            >
              <option value="name_asc">Urut: Nama A-Z</option>
              <option value="souls_desc">Urut: Jiwa Terbanyak</option>
              <option value="origin_asc">Urut: Asal Rombongan</option>
              <option value="status">Urut: Status RSVP</option>
            </select>

            {(searchQuery || statusFilter !== 'ALL' || tentFilter !== 'ALL' || sortBy !== 'name_asc') && (
              <button
                type="button"
                onClick={resetFilters}
                title="Reset Filter & Sort"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1 shadow-2xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Modern Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#F8F9FC] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 pl-6 pr-2 text-center w-12">No.</th>
                <th className="py-3.5 px-2">No. Tiket & Nama Tamu</th>
                <th className="py-3.5 px-2">Asal Rombongan</th>
                <th className="py-3.5 px-2 text-center">Jiwa</th>
                <th className="py-3.5 px-2">Kontak (WhatsApp)</th>
                <th className="py-3.5 px-2">Blok Tenda</th>
                <th className="py-3.5 px-2">Status RSVP</th>
                <th className="py-3.5 pl-2 pr-6 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAndSortedGuests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-8 w-8 text-slate-300" />
                      <span className="font-semibold text-slate-600">Tidak ada data tamu yang sesuai.</span>
                      <span className="text-[11px] text-slate-400">Coba ubah kata kunci pencarian atau filter status.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedGuests.map((guest, idx) => {
                  const avatar = AVATAR_STYLES[guest.avatarTheme] || AVATAR_STYLES.purple;
                  const tentObj = tents.find((t) => t.id === guest.tentId);

                  return (
                    <tr key={guest.id} className="hover:bg-[#F8F9FC]/80 transition-colors group">
                      {/* Nomor */}
                      <td className="py-3.5 pl-6 pr-2 text-center font-mono text-slate-400 font-semibold w-12">
                        {idx + 1}
                      </td>

                      {/* Kode Tiket & Nama */}
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold shadow-2xs ${avatar.bg} ${avatar.icon}`}>
                            {guest.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[#1E194D] block truncate text-sm">
                              {guest.name}
                            </span>
                            <span className="font-mono text-[11px] text-[#6355E5] font-bold tracking-wide">
                              {guest.ticketCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Asal Rombongan */}
                      <td className="py-3.5 px-2 text-slate-700 font-medium max-w-[160px] truncate" title={guest.groupOrigin}>
                        {guest.groupOrigin}
                      </td>

                      {/* Jiwa */}
                      <td className="py-3.5 px-2 text-center font-mono font-bold text-[#1E194D]">
                        <span className="inline-flex items-center justify-center bg-slate-100 rounded-full px-2.5 py-0.5 text-xs">
                          {guest.membersCount}
                        </span>
                      </td>

                      {/* Kontak */}
                      <td className="py-3.5 px-2 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {guest.phone}
                      </td>

                      {/* Pemetaan Tenda Langsung */}
                      <td className="py-3.5 px-2 whitespace-nowrap">
                        <select
                          value={guest.tentId ?? ''}
                          onChange={(e) => onQuickTentChange(guest.id, e.target.value || null)}
                          className={`rounded-xl border px-2.5 py-1 text-[11px] font-bold focus:outline-none shadow-2xs ${
                            tentObj ? `${tentObj.badgeBg} ${tentObj.badgeText} border-transparent` : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}
                        >
                          <option value="">Belum Ditentukan</option>
                          {tents.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Status RSVP Cepat */}
                      <td className="py-3.5 px-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            const nextStatus: RsvpStatus =
                              guest.rsvpStatus === 'Hadir'
                                ? 'Belum Konfirmasi'
                                : guest.rsvpStatus === 'Belum Konfirmasi'
                                ? 'Berhalangan'
                                : 'Hadir';
                            onQuickStatusChange(guest.id, nextStatus);
                          }}
                          title="Klik untuk mengubah status RSVP"
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all shadow-2xs ${
                            guest.rsvpStatus === 'Hadir'
                              ? 'bg-[#E6F6EC] text-[#1E8E4E] hover:bg-emerald-200'
                              : guest.rsvpStatus === 'Berhalangan'
                              ? 'bg-[#FDECEB] text-[#C93B3B] hover:bg-rose-200'
                              : 'bg-[#FEF3D6] text-[#B27B00] hover:bg-amber-200'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            guest.rsvpStatus === 'Hadir'
                              ? 'bg-[#1E8E4E]'
                              : guest.rsvpStatus === 'Berhalangan'
                              ? 'bg-[#C93B3B]'
                              : 'bg-[#E5A100]'
                          }`} />
                          <span>{guest.rsvpStatus}</span>
                        </button>
                      </td>

                      {/* Aksi Cepat */}
                      <td className="py-3.5 pl-2 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* QR Tiket */}
                          <button
                            type="button"
                            onClick={() => setSelectedTicketGuest(guest)}
                            title="Lihat / Unduh E-Tiket QR"
                            className="rounded-xl p-2 text-[#6355E5] bg-[#EDE9FE]/60 hover:bg-[#EDE9FE] transition-colors shadow-2xs"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onEditGuest(guest)}
                            title="Edit Data Tamu"
                            className="rounded-xl p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors shadow-2xs"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          {/* Hapus */}
                          <button
                            type="button"
                            onClick={() => onDeleteGuest(guest.id)}
                            title="Hapus Rombongan"
                            className="rounded-xl p-2 text-slate-400 bg-slate-50 hover:text-red-600 hover:bg-red-50 transition-colors shadow-2xs"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        <div className="p-4 bg-[#F8F9FC] border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <strong className="text-[#1E194D]">{filteredAndSortedGuests.length}</strong> dari {guests.length} rombongan tamu
          </span>
          <span className="font-mono mt-1 sm:mt-0">
            Total Jiwa Hadir Terhitung: <strong className="text-[#1E8E4E]">{counts.totalSoulsAttending} Jiwa</strong>
          </span>
        </div>
      </div>

      {/* Modal E-Tiket Preview */}
      {selectedTicketGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <DigitalTicketCard
              guest={selectedTicketGuest}
              tents={tents}
              tables={tables}
              onClose={() => setSelectedTicketGuest(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
