import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  Unsubscribe,
} from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { db } from './firebase';
import {
  Guest,
  TentBlock,
  TableItem,
  ActivityItem,
  AdminUser,
  exportToCsv,
} from './bajamba-data';

const COLLECTIONS = {
  GUESTS: 'guests',
  TENTS: 'tents',
  TABLES: 'tables',
  ACTIVITIES: 'activities',
  ADMINS: 'admins',
};

// ========================
// Firestore Error Standard Handler (per Firebase skill guidelines)
// ========================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ========================
// Real-time Subscriptions
// ========================

export function subscribeGuests(onData: (guests: Guest[]) => void): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.GUESTS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: Guest[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Guest);
        });
        // Sort by registeredAt descending
        list.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
        onData(list);
      } else {
        onData([]);
      }
    },
    (err) => {
      console.warn('Firestore subscribeGuests error:', err);
    }
  );
}

export function subscribeTents(onData: (tents: TentBlock[]) => void): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.TENTS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: TentBlock[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as TentBlock);
        });
        list.sort((a, b) => a.id.localeCompare(b.id));
        onData(list);
      } else {
        onData([]);
      }
    },
    (err) => {
      console.warn('Firestore subscribeTents error:', err);
    }
  );
}

export function subscribeTables(onData: (tables: TableItem[]) => void): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.TABLES);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: TableItem[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as TableItem);
        });
        list.sort((a, b) => a.id - b.id);
        onData(list);
      } else {
        onData([]);
      }
    },
    (err) => {
      console.warn('Firestore subscribeTables error:', err);
    }
  );
}

export function subscribeActivities(onData: (acts: ActivityItem[]) => void): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.ACTIVITIES);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: ActivityItem[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as ActivityItem);
        });
        // Keep latest 25
        list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        onData(list.slice(0, 25));
      } else {
        onData([]);
      }
    },
    (err) => {
      console.warn('Firestore subscribeActivities error:', err);
    }
  );
}

export function subscribeAdmins(onData: (admins: AdminUser[]) => void): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.ADMINS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: AdminUser[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as AdminUser);
        });
        onData(list);
      } else {
        onData([]);
      }
    },
    (err) => {
      console.warn('Firestore subscribeAdmins error:', err);
    }
  );
}

// ========================
// Mutations
// ========================

export async function saveGuestToFirestore(guest: Guest): Promise<void> {
  const path = `${COLLECTIONS.GUESTS}/${guest.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.GUESTS, guest.id), guest);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function deleteGuestFromFirestore(guestId: string): Promise<void> {
  const path = `${COLLECTIONS.GUESTS}/${guestId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.GUESTS, guestId));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

export async function saveTentToFirestore(tent: TentBlock): Promise<void> {
  const path = `${COLLECTIONS.TENTS}/${tent.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.TENTS, tent.id), tent);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function deleteTentFromFirestore(tentId: string): Promise<void> {
  const path = `${COLLECTIONS.TENTS}/${tentId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.TENTS, tentId));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

export async function saveTableToFirestore(table: TableItem): Promise<void> {
  const path = `${COLLECTIONS.TABLES}/${table.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.TABLES, String(table.id)), table);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function deleteTableFromFirestore(tableId: number): Promise<void> {
  const path = `${COLLECTIONS.TABLES}/${tableId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.TABLES, String(tableId)));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

export async function saveActivityToFirestore(act: ActivityItem): Promise<void> {
  const path = `${COLLECTIONS.ACTIVITIES}/${act.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.ACTIVITIES, act.id), act);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function saveAdminToFirestore(admin: AdminUser): Promise<void> {
  const path = `${COLLECTIONS.ADMINS}/${admin.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.ADMINS, admin.id), admin);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function deleteAdminFromFirestore(adminId: string): Promise<void> {
  const path = `${COLLECTIONS.ADMINS}/${adminId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.ADMINS, adminId));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

// ========================
// Initial Seed to Firestore
// ========================

export async function seedInitialDataIfEmpty(
  initialGuests: Guest[],
  initialTents: TentBlock[],
  initialTables: TableItem[],
  initialActivities: ActivityItem[],
  initialAdmins: AdminUser[]
): Promise<void> {
  try {
    const guestsSnap = await getDocs(collection(db, COLLECTIONS.GUESTS));
    if (guestsSnap.empty) {
      console.log('Seeding initial data to Firestore...');
      for (const g of initialGuests) {
        await setDoc(doc(db, COLLECTIONS.GUESTS, g.id), g);
      }
      for (const t of initialTents) {
        await setDoc(doc(db, COLLECTIONS.TENTS, t.id), t);
      }
      for (const tbl of initialTables) {
        await setDoc(doc(db, COLLECTIONS.TABLES, String(tbl.id)), tbl);
      }
      for (const a of initialActivities) {
        await setDoc(doc(db, COLLECTIONS.ACTIVITIES, a.id), a);
      }
      for (const adm of initialAdmins) {
        await setDoc(doc(db, COLLECTIONS.ADMINS, adm.id), adm);
      }
      console.log('Seeding completed successfully!');
    }
  } catch (err) {
    console.warn('Firestore initial check/seed warning:', err);
  }
}

// ========================
// Export to Excel / Google Sheets
// ========================

function prepareSpreadsheetData(
  guests: Guest[],
  tents: TentBlock[],
  tables: TableItem[]
) {
  const tentMap = new Map(tents.map((t) => [t.id, t.name]));
  const tableMap = new Map(tables.map((tbl) => [tbl.id, tbl.name]));

  const headers = [
    'No',
    'Kode Tiket',
    'Nama Lengkap',
    'Nomor WhatsApp',
    'Email',
    'Asal Rombongan / Nagari',
    'Kategori Instansi',
    'Kelompok / Kelas',
    'Alamat Instansi',
    'Jumlah Jiwa (Pax)',
    'Status RSVP',
    'Penempatan Tenda',
    'Meja Jamba',
    'Status Check-In',
    'Waktu Check-In',
    'Waktu Pendaftaran',
    'Catatan Khusus',
  ];

  const rows = guests.map((g, idx) => [
    idx + 1,
    g.ticketCode,
    g.name,
    g.phone,
    g.email || '-',
    g.groupOrigin,
    g.kategoriInstansi || '-',
    g.kelompokKelas || '-',
    g.instansiAlamat || '-',
    g.membersCount,
    g.rsvpStatus,
    g.tentId ? tentMap.get(g.tentId) || g.tentId : 'Belum Ditentukan',
    g.tableId !== null ? tableMap.get(g.tableId) || `Meja #${g.tableId}` : 'Belum Ada Meja',
    g.checkedIn ? 'SUDAH HADIR' : 'BELUM HADIR',
    g.checkedInAt || '-',
    g.registeredAt,
    g.notes || '-',
  ]);

  return { headers, rows };
}

/**
 * Generates and downloads a native Excel (.xlsx) file with formatted column widths
 */
export function exportGuestsToExcel(
  guests: Guest[],
  tents: TentBlock[],
  tables: TableItem[],
  customFilename?: string
) {
  const { headers, rows } = prepareSpreadsheetData(guests, tents, tables);
  const data = [headers, ...rows];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set intelligent column widths
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 14 }, // Kode Tiket
    { wch: 28 }, // Nama Lengkap
    { wch: 18 }, // Nomor WhatsApp
    { wch: 22 }, // Email
    { wch: 26 }, // Asal Rombongan
    { wch: 20 }, // Kategori Instansi
    { wch: 18 }, // Kelompok / Kelas
    { wch: 24 }, // Alamat Instansi
    { wch: 16 }, // Jumlah Jiwa
    { wch: 18 }, // Status RSVP
    { wch: 22 }, // Penempatan Tenda
    { wch: 18 }, // Meja Jamba
    { wch: 16 }, // Status Check-In
    { wch: 20 }, // Waktu Check-In
    { wch: 22 }, // Waktu Pendaftaran
    { wch: 30 }, // Catatan Khusus
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Tamu Makan Bajamba');

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `Data_Tamu_Makan_Bajamba_${timestamp}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Generates and downloads a CSV file optimized for Google Sheets and Excel
 */
export function exportGuestsToGoogleSheetsCsv(
  guests: Guest[],
  tents: TentBlock[],
  tables: TableItem[]
) {
  const { headers, rows } = prepareSpreadsheetData(guests, tents, tables);
  const stringRows = rows.map((r) => r.map((c) => String(c)));
  const timestamp = new Date().toISOString().slice(0, 10);
  exportToCsv(`Data_Tamu_Makan_Bajamba_${timestamp}.csv`, [headers, ...stringRows]);
}

/**
 * Copies tab-separated values to the user clipboard for 1-click paste (Ctrl+V) into Google Sheets
 */
export async function copyGuestsForGoogleSheets(
  guests: Guest[],
  tents: TentBlock[],
  tables: TableItem[]
): Promise<boolean> {
  try {
    const { headers, rows } = prepareSpreadsheetData(guests, tents, tables);
    const tsv = [headers, ...rows]
      .map((r) => r.map((c) => String(c).replace(/\t|\n/g, ' ')).join('\t'))
      .join('\n');

    await navigator.clipboard.writeText(tsv);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Default spreadsheet export - downloads standard .xlsx
 */
export function exportGuestsToSpreadsheet(
  guests: Guest[],
  tents: TentBlock[],
  tables: TableItem[]
) {
  exportGuestsToExcel(guests, tents, tables);
}
