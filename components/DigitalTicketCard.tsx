'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Printer,
  Sparkles,
  MapPin,
  Users,
  Phone,
  CheckCircle2,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { Guest, TentBlock, TableItem } from '@/lib/bajamba-data';
import { openWhatsAppTicket } from '@/lib/whatsapp-helper';

interface DigitalTicketCardProps {
  guest: Guest;
  tents: TentBlock[];
  tables: TableItem[];
  onClose?: () => void;
}

export default function DigitalTicketCard({
  guest,
  tents,
  tables,
  onClose,
}: DigitalTicketCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const assignedTent = tents.find((t) => t.id === guest.tentId);
  const assignedTable = tables.find((t) => t.id === guest.tableId);

  useEffect(() => {
    // Generate high resolution QR Code with guest ticket code and verification payload
    const payload = JSON.stringify({
      code: guest.ticketCode,
      name: guest.name,
      party: guest.membersCount,
      origin: guest.groupOrigin,
      tent: assignedTent?.shortCode || 'Pending',
      table: guest.tableId || null,
    });

    QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#16122E',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR:', err));
  }, [guest, assignedTent]);

  const handleDownloadImage = () => {
    if (!qrDataUrl) return;
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw ticket background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 600, 800);

    // Purple header
    ctx.fillStyle = '#6355E5';
    ctx.fillRect(0, 0, 600, 150);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('E-TIKET MAKAN BAJAMBA', 300, 60);

    ctx.font = '16px sans-serif';
    ctx.fillText('Perhelatan Adat Kota Sawahlunto', 300, 95);

    ctx.font = 'bold 15px monospace';
    ctx.fillText(`KODE TIKET: ${guest.ticketCode}`, 300, 130);

    // Guest Info
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1E194D';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(guest.name, 50, 200);

    ctx.fillStyle = '#555177';
    ctx.font = '15px sans-serif';
    ctx.fillText(`Asal Rombongan: ${guest.groupOrigin}`, 50, 230);
    ctx.fillText(`Jumlah Hadir: ${guest.membersCount} Jiwa`, 50, 260);

    const tentText = assignedTent ? assignedTent.name : 'Akan Diarahkan Panitia di Lokasi';
    const tableText = assignedTable ? assignedTable.name : 'Meja Belum Ditetapkan';
    ctx.fillStyle = '#6355E5';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Lokasi Tenda: ${tentText}`, 50, 305);
    ctx.fillText(`Penempatan Meja: ${tableText}`, 50, 335);

    // Draw QR Code
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 160, 380, 280, 280);

      ctx.fillStyle = '#64748B';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Tunjukkan QR Code ini kepada panitia di gerbang masuk balai adat', 300, 700);
      ctx.fillText('Sabtu, 09.00 WIB · Balai Adat Kota Sawahlunto', 300, 730);

      const link = document.createElement('a');
      link.download = `tiket-bajamba-${guest.ticketCode}-${guest.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    qrImg.src = qrDataUrl;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(guest.ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={ticketRef}
      className="max-w-md w-full mx-auto rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-none"
    >
      {/* Top Banner RSVPify Violet Theme */}
      <div className="bg-[#6355E5] text-white p-6 relative overflow-hidden">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs">
              <Sparkles className="h-3 w-3" />
              E-Tiket Resmi Makan Bajamba
            </span>
            <h2 className="text-xl font-extrabold tracking-tight mt-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Makan Bajamba Sawahlunto
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              Sabtu, Pukul 09.00 WIB · Balai Adat Kota Sawahlunto
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 block">
              Kode Tiket
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              title="Salin kode tiket"
              className="mt-0.5 font-mono text-sm font-extrabold bg-white/15 px-2.5 py-1 rounded-lg hover:bg-white/25 transition-colors inline-block"
            >
              {guest.ticketCode}
            </button>
            {copied && <span className="block text-[10px] text-emerald-200 mt-0.5">Disalin!</span>}
          </div>
        </div>
      </div>

      {/* Ticket Body */}
      <div className="p-6 space-y-5">
        {/* Guest Details matching Pemko Sawahlunto E-Ticket Sample */}
        <div className="rounded-2xl bg-[#F8F9FC] border border-slate-100 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Nama Peserta
              </span>
              <h3 className="text-base font-extrabold text-[#1E194D] mt-0.5">
                {guest.name}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F6EC] px-2.5 py-1 text-xs font-bold text-[#1E8E4E]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              TERDAFTAR
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">WhatsApp / HP</span>
              <span className="font-mono font-bold text-[#6355E5]">{guest.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Kelompok / Kelas</span>
              <span className="inline-block rounded-md bg-[#6355E5] px-2 py-0.5 text-[11px] font-bold text-white">
                {guest.kelompokKelas || 'VIP B'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Kategori Instansi</span>
              <span className="font-semibold text-slate-700">{guest.kategoriInstansi || 'Perangkat Daerah'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Email</span>
              <span className="font-mono text-slate-600 truncate block">{guest.email || '-'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Instansi / Alamat</span>
              <span className="font-semibold text-slate-700">{guest.instansiAlamat || guest.groupOrigin}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Rombongan / Pengikut</span>
              <span className="font-semibold text-slate-700">{guest.membersCount} Jiwa ({guest.groupOrigin})</span>
            </div>
          </div>
        </div>

        {/* Tent & Table Spatial Allocation Highlight */}
        <div className="rounded-2xl border-2 border-dashed border-[#6355E5]/40 bg-[#F0EEFF]/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6355E5]">
                Lokasi Tenda & Dudukan
              </span>
              <p className="text-sm font-extrabold text-[#1E194D] mt-0.5">
                {assignedTent ? assignedTent.name : 'Menunggu Pemetaan Tenda'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {assignedTable ? `${assignedTable.name} (${assignedTable.subtitle})` : 'Nomor meja akan diarahkan panitia saat tiba'}
              </p>
            </div>
            <span className="text-xl font-black text-[#6355E5] font-mono px-3 py-1.5 rounded-xl bg-white shadow-xs">
              {assignedTent ? assignedTent.shortCode.replace('Tenda ', 'T-') : 'T-?'}
            </span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt={`QR Code Tiket ${guest.ticketCode}`}
              className="w-48 h-48 rounded-xl border border-slate-100 shadow-2xs"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 text-xs">
              Menghasilkan QR...
            </div>
          )}
          <p className="text-xs font-mono font-bold text-[#1E194D]">
            {guest.ticketCode}
          </p>
          <p className="text-[11px] text-slate-500 max-w-xs">
            Pindai QR Code ini pada scanner kamera meja registrasi saat tiba di lokasi Makan Bajamba.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 print:hidden">
          <button
            type="button"
            onClick={() => openWhatsAppTicket(guest)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-xs font-bold text-white hover:bg-[#20ba59] transition-colors shadow-xs"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Kirim Notifikasi Tiket via WhatsApp</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadImage}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6355E5] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#5243D4] transition-colors shadow-xs"
            >
              <Download className="h-4 w-4" />
              <span>Unduh Tiket (PNG)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
