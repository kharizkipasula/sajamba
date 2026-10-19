export const SAWAHLUNTO_LOGO_URL =
  'https://upload.wikimedia.org/wikipedia/commons/a/ae/Lambang_Kota_Sawahlunto.jpg';

export type RsvpStatus = 'Hadir' | 'Belum Konfirmasi' | 'Berhalangan';

export interface TentBlock {
  id: string;
  name: string;
  shortCode: string;
  zoneDesc: string;
  capacity: number;
  tableIds: number[];
  colorTheme: string;
  badgeBg: string;
  badgeText: string;
  coords?: { x: number; y: number };
}

export interface VenueMapConfig {
  imageUrl: string;
  venueName: string;
  gridColumns?: number;
  gridRows?: number;
  notes?: string;
  tentCoordinates?: Record<string, { x: number; y: number }>;
}

export const DEFAULT_VENUE_MAP: VenueMapConfig = {
  imageUrl: '',
  venueName: 'Kawasan Wisata Adat Silungkang & Lapangan Segitiga Sawahlunto',
  notes: 'Denah Tata Ruang Makan Bajamba Terbuka',
  tentCoordinates: {
    'tenda-a': { x: 50, y: 22 },
    'tenda-b': { x: 25, y: 56 },
    'tenda-c': { x: 75, y: 56 },
    'tenda-d': { x: 50, y: 82 },
  },
};

export interface TableItem {
  id: number;
  name: string;
  subtitle: string;
  tentId: string;
  capacity: number;
}

export interface Guest {
  id: string;
  ticketCode: string; // e.g. "BJB-741029"
  name: string;
  phone: string;
  email?: string;
  kategoriInstansi?: string;
  kelompokKelas?: string;
  instansiAlamat?: string;
  membersCount: number; // Jumlah jiwa rombongan
  groupOrigin: string; // Asal / Rombongan / Nagari
  rsvpStatus: RsvpStatus;
  notes: string; // Alergi atau kebutuhan khusus
  tentId: string | null; // "tenda-a", "tenda-b", "tenda-c", "tenda-d"
  tableId: number | null; // Nomor meja (1-8)
  checkedIn: boolean;
  checkedInAt: string | null;
  updatedAt: string;
  registeredAt: string;
  avatarTheme: 'purple' | 'orange' | 'emerald' | 'blue' | 'rose' | 'amber';
}

export interface ActivityItem {
  id: string;
  guestId: string;
  guestName: string;
  groupOrigin: string;
  ticketCode: string;
  actionType:
    | 'registered'
    | 'rsvp_hadir'
    | 'rsvp_berhalangan'
    | 'rsvp_pending'
    | 'checkin'
    | 'tent_assigned';
  rsvpStatus: RsvpStatus;
  membersCount: number;
  tentName?: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  displayName: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'OPERATOR';
  createdAt: string;
  lastLoginAt?: string | null;
}

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin-1',
    username: 'admindisbud',
    password: 'admin',
    displayName: 'Admin Dinas Kebudayaan',
    role: 'SUPERADMIN',
    createdAt: '2026-10-14 08:00',
    lastLoginAt: null,
  },
];

export const DEFAULT_GROUP_ORIGINS: string[] = [
  'Keluarga dari Koto Gadang',
  'Nagari Padang',
  'Kerabat Silungkang',
  'Keluarga Besar Talawi',
  'Perantau Bukittinggi',
  'Bundo Kanduang Payakumbuh',
  'Keluarga Kubang Sirakuk',
  'Ninik Mamak Lembah Segar',
];

export const INITIAL_TENTS: TentBlock[] = [
  {
    id: 'tenda-a',
    name: 'Tenda A — Balai Utama Ninik Mamak',
    shortCode: 'Tenda A',
    zoneDesc: 'Area Depan Panggung Kehormatan & Pimpinan Kerapatan Adat',
    capacity: 22,
    tableIds: [1, 2],
    colorTheme: 'border-purple-300 bg-purple-50/50',
    badgeBg: 'bg-[#EDE9FE]',
    badgeText: 'text-[#6D28D9]',
  },
  {
    id: 'tenda-b',
    name: 'Tenda B — Sayap Barat Silungkang & Koto Gadang',
    shortCode: 'Tenda B',
    zoneDesc: 'Sisi Barat Halaman Adat dekat Taman Museum Ransum',
    capacity: 20,
    tableIds: [3, 4],
    colorTheme: 'border-blue-300 bg-blue-50/50',
    badgeBg: 'bg-[#DBEAFE]',
    badgeText: 'text-[#1D4ED8]',
  },
  {
    id: 'tenda-c',
    name: 'Tenda C — Sayap Timur Talawi & Lembah Segar',
    shortCode: 'Tenda C',
    zoneDesc: 'Sisi Timur Balai Adat & Area Dapur Sajian Tradisional',
    capacity: 20,
    tableIds: [5, 6],
    colorTheme: 'border-emerald-300 bg-emerald-50/50',
    badgeBg: 'bg-[#D1FAE5]',
    badgeText: 'text-[#047857]',
  },
  {
    id: 'tenda-d',
    name: 'Tenda D — Serambi Selatan Perantau & Nagari',
    shortCode: 'Tenda D',
    zoneDesc: 'Area Terbuka Pintu Masuk Selatan untuk Tamu Perantau',
    capacity: 20,
    tableIds: [7, 8],
    colorTheme: 'border-amber-300 bg-amber-50/50',
    badgeBg: 'bg-[#FEF3C7]',
    badgeText: 'text-[#B45309]',
  },
];

export const INITIAL_TABLES: TableItem[] = [
  { id: 1, name: 'Meja 1 — Jamba Utama', subtitle: 'Kehormatan & Ninik Mamak', tentId: 'tenda-a', capacity: 12 },
  { id: 2, name: 'Meja 2 — Jamba Pucuk Adat', subtitle: 'Pimpinan Nagari & Alim Ulama', tentId: 'tenda-a', capacity: 10 },
  { id: 3, name: 'Meja 3 — Jamba Silungkang', subtitle: 'Kerabat Silungkang & Koto Gadang', tentId: 'tenda-b', capacity: 10 },
  { id: 4, name: 'Meja 4 — Jamba Koto Gadang', subtitle: 'Keluarga Besar Koto Gadang', tentId: 'tenda-b', capacity: 10 },
  { id: 5, name: 'Meja 5 — Jamba Talawi', subtitle: 'Keluarga Besar Talawi', tentId: 'tenda-c', capacity: 10 },
  { id: 6, name: 'Meja 6 — Jamba Lembah Segar', subtitle: 'Bundo Kanduang & Lembah Segar', tentId: 'tenda-c', capacity: 10 },
  { id: 7, name: 'Meja 7 — Jamba Singkarak', subtitle: 'Ikatan Perantau Bukittinggi', tentId: 'tenda-d', capacity: 10 },
  { id: 8, name: 'Meja 8 — Jamba Ombilin', subtitle: 'Kerabat Perantau & Tamu Kehormatan', tentId: 'tenda-d', capacity: 10 },
];

export const INITIAL_GUESTS: Guest[] = [
  {
    id: 'g-1',
    ticketCode: 'BJB-741029',
    name: 'Datuk Paduko Alam Chaniago',
    phone: '0812-6601-4421',
    membersCount: 4,
    groupOrigin: 'Keluarga dari Koto Gadang',
    rsvpStatus: 'Hadir',
    notes: 'Duduk dekat mimbar adat, butuh 1 kursi lansia',
    tentId: 'tenda-a',
    tableId: 1,
    checkedIn: true,
    checkedInAt: '09:15:22 WIB',
    updatedAt: '10 menit yang lalu',
    registeredAt: '10 Okt 2026',
    avatarTheme: 'purple',
  },
  {
    id: 'g-2',
    ticketCode: 'BJB-519283',
    name: 'Hj. Siti Manggopoh Bundo',
    phone: '0813-7420-8819',
    membersCount: 3,
    groupOrigin: 'Nagari Padang',
    rsvpStatus: 'Hadir',
    notes: 'Alergi udang/seafood, sambal dipisah',
    tentId: 'tenda-a',
    tableId: 1,
    checkedIn: true,
    checkedInAt: '09:24:10 WIB',
    updatedAt: '18 menit yang lalu',
    registeredAt: '10 Okt 2026',
    avatarTheme: 'orange',
  },
  {
    id: 'g-3',
    ticketCode: 'BJB-638104',
    name: 'Sutan Sjahrir Sikumbang',
    phone: '0821-7099-3102',
    membersCount: 5,
    groupOrigin: 'Kerabat Silungkang',
    rsvpStatus: 'Hadir',
    notes: 'Membawa 1 anak balita',
    tentId: 'tenda-b',
    tableId: 3,
    checkedIn: false,
    checkedInAt: null,
    updatedAt: '25 menit yang lalu',
    registeredAt: '11 Okt 2026',
    avatarTheme: 'emerald',
  },
  {
    id: 'g-4',
    ticketCode: 'BJB-902417',
    name: 'Rangkayo Rasuna Piliang',
    phone: '0852-6311-9045',
    membersCount: 2,
    groupOrigin: 'Keluarga dari Koto Gadang',
    rsvpStatus: 'Hadir',
    notes: 'Tidak makan pedas sama sekali',
    tentId: 'tenda-b',
    tableId: 4,
    checkedIn: false,
    checkedInAt: null,
    updatedAt: '40 menit yang lalu',
    registeredAt: '11 Okt 2026',
    avatarTheme: 'blue',
  },
  {
    id: 'g-5',
    ticketCode: 'BJB-317892',
    name: 'Engku Mudo Bagindo Tanjuang',
    phone: '0811-6642-7780',
    membersCount: 4,
    groupOrigin: 'Keluarga Besar Talawi',
    rsvpStatus: 'Belum Konfirmasi',
    notes: 'Menunggu konfirmasi mobil rombongan',
    tentId: 'tenda-c',
    tableId: 5,
    checkedIn: false,
    checkedInAt: null,
    updatedAt: '1 jam yang lalu',
    registeredAt: '11 Okt 2026',
    avatarTheme: 'amber',
  },
  {
    id: 'g-6',
    ticketCode: 'BJB-842105',
    name: 'Puti Reno Nilam Sari',
    phone: '0812-7588-2301',
    membersCount: 3,
    groupOrigin: 'Perantau Bukittinggi',
    rsvpStatus: 'Hadir',
    notes: 'Dendeng batokok kering jika tersedia',
    tentId: 'tenda-d',
    tableId: 7,
    checkedIn: true,
    checkedInAt: '09:42:05 WIB',
    updatedAt: '1 jam yang lalu',
    registeredAt: '12 Okt 2026',
    avatarTheme: 'rose',
  },
  {
    id: 'g-7',
    ticketCode: 'BJB-209841',
    name: 'Marah Rusli Koto',
    phone: '0813-6300-5129',
    membersCount: 2,
    groupOrigin: 'Nagari Padang',
    rsvpStatus: 'Berhalangan',
    notes: 'Sedang dinas luar kota di Jakarta',
    tentId: null,
    tableId: null,
    checkedIn: false,
    checkedInAt: null,
    updatedAt: '2 jam yang lalu',
    registeredAt: '12 Okt 2026',
    avatarTheme: 'purple',
  },
  {
    id: 'g-8',
    ticketCode: 'BJB-761234',
    name: 'Bundo Kanduang Rohana Kudus',
    phone: '0822-8419-6634',
    membersCount: 6,
    groupOrigin: 'Bundo Kanduang Payakumbuh',
    rsvpStatus: 'Hadir',
    notes: 'Rombongan seragam songket merah',
    tentId: 'tenda-c',
    tableId: 6,
    checkedIn: false,
    checkedInAt: null,
    updatedAt: '2 jam yang lalu',
    registeredAt: '12 Okt 2026',
    avatarTheme: 'orange',
  },
  {
    id: 'g-9',
    ticketCode: 'BJB-490321',
    name: 'Tuanku Imam Jambak',
    phone: '0853-7712-4098',
    membersCount: 3,
    groupOrigin: 'Ninik Mamak Lembah Segar',
    rsvpStatus: 'Hadir',
    notes: 'Rendang daging empuk untuk orang tua',
    tentId: 'tenda-a',
    tableId: 2,
    checkedIn: false,
    checkedInAt: null,
    updatedAt: '3 jam yang lalu',
    registeredAt: '12 Okt 2026',
    avatarTheme: 'emerald',
  },
  {
    id: 'g-10',
    ticketCode: 'BJB-183492',
    name: 'Uda Zulkifli Guci',
    phone: '0812-6790-1182',
    membersCount: 4,
    groupOrigin: 'Keluarga Kubang Sirakuk',
    rsvpStatus: 'Belum Konfirmasi',
    notes: '',
    tentId: 'tenda-d',
    tableId: 8,
    checkedIn: false,
    checkedInAt: null,
    updatedAt: '4 jam yang lalu',
    registeredAt: '12 Okt 2026',
    avatarTheme: 'blue',
  },
  {
    id: 'g-11',
    ticketCode: 'BJB-629104',
    name: 'Uniang Sari Banilai Caniago',
    phone: '0813-7845-9920',
    membersCount: 2,
    groupOrigin: 'Kerabat Silungkang',
    rsvpStatus: 'Belum Konfirmasi',
    notes: '',
    tentId: null,
    tableId: null,
    checkedIn: false,
    checkedInAt: null,
    updatedAt: '5 jam yang lalu',
    registeredAt: '12 Okt 2026',
    avatarTheme: 'rose',
  },
  {
    id: 'g-12',
    ticketCode: 'BJB-347201',
    name: 'Bagindo Azizchan Melayu',
    phone: '0821-6933-8017',
    membersCount: 3,
    groupOrigin: 'Perantau Bukittinggi',
    rsvpStatus: 'Berhalangan',
    notes: 'Mengirimkan salam & tanda kasih untuk keluarga',
    tentId: null,
    tableId: null,
    checkedIn: false,
    checkedInAt: null,
    updatedAt: '6 jam yang lalu',
    registeredAt: '12 Okt 2026',
    avatarTheme: 'amber',
  },
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    guestId: 'g-1',
    guestName: 'Datuk Paduko Alam Chaniago',
    groupOrigin: 'Keluarga dari Koto Gadang',
    ticketCode: 'BJB-741029',
    actionType: 'checkin',
    rsvpStatus: 'Hadir',
    membersCount: 4,
    tentName: 'Tenda A',
    timestamp: '09:15 WIB',
  },
  {
    id: 'act-2',
    guestId: 'g-2',
    guestName: 'Hj. Siti Manggopoh Bundo',
    groupOrigin: 'Nagari Padang',
    ticketCode: 'BJB-519283',
    actionType: 'checkin',
    rsvpStatus: 'Hadir',
    membersCount: 3,
    tentName: 'Tenda A',
    timestamp: '09:24 WIB',
  },
  {
    id: 'act-3',
    guestId: 'g-6',
    guestName: 'Puti Reno Nilam Sari',
    groupOrigin: 'Perantau Bukittinggi',
    ticketCode: 'BJB-842105',
    actionType: 'checkin',
    rsvpStatus: 'Hadir',
    membersCount: 3,
    tentName: 'Tenda D',
    timestamp: '09:42 WIB',
  },
  {
    id: 'act-4',
    guestId: 'g-8',
    guestName: 'Bundo Kanduang Rohana Kudus',
    groupOrigin: 'Bundo Kanduang Payakumbuh',
    ticketCode: 'BJB-761234',
    actionType: 'rsvp_hadir',
    rsvpStatus: 'Hadir',
    membersCount: 6,
    tentName: 'Tenda C',
    timestamp: '1 jam yang lalu',
  },
];

export const AVATAR_STYLES: Record<
  Guest['avatarTheme'],
  { bg: string; icon: string; ring: string }
> = {
  purple: {
    bg: 'bg-[#EDE9FE]',
    icon: 'text-[#6D28D9]',
    ring: 'ring-[#DDD6FE]',
  },
  orange: {
    bg: 'bg-[#FFEDD5]',
    icon: 'text-[#C2410C]',
    ring: 'ring-[#FED7AA]',
  },
  emerald: {
    bg: 'bg-[#D1FAE5]',
    icon: 'text-[#047857]',
    ring: 'ring-[#A7F3D0]',
  },
  blue: {
    bg: 'bg-[#DBEAFE]',
    icon: 'text-[#1D4ED8]',
    ring: 'ring-[#BFDBFE]',
  },
  rose: {
    bg: 'bg-[#FFE4E6]',
    icon: 'text-[#BE123C]',
    ring: 'ring-[#FECDD3]',
  },
  amber: {
    bg: 'bg-[#FEF3C7]',
    icon: 'text-[#B45309]',
    ring: 'ring-[#FDE68A]',
  },
};

export function generateTicketCode(): string {
  const randNum = Math.floor(100000 + Math.random() * 900000);
  return `BJB-${randNum}`;
}

export function formatIndonesianTime(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds} WIB`;
}

export function exportToCsv(filename: string, rows: string[][]) {
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          const escaped = String(cell ?? '').replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
