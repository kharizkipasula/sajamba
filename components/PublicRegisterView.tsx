'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Sparkles,
  Phone,
  Users,
  MapPin,
  FileText,
  CheckCircle2,
  Ticket,
  ArrowRight,
  RotateCcw,
  MessageCircle,
} from 'lucide-react';
import {
  Guest,
  TentBlock,
  TableItem,
  DEFAULT_GROUP_ORIGINS,
  generateTicketCode,
} from '@/lib/bajamba-data';
import { openWhatsAppTicket } from '@/lib/whatsapp-helper';
import DigitalTicketCard from './DigitalTicketCard';

interface PublicRegisterViewProps {
  guests: Guest[];
  tents: TentBlock[];
  tables: TableItem[];
  onRegisterGuest: (newGuest: Guest) => void;
  initialTicketCode?: string;
}

export default function PublicRegisterView({
  guests,
  tents,
  tables,
  onRegisterGuest,
  initialTicketCode,
}: PublicRegisterViewProps) {
  const [activeTab, setActiveTab] = useState<'register' | 'lookup'>('register');

  // Register Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [kategoriInstansi, setKategoriInstansi] = useState('Perangkat Daerah');
  const [kelompokKelas, setKelompokKelas] = useState('VIP B');
  const [instansiAlamat, setInstansiAlamat] = useState('');
  const [membersCount, setMembersCount] = useState(2);
  const [groupOrigin, setGroupOrigin] = useState('');
  const [registeredGuest, setRegisteredGuest] = useState<Guest | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [foundGuest, setFoundGuest] = useState<Guest | null>(null);
  const [lookupError, setLookupError] = useState('');

  // Auto lookup if ticket query provided via WhatsApp link
  React.useEffect(() => {
    if (initialTicketCode) {
      setActiveTab('lookup');
      setLookupQuery(initialTicketCode);
      const match = guests.find(
        (g) => g.ticketCode.toLowerCase() === initialTicketCode.toLowerCase()
      );
      if (match) {
        setFoundGuest(match);
      }
    }
  }, [initialTicketCode, guests]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Nama lengkap kepala rombongan wajib diisi.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Nomor WhatsApp / HP aktif wajib diisi untuk verifikasi tiket.');
      return;
    }
    const finalGroup = groupOrigin.trim();
    if (!finalGroup) {
      setErrorMsg('Asal Nagari / Rombongan wajib diisi.');
      return;
    }

    const ticketCode = generateTicketCode();
    const newGuest: Guest = {
      id: `g-${Date.now()}`,
      ticketCode,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      kategoriInstansi: kategoriInstansi.trim(),
      kelompokKelas: kelompokKelas.trim(),
      instansiAlamat: instansiAlamat.trim(),
      membersCount: Math.max(1, Number(membersCount) || 1),
      groupOrigin: finalGroup,
      rsvpStatus: 'Hadir',
      notes: '',
      tentId: null, // Will be mapped by admin
      tableId: null,
      checkedIn: false,
      checkedInAt: null,
      updatedAt: 'Baru saja',
      registeredAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      avatarTheme: 'purple',
    };

    onRegisterGuest(newGuest);
    setRegisteredGuest(newGuest);
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setFoundGuest(null);

    const q = lookupQuery.trim().toLowerCase();
    if (!q) {
      setLookupError('Silakan masukkan nomor WhatsApp atau kode tiket.');
      return;
    }

    const match = guests.find(
      (g) =>
        g.ticketCode.toLowerCase() === q ||
        g.phone.replace(/[^0-9]/g, '') === q.replace(/[^0-9]/g, '') ||
        g.name.toLowerCase().includes(q)
    );

    if (match) {
      setFoundGuest(match);
    } else {
      setLookupError('Tiket tidak ditemukan. Periksa kembali nomor WhatsApp atau kode tiket yang Anda masukkan.');
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setMembersCount(2);
    setGroupOrigin('');
    setRegisteredGuest(null);
    setErrorMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDE9FE] px-3.5 py-1 text-xs font-bold text-[#6355E5] mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          Pendaftaran Resmi Acara Adat
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E194D]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          Pendaftaran Mandiri Tamu Makan Bajamba
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto leading-relaxed">
          Daftarkan rombongan keluarga Anda untuk mendapatkan <strong>E-Tiket resmi dengan QR Code</strong>.
          Panitia akan memetakan lokasi tenda dan jamba duduk sebelum hari perhelatan.
        </p>

        {/* Tab Toggle */}
        <div className="inline-flex items-center gap-1 p-1 bg-[#F8F9FC] rounded-2xl border border-slate-200 mt-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setFoundGuest(null);
            }}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-[#6355E5] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#1E194D]'
            }`}
          >
            Form Pendaftaran Baru
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('lookup');
              setRegisteredGuest(null);
            }}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'lookup'
                ? 'bg-[#6355E5] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#1E194D]'
            }`}
          >
            Cari & Unduh Tiket Saya
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto">
        {activeTab === 'register' ? (
          registeredGuest ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#E6F6EC] border border-emerald-200 p-4 text-center">
                <CheckCircle2 className="h-6 w-6 text-[#1E8E4E] mx-auto mb-1" />
                <h3 className="text-sm font-bold text-[#1E8E4E]">Pendaftaran Berhasil Diterbitkan!</h3>
                <p className="text-xs text-emerald-800">
                  Berikut adalah E-Tiket resmi Anda. Simpan atau unduh gambar tiket di bawah ini untuk ditunjukkan saat tiba di Balai Adat Sawahlunto.
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => openWhatsAppTicket(registeredGuest)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-bold text-white hover:bg-[#20ba59] transition-colors shadow-2xs"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Kirim Tiket ke WhatsApp Saya</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#6355E5] hover:underline px-2.5 py-1.5"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Daftarkan rombongan lain
                  </button>
                </div>
              </div>

              <DigitalTicketCard
                guest={registeredGuest}
                tents={tents}
                tables={tables}
              />
            </div>
          ) : (
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8">
              <form onSubmit={handleRegister} className="space-y-5">
                {errorMsg && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-semibold text-red-700">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Lengkap */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#1E194D] mb-1.5">
                      Nama Lengkap Tamu / Kepala Rombongan *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Sutan Bagindo Chaniago"
                      className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-4 py-2.5 text-sm text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6355E5]/20"
                    />
                  </div>

                  {/* No WhatsApp */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-[#1E194D] mb-1.5">
                      <Phone className="h-3.5 w-3.5 text-[#6355E5]" />
                      Nomor WhatsApp / HP Aktif *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 0812-3456-7890"
                      className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-4 py-2.5 text-sm text-[#1E194D] font-mono tabular-nums focus:border-[#6355E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6355E5]/20"
                    />
                  </div>

                  {/* Jumlah Anggota */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-[#1E194D] mb-1.5">
                      <Users className="h-3.5 w-3.5 text-[#6355E5]" />
                      Jumlah Anggota Rombongan (Jiwa) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={membersCount}
                      onChange={(e) => setMembersCount(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-4 py-2.5 text-sm font-bold text-[#1E194D] font-mono tabular-nums focus:border-[#6355E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6355E5]/20"
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
                      className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-4 py-2.5 text-sm text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6355E5]/20"
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
                      className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-4 py-2.5 text-sm text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none"
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
                      className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-4 py-2.5 text-sm text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none"
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
                      className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-4 py-2.5 text-sm text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Asal Rombongan / Nagari (Free Text) */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#1E194D] mb-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#6355E5]" />
                    Asal Nagari / Rombongan Keluarga *
                  </label>
                  <input
                    type="text"
                    value={groupOrigin}
                    onChange={(e) => setGroupOrigin(e.target.value)}
                    placeholder="Contoh: Nagari Lunto Barat / Suku Chaniago"
                    className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-4 py-2.5 text-sm text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6355E5]/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#6355E5] py-3.5 px-6 text-sm font-bold text-white hover:bg-[#5243D4] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Ticket className="h-5 w-5" />
                  <span>Daftar Sekarang & Dapatkan E-Tiket QR Code</span>
                </button>
              </form>
            </div>
          )
        ) : (
          /* Tab Cari Tiket */
          <div className="space-y-5">
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8">
              <form onSubmit={handleLookup} className="space-y-4">
                <label className="block text-xs font-bold text-[#1E194D]">
                  Cari Tiket dengan Kode Tiket (BJB-XXXXXX) atau Nomor WhatsApp
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    placeholder="Masukkan kode tiket (misal BJB-741029) atau nomor HP..."
                    className="w-full rounded-2xl border border-slate-200 bg-[#F8F9FC] pl-12 pr-4 py-3 text-sm text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6355E5]/20"
                  />
                </div>

                {lookupError && (
                  <p className="text-xs font-semibold text-red-600">
                    {lookupError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#6355E5] py-3 text-xs font-bold text-white hover:bg-[#5243D4] transition-colors flex items-center justify-center gap-2"
                >
                  <span>Cari E-Tiket Saya</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            {foundGuest && (
              <DigitalTicketCard
                guest={foundGuest}
                tents={tents}
                tables={tables}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
