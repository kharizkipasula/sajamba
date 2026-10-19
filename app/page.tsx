'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  LayoutGrid,
  QrCode,
  FileBarChart2,
  Check,
  Home,
  UserPlus,
  Menu,
  X,
  RotateCcw,
  ChevronRight,
  Ticket,
  Tent,
  ShieldCheck,
  LogOut,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import {
  Guest,
  TableItem,
  TentBlock,
  ActivityItem,
  RsvpStatus,
  AdminUser,
  INITIAL_GUESTS,
  INITIAL_TABLES,
  INITIAL_TENTS,
  INITIAL_ACTIVITIES,
  INITIAL_ADMIN_USERS,
  formatIndonesianTime,
  SAWAHLUNTO_LOGO_URL,
  DEFAULT_VENUE_MAP,
  VenueMapConfig,
} from '@/lib/bajamba-data';
import DashboardView, { NavTab } from '@/components/DashboardView';
import PublicRegisterView from '@/components/PublicRegisterView';
import GuestListView from '@/components/GuestListView';
import TentMappingView from '@/components/TentMappingView';
import CheckInView from '@/components/CheckInView';
import GuestModal from '@/components/GuestModal';
import AdminLoginView from '@/components/AdminLoginView';
import AdminUsersView from '@/components/AdminUsersView';
import ExportModal from '@/components/ExportModal';
import {
  subscribeGuests,
  subscribeTents,
  subscribeTables,
  subscribeActivities,
  subscribeAdmins,
  saveGuestToFirestore,
  deleteGuestFromFirestore,
  saveTentToFirestore,
  deleteTentFromFirestore,
  saveTableToFirestore,
  deleteTableFromFirestore,
  saveActivityToFirestore,
  saveAdminToFirestore,
  deleteAdminFromFirestore,
  seedInitialDataIfEmpty,
  exportGuestsToSpreadsheet,
} from '@/lib/firestore-service';
import { testFirestoreConnection } from '@/lib/firebase';

const STORAGE_KEYS = {
  GUESTS: 'bajamba_sawahlunto_guests_v2',
  TABLES: 'bajamba_sawahlunto_tables_v2',
  TENTS: 'bajamba_sawahlunto_tents_v2',
  ACTIVITIES: 'bajamba_sawahlunto_activities_v2',
  ADMIN_USERS: 'bajamba_sawahlunto_admin_users_v2',
  CURRENT_ADMIN: 'bajamba_sawahlunto_current_admin_v2',
  VENUE_MAP: 'bajamba_sawahlunto_venue_map_v2',
};

const AVATAR_THEME_LIST: Guest['avatarTheme'][] = [
  'purple',
  'orange',
  'emerald',
  'blue',
  'rose',
  'amber',
];

export default function BajambaAppPage() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [urlTicketCode, setUrlTicketCode] = useState<string>('');

  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [tables, setTables] = useState<TableItem[]>(INITIAL_TABLES);
  const [tents, setTents] = useState<TentBlock[]>(INITIAL_TENTS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(null);
  const [venueMap, setVenueMap] = useState<VenueMapConfig>(DEFAULT_VENUE_MAP);
  const [isHydrated, setIsHydrated] = useState(false);

  // Modal State
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Load from localStorage on client mount with requestAnimationFrame
  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      try {
        const savedGuests = localStorage.getItem(STORAGE_KEYS.GUESTS);
        const savedTables = localStorage.getItem(STORAGE_KEYS.TABLES);
        const savedTents = localStorage.getItem(STORAGE_KEYS.TENTS);
        const savedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
        const savedAdminUsers = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
        const savedCurrentAdmin = localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN);
        const savedVenueMap = localStorage.getItem(STORAGE_KEYS.VENUE_MAP);

        if (savedVenueMap) {
          try {
            const parsed = JSON.parse(savedVenueMap);
            if (parsed && typeof parsed === 'object') {
              setVenueMap(parsed);
            }
          } catch {
            // ignore
          }
        }

        if (savedGuests) {
          const parsed = JSON.parse(savedGuests);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setGuests(parsed);
          }
        }
        if (savedTables) {
          const parsed = JSON.parse(savedTables);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTables(parsed);
          }
        }
        if (savedTents) {
          const parsed = JSON.parse(savedTents);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTents(parsed);
          }
        }
        if (savedActivities) {
          const parsed = JSON.parse(savedActivities);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setActivities(parsed);
          }
        }
        if (savedAdminUsers) {
          const parsed = JSON.parse(savedAdminUsers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAdminUsers(parsed);
          }
        }
        if (savedCurrentAdmin) {
          const parsed = JSON.parse(savedCurrentAdmin);
          if (parsed && parsed.id) {
            setCurrentAdminUser(parsed);
          }
        }

        // Check URL parameters (e.g. from WhatsApp ticket link ?tab=register&ticket=BJB-741029)
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const tParam = params.get('ticket');
          const tabParam = params.get('tab') as NavTab | null;
          if (tParam) {
            setUrlTicketCode(tParam);
            setActiveTab('register');
          } else if (tabParam && ['dashboard', 'register', 'guests', 'tents', 'checkin', 'admins'].includes(tabParam)) {
            setActiveTab(tabParam);
          }
        }
      } catch {
        // Fallback
      } finally {
        setIsHydrated(true);
      }
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  // Persist to localStorage whenever state updates
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
      localStorage.setItem(STORAGE_KEYS.TENTS, JSON.stringify(tents));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(adminUsers));
      if (currentAdminUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(currentAdminUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
      }
    } catch {
      // Ignore quota
    }
  }, [guests, tables, tents, activities, adminUsers, currentAdminUser, isHydrated]);

  // Real-time Firestore Synchronizer
  useEffect(() => {
    if (!isHydrated) return;

    testFirestoreConnection();
    seedInitialDataIfEmpty(
      INITIAL_GUESTS,
      INITIAL_TENTS,
      INITIAL_TABLES,
      INITIAL_ACTIVITIES,
      INITIAL_ADMIN_USERS
    );

    const unsubGuests = subscribeGuests((remoteGuests) => {
      if (remoteGuests && remoteGuests.length > 0) {
        setGuests(remoteGuests);
      }
    });

    const unsubTents = subscribeTents((remoteTents) => {
      if (remoteTents && remoteTents.length > 0) {
        setTents(remoteTents);
      }
    });

    const unsubTables = subscribeTables((remoteTables) => {
      if (remoteTables && remoteTables.length > 0) {
        setTables(remoteTables);
      }
    });

    const unsubActivities = subscribeActivities((remoteActs) => {
      if (remoteActs && remoteActs.length > 0) {
        setActivities(remoteActs);
      }
    });

    const unsubAdmins = subscribeAdmins((remoteAdmins) => {
      if (remoteAdmins && remoteAdmins.length > 0) {
        setAdminUsers(remoteAdmins);
      }
    });

    return () => {
      unsubGuests();
      unsubTents();
      unsubTables();
      unsubActivities();
      unsubAdmins();
    };
  }, [isHydrated]);

  const recordActivity = (
    guest: Guest,
    actionType: ActivityItem['actionType'],
    tentName?: string
  ) => {
    const newAct: ActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      guestId: guest.id,
      guestName: guest.name,
      groupOrigin: guest.groupOrigin,
      ticketCode: guest.ticketCode,
      actionType,
      rsvpStatus: guest.rsvpStatus,
      membersCount: guest.membersCount,
      tentName,
      timestamp: formatIndonesianTime(new Date()),
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 19)]);
    saveActivityToFirestore(newAct);
  };

  const handleRegisterGuest = (newGuest: Guest) => {
    setGuests((prev) => [newGuest, ...prev]);
    recordActivity(newGuest, 'registered');
    saveGuestToFirestore(newGuest);
  };

  const handleSaveGuest = (
    guestData: Omit<
      Guest,
      'id' | 'ticketCode' | 'checkedIn' | 'checkedInAt' | 'updatedAt' | 'registeredAt' | 'avatarTheme'
    >,
    existingId?: string
  ) => {
    const nowLabel = formatIndonesianTime(new Date());

    if (existingId) {
      setGuests((prev) =>
        prev.map((g) => {
          if (g.id !== existingId) return g;
          const updated: Guest = {
            ...g,
            ...guestData,
            updatedAt: nowLabel,
          };
          saveGuestToFirestore(updated);
          recordActivity(
            updated,
            updated.rsvpStatus === 'Hadir'
              ? 'rsvp_hadir'
              : updated.rsvpStatus === 'Berhalangan'
              ? 'rsvp_berhalangan'
              : 'rsvp_pending'
          );
          return updated;
        })
      );
    } else {
      const randNum = Math.floor(100000 + Math.random() * 900000);
      const newGuest: Guest = {
        id: `g-${Date.now()}`,
        ticketCode: `BJB-${randNum}`,
        ...guestData,
        checkedIn: false,
        checkedInAt: null,
        updatedAt: nowLabel,
        registeredAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        avatarTheme: AVATAR_THEME_LIST[guests.length % AVATAR_THEME_LIST.length],
      };
      setGuests((prev) => [newGuest, ...prev]);
      recordActivity(newGuest, 'registered');
      saveGuestToFirestore(newGuest);
    }
  };

  const handleDeleteGuest = (guestId: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
    deleteGuestFromFirestore(guestId);
  };

  const handleQuickStatusChange = (guestId: string, status: RsvpStatus) => {
    const nowLabel = formatIndonesianTime(new Date());
    setGuests((prev) =>
      prev.map((g) => {
        if (g.id !== guestId) return g;
        const updated: Guest = {
          ...g,
          rsvpStatus: status,
          updatedAt: nowLabel,
        };
        saveGuestToFirestore(updated);
        recordActivity(
          updated,
          status === 'Hadir' ? 'rsvp_hadir' : status === 'Berhalangan' ? 'rsvp_berhalangan' : 'rsvp_pending'
        );
        return updated;
      })
    );
  };

  const handleAssignTent = (guestId: string, tentId: string | null, tableId: number | null) => {
    const nowLabel = formatIndonesianTime(new Date());
    const tentObj = tents.find((t) => t.id === tentId);

    setGuests((prev) =>
      prev.map((g) => {
        if (g.id !== guestId) return g;
        const updated: Guest = {
          ...g,
          tentId,
          tableId,
          updatedAt: nowLabel,
        };
        saveGuestToFirestore(updated);
        if (tentObj) {
          recordActivity(updated, 'tent_assigned', tentObj.shortCode);
        }
        return updated;
      })
    );
  };

  const handleQuickTentChange = (guestId: string, tentId: string | null) => {
    const tentTables = tentId ? tables.filter((t) => t.tentId === tentId) : [];
    handleAssignTent(guestId, tentId, tentTables[0]?.id || null);
  };

  const handleAssignTable = (guestId: string, tableId: number | null) => {
    const nowLabel = formatIndonesianTime(new Date());
    const tblObj = tables.find((t) => t.id === tableId);

    setGuests((prev) =>
      prev.map((g) => {
        if (g.id !== guestId) return g;
        const updated: Guest = {
          ...g,
          tableId,
          tentId: tblObj ? tblObj.tentId : g.tentId,
          updatedAt: nowLabel,
        };
        saveGuestToFirestore(updated);
        return updated;
      })
    );
  };

  const handleSaveTent = (
    tentData: Omit<TentBlock, 'id' | 'tableIds'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTents((prev) =>
        prev.map((t) => {
          if (t.id === existingId) {
            const updated = { ...t, ...tentData };
            saveTentToFirestore(updated);
            return updated;
          }
          return t;
        })
      );
    } else {
      const newTentId = `tenda-${Date.now()}`;
      const newTent: TentBlock = {
        id: newTentId,
        ...tentData,
        tableIds: [],
      };
      setTents((prev) => [...prev, newTent]);
      saveTentToFirestore(newTent);
    }
  };

  const handleDeleteTent = (tentId: string) => {
    // Sesuai konfirmasi user: Pindahkan tamu otomatis ke status belum memiliki tenda
    const nowLabel = formatIndonesianTime(new Date());
    setGuests((prev) =>
      prev.map((g) => {
        if (g.tentId === tentId) {
          const updated = {
            ...g,
            tentId: null,
            tableId: null,
            updatedAt: nowLabel,
          };
          saveGuestToFirestore(updated);
          return updated;
        }
        return g;
      })
    );

    // Hapus meja yang berada di dalam tenda ini
    tables
      .filter((t) => t.tentId === tentId)
      .forEach((tbl) => deleteTableFromFirestore(tbl.id));

    setTables((prev) => prev.filter((t) => t.tentId !== tentId));
    setTents((prev) => prev.filter((t) => t.id !== tentId));
    deleteTentFromFirestore(tentId);
  };

  const handleSaveTable = (
    tableData: Omit<TableItem, 'id'>,
    existingId?: number
  ) => {
    if (existingId !== undefined) {
      setTables((prev) =>
        prev.map((t) => {
          if (t.id === existingId) {
            const updated = { ...t, ...tableData };
            saveTableToFirestore(updated);
            return updated;
          }
          return t;
        })
      );
    } else {
      const nextId =
        tables.length > 0 ? Math.max(...tables.map((t) => t.id)) + 1 : 1;
      const newTable: TableItem = {
        id: nextId,
        ...tableData,
      };
      setTables((prev) => [...prev, newTable]);
      saveTableToFirestore(newTable);

      // Hubungkan ke tableIds pada tenda terkait
      setTents((prev) =>
        prev.map((t) => {
          if (t.id === tableData.tentId) {
            const updatedTent = { ...t, tableIds: [...t.tableIds, nextId] };
            saveTentToFirestore(updatedTent);
            return updatedTent;
          }
          return t;
        })
      );
    }
  };

  const handleDeleteTable = (tableId: number) => {
    const nowLabel = formatIndonesianTime(new Date());
    // Lepas nomor meja dari tamu yang duduk di meja ini
    setGuests((prev) =>
      prev.map((g) => {
        if (g.tableId === tableId) {
          const updated = {
            ...g,
            tableId: null,
            updatedAt: nowLabel,
          };
          saveGuestToFirestore(updated);
          return updated;
        }
        return g;
      })
    );

    // Hapus meja
    setTables((prev) => prev.filter((t) => t.id !== tableId));
    deleteTableFromFirestore(tableId);

    // Update tableIds di tenda
    setTents((prev) =>
      prev.map((t) => {
        const updated = {
          ...t,
          tableIds: t.tableIds.filter((id) => id !== tableId),
        };
        saveTentToFirestore(updated);
        return updated;
      })
    );
  };

  const handleToggleCheckIn = (guestId: string) => {
    const nowTime = formatIndonesianTime(new Date());
    setGuests((prev) =>
      prev.map((g) => {
        if (g.id !== guestId) return g;
        const nextCheckedIn = !g.checkedIn;
        const updated: Guest = {
          ...g,
          checkedIn: nextCheckedIn,
          checkedInAt: nextCheckedIn ? nowTime : null,
          rsvpStatus: nextCheckedIn ? 'Hadir' : g.rsvpStatus,
          updatedAt: nowTime,
        };
        saveGuestToFirestore(updated);
        if (nextCheckedIn) {
          recordActivity(updated, 'checkin');
        }
        return updated;
      })
    );
  };

  const handleAdminLogin = (user: AdminUser) => {
    const nowTime = formatIndonesianTime(new Date());
    const updatedUser: AdminUser = { ...user, lastLoginAt: nowTime };
    setCurrentAdminUser(updatedUser);
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === user.id ? updatedUser : u))
    );
    saveAdminToFirestore(updatedUser);
    setActiveTab('dashboard');
  };

  const handleAdminLogout = () => {
    setCurrentAdminUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
    } catch {
      // ignore
    }
  };

  const handleSaveAdmin = (
    adminData: Omit<AdminUser, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    const nowTime = formatIndonesianTime(new Date());
    if (existingId) {
      setAdminUsers((prev) =>
        prev.map((u) => {
          if (u.id === existingId) {
            const updated: AdminUser = {
              ...u,
              ...adminData,
            };
            if (currentAdminUser?.id === existingId) {
              setCurrentAdminUser(updated);
            }
            saveAdminToFirestore(updated);
            return updated;
          }
          return u;
        })
      );
    } else {
      const newAdmin: AdminUser = {
        id: `admin-${Date.now()}`,
        ...adminData,
        createdAt: nowTime,
        lastLoginAt: null,
      };
      setAdminUsers((prev) => [...prev, newAdmin]);
      saveAdminToFirestore(newAdmin);
    }
  };

  const handleDeleteAdmin = (adminId: string) => {
    setAdminUsers((prev) => prev.filter((u) => u.id !== adminId));
    deleteAdminFromFirestore(adminId);
  };

  const handleUpdateTentCoordinates = (
    tentId: string,
    coords: { x: number; y: number }
  ) => {
    setVenueMap((prev) => {
      const updated: VenueMapConfig = {
        ...prev,
        tentCoordinates: {
          ...(prev.tentCoordinates || {}),
          [tentId]: coords,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEYS.VENUE_MAP, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleSaveVenueMap = (mapConfig: VenueMapConfig) => {
    setVenueMap(mapConfig);
    try {
      localStorage.setItem(STORAGE_KEYS.VENUE_MAP, JSON.stringify(mapConfig));
    } catch {
      // ignore
    }
  };

  const handleResetVenueMapToDefault = () => {
    setVenueMap(DEFAULT_VENUE_MAP);
    try {
      localStorage.setItem(STORAGE_KEYS.VENUE_MAP, JSON.stringify(DEFAULT_VENUE_MAP));
    } catch {
      // ignore
    }
  };

  const handleResetDemoData = () => {
    setGuests(INITIAL_GUESTS);
    setTables(INITIAL_TABLES);
    setTents(INITIAL_TENTS);
    setActivities(INITIAL_ACTIVITIES);
    setAdminUsers(INITIAL_ADMIN_USERS);
    setVenueMap(DEFAULT_VENUE_MAP);
    try {
      localStorage.removeItem(STORAGE_KEYS.GUESTS);
      localStorage.removeItem(STORAGE_KEYS.TABLES);
      localStorage.removeItem(STORAGE_KEYS.TENTS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_USERS);
      localStorage.removeItem(STORAGE_KEYS.VENUE_MAP);
    } catch {
      // ignore
    }
  };

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'guests', label: 'Daftar Tamu', icon: Users, badge: String(guests.length) },
    { id: 'tents', label: 'Pemetaan Tenda', icon: Tent, badge: `${tents.length} Tenda` },
    {
      id: 'checkin',
      label: 'Check-in Tamu (QR)',
      icon: QrCode,
      badge: `${guests.filter((g) => g.checkedIn).length}`,
    },
    {
      id: 'admins',
      label: 'Kelola Petugas Admin',
      icon: ShieldCheck,
      badge: `${adminUsers.length} User`,
    },
    { id: 'register', label: 'Pendaftaran & E-Tiket', icon: Ticket },
  ];

  const activeNavLabel = navItems.find((n) => n.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="min-h-screen flex bg-[#F8F9FC] text-[#1E194D]">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGASI (RSVPify Dark Navy Theme) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[268px] bg-[#16122E] text-white flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Brand Lockup */}
          <div className="px-6 py-6 flex items-center justify-between border-b border-white/10">
            <button
              type="button"
              onClick={() => {
                setActiveTab(currentAdminUser ? 'dashboard' : 'register');
                setMobileSidebarOpen(false);
              }}
              className="flex items-center gap-3 text-left group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-md group-hover:scale-105 transition-transform overflow-hidden">
                <Image
                  src={SAWAHLUNTO_LOGO_URL}
                  alt="Lambang Kota Sawahlunto"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-extrabold tracking-tight text-white leading-tight truncate" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                  Kota Sawahlunto
                </span>
                <span className="block text-[11px] font-medium text-slate-400 truncate">
                  Makan Bajamba &bull; Disbud
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="py-5">
            <div className="px-6 pb-2.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Operasional Acara
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-6 py-3 text-xs sm:text-sm transition-all ${
                      isActive
                        ? 'bg-[#2B244D] text-white font-bold shadow-inset'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#8B7FF5]' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono tabular-nums ${
                        isActive ? 'bg-[#6355E5] text-white font-bold' : 'bg-white/10 text-slate-300'
                      }`}>
                        {item.badge}
                      </span>
                    ) : (
                      isActive && <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Profile & Reset */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {currentAdminUser ? (
            <div className="rounded-2xl bg-[#221D42] p-3 text-xs border border-white/5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#6355E5] to-[#EAB308] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {currentAdminUser.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate text-[11px]">
                      {currentAdminUser.displayName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      @{currentAdminUser.username}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                  {currentAdminUser.role}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAdminLogout}
                className="w-full mt-1 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 py-1.5 px-2.5 text-[11px] font-semibold text-slate-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar Sesi (Logout)</span>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#221D42] p-3 text-xs border border-white/5 text-center">
              <p className="text-[11px] text-slate-300 font-medium">Mode Publik</p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('dashboard');
                  setMobileSidebarOpen(false);
                }}
                className="w-full mt-2 rounded-xl bg-[#6355E5] hover:bg-[#7265F0] py-2 px-3 text-[11px] font-bold text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Login Petugas Admin</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleResetDemoData}
            className="w-full rounded-xl bg-[#2B244D] hover:bg-[#372E61] py-2 px-3 text-[11px] font-semibold text-slate-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Data Awal</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden rounded-xl border border-slate-200 p-2 text-[#1E194D] hover:bg-slate-50"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 truncate">
              <button
                type="button"
                onClick={() => setActiveTab(currentAdminUser ? 'dashboard' : 'register')}
                className="hover:text-[#1E194D] transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-slate-200/80 bg-white p-0.5">
                  <Image
                    src={SAWAHLUNTO_LOGO_URL}
                    alt="Logo Sawahlunto"
                    width={20}
                    height={20}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="hidden sm:inline font-semibold">Kota Sawahlunto</span>
              </button>
              <span className="text-slate-300" aria-hidden="true">/</span>
              <span className="font-bold text-[#1E194D] truncate">{activeNavLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {currentAdminUser ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#6355E5] bg-white px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-[#6355E5] hover:bg-[#EDE9FE]/40 transition-colors whitespace-nowrap"
                >
                  <Ticket className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Link E-Tiket Tamu</span>
                  <span className="sm:hidden">Tiket</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingGuest(null);
                    setIsGuestModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#6355E5] px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-white hover:bg-[#5243D4] transition-colors shadow-2xs whitespace-nowrap"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">+ Tambah Tamu</span>
                  <span className="sm:hidden">+ Tamu</span>
                </button>

                {/* Admin Pill with Quick Logout */}
                <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#1E194D] leading-tight truncate max-w-[120px]">
                      {currentAdminUser.displayName}
                    </p>
                    <span className="text-[10px] font-extrabold uppercase text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      {currentAdminUser.role}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Keluar Sesi (Logout)"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {activeTab === 'register' ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E194D] hover:bg-[#2B244D] px-3.5 py-2 text-xs font-bold text-white transition-colors shadow-2xs whitespace-nowrap"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-[#EAB308]" />
                    <span>Login Petugas Admin</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#6355E5] bg-white px-3.5 py-2 text-xs font-bold text-[#6355E5] hover:bg-[#EDE9FE]/40 transition-colors whitespace-nowrap"
                  >
                    <Ticket className="h-3.5 w-3.5" />
                    <span>Buka Portal E-Tiket Tamu</span>
                  </button>
                )}
              </>
            )}
          </div>
        </header>

        {/* Viewport Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1360px] w-full mx-auto">
          {/* Protected Area: If not logged in and not on register tab, show AdminLoginView */}
          {!currentAdminUser && activeTab !== 'register' ? (
            <AdminLoginView
              adminUsers={adminUsers}
              onLogin={handleAdminLogin}
              onSwitchToPublic={() => setActiveTab('register')}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  guests={guests}
                  activities={activities}
                  tables={tables}
                  tents={tents}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onOpenAddModal={() => {
                    setEditingGuest(null);
                    setIsGuestModalOpen(true);
                  }}
                  onExportSpreadsheet={() => setIsExportModalOpen(true)}
                />
              )}

              {activeTab === 'register' && (
                <PublicRegisterView
                  guests={guests}
                  tents={tents}
                  tables={tables}
                  onRegisterGuest={handleRegisterGuest}
                  initialTicketCode={urlTicketCode}
                />
              )}

              {activeTab === 'guests' && (
                <GuestListView
                  guests={guests}
                  tents={tents}
                  tables={tables}
                  onOpenAddModal={() => {
                    setEditingGuest(null);
                    setIsGuestModalOpen(true);
                  }}
                  onEditGuest={(guest) => {
                    setEditingGuest(guest);
                    setIsGuestModalOpen(true);
                  }}
                  onDeleteGuest={handleDeleteGuest}
                  onQuickStatusChange={handleQuickStatusChange}
                  onQuickTentChange={handleQuickTentChange}
                />
              )}

              {activeTab === 'tents' && (
                <TentMappingView
                  guests={guests}
                  tents={tents}
                  tables={tables}
                  venueMap={venueMap}
                  onAssignTent={handleAssignTent}
                  onSaveTent={handleSaveTent}
                  onDeleteTent={handleDeleteTent}
                  onSaveTable={handleSaveTable}
                  onDeleteTable={handleDeleteTable}
                  onUpdateTentCoordinates={handleUpdateTentCoordinates}
                  onSaveVenueMap={handleSaveVenueMap}
                  onResetVenueMapToDefault={handleResetVenueMapToDefault}
                />
              )}

              {activeTab === 'checkin' && (
                <CheckInView
                  guests={guests}
                  tents={tents}
                  tables={tables}
                  onToggleCheckIn={handleToggleCheckIn}
                />
              )}

              {activeTab === 'admins' && (
                <AdminUsersView
                  adminUsers={adminUsers}
                  currentAdmin={currentAdminUser}
                  onSaveAdmin={handleSaveAdmin}
                  onDeleteAdmin={handleDeleteAdmin}
                />
              )}
            </>
          )}


        </main>
      </div>

      {/* Modal Tambah / Edit Tamu */}
      <GuestModal
        key={editingGuest ? `edit-${editingGuest.id}` : `new-${isGuestModalOpen}`}
        isOpen={isGuestModalOpen}
        onClose={() => {
          setIsGuestModalOpen(false);
          setEditingGuest(null);
        }}
        onSave={handleSaveGuest}
        editingGuest={editingGuest}
        existingGroups={Array.from(new Set(guests.map((g) => g.groupOrigin)))}
        tents={tents}
        tables={tables}
      />

      {/* Modal Ekspor Data Tamu (Excel & Sheets) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        guests={guests}
        tents={tents}
        tables={tables}
      />
    </div>
  );
}
