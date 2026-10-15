'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] text-[#1E194D] p-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-extrabold text-[#6355E5]">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-slate-500">
          Halaman yang Anda tuju tidak ditemukan atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl bg-[#6355E5] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#5243D4]"
        >
          Kembali ke Dashboard Bajamba
        </Link>
      </div>
    </div>
  );
}
