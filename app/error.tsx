'use client';

import React from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] text-[#1E194D] p-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-extrabold text-[#C93B3B]">Terjadi Kendala</h1>
        <p className="text-xs text-slate-500">{error.message || 'Terjadi kesalahan sistem.'}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-[#6355E5] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#5243D4]"
        >
          Muat Ulang Halaman
        </button>
      </div>
    </div>
  );
}
