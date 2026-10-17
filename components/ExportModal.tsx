'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  X,
  Database,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Guest, TentBlock, TableItem } from '@/lib/bajamba-data';
import {
  exportGuestsToExcel,
  exportGuestsToGoogleSheetsCsv,
  copyGuestsForGoogleSheets,
} from '@/lib/firestore-service';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  guests: Guest[];
  tents: TentBlock[];
  tables: TableItem[];
}

export default function ExportModal({
  isOpen,
  onClose,
  guests,
  tents,
  tables,
}: ExportModalProps) {
  const [filterScope, setFilterScope] = useState<'all' | 'hadir' | 'checkedin'>('all');
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const scopedGuests = guests.filter((g) => {
    if (filterScope === 'hadir') return g.rsvpStatus === 'Hadir';
    if (filterScope === 'checkedin') return g.checkedIn;
    return true;
  });

  const totalSouls = scopedGuests.reduce((acc, g) => acc + g.membersCount, 0);

  const handleDownloadExcel = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const scopeLabel = filterScope === 'all' ? 'Semua' : filterScope === 'hadir' ? 'Hadir' : 'CheckIn';
    exportGuestsToExcel(
      scopedGuests,
      tents,
      tables,
      `Data_Tamu_Makan_Bajamba_${scopeLabel}_${timestamp}.xlsx`
    );
    setDownloadSuccess('File Excel (.xlsx) berhasil diunduh!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadCsv = () => {
    exportGuestsToGoogleSheetsCsv(scopedGuests, tents, tables);
    setDownloadSuccess('File CSV Google Sheets berhasil diunduh!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleCopyClipboard = async () => {
    const ok = await copyGuestsForGoogleSheets(scopedGuests, tents, tables);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <FileSpreadsheet className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Ekspor Data Tamu (2000+ Tamu)
              </h2>
              <p className="text-xs text-emerald-100/90">
                Format Microsoft Excel &amp; Google Spreadsheet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Firestore Connection Banner */}
          <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <div className="text-xs min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-900">Database Firestore Aktif</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-emerald-800/80 mt-0.5 leading-relaxed">
                Data disinkronkan secara real-time dari Firebase Firestore untuk kapasitas lebih dari 2.000 tamu acara Makan Bajamba.
              </p>
            </div>
          </div>

          {/* Filter Scope Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Cakupan Data yang Diekspor
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFilterScope('all')}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  filterScope === 'all'
                    ? 'bg-[#1E194D] text-white border-[#1E194D] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Semua Data
                <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                  ({guests.length} Tamu)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterScope('hadir')}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  filterScope === 'hadir'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Konfirmasi Hadir
                <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                  ({guests.filter((g) => g.rsvpStatus === 'Hadir').length} Tamu)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterScope('checkedin')}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  filterScope === 'checkedin'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Sudah Check-In
                <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                  ({guests.filter((g) => g.checkedIn).length} Tamu)
                </span>
              </button>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>Rombongan terpilih: <strong className="text-slate-800">{scopedGuests.length}</strong></span>
              <span>Total Jiwa (Pax): <strong className="text-slate-800">{totalSouls} Jiwa</strong></span>
            </div>
          </div>

          {/* Success Alerts */}
          {downloadSuccess && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {copied && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-200 px-3.5 py-2.5 text-xs font-semibold text-indigo-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Data disalin! Buka Google Sheets baru dan tekan <strong>Ctrl+V</strong>.</span>
            </div>
          )}

          {/* Export Action Cards */}
          <div className="space-y-2.5 pt-1">
            {/* Excel XLSX */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/20 transition-all flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">Unduh Format Microsoft Excel (.xlsx)</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                      Rekomendasi
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    File workbook asli dengan lebar kolom presisi &amp; header terstruktur.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadExcel}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shrink-0 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh .xlsx</span>
              </button>
            </div>

            {/* Google Sheets CSV */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50/20 transition-all flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-800">Unduh Format CSV / Google Sheets (.csv)</h3>
                  <p className="text-xs text-slate-500 truncate">
                    Encoding UTF-8 dengan BOM, langsung dapat diimpor ke Google Spreadsheet / Drive.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shrink-0 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh .csv</span>
              </button>
            </div>

            {/* Quick Copy for Google Sheets */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/20 transition-all flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Copy className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-800">Salin untuk Google Spreadsheet</h3>
                  <p className="text-xs text-slate-500 truncate">
                    Salin data ke clipboard lalu tempel langsung (Ctrl+V) di Google Sheets.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyClipboard}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Data'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Dinas Kebudayaan Kota Sawahlunto</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
