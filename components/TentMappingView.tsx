'use client';

import React, { useState, useRef } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  GripVertical,
  X,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Tent,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Rows,
  Columns,
} from 'lucide-react';
import { Guest, TentBlock, TableItem } from '@/lib/bajamba-data';
import TentModal from '@/components/TentModal';
import TableModal from '@/components/TableModal';

type TentSortKey = 'table' | 'name' | 'members' | 'ticket';
type SortDirection = 'asc' | 'desc';

interface TentMappingViewProps {
  guests: Guest[];
  tents: TentBlock[];
  tables: TableItem[];
  onAssignTent: (guestId: string, tentId: string | null, tableId: number | null) => void;
  onSaveTent: (tentData: Omit<TentBlock, 'id' | 'tableIds'>, existingId?: string) => void;
  onDeleteTent: (tentId: string) => void;
  onSaveTable: (tableData: Omit<TableItem, 'id'>, existingId?: number) => void;
  onDeleteTable: (tableId: number) => void;
}

export default function TentMappingView({
  guests,
  tents,
  tables,
  onAssignTent,
  onSaveTent,
  onDeleteTent,
  onSaveTable,
  onDeleteTable,
}: TentMappingViewProps) {
  // Layout view mode: 'full' (Kartu Penuh Horizontal 100%) or 'grid' (2 Kolom)
  const [viewLayout, setViewLayout] = useState<'full' | 'grid'>('full');

  // Drag & drop state
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null);
  const [dragOverTentId, setDragOverTentId] = useState<string | null>(null);

  // Sorting state per tent
  const [tentSortMap, setTentSortMap] = useState<
    Record<string, { key: TentSortKey; direction: SortDirection }>
  >({});

  // Filter & search state for the active guests horizontal row
  const [searchFilter, setSearchFilter] = useState('');
  const [guestCategoryFilter, setGuestCategoryFilter] = useState<'ALL' | 'UNASSIGNED' | 'ASSIGNED'>('UNASSIGNED');

  // Ref for horizontal scroll
  const horizontalScrollRef = useRef<HTMLDivElement>(null);

  // Tent Modal state
  const [isTentModalOpen, setIsTentModalOpen] = useState(false);
  const [editingTent, setEditingTent] = useState<TentBlock | null>(null);

  // Table Modal state
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [tableModalDefaultTentId, setTableModalDefaultTentId] = useState<string>('');

  // Delete Confirmation Modals state
  const [tentToDelete, setTentToDelete] = useState<TentBlock | null>(null);
  const [tableToDelete, setTableToDelete] = useState<TableItem | null>(null);

  const activeGuests = guests.filter((g) => g.rsvpStatus !== 'Berhalangan');
  const unassignedGuests = activeGuests.filter((g) => !g.tentId);
  const assignedGuests = activeGuests.filter((g) => Boolean(g.tentId));

  // Filtered guests for top horizontal carousel
  const displayedTopGuests = activeGuests.filter((g) => {
    if (guestCategoryFilter === 'UNASSIGNED' && g.tentId) return false;
    if (guestCategoryFilter === 'ASSIGNED' && !g.tentId) return false;

    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.groupOrigin.toLowerCase().includes(q) ||
      g.ticketCode.toLowerCase().includes(q)
    );
  });

  const totalTentCapacity = tents.reduce((acc, t) => acc + t.capacity, 0);
  const totalOccupiedSeats = activeGuests
    .filter((g) => g.tentId !== null)
    .reduce((acc, g) => acc + g.membersCount, 0);

  const handleDragStart = (e: React.DragEvent, guestId: string) => {
    setDraggedGuestId(guestId);
    e.dataTransfer.setData('text/plain', guestId);
  };

  const handleDragOver = (e: React.DragEvent, tentId: string | null) => {
    e.preventDefault();
    setDragOverTentId(tentId);
  };

  const handleDropOnTent = (e: React.DragEvent, tentId: string | null) => {
    e.preventDefault();
    const guestId = e.dataTransfer.getData('text/plain') || draggedGuestId;
    if (guestId) {
      if (!tentId) {
        onAssignTent(guestId, null, null);
      } else {
        const tentTables = tables.filter((t) => t.tentId === tentId);
        const defaultTable = tentTables[0]?.id || null;
        onAssignTent(guestId, tentId, defaultTable);
      }
    }
    setDraggedGuestId(null);
    setDragOverTentId(null);
  };

  const scrollHorizontal = (offset: number) => {
    if (horizontalScrollRef.current) {
      horizontalScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleOpenAddTent = () => {
    setEditingTent(null);
    setIsTentModalOpen(true);
  };

  const handleOpenEditTent = (tent: TentBlock) => {
    setEditingTent(tent);
    setIsTentModalOpen(true);
  };

  const handleOpenAddTableForTent = (tentId: string) => {
    setEditingTable(null);
    setTableModalDefaultTentId(tentId);
    setIsTableModalOpen(true);
  };

  const handleOpenEditTable = (table: TableItem) => {
    setEditingTable(table);
    setTableModalDefaultTentId(table.tentId);
    setIsTableModalOpen(true);
  };

  const confirmDeleteTent = () => {
    if (tentToDelete) {
      onDeleteTent(tentToDelete.id);
      setTentToDelete(null);
    }
  };

  const confirmDeleteTable = () => {
    if (tableToDelete) {
      onDeleteTable(tableToDelete.id);
      setTableToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6355E5] mb-1">
            <span>Denah Tata Ruang Makan Bajamba Sawahlunto</span>
            <span aria-hidden="true">·</span>
            <span>{tents.length} Blok Tenda Adat</span>
            <span aria-hidden="true">·</span>
            <span>{tables.length} Meja Jamba</span>
          </div>
          <h1
            className="text-2xl font-bold text-[#1E194D]"
            style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
          >
            Pemetaan Lokasi Tenda & Dudukan Tamu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Petakan rombongan tamu ke blok tenda secara fleksibel. Tarik kartu tamu di atas atau gunakan dropdown cepat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2.5 rounded-2xl bg-white border border-slate-200 px-3.5 py-2 shadow-2xs">
            <div className="text-xs">
              <span className="text-slate-500 block text-[10px]">Total Kursi Terisi</span>
              <span className="font-bold text-[#1E194D] font-mono tabular-nums text-sm">
                {totalOccupiedSeats} / {totalTentCapacity} Kursi
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div className="text-xs">
              <span className="text-slate-500 block text-[10px]">Belum Ada Tenda</span>
              <span className="font-bold text-[#C93B3B] font-mono tabular-nums text-sm">
                {unassignedGuests.length} Rombongan
              </span>
            </div>
          </div>

          {/* Tombol Tambah Blok Tenda (CRUD Tenda) */}
          <button
            type="button"
            onClick={handleOpenAddTent}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#6355E5] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#5243D4] transition-all shadow-xs"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>+ Tambah Blok Tenda</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Banner matching Guest List design */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Belum Ada Tenda */}
        <button
          type="button"
          onClick={() => setGuestCategoryFilter('UNASSIGNED')}
          className={`rounded-2xl p-4 text-left border transition-all relative overflow-hidden shadow-2xs ${
            guestCategoryFilter === 'UNASSIGNED'
              ? 'bg-[#C93B3B] text-white border-[#C93B3B] shadow-md ring-2 ring-[#C93B3B]/20'
              : 'bg-white text-[#1E194D] border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold ${guestCategoryFilter === 'UNASSIGNED' ? 'text-red-100' : 'text-slate-500'}`}>
              Belum Ada Tenda
            </span>
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
              guestCategoryFilter === 'UNASSIGNED' ? 'bg-white/20 text-white' : 'bg-red-50 text-[#C93B3B]'
            }`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">
            {unassignedGuests.length}
          </div>
          <div className={`text-[10px] mt-1 ${guestCategoryFilter === 'UNASSIGNED' ? 'text-red-100' : 'text-slate-400'}`}>
            Rombongan perlu dipetakan
          </div>
        </button>

        {/* Sudah Ada Tenda */}
        <button
          type="button"
          onClick={() => setGuestCategoryFilter('ASSIGNED')}
          className={`rounded-2xl p-4 text-left border transition-all relative overflow-hidden shadow-2xs ${
            guestCategoryFilter === 'ASSIGNED'
              ? 'bg-[#1E8E4E] text-white border-[#1E8E4E] shadow-md ring-2 ring-[#1E8E4E]/20'
              : 'bg-white text-[#1E194D] border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold ${guestCategoryFilter === 'ASSIGNED' ? 'text-emerald-100' : 'text-slate-500'}`}>
              Sudah Ada Tenda
            </span>
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
              guestCategoryFilter === 'ASSIGNED' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-[#1E8E4E]'
            }`}>
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">
            {assignedGuests.length}
          </div>
          <div className={`text-[10px] mt-1 ${guestCategoryFilter === 'ASSIGNED' ? 'text-emerald-100' : 'text-slate-400'}`}>
            Rombongan terjadwal
          </div>
        </button>

        {/* Semua Rombongan Aktif */}
        <button
          type="button"
          onClick={() => setGuestCategoryFilter('ALL')}
          className={`rounded-2xl p-4 text-left border transition-all relative overflow-hidden shadow-2xs ${
            guestCategoryFilter === 'ALL'
              ? 'bg-[#6355E5] text-white border-[#6355E5] shadow-md ring-2 ring-[#6355E5]/20'
              : 'bg-white text-[#1E194D] border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold ${guestCategoryFilter === 'ALL' ? 'text-indigo-100' : 'text-slate-500'}`}>
              Semua Rombongan
            </span>
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
              guestCategoryFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-[#EDE9FE] text-[#6355E5]'
            }`}>
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">
            {activeGuests.length}
          </div>
          <div className={`text-[10px] mt-1 ${guestCategoryFilter === 'ALL' ? 'text-indigo-100' : 'text-slate-400'}`}>
            Total tamu hadir
          </div>
        </button>

        {/* Total Kursi Terisi */}
        <div className="rounded-2xl p-4 text-left border bg-white text-[#1E194D] border-slate-200/90 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              Kapasitas Kursi
            </span>
            <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-sky-50 text-sky-600">
              <Tent className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">
            {totalOccupiedSeats}<span className="text-sm font-normal text-slate-400">/{totalTentCapacity}</span>
          </div>
          <div className="text-[10px] mt-1 text-slate-400">
            Terisi dari total kursi tenda
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. BAGIAN ATAS: CARD ROMBONGAN TAMU AKTIF (HORIZONTAL SCROLL & FILTER) */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDE9FE] text-[#6355E5] shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1E194D] flex items-center gap-2">
                <span>Rombongan Tamu Aktif</span>
                <span className="rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[10px] font-mono font-bold text-[#6355E5]">
                  {displayedTopGuests.length} Tamu
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Tarik kartu tamu ke blok tenda di bawah, atau pilih tenda langsung dari kartu
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Kategori Tamu */}
            <div className="flex items-center gap-1 p-1 bg-[#F8F9FC] rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setGuestCategoryFilter('UNASSIGNED')}
                className={`py-1 px-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  guestCategoryFilter === 'UNASSIGNED'
                    ? 'bg-white text-[#C93B3B] font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-[#1E194D]'
                }`}
              >
                Belum Ada Tenda ({unassignedGuests.length})
              </button>
              <button
                type="button"
                onClick={() => setGuestCategoryFilter('ASSIGNED')}
                className={`py-1 px-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  guestCategoryFilter === 'ASSIGNED'
                    ? 'bg-white text-[#1E8E4E] font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-[#1E194D]'
                }`}
              >
                Sudah Ada Tenda ({assignedGuests.length})
              </button>
              <button
                type="button"
                onClick={() => setGuestCategoryFilter('ALL')}
                className={`py-1 px-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  guestCategoryFilter === 'ALL'
                    ? 'bg-white text-[#6355E5] font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-[#1E194D]'
                }`}
              >
                Semua ({activeGuests.length})
              </button>
            </div>

            {/* Pencarian Cepat */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari nama, tiket, nagari..."
                className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] pl-8 pr-3 py-1.5 text-xs text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Tombol Geser Kiri - Kanan */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollHorizontal(-340)}
                aria-label="Geser ke kiri"
                className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-[#6355E5] transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollHorizontal(340)}
                aria-label="Geser ke kanan"
                className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-[#6355E5] transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Baris Horizontal Kartu Tamu */}
        <div
          ref={horizontalScrollRef}
          className="flex items-stretch gap-3.5 overflow-x-auto pb-2 pt-1 scroll-smooth snap-x select-none"
          style={{ scrollbarWidth: 'thin' }}
        >
          {displayedTopGuests.length === 0 ? (
            <div className="w-full py-8 text-center rounded-2xl border border-dashed border-slate-200 bg-[#F8F9FC] flex flex-col items-center justify-center space-y-1.5">
              <CheckCircle2 className="h-6 w-6 text-[#1E8E4E]" />
              <p className="text-xs font-bold text-[#1E194D]">Tidak ada rombongan tamu pada filter ini</p>
              <p className="text-[11px] text-slate-500">
                {guestCategoryFilter === 'UNASSIGNED'
                  ? 'Semua tamu aktif telah berhasil dialokasikan ke tenda.'
                  : 'Coba ubah kata kunci pencarian atau ganti filter.'}
              </p>
            </div>
          ) : (
            displayedTopGuests.map((guest) => {
              const currentTent = tents.find((t) => t.id === guest.tentId);
              const isAssigned = Boolean(guest.tentId);

              return (
                <div
                  key={guest.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, guest.id)}
                  className={`min-w-[280px] sm:min-w-[310px] max-w-[330px] rounded-2xl border p-3.5 transition-all cursor-grab active:cursor-grabbing snap-start shrink-0 flex flex-col justify-between space-y-2.5 shadow-2xs ${
                    draggedGuestId === guest.id
                      ? 'border-[#6355E5] ring-2 ring-[#6355E5]/30 bg-purple-50/50'
                      : isAssigned
                      ? 'border-slate-200 bg-white hover:border-[#6355E5]'
                      : 'border-amber-200/90 bg-[#FFFDF5] hover:border-amber-400'
                  }`}
                >
                  {/* Top: Grip, Nama & Tiket */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <GripVertical className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1E194D] truncate">{guest.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{guest.groupOrigin}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-[#EDE9FE] px-2 py-0.5 text-[10px] font-mono font-bold text-[#6355E5]">
                      {guest.ticketCode}
                    </span>
                  </div>

                  {/* Middle Info: Jiwa & Badge Tenda Saat Ini */}
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-[#1E194D] font-mono tabular-nums bg-slate-100 rounded-md px-1.5 py-0.5 text-[10px]">
                        {guest.membersCount} Jiwa
                      </span>
                    </div>

                    {currentTent ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${currentTent.badgeBg} ${currentTent.badgeText}`}
                      >
                        <Tent className="h-2.5 w-2.5" />
                        <span>{currentTent.shortCode}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 text-[10px] font-bold">
                        Belum Ada Tenda
                      </span>
                    )}
                  </div>

                  {/* Bottom: Quick Select Dropdown & Unassign */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <select
                      value={guest.tentId ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                          onAssignTent(guest.id, null, null);
                        } else {
                          const tentTables = tables.filter((t) => t.tentId === val);
                          onAssignTent(guest.id, val, tentTables[0]?.id || null);
                        }
                      }}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-[#1E194D] focus:border-[#6355E5] focus:outline-none"
                    >
                      <option value="">-- Belum Ada Tenda --</option>
                      {tents.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.shortCode} ({t.name.split(' — ')[0]})
                        </option>
                      ))}
                    </select>

                    {guest.tentId && (
                      <button
                        type="button"
                        onClick={() => onAssignTent(guest.id, null, null)}
                        title="Lepas dari tenda"
                        className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BAGIAN BAWAH: BLOK TENDA-TENDA (DENAH VISUAL, CRUD TENDA & MEJA) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Header Toolbar: Judul, Info, dan Pengalih Mode Tampilan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 text-[#6355E5]">
              <Tent className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1E194D]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                  Blok Tenda & Meja Jamba
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#6355E5] border border-purple-100">
                  {tents.length} Blok
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Tarik kartu tamu dari baris atas ke tenda di bawah untuk memetakan tempat duduk
              </p>
            </div>
          </div>

          {/* Switcher Tampilan: Kartu Penuh (100% Horizontal) vs Grid 2 Kolom */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-500 font-medium hidden md:inline">Tampilan:</span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewLayout('full')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewLayout === 'full'
                    ? 'bg-white text-[#6355E5] shadow-xs'
                    : 'text-slate-600 hover:text-[#1E194D]'
                }`}
                title="Tampilan Kartu Penuh Horizontal (Lebar 100% Luas & Lapang)"
              >
                <Rows className="h-3.5 w-3.5" />
                <span>Kartu Penuh (100%)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('grid')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewLayout === 'grid'
                    ? 'bg-white text-[#6355E5] shadow-xs'
                    : 'text-slate-600 hover:text-[#1E194D]'
                }`}
                title="Tampilan Grid 2 Kolom"
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Grid 2 Kolom</span>
              </button>
            </div>
          </div>
        </div>

        {/* Daftar Blok Tenda: Full-Width Horizontal atau Grid 2 Kolom */}
        <div className={viewLayout === 'full' ? 'space-y-6' : 'grid grid-cols-1 md:grid-cols-2 gap-5'}>
          {tents.map((tent) => {
            const assignedToThisTent = activeGuests.filter((g) => g.tentId === tent.id);
            const occupiedSeats = assignedToThisTent.reduce((acc, g) => acc + g.membersCount, 0);
            const tentTables = tables.filter((t) => t.tentId === tent.id);
            const isOver = occupiedSeats > tent.capacity;
            const fillPct = Math.min(100, Math.round((occupiedSeats / tent.capacity) * 100));
            const isDragHover = dragOverTentId === tent.id;

            // Sorting helper for guests in this tent
            const currentSort = tentSortMap[tent.id] || { key: 'table', direction: 'asc' };
            const sortedAssignedGuests = [...assignedToThisTent].sort((a, b) => {
              let cmp = 0;
              if (currentSort.key === 'table') {
                const tA = a.tableId ?? 99999;
                const tB = b.tableId ?? 99999;
                cmp = tA - tB;
                if (cmp === 0) cmp = a.name.localeCompare(b.name, 'id');
              } else if (currentSort.key === 'name') {
                cmp = a.name.localeCompare(b.name, 'id');
              } else if (currentSort.key === 'members') {
                cmp = a.membersCount - b.membersCount;
              } else if (currentSort.key === 'ticket') {
                cmp = a.ticketCode.localeCompare(b.ticketCode);
              }
              return currentSort.direction === 'asc' ? cmp : -cmp;
            });

            // TAMPILAN 1: KARTU PENUH HORIZONTAL (100% LEBAR LUAS & AIRY)
            if (viewLayout === 'full') {
              return (
                <div
                  key={tent.id}
                  onDragOver={(e) => handleDragOver(e, tent.id)}
                  onDragLeave={() => setDragOverTentId(null)}
                  onDrop={(e) => handleDropOnTent(e, tent.id)}
                  className={`w-full rounded-3xl bg-white border p-6 sm:p-8 shadow-xs hover:shadow-md transition-all space-y-6 relative overflow-hidden ${
                    isDragHover
                      ? 'border-[#6355E5] ring-4 ring-[#6355E5]/20 bg-[#F8F7FF]'
                      : isOver
                      ? 'border-red-300'
                      : 'border-slate-200/90'
                  }`}
                >
                  {/* Decorative top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6355E5] via-[#8B5CF6] to-[#EC4899] opacity-90" />
                  {/* Header Bar Kartu Tenda Penuh: Badge, Nama, Kapasitas, & Tombol CRUD */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    {/* Sisi Kiri: Badge Tenda, Nama Lengkap, Deskripsi Zona, & Tag Ringkasan */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <span
                        className={`inline-flex items-center justify-center rounded-2xl px-3.5 py-2 text-sm font-black shadow-2xs shrink-0 ${tent.badgeBg} ${tent.badgeText}`}
                      >
                        {tent.shortCode}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className="text-lg font-bold text-[#1E194D]"
                            style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                          >
                            {tent.name}
                          </h3>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                            <LayoutGrid className="h-3 w-3 text-slate-500" />
                            {tentTables.length} Meja Jamba
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 text-[#6355E5] px-2.5 py-0.5 text-xs font-bold border border-purple-100">
                            <Users className="h-3 w-3" />
                            {assignedToThisTent.length} Rombongan
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {tent.zoneDesc}
                        </p>
                      </div>
                    </div>

                    {/* Sisi Kanan: Widget Kapasitas Kursi & Aksi (Tambah Meja, Edit, Hapus) */}
                    <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                      {/* Bar Kapasitas Kursi */}
                      <div className="bg-[#F8F9FC] border border-slate-200/80 rounded-2xl px-4 py-2.5 min-w-[220px]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[11px] text-slate-500 font-medium">Kapasitas Tenda:</span>
                          <span className="font-mono font-bold text-[#1E194D] tabular-nums text-xs">
                            {occupiedSeats} / {tent.capacity} Kursi ({fillPct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOver ? 'bg-red-500' : fillPct >= 80 ? 'bg-amber-500' : 'bg-[#6355E5]'
                            }`}
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                          <span>
                            {isOver ? (
                              <span className="text-red-600 font-bold flex items-center gap-0.5">
                                <AlertTriangle className="h-3 w-3" /> Lebih {occupiedSeats - tent.capacity} kursi
                              </span>
                            ) : (
                              `Sisa ${tent.capacity - occupiedSeats} kursi kosong`
                            )}
                          </span>
                          <span>Batas: {tent.capacity}</span>
                        </div>
                      </div>

                      {/* Tombol Aksi Tenda & Meja */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenAddTableForTent(tent.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#6355E5] text-white px-3.5 py-2 text-xs font-bold hover:bg-[#5244D4] transition-all shadow-xs"
                          title="Tambah Meja Jamba di Tenda Ini"
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>+ Meja</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditTent(tent)}
                          title="Edit Tenda"
                          className="rounded-xl p-2 text-slate-400 hover:text-[#6355E5] hover:bg-purple-50 border border-slate-200/80 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setTentToDelete(tent)}
                          title="Hapus Tenda"
                          className="rounded-xl p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200/80 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Stacked Layout: Horizontal Meja Jamba row on top, Full-width Guest Table below */}
                  <div className="space-y-6">
                    {/* TOP SECTION: MEJA JAMBA CARDS HORIZONTALLY SIDE-BY-SIDE */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LayoutGrid className="h-4 w-4 text-[#6355E5]" />
                          <h4 className="text-xs font-bold text-[#1E194D]">
                            Meja Jamba ({tentTables.length})
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium">
                            (Tata Letak Jamba Per Meja)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenAddTableForTent(tent.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3.5 py-1.5 text-xs font-bold text-[#6355E5] hover:bg-purple-100 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>+ Tambah Meja</span>
                        </button>
                      </div>

                      {tentTables.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-[#F8F9FC] p-4 text-center space-y-2">
                          <p className="text-xs text-slate-400 italic">
                            Belum ada meja jamba di tenda ini.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleOpenAddTableForTent(tent.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-3 py-1 text-xs font-bold text-[#6355E5] hover:bg-purple-50 shadow-2xs"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Tambah Meja Pertama</span>
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                          {tentTables.map((tbl) => {
                            const guestsAtTable = assignedToThisTent.filter((g) => g.tableId === tbl.id);
                            const occupiedTableSeats = guestsAtTable.reduce(
                              (acc, g) => acc + g.membersCount,
                              0
                            );
                            const tableFillPct = Math.min(100, Math.round((occupiedTableSeats / tbl.capacity) * 100));
                            const isTableOver = occupiedTableSeats > tbl.capacity;

                            return (
                              <div
                                key={tbl.id}
                                className="rounded-2xl border border-slate-200/90 bg-white p-3.5 hover:border-[#6355E5]/40 transition-all shadow-2xs space-y-2.5 relative overflow-hidden"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="font-bold text-[#1E194D] text-xs truncate">
                                      {tbl.name}
                                    </p>
                                    <span className="text-[10px] text-slate-500 font-medium">
                                      {guestsAtTable.length} Rombongan terpetakan
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <div className="h-7 w-7 rounded-xl bg-purple-50 text-[#6355E5] flex items-center justify-center shrink-0 mr-1">
                                      <LayoutGrid className="h-3.5 w-3.5" />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditTable(tbl)}
                                      title="Edit Meja"
                                      className="rounded-lg p-1 text-slate-400 hover:text-[#6355E5] hover:bg-purple-50 transition-colors"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setTableToDelete(tbl)}
                                      title="Hapus Meja"
                                      className="rounded-lg p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Progress bar kapasitas meja */}
                                <div>
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                                    <span>Keterisian:</span>
                                    <span className={`font-mono font-bold ${isTableOver ? 'text-red-600' : 'text-[#1E194D]'}`}>
                                      {occupiedTableSeats}/{tbl.capacity} Kursi
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        isTableOver ? 'bg-red-500' : tableFillPct >= 80 ? 'bg-amber-500' : 'bg-[#6355E5]'
                                      }`}
                                      style={{ width: `${tableFillPct}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* DIVIDER ANTARA MEJA & TABEL TAMU */}
                    <div className="pt-2 border-t border-slate-100"></div>

                    {/* BAGIAN KANAN: TABEL ROMBONGAN TAMU DI TENDA (LUAS & LEBAR PENUH) */}
                    <div className="space-y-3">
                      {/* Kontrol Sortir & Judul Tabel Rombongan */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#1E194D]">
                            Daftar Rombongan di Tenda Ini ({assignedToThisTent.length})
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono tabular-nums bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                            {occupiedSeats} jiwa
                          </span>
                        </div>

                        {/* Kontrol Sortir Rombongan */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <span className="text-[10px] text-slate-500 font-medium">Sortir:</span>
                          <select
                            value={currentSort.key}
                            onChange={(e) => {
                              const newKey = e.target.value as TentSortKey;
                              setTentSortMap((prev) => ({
                                ...prev,
                                [tent.id]: { key: newKey, direction: prev[tent.id]?.direction || 'asc' },
                              }));
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-[#1E194D] focus:border-[#6355E5] focus:outline-none"
                          >
                            <option value="table">Nomor Meja</option>
                            <option value="name">Nama Rombongan</option>
                            <option value="members">Jumlah Jiwa</option>
                            <option value="ticket">No. Tiket</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              setTentSortMap((prev) => {
                                const cur = prev[tent.id] || { key: 'table', direction: 'asc' };
                                return {
                                  ...prev,
                                  [tent.id]: {
                                    key: cur.key,
                                    direction: cur.direction === 'asc' ? 'desc' : 'asc',
                                  },
                                };
                              });
                            }}
                            title={currentSort.direction === 'asc' ? 'Urutan Naik (A-Z / 1-9)' : 'Urutan Turun (Z-A / 9-1)'}
                            className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:text-[#6355E5] hover:bg-slate-50 transition-colors"
                          >
                            {currentSort.direction === 'asc' ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Tabel Rombongan Terstruktur (Lebar, Jelas, & Nyaman) */}
                      {assignedToThisTent.length === 0 ? (
                        <div className="h-44 rounded-2xl border border-dashed border-slate-200 bg-[#F8F9FC] flex flex-col items-center justify-center text-center p-4 text-xs text-slate-400 space-y-2">
                          <Users className="h-6 w-6 text-slate-300" />
                          <p className="font-medium text-slate-500">Tenda ini belum memiliki rombongan tamu.</p>
                          <span className="text-[11px] text-slate-400">
                            Tarik kartu tamu dari baris atas atau pilih tenda ini langsung dari kartu tamu di atas
                          </span>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
                          <div className="overflow-x-auto max-h-[350px]" style={{ scrollbarWidth: 'thin' }}>
                            <table className="w-full text-left border-collapse text-xs">
                              <thead className="bg-[#F8F9FC] border-b border-slate-200 sticky top-0 z-10 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                  <th className="py-2.5 px-3 text-center w-10">No.</th>
                                  <th
                                    onClick={() => {
                                      setTentSortMap((prev) => {
                                        const cur = prev[tent.id] || { key: 'table', direction: 'asc' };
                                        return {
                                          ...prev,
                                          [tent.id]: {
                                            key: 'ticket',
                                            direction: cur.key === 'ticket' && cur.direction === 'asc' ? 'desc' : 'asc',
                                          },
                                        };
                                      });
                                    }}
                                    className="py-2.5 px-3 font-mono cursor-pointer hover:text-[#6355E5] select-none whitespace-nowrap w-28"
                                  >
                                    <div className="flex items-center gap-1">
                                      <span>No Tiket</span>
                                      {currentSort.key === 'ticket' && (
                                        <span>{currentSort.direction === 'asc' ? '↑' : '↓'}</span>
                                      )}
                                    </div>
                                  </th>
                                  <th
                                    onClick={() => {
                                      setTentSortMap((prev) => {
                                        const cur = prev[tent.id] || { key: 'table', direction: 'asc' };
                                        return {
                                          ...prev,
                                          [tent.id]: {
                                            key: 'name',
                                            direction: cur.key === 'name' && cur.direction === 'asc' ? 'desc' : 'asc',
                                          },
                                        };
                                      });
                                    }}
                                    className="py-2.5 px-3 cursor-pointer hover:text-[#6355E5] select-none min-w-[160px]"
                                  >
                                    <div className="flex items-center gap-1">
                                      <span>Nama Rombongan</span>
                                      {currentSort.key === 'name' && (
                                        <span>{currentSort.direction === 'asc' ? '↑' : '↓'}</span>
                                      )}
                                    </div>
                                  </th>
                                  <th className="py-2.5 px-3 min-w-[140px]">
                                    <span>Asal</span>
                                  </th>
                                  <th
                                    onClick={() => {
                                      setTentSortMap((prev) => {
                                        const cur = prev[tent.id] || { key: 'table', direction: 'asc' };
                                        return {
                                          ...prev,
                                          [tent.id]: {
                                            key: 'members',
                                            direction: cur.key === 'members' && cur.direction === 'asc' ? 'desc' : 'asc',
                                          },
                                        };
                                      });
                                    }}
                                    className="py-2.5 px-3 text-center cursor-pointer hover:text-[#6355E5] select-none whitespace-nowrap w-24"
                                  >
                                    <div className="flex items-center justify-center gap-0.5">
                                      <span>Jumlah</span>
                                      {currentSort.key === 'members' && (
                                        <span>{currentSort.direction === 'asc' ? '↑' : '↓'}</span>
                                      )}
                                    </div>
                                  </th>
                                  <th
                                    onClick={() => {
                                      setTentSortMap((prev) => {
                                        const cur = prev[tent.id] || { key: 'table', direction: 'asc' };
                                        return {
                                          ...prev,
                                          [tent.id]: {
                                            key: 'table',
                                            direction: cur.key === 'table' && cur.direction === 'asc' ? 'desc' : 'asc',
                                          },
                                        };
                                      });
                                    }}
                                    className="py-2.5 px-3 cursor-pointer hover:text-[#6355E5] select-none min-w-[150px]"
                                  >
                                    <div className="flex items-center gap-1">
                                      <span>Meja</span>
                                      {currentSort.key === 'table' && (
                                        <span>{currentSort.direction === 'asc' ? '↑' : '↓'}</span>
                                      )}
                                    </div>
                                  </th>
                                  <th className="py-2.5 px-3 text-center w-12">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-xs">
                                {sortedAssignedGuests.map((g, idx) => (
                                  <tr key={g.id} className="hover:bg-purple-50/40 transition-colors">
                                    <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-semibold">
                                      {idx + 1}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono font-bold text-[#6355E5] whitespace-nowrap">
                                      {g.ticketCode}
                                    </td>
                                    <td className="py-2.5 px-3 font-bold text-[#1E194D]">
                                      <div className="truncate max-w-[220px]" title={g.name}>
                                        {g.name}
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-600">
                                      <div className="truncate max-w-[180px]" title={g.groupOrigin}>
                                        {g.groupOrigin}
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                      <span className="font-bold font-mono text-[#1E194D] bg-slate-100 px-2 py-0.5 rounded-lg text-xs inline-block">
                                        {g.membersCount} Jiwa
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <select
                                        value={g.tableId ?? ''}
                                        onChange={(e) => {
                                          const tableVal = e.target.value ? Number(e.target.value) : null;
                                          onAssignTent(g.id, g.tentId, tableVal);
                                        }}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:border-[#6355E5] focus:outline-none"
                                      >
                                        <option value="">-- Belum Pilih Meja --</option>
                                        {tentTables.map((t) => (
                                          <option key={t.id} value={t.id}>
                                            {t.name} ({t.capacity} krs)
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <button
                                        type="button"
                                        onClick={() => onAssignTent(g.id, null, null)}
                                        title="Keluarkan dari tenda ini"
                                        className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // TAMPILAN 2: GRID 2 KOLOM (KOMPAK)
            return (
              <div
                key={tent.id}
                onDragOver={(e) => handleDragOver(e, tent.id)}
                onDragLeave={() => setDragOverTentId(null)}
                onDrop={(e) => handleDropOnTent(e, tent.id)}
                className={`rounded-3xl bg-white border p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                  isDragHover
                    ? 'border-[#6355E5] ring-4 ring-[#6355E5]/20 bg-[#F8F7FF]'
                    : isOver
                    ? 'border-red-300'
                    : 'border-slate-200/90'
                }`}
              >
                <div>
                  {/* Card Header: Badge, Nama, Aksi Edit & Hapus Tenda (CRUD Tenda) */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${tent.badgeBg} ${tent.badgeText}`}
                        >
                          {tent.shortCode}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                          {tentTables.length} meja
                        </span>
                      </div>
                      <h3
                        className="text-base font-bold text-[#1E194D] truncate"
                        style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                      >
                        {tent.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-1">
                        {tent.zoneDesc}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditTent(tent)}
                        title="Edit Tenda"
                        className="rounded-xl p-1.5 text-slate-400 hover:text-[#6355E5] hover:bg-purple-50 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setTentToDelete(tent)}
                        title="Hapus Tenda"
                        className="rounded-xl p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar Kapasitas Kursi Tenda */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Daya Tampung Tenda:</span>
                      <span className="font-mono font-bold text-[#1E194D] tabular-nums">
                        {occupiedSeats} / {tent.capacity} Kursi ({fillPct}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver ? 'bg-red-500' : fillPct >= 80 ? 'bg-amber-500' : 'bg-[#6355E5]'
                        }`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>
                        {isOver ? (
                          <span className="text-red-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Lebih {occupiedSeats - tent.capacity} kursi
                          </span>
                        ) : (
                          `Sisa ${tent.capacity - occupiedSeats} kursi kosong`
                        )}
                      </span>
                      <span>Batas: {tent.capacity}</span>
                    </div>
                  </div>

                  {/* SUBSECTION MEJA JAMBA */}
                  <div className="rounded-2xl bg-[#F8F9FC] border border-slate-200/80 p-3 mb-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <LayoutGrid className="h-3.5 w-3.5 text-slate-600" />
                        <span className="text-xs font-bold text-[#1E194D]">
                          Meja Jamba ({tentTables.length})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenAddTableForTent(tent.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-[#6355E5] hover:bg-[#EDE9FE]/50 transition-colors shadow-2xs"
                      >
                        <Plus className="h-3 w-3 stroke-[2.5]" />
                        <span>+ Tambah Meja</span>
                      </button>
                    </div>

                    {tentTables.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-1">
                        Belum ada meja jamba di tenda ini. Klik + Tambah Meja untuk menambahkan.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {tentTables.map((tbl) => {
                          const guestsAtTable = assignedToThisTent.filter((g) => g.tableId === tbl.id);
                          const occupiedTableSeats = guestsAtTable.reduce(
                            (acc, g) => acc + g.membersCount,
                            0
                          );

                          return (
                            <div
                              key={tbl.id}
                              className="rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-between gap-1.5 shadow-2xs text-xs"
                            >
                              <div className="min-w-0">
                                <p className="font-bold text-[#1E194D] truncate text-[11px]">
                                  {tbl.name}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono tabular-nums">
                                  {occupiedTableSeats}/{tbl.capacity} kursi
                                </p>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditTable(tbl)}
                                  title="Edit Meja"
                                  className="rounded p-1 text-slate-400 hover:text-[#6355E5] hover:bg-slate-50"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTableToDelete(tbl)}
                                  title="Hapus Meja"
                                  className="rounded p-1 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* DAFTAR TAMU YANG DITEMPATKAN DI TENDA INI (TABEL MINI) */}
                  <div className="space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1E194D]">
                          Rombongan di Tenda Ini ({assignedToThisTent.length})
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono tabular-nums bg-slate-100 px-2 py-0.5 rounded-full">
                          {occupiedSeats} jiwa
                        </span>
                      </div>

                      {/* Kontrol Sortir Rombongan */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <span className="text-[10px] text-slate-500 font-medium">Sortir:</span>
                        <select
                          value={currentSort.key}
                          onChange={(e) => {
                            const newKey = e.target.value as TentSortKey;
                            setTentSortMap((prev) => ({
                              ...prev,
                              [tent.id]: { key: newKey, direction: prev[tent.id]?.direction || 'asc' },
                            }));
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-[#1E194D] focus:border-[#6355E5] focus:outline-none"
                        >
                          <option value="table">Nomor Meja</option>
                          <option value="name">Nama Rombongan</option>
                          <option value="members">Jumlah Jiwa</option>
                          <option value="ticket">No. Tiket</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            setTentSortMap((prev) => {
                              const cur = prev[tent.id] || { key: 'table', direction: 'asc' };
                                return {
                                  ...prev,
                                  [tent.id]: {
                                    key: cur.key,
                                    direction: cur.direction === 'asc' ? 'desc' : 'asc',
                                  },
                                };
                              });
                            }}
                            title={currentSort.direction === 'asc' ? 'Urutan Naik (A-Z / 1-9)' : 'Urutan Turun (Z-A / 9-1)'}
                            className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:text-[#6355E5] hover:bg-slate-50 transition-colors"
                          >
                            {currentSort.direction === 'asc' ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Tabel Mini Terstruktur */}
                      {assignedToThisTent.length === 0 ? (
                        <div className="h-28 rounded-2xl border border-dashed border-slate-200 bg-[#F8F9FC] flex flex-col items-center justify-center text-center p-3 text-[11px] text-slate-400 space-y-1">
                          <Users className="h-5 w-5 text-slate-300" />
                          <span>Tarik kartu tamu dari baris atas ke area tenda ini</span>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
                          <div className="overflow-x-auto max-h-[260px]" style={{ scrollbarWidth: 'thin' }}>
                            <table className="w-full text-left border-collapse text-xs">
                              <thead className="bg-[#F8F9FC] border-b border-slate-200 sticky top-0 z-10 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                  <th className="py-2 px-2 text-center w-8">No.</th>
                                  <th
                                    onClick={() => {
                                      setTentSortMap((prev) => {
                                        const cur = prev[tent.id] || { key: 'table', direction: 'asc' };
                                        return {
                                          ...prev,
                                          [tent.id]: {
                                            key: 'ticket',
                                            direction: cur.key === 'ticket' && cur.direction === 'asc' ? 'desc' : 'asc',
                                          },
                                        };
                                      });
                                    }}
                                    className="py-2 px-2.5 font-mono cursor-pointer hover:text-[#6355E5] select-none whitespace-nowrap"
                                  >
                                    <div className="flex items-center gap-1">
                                      <span>No Tiket</span>
                                      {currentSort.key === 'ticket' && (
                                        <span>{currentSort.direction === 'asc' ? '↑' : '↓'}</span>
                                      )}
                                    </div>
                                  </th>
                                  <th
                                    onClick={() => {
                                      setTentSortMap((prev) => {
                                        const cur = prev[tent.id] || { key: 'table', direction: 'asc' };
                                        return {
                                          ...prev,
                                          [tent.id]: {
                                            key: 'name',
                                            direction: cur.key === 'name' && cur.direction === 'asc' ? 'desc' : 'asc',
                                          },
                                        };
                                      });
                                    }}
                                    className="py-2 px-2.5 cursor-pointer hover:text-[#6355E5] select-none min-w-[130px]"
                                  >
                                    <div className="flex items-center gap-1">
                                      <span>Nama Rombongan</span>
                                      {currentSort.key === 'name' && (
                                        <span>{currentSort.direction === 'asc' ? '↑' : '↓'}</span>
                                      )}
                                    </div>
                                  </th>
                                  <th className="py-2 px-2.5 min-w-[120px]">
                                    <span>Asal</span>
                                  </th>
                                  <th
                                    onClick={() => {
                                      setTentSortMap((prev) => {
                                        const cur = prev[tent.id] || { key: 'table', direction: 'asc' };
                                        return {
                                          ...prev,
                                          [tent.id]: {
                                            key: 'members',
                                            direction: cur.key === 'members' && cur.direction === 'asc' ? 'desc' : 'asc',
                                          },
                                        };
                                      });
                                    }}
                                    className="py-2 px-2 text-center cursor-pointer hover:text-[#6355E5] select-none whitespace-nowrap w-16"
                                  >
                                    <div className="flex items-center justify-center gap-0.5">
                                      <span>Jumlah</span>
                                      {currentSort.key === 'members' && (
                                        <span>{currentSort.direction === 'asc' ? '↑' : '↓'}</span>
                                      )}
                                    </div>
                                  </th>
                                  <th
                                    onClick={() => {
                                      setTentSortMap((prev) => {
                                        const cur = prev[tent.id] || { key: 'table', direction: 'asc' };
                                        return {
                                          ...prev,
                                          [tent.id]: {
                                            key: 'table',
                                            direction: cur.key === 'table' && cur.direction === 'asc' ? 'desc' : 'asc',
                                          },
                                        };
                                      });
                                    }}
                                    className="py-2 px-2.5 cursor-pointer hover:text-[#6355E5] select-none min-w-[110px]"
                                  >
                                    <div className="flex items-center gap-1">
                                      <span>Meja</span>
                                      {currentSort.key === 'table' && (
                                        <span>{currentSort.direction === 'asc' ? '↑' : '↓'}</span>
                                      )}
                                    </div>
                                  </th>
                                  <th className="py-2 px-2 text-center w-8">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-[11px]">
                                {sortedAssignedGuests.map((g, idx) => (
                                  <tr key={g.id} className="hover:bg-purple-50/40 transition-colors">
                                    <td className="py-2 px-2 text-center font-mono text-slate-400 font-semibold">
                                      {idx + 1}
                                    </td>
                                    <td className="py-2 px-2.5 font-mono font-bold text-[#6355E5] whitespace-nowrap">
                                      {g.ticketCode}
                                    </td>
                                    <td className="py-2.5 px-2.5 font-bold text-[#1E194D]">
                                      <div className="truncate max-w-[150px]" title={g.name}>
                                        {g.name}
                                      </div>
                                    </td>
                                    <td className="py-2 px-2.5 text-slate-600">
                                      <div className="truncate max-w-[130px]" title={g.groupOrigin}>
                                        {g.groupOrigin}
                                      </div>
                                    </td>
                                    <td className="py-2 px-2 text-center whitespace-nowrap">
                                      <span className="font-bold font-mono text-[#1E194D] bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                        {g.membersCount} Jiwa
                                      </span>
                                    </td>
                                    <td className="py-2 px-2.5">
                                      <select
                                        value={g.tableId ?? ''}
                                        onChange={(e) => {
                                          const tableVal = e.target.value ? Number(e.target.value) : null;
                                          onAssignTent(g.id, g.tentId, tableVal);
                                        }}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-semibold text-slate-700 focus:border-[#6355E5] focus:outline-none"
                                      >
                                        <option value="">-- Meja --</option>
                                        {tentTables.map((t) => (
                                          <option key={t.id} value={t.id}>
                                            {t.name.split(' — ')[0]} ({t.capacity} krs)
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="py-2 px-2 text-center">
                                      <button
                                        type="button"
                                        onClick={() => onAssignTent(g.id, null, null)}
                                        title="Keluarkan dari tenda ini"
                                        className="rounded-lg p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* ========================================================================= */}
      {/* MODAL CRUD TENDA & MEJA */}
      {/* ========================================================================= */}
      <TentModal
        isOpen={isTentModalOpen}
        onClose={() => {
          setIsTentModalOpen(false);
          setEditingTent(null);
        }}
        onSave={onSaveTent}
        editingTent={editingTent}
      />

      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => {
          setIsTableModalOpen(false);
          setEditingTable(null);
        }}
        onSave={onSaveTable}
        editingTable={editingTable}
        defaultTentId={tableModalDefaultTentId}
        tents={tents}
      />

      {/* Dialog Konfirmasi Hapus Tenda */}
      {tentToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#16122E]/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1E194D]">
                  Hapus {tentToDelete.name}?
                </h3>
                <p className="text-xs text-slate-500">Konfirmasi tindakan penghapusan blok tenda</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-amber-50 border border-amber-200 rounded-xl p-3">
              Tamu yang sedang berada di tenda ini akan <strong>otomatis dipindahkan ke status belum memiliki tenda</strong>, dan meja jamba di dalam tenda ini akan dihapus.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTentToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteTent}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs"
              >
                Ya, Hapus Tenda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Konfirmasi Hapus Meja */}
      {tableToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#16122E]/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1E194D]">
                  Hapus {tableToDelete.name}?
                </h3>
                <p className="text-xs text-slate-500">Konfirmasi penghapusan meja jamba</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tamu yang telah dialokasikan ke meja ini akan tetap berada di blok tenda, namun status nomor mejanya akan dikosongkan.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTableToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteTable}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs"
              >
                Ya, Hapus Meja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
