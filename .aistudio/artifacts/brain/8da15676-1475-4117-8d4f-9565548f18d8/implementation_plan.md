# Integrasi Database Firebase Firestore (2.000+ Tamu) & Ekspor Laporan Excel/Sheets

Mengintegrasikan **Firebase Firestore** sebagai database *real-time* berbasis awan berkecepatan tinggi (< 100 ms) untuk menangani lebih dari 2.000 tamu dan banyak petugas gerbang secara bersamaan pada **Free Tier** permanen (bebas biaya server), dilengkapi fitur **Ekspor Data Laporan ke Excel & Spreadsheet**.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan Terkonfirmasi**:
> - **Pilihan Database**: Menggunakan **Firebase Firestore** sebagai basis data operasional utama (karena Google Sheets memiliki batas kuota 60 request/menit yang sering *crash* saat scan massal di gerbang).
> - **Biaya & Kuota**: Sepenuhnya memanfaatkan **Firebase Spark Plan (Gratis $0)** yang menyediakan 50.000 baca/hari dan 20.000 tulis/hari serta 1 GB penyimpanan (data 2.000 tamu hanya menghabiskan ~2 MB).
> - **Kebutuhan Spreadsheet Terpenuhi**: Dilengkapi fitur satu klik **"Ekspor Laporan (Excel / CSV / Google Sheets Ready)"** di halaman Daftar Tamu & Dashboard agar panitia dapat langsung mengolah atau mencetak laporan.

---

## 1. Overview & Core Concept

- **Apa yang Dikerjakan**:
  1. Menyediakan database persisten awan berbasis dokumen di Google Cloud (Firestore) yang menyinkronkan data tamu, status check-in QR, pemetaan tenda adat, dan akun petugas secara *real-time* lintas HP/komputer panitia.
  2. Menyediakan tombol ekspor laporan komprehensif ke format Excel (.xlsx / .csv dengan format UTF-8 BOM yang langsung rapi di Microsoft Excel dan Google Sheets).
- **Target Pengguna**: Panitia penerima tamu, petugas gerbang scan QR tiket, koordinator tenda, dan pimpinan Dinas Kebudayaan Kota Sawahlunto.
- **Nilai Tambah**:
  - Petugas scanner di pintu masuk dapat memvalidasi barcode secara instan tanpa jeda antrean.
  - Saat satu tamu check-in, angka okupansi di dashboard semua panitia langsung bertambah otomatis (*live update*).
  - Data aman dari kehilangan akibat hapus cache browser atau ganti perangkat.

---

## 2. User Experience & Visual Design

### A. Alur Registrasi & Check-in Real-Time
1. **Pendaftaran Mandiri Tamu**:
   - Tamu mendaftar di portal web -> data langsung tersimpan ke koleksi `guests` di Firestore -> kode tiket `BJB-XXXXXX` dan barcode QR terbit instan.
2. **Pemindaian Tiket di Gerbang Check-In**:
   - Panitia membuka scanner kamera HP/laptop -> barcode tiket tamu terdeteksi -> Firestore menjalankan verifikasi atomik -> status berubah menjadi `checkedIn: true` dalam hitungan milidetik.
3. **Indikator Koneksi Database**:
   - Lencana status koneksi awan yang elegan dan rapi di pojok dashboard (*"Cloud Synced • Realtime"*).

### B. Fitur Ekspor ke Excel & Google Sheets
- Tombol hijau berikon spreadsheet: **"Ekspor Data Tamu (Excel / Sheets)"**.
- Menghasilkan file laporan lengkap mencakup:
  - Kode Tiket
  - Nama Lengkap & Nomor WhatsApp
  - Asal Rombongan / Nagari / Instansi
  - Jumlah Jiwa (Pax)
  - Status Konfirmasi (Hadir / Belum / Berhalangan)
  - Tenda & Meja Jamba yang Ditempati
  - Status Check-in & Waktu Tiba di Gerbang
  - Catatan Kebutuhan Khusus

---

## 3. Key Product Decisions & Trade-Offs

- **Firestore vs Google Sheets API**:
  - *Keputusan*: Firestore menangani transaksi scan & tulis cepat, sedangkan Spreadsheet digunakan untuk konsumsi laporan akhir.
  - *Alasan*: Menghindari galat *429 Rate Quota Exceeded* dan konflik penulisan ganda saat ribuan tamu hadir bersamaan.
- **Keamanan & Perizinan (*Security Rules*)**:
  - *Aturan*: Tamu publik diizinkan membuat data pendaftaran dan membaca tiket miliknya sendiri; hanya petugas terautentikasi (admin/operator) yang diizinkan mengubah tenda, meja, dan menandai check-in.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                   Aplikasi Web Makan Bajamba                │
│                                                             │
│   ┌────────────────────┐          ┌────────────────────┐    │
│   │   Portal Publik    │          │    Portal Admin    │    │
│   │ (Daftar & E-Tiket) │          │ (Dashboard & Tenda)│    │
│   └─────────┬──────────┘          └─────────┬──────────┘    │
└─────────────┼───────────────────────────────┼───────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Firebase Firestore (Google Cloud)               │
│                                                             │
│  ├── /guests/{guestId}        (Data 2000+ Tamu & QR Tiket)  │
│  ├── /tents/{tentId}          (Kapasitas & Alokasi Tenda)   │
│  ├── /tables/{tableId}        (Daftar Meja Bajamba)         │
│  ├── /activities/{actId}      (Log Check-in & Registrasi)   │
│  └── /admins/{adminId}        (Kredensial & Hak Akses Petugas)│
└─────────────────────────────────────────────────────────────┘
              │
              ▼
   ┌──────────────────────────────────────────────┐
   │ Unduh Laporan: Excel (.csv / .xlsx ready)    │
   │ Siap Diimpor ke Google Sheets Panitia        │
   └──────────────────────────────────────────────┘
```

### Langkah Pelaksanaan (Saat Anda Menyetujui / Proceed):
1. Membuka antarmuka persetujuan Firebase (`show_aistudio_ui: firebase_setup`).
2. Melakukan *provisioning* Firestore Database melalui perintah resmi sistem.
3. Menyiapkan aturan keamanan `firestore.rules` dan konfigurasi blueprint.
4. Menghubungkan aplikasi web dengan Firebase SDK untuk sinkronisasi real-time.
5. Memasang tombol ekspor laporan Excel & Sheets.
