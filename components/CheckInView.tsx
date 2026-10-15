'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Check,
  UserCheck,
  Clock,
  RotateCcw,
  User,
  MapPin,
  UtensilsCrossed,
  Phone,
  Camera,
  CameraOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Scan,
} from 'lucide-react';
import { Guest, TentBlock, TableItem, AVATAR_STYLES } from '@/lib/bajamba-data';

interface CheckInViewProps {
  guests: Guest[];
  tents: TentBlock[];
  tables: TableItem[];
  onToggleCheckIn: (guestId: string) => void;
}

export default function CheckInView({
  guests,
  tents,
  tables,
  onToggleCheckIn,
}: CheckInViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'ARRIVED' | 'WAITING'>('ALL');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedGuest, setScannedGuest] = useState<Guest | null>(null);
  const [scanSuccessFeedback, setScanSuccessFeedback] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Kamera tidak didukung pada browser ini. Silakan gunakan pencarian tiket di bawah.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch {
      setCameraError('Izin kamera ditolak atau kamera tidak tersedia. Anda tetap dapat menggunakan input kode tiket & simulasi scan.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Fast code or search lookup
  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    const matched = guests.find(
      (g) =>
        g.ticketCode.toLowerCase() === q ||
        g.phone.replace(/[^0-9]/g, '') === q.replace(/[^0-9]/g, '') ||
        g.name.toLowerCase().includes(q)
    );

    if (matched) {
      setScannedGuest(matched);
      setScanSuccessFeedback(true);
    }
  };

  const handleSimulateScan = (guest: Guest) => {
    setScannedGuest(guest);
    setScanSuccessFeedback(true);
  };

  const handleConfirmArrival = (guest: Guest) => {
    onToggleCheckIn(guest.id);
    setScannedGuest(null);
    setScanSuccessFeedback(false);
  };

  const arrivedGuests = guests.filter((g) => g.checkedIn);
  const arrivedSouls = arrivedGuests.reduce((acc, g) => acc + g.membersCount, 0);
  const expectedGuests = guests.filter((g) => g.rsvpStatus !== 'Berhalangan');
  const expectedSouls = expectedGuests.reduce((acc, g) => acc + g.membersCount, 0);

  const filteredGuests = guests.filter((g) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      g.name.toLowerCase().includes(q) ||
      g.ticketCode.toLowerCase().includes(q) ||
      g.phone.includes(q) ||
      g.groupOrigin.toLowerCase().includes(q);

    const matchesFilter =
      filterMode === 'ALL'
        ? true
        : filterMode === 'ARRIVED'
        ? g.checkedIn
        : !g.checkedIn && g.rsvpStatus !== 'Berhalangan';

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E194D]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Check-in Tamu & Pemindai QR Code
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Arahkan kamera ke QR Code e-tiket tamu atau ketik kode tiket / nomor WhatsApp untuk verifikasi instan di gerbang
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isCameraActive ? (
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
            >
              <CameraOff className="h-4 w-4" />
              <span>Matikan Kamera</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6355E5] px-4 py-2 text-xs font-bold text-white hover:bg-[#5243D4] transition-colors shadow-xs"
            >
              <Camera className="h-4 w-4" />
              <span>Buka Pemindai Kamera</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 3 Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Tiba di Balai Adat</p>
            <p className="text-2xl font-extrabold text-[#1E8E4E] font-mono tabular-nums mt-1">
              {arrivedGuests.length} <span className="text-xs font-normal text-slate-500">rombongan ({arrivedSouls} jiwa)</span>
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E6F6EC] text-[#1E8E4E]">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Menunggu Kedatangan</p>
            <p className="text-2xl font-extrabold text-[#1E194D] font-mono tabular-nums mt-1">
              {Math.max(0, expectedGuests.length - arrivedGuests.length)}{' '}
              <span className="text-xs font-normal text-slate-500">rombongan ({Math.max(0, expectedSouls - arrivedSouls)} jiwa)</span>
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFEFF6] text-[#555177]">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-3xl bg-[#6355E5] text-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-white/80">Progres Kehadiran Gerbang</p>
            <p className="text-2xl font-extrabold font-mono tabular-nums mt-1">
              {expectedSouls > 0 ? Math.round((arrivedSouls / expectedSouls) * 100) : 0}%{' '}
              <span className="text-xs font-normal text-white/80">dari target tamu</span>
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
            <Check className="h-5 w-5 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Camera Viewport & Verification Modal */}
      {isCameraActive && (
        <div className="rounded-3xl bg-[#16122E] text-white p-6 shadow-xl relative overflow-hidden">
          <div className="max-w-md mx-auto text-center space-y-3">
            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-[#6355E5] bg-black">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-dashed border-white/60 m-8 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-xs text-white/80 bg-black/50 px-3 py-1 rounded-full">
                  Posisikan QR Code di dalam kotak
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Kamera aktif. Petugas juga dapat menekan salah satu tamu di bawah untuk simulasi scan instan.
            </p>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs font-semibold text-amber-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Pop-up Verification Modal when Guest is Scanned */}
      {scannedGuest && (
        <div className="rounded-3xl bg-white border-2 border-[#6355E5] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F6EC] text-[#1E8E4E]">
                <Scan className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#6355E5] uppercase tracking-wider">
                  Hasil Pemindaian Tiket
                </span>
                <h3 className="text-lg font-bold text-[#1E194D]">
                  {scannedGuest.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Kode Tiket: <strong>{scannedGuest.ticketCode}</strong> · {scannedGuest.phone}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setScannedGuest(null)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Lokasi Tenda */}
            <div className="rounded-2xl bg-[#F0EEFF] p-3.5 border border-[#6355E5]/20">
              <span className="text-[10px] font-bold text-[#6355E5] uppercase block">
                Penempatan Tenda
              </span>
              <p className="text-sm font-extrabold text-[#1E194D] mt-1">
                {tents.find((t) => t.id === scannedGuest.tentId)?.name || 'Belum Ditentukan'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {tables.find((t) => t.id === scannedGuest.tableId)?.name || 'Meja diatur panitia'}
              </p>
            </div>

            {/* Rombongan & Jiwa */}
            <div className="rounded-2xl bg-[#F8F9FC] p-3.5 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Jumlah Jiwa Rombongan
              </span>
              <p className="text-sm font-extrabold text-[#1E194D] font-mono tabular-nums mt-1">
                {scannedGuest.membersCount} Jiwa
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {scannedGuest.groupOrigin}
              </p>
            </div>

            {/* Catatan Khusus */}
            <div className="rounded-2xl bg-[#F8F9FC] p-3.5 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Catatan Alergi / Khusus
              </span>
              <p className="text-xs font-semibold text-[#1E194D] mt-1">
                {scannedGuest.notes || 'Tidak ada catatan alergi'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleConfirmArrival(scannedGuest)}
              className="flex-1 rounded-2xl bg-[#1E8E4E] py-3.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Check className="h-5 w-5 stroke-[3]" />
              <span>
                {scannedGuest.checkedIn ? 'Batalkan Status Tiba' : 'Konfirmasi Tiba di Lokasi Sekarang'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Search & Fast Verification Toolbar */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleCodeSubmit} className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik kode tiket (misal: BJB-741029), nomor WhatsApp, atau nama..."
              className="w-full rounded-2xl border border-slate-200 bg-[#F8F9FC] pl-12 pr-4 py-3 text-sm font-medium text-[#1E194D] placeholder:text-slate-400 focus:border-[#6355E5] focus:bg-white focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-1.5 p-1 bg-[#F8F9FC] rounded-2xl border border-slate-100 shrink-0">
            {[
              { id: 'ALL', label: 'Semua Tamu' },
              { id: 'WAITING', label: 'Belum Tiba' },
              { id: 'ARRIVED', label: 'Tiba di Lokasi' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterMode(tab.id as 'ALL' | 'ARRIVED' | 'WAITING')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  filterMode === tab.id
                    ? 'bg-[#6355E5] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-[#1E194D]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Guest Rows */}
        <div className="divide-y divide-slate-100">
          {filteredGuests.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Tidak ada tamu yang cocok dengan pencarian.
            </div>
          ) : (
            filteredGuests.map((guest) => {
              const avatar = AVATAR_STYLES[guest.avatarTheme] || AVATAR_STYLES.purple;
              const tentObj = tents.find((t) => t.id === guest.tentId);

              return (
                <div
                  key={guest.id}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    guest.checkedIn ? 'bg-[#E6F6EC]/30' : 'hover:bg-[#F8F9FC]'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${avatar.bg} ${avatar.icon}`}>
                      <User className="h-6 w-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[#1E194D]">
                          {guest.name}
                        </h3>
                        <span className="font-mono text-xs font-bold text-[#6355E5] bg-[#EDE9FE] px-2 py-0.5 rounded-lg">
                          {guest.ticketCode}
                        </span>
                        {tentObj ? (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${tentObj.badgeBg} ${tentObj.badgeText}`}>
                            {tentObj.shortCode}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                            Belum Ada Tenda
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="font-mono tabular-nums flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {guest.phone}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{guest.groupOrigin} ({guest.membersCount} jiwa)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSimulateScan(guest)}
                      title="Simulasi Scan Barcode Tamu Ini"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                    >
                      <Scan className="h-3.5 w-3.5 text-[#6355E5]" />
                      <span>Scan Tiket</span>
                    </button>

                    {guest.checkedIn ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F6EC] px-3 py-1 text-xs font-bold text-[#1E8E4E]">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                          <span>Tiba ({guest.checkedInAt})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => onToggleCheckIn(guest.id)}
                          title="Batalkan Check-in"
                          className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleCheckIn(guest.id)}
                        className="rounded-xl bg-[#6355E5] px-4 py-2 text-xs font-bold text-white hover:bg-[#5243D4] transition-colors shadow-2xs"
                      >
                        Check-in Tamu
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
