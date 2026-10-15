# Implementation Plan - Add Pemko Sawahlunto E-Ticket Fields (Email, Kategori Instansi, Kelompok/Kelas, Instansi/Alamat)

## Goal
Update the `Guest` data type, registration form (`PublicRegisterView.tsx`), admin guest modal (`GuestModal.tsx`), and digital ticket card (`DigitalTicketCard.tsx`) to support the exact fields shown in the Pemko Sawahlunto e-ticket sample image:
- **Email**
- **Kategori Instansi** (e.g., Perangkat Daerah, Umum, Forkopimda, dll.)
- **Kelompok / Kelas** (e.g., VIP A, VIP B, Umum, dll.)
- **Instansi / Alamat**

## Proposed Changes

### `lib/bajamba-data.ts`
- Extend `Guest` interface to include optional/default properties:
  - `email?: string`
  - `kategoriInstansi?: string`
  - `kelompokKelas?: string`
  - `instansiAlamat?: string`

### `components/PublicRegisterView.tsx`
- Add input fields on public registration for:
  - Email
  - Kategori Instansi (Dropdown/Select: Perangkat Daerah, Umum, Vertikal/BUMN, Forkopimda)
  - Kelompok / Kelas (Dropdown/Select: Umum, VIP A, VIP B, Undangan Khusus)
  - Instansi / Alamat (Free-text)

### `components/GuestModal.tsx`
- Add inputs for the same new fields in the admin guest modal for adding/editing guests.

### `components/DigitalTicketCard.tsx`
- Render Email, Kategori Instansi, Kelompok/Kelas, and Instansi/Alamat cleanly on the digital e-ticket card matching the reference layout.

## Verification Plan
1. Compile applet with `compile_applet` to ensure zero TypeScript or build errors.
2. Verify registration form, guest modal, and digital ticket card rendering in preview.
