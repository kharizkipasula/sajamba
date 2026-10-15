'use client';

import React, { useState, useEffect } from 'react';
import { X, LayoutGrid } from 'lucide-react';
import { TableItem, TentBlock } from '@/lib/bajamba-data';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tableData: Omit<TableItem, 'id'>, existingId?: number) => void;
  editingTable: TableItem | null;
  defaultTentId?: string;
  tents: TentBlock[];
}

export default function TableModal({
  isOpen,
  onClose,
  onSave,
  editingTable,
  defaultTentId,
  tents,
}: TableModalProps) {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tentId, setTentId] = useState('');
  const [capacity, setCapacity] = useState(10);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTable) {
      setName(editingTable.name);
      setSubtitle(editingTable.subtitle);
      setTentId(editingTable.tentId);
      setCapacity(editingTable.capacity);
      setError('');
    } else {
      setName('');
      setSubtitle('');
      setTentId(defaultTentId || tents[0]?.id || 'tenda-a');
      setCapacity(10);
      setError('');
    }
  }, [editingTable, defaultTentId, tents, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama meja jamba wajib diisi.');
      return;
    }
    if (!tentId) {
      setError('Pilih blok tenda tempat meja ini diletakkan.');
      return;
    }

    onSave(
      {
        name: name.trim(),
        subtitle: subtitle.trim() || 'Dudukan Tamu Makan Bajamba',
        tentId,
        capacity: Math.max(1, Number(capacity) || 1),
      },
      editingTable?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#16122E]/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#F8F9FC]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#6355E5]">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1E194D]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                {editingTable ? 'Edit Meja Jamba' : 'Tambah Meja Jamba Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Tentukan nama meja, alokasi tenda, dan kapasitas kursi
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
              Nama Meja Jamba *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Meja 9 — Jamba Singkarak"
              className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E194D] mb-1.5">
              Keterangan / Subtitle Meja
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Contoh: Khusus Rombongan Perantau atau Ninik Mamak"
              className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-3.5 py-2 text-xs text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1E194D] mb-1.5">
                Blok Tenda Penempatan *
              </label>
              <select
                value={tentId}
                onChange={(e) => setTentId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-3 py-2.5 text-xs font-semibold text-[#1E194D] focus:border-[#6355E5] focus:bg-white focus:outline-none"
              >
                {tents.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.shortCode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E194D] mb-1.5">
                Kapasitas Kursi (Jiwa) *
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#1E194D] font-mono tabular-nums focus:border-[#6355E5] focus:bg-white focus:outline-none"
              />
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
              {editingTable ? 'Simpan Perubahan' : 'Tambah Meja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
