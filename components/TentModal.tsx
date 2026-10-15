'use client';

import React, { useState, useEffect } from 'react';
import { X, Tent, Palette } from 'lucide-react';
import { TentBlock } from '@/lib/bajamba-data';

interface TentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tentData: Omit<TentBlock, 'id' | 'tableIds'>, existingId?: string) => void;
  editingTent: TentBlock | null;
}

const TENT_THEMES = [
  {
    id: 'purple',
    label: 'Ungu Adat (Signature)',
    colorTheme: 'border-purple-300 bg-purple-50/50',
    badgeBg: 'bg-[#EDE9FE]',
    badgeText: 'text-[#6D28D9]',
    colorDot: 'bg-[#6D28D9]',
  },
  {
    id: 'blue',
    label: 'Biru Singkarak',
    colorTheme: 'border-blue-300 bg-blue-50/50',
    badgeBg: 'bg-[#DBEAFE]',
    badgeText: 'text-[#1D4ED8]',
    colorDot: 'bg-[#1D4ED8]',
  },
  {
    id: 'emerald',
    label: 'Hijau Lembah',
    colorTheme: 'border-emerald-300 bg-emerald-50/50',
    badgeBg: 'bg-[#D1FAE5]',
    badgeText: 'text-[#047857]',
    colorDot: 'bg-[#047857]',
  },
  {
    id: 'amber',
    label: 'Kuning Songket Marapi',
    colorTheme: 'border-amber-300 bg-amber-50/50',
    badgeBg: 'bg-[#FEF3C7]',
    badgeText: 'text-[#B45309]',
    colorDot: 'bg-[#B45309]',
  },
  {
    id: 'rose',
    label: 'Merah Silungkang',
    colorTheme: 'border-rose-300 bg-rose-50/50',
    badgeBg: 'bg-[#FFE4E6]',
    badgeText: 'text-[#BE123C]',
    colorDot: 'bg-[#BE123C]',
  },
];

export default function TentModal({
  isOpen,
  onClose,
  onSave,
  editingTent,
}: TentModalProps) {
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [zoneDesc, setZoneDesc] = useState('');
  const [capacity, setCapacity] = useState(20);
  const [selectedThemeId, setSelectedThemeId] = useState('purple');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTent) {
      setName(editingTent.name);
      setShortCode(editingTent.shortCode);
      setZoneDesc(editingTent.zoneDesc);
      setCapacity(editingTent.capacity);
      const matched = TENT_THEMES.find((t) => t.badgeBg === editingTent.badgeBg);
      setSelectedThemeId(matched?.id || 'purple');
      setError('');
    } else {
      setName('');
      setShortCode('Tenda Baru');
      setZoneDesc('');
      setCapacity(20);
      setSelectedThemeId('purple');
      setError('');
    }
  }, [editingTent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama blok tenda wajib diisi.');
      return;
    }
    if (!shortCode.trim()) {
      setError('Kode singkat tenda (misal: Tenda E) wajib diisi.');
      return;
    }

    const theme = TENT_THEMES.find((t) => t.id === selectedThemeId) || TENT_THEMES[0];

    onSave(
      {
        name: name.trim(),
        shortCode: shortCode.trim(),
        zoneDesc: zoneDesc.trim() || 'Area balai adat perhelatan Makan Bajamba',
        capacity: Math.max(1, Number(capacity) || 1),
        colorTheme: theme.colorTheme,
        badgeBg: theme.badgeBg,
        badgeText: theme.badgeText,
      },
      editingTent?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#16122E]/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#F8F9FC]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#6355E5]">
              <Tent className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1E194D]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                {editingTent ? 'Edit Blok Tenda' : 'Tambah Blok Tenda Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Atur zonasi, nama tenda, dan batas daya tampung kursi
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-600 font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#1E194D] mb-1.5">
              Nama Lengkap Blok Tenda *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Tenda E — Halaman Barat Kerabat Solok"
              className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1E194D] mb-1.5">
                Kode Singkat / Label *
              </label>
              <input
                type="text"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                placeholder="Contoh: Tenda E"
                className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E194D] mb-1.5">
                Kapasitas Kursi (Jiwa) *
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#1E194D] font-mono tabular-nums focus:border-[#6355E5] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E194D] mb-1.5">
              Deskripsi Zonasi / Lokasi Area Tenda
            </label>
            <input
              type="text"
              value={zoneDesc}
              onChange={(e) => setZoneDesc(e.target.value)}
              placeholder="Contoh: Sayap barat halaman depan Balai Adat Sawahlunto"
              className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-3.5 py-2 text-xs text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Pilihan Tema Warna Tenda */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#1E194D] mb-2">
              <Palette className="h-3.5 w-3.5 text-[#6355E5]" />
              Tema Warna Label Tenda
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TENT_THEMES.map((theme) => {
                const isSelected = selectedThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedThemeId(theme.id)}
                    className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs text-left transition-all ${
                      isSelected
                        ? 'border-[#6355E5] bg-[#EDE9FE]/40 ring-2 ring-[#6355E5]/20 font-bold text-[#1E194D]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`h-4 w-4 rounded-full ${theme.colorDot} shrink-0`} />
                    <span className="truncate">{theme.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
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
              {editingTent ? 'Simpan Perubahan' : 'Buat Blok Tenda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
