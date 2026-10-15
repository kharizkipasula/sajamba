'use client';

import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  FolderKanban,
  UserPlus,
  ArrowUpRight,
  UtensilsCrossed,
  QrCode,
  LayoutGrid,
  FileSpreadsheet,
  Sparkles,
  Check,
  User,
  Tent,
  Ticket,
} from 'lucide-react';
import {
  Guest,
  ActivityItem,
  TableItem,
  TentBlock,
  AVATAR_STYLES,
} from '@/lib/bajamba-data';

export type NavTab =
  | 'dashboard'
  | 'register'
  | 'guests'
  | 'tents'
  | 'checkin';

interface DashboardViewProps {
  guests: Guest[];
  activities: ActivityItem[];
  tables: TableItem[];
  tents: TentBlock[];
  onNavigate: (tab: NavTab) => void;
  onOpenAddModal: () => void;
}

export default function DashboardView({
  guests,
  activities,
  tables,
  tents,
  onNavigate,
  onOpenAddModal,
}: DashboardViewProps) {
  const totalInvitations = guests.length;
  const totalInvitedSouls = guests.reduce((acc, g) => acc + g.membersCount, 0);

  const attendingGuests = guests.filter((g) => g.rsvpStatus === 'Hadir');
  const attendingSouls = attendingGuests.reduce((acc, g) => acc + g.membersCount, 0);

  const pendingGuests = guests.filter((g) => g.rsvpStatus === 'Belum Konfirmasi');
  const pendingSouls = pendingGuests.reduce((acc, g) => acc + g.membersCount, 0);

  const declinedGuests = guests.filter((g) => g.rsvpStatus === 'Berhalangan');
  const declinedSouls = declinedGuests.reduce((acc, g) => acc + g.membersCount, 0);

  const uniqueGroups = new Set(guests.map((g) => g.groupOrigin.trim())).size;
  const checkedInCount = guests.filter((g) => g.checkedIn).length;
  const checkedInSouls = guests
    .filter((g) => g.checkedIn)
    .reduce((acc, g) => acc + g.membersCount, 0);

  const maxStatusSouls = Math.max(attendingSouls, pendingSouls, declinedSouls, 1);

  const totalSeatsCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);
  const assignedSeats = guests
    .filter((g) => g.tableId !== null && g.rsvpStatus !== 'Berhalangan')
    .reduce((acc, g) => acc + g.membersCount, 0);

  const unassignedTentCount = guests.filter((g) => g.rsvpStatus !== 'Berhalangan' && !g.tentId).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6355E5]">
              <span>Perhelatan Adat Kota Sawahlunto</span>
              <span aria-hidden="true">·</span>
              <span>Balai Adat Nagari & Balai Ransum</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E194D]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Makan Bajamba Sawahlunto
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Platform terpadu registrasi tamu mandiri, penerbitan e-tiket QR Code, pemetaan tenda adat,
              penataan meja jamba, dan check-in gerbang secara real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="rounded-full border border-[#6355E5] bg-white px-5 py-2.5 text-xs font-bold text-[#6355E5] hover:bg-[#EDE9FE]/50 transition-colors flex items-center gap-1.5"
            >
              <Ticket className="h-4 w-4" />
              <span>Link Pendaftaran Tamu</span>
            </button>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-2 rounded-full bg-[#6355E5] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#5243D4] transition-colors shadow-xs"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Tambah Tamu</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Kartu Statistik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Tamu Terdaftar</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#1E194D] font-mono tabular-nums">
                  {totalInvitedSouls}
                </span>
                <span className="text-xs font-semibold text-slate-500">jiwa</span>
              </div>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#6355E5]">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{totalInvitations} rombongan e-tiket</span>
            <button
              type="button"
              onClick={() => onNavigate('guests')}
              className="font-bold text-[#6355E5] hover:underline"
            >
              Lihat tabel
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500">Sudah Konfirmasi Hadir</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#1E8E4E] font-mono tabular-nums">
                  {attendingSouls}
                </span>
                <span className="text-xs font-semibold text-slate-500">jiwa ({attendingGuests.length} keluarga)</span>
              </div>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E6F6EC] text-[#1E8E4E]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{checkedInSouls} jiwa sudah tiba di lokasi</span>
            <button
              type="button"
              onClick={() => onNavigate('checkin')}
              className="font-bold text-[#1E8E4E] hover:underline"
            >
              Check-in
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500">Belum Konfirmasi</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#1E194D] font-mono tabular-nums">
                  {pendingSouls}
                </span>
                <span className="text-xs font-semibold text-slate-500">jiwa ({pendingGuests.length} keluarga)</span>
              </div>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EFEFF6] text-[#555177]">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Berhalangan: {declinedSouls} jiwa</span>
            <span className="font-mono text-slate-400">Menunggu RSVP</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500">Status Pemetaan Tenda</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#6355E5] font-mono tabular-nums">
                  {tents.length}
                </span>
                <span className="text-xs font-semibold text-slate-500">Blok Tenda Utama</span>
              </div>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#6355E5]">
              <Tent className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{unassignedTentCount} rombongan belum dipetakan</span>
            <button
              type="button"
              onClick={() => onNavigate('tents')}
              className="font-bold text-[#6355E5] hover:underline"
            >
              Atur Tenda
            </button>
          </div>
        </div>
      </div>

      {/* Overview Blok Tenda Interaktif */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E194D]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Okupansi Kursi per Blok Tenda
            </h2>
            <p className="text-xs text-slate-500">
              Kapasitas dan keterisian rombongan pada 4 Tenda Acara Balai Adat Sawahlunto
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('tents')}
            className="text-xs font-bold text-[#6355E5] hover:underline"
          >
            Buka Denah Lengkap →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {tents.map((tent) => {
            const tentGuests = guests.filter((g) => g.tentId === tent.id && g.rsvpStatus !== 'Berhalangan');
            const occupied = tentGuests.reduce((acc, g) => acc + g.membersCount, 0);
            const fillPct = Math.min(100, Math.round((occupied / tent.capacity) * 100));

            return (
              <div key={tent.id} className="rounded-2xl border border-slate-100 bg-[#F8F9FC] p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${tent.badgeBg} ${tent.badgeText}`}>
                    {tent.shortCode}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#1E194D] tabular-nums">
                    {occupied}/{tent.capacity} kursi
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#1E194D] truncate">{tent.name.split(' — ')[1] || tent.name}</h3>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full ${fillPct >= 90 ? 'bg-amber-500' : 'bg-[#6355E5]'}`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{tentGuests.length} Rombongan</span>
                  <span className="font-mono">{fillPct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split: Grafik Status RSVP & Aktivitas Scan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-[#1E194D]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                  Grafik Status Kehadiran
                </h2>
                <p className="text-xs text-slate-500">
                  Perbandingan rombongan keluarga & jiwa berdasarkan respon kehadiran
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 tabular-nums">
                Total: {totalInvitedSouls} Jiwa
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Hadir', souls: attendingSouls, families: attendingGuests.length, bg: 'bg-[#1E8E4E]', badge: 'bg-[#E6F6EC] text-[#1E8E4E]' },
                { label: 'Belum Pasti', souls: pendingSouls, families: pendingGuests.length, bg: 'bg-[#6355E5]', badge: 'bg-[#EFEFF6] text-[#555177]' },
                { label: 'Berhalangan', souls: declinedSouls, families: declinedGuests.length, bg: 'bg-[#C93B3B]', badge: 'bg-[#FDECEB] text-[#C93B3B]' },
              ].map((st) => {
                const heightPct = Math.max(15, Math.round((st.souls / maxStatusSouls) * 100));
                return (
                  <div key={st.label} className="rounded-2xl border border-slate-100 bg-[#F8F9FC] p-3.5 flex flex-col justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-center ${st.badge} mb-2`}>
                      {st.label}
                    </span>
                    <div className="h-24 flex items-end justify-center px-4 py-1 bg-white rounded-xl border border-slate-100 mb-2">
                      <div className={`w-full max-w-[40px] rounded-t-md transition-all ${st.bg}`} style={{ height: `${heightPct}%` }} />
                    </div>
                    <div className="text-center">
                      <div className="text-base font-extrabold text-[#1E194D] font-mono tabular-nums">
                        {st.souls} <span className="text-[10px] text-slate-400 font-normal">jiwa</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{st.families} keluarga</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Aktivitas Terbaru */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-[#1E194D]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                  Aktivitas & Log Tiket
                </h2>
                <p className="text-xs text-slate-500">Pendaftaran baru & check-in gerbang</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('checkin')}
                className="text-xs font-bold text-[#6355E5] hover:underline"
              >
                Scan Tamu
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto pr-1">
              {activities.slice(0, 6).map((act, idx) => {
                const themes: Array<keyof typeof AVATAR_STYLES> = ['purple', 'orange', 'emerald', 'blue', 'rose', 'amber'];
                const avatar = AVATAR_STYLES[themes[idx % themes.length]];

                return (
                  <div key={act.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${avatar.bg} ${avatar.icon}`}>
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#1E194D] truncate">{act.guestName}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">
                          {act.ticketCode} · {act.tentName || act.groupOrigin}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block rounded-full bg-[#E6F6EC] px-2 py-0.5 text-[10px] font-bold text-[#1E8E4E]">
                        {act.actionType === 'checkin' ? 'Check-in Tiba' : act.rsvpStatus}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{act.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('checkin')}
              className="w-full rounded-2xl bg-[#6355E5] py-3 px-4 text-xs font-bold text-white hover:bg-[#5243D4] transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <QrCode className="h-4 w-4" />
              <span>Buka Pemindai QR Gerbang ({checkedInCount}/{attendingGuests.length} Tiba)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
