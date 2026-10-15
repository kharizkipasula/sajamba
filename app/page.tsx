'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  Guest,
  TableItem,
  TentBlock,
  ActivityItem,
  RsvpStatus,
  INITIAL_GUESTS,
  INITIAL_TABLES,
  INITIAL_TENTS,
  INITIAL_ACTIVITIES,
  formatIndonesianTime,
} from '@/lib/bajamba-data';
import DashboardView, { NavTab } from '@/components/DashboardView';
import PublicRegisterView from '@/components/PublicRegisterView';
import GuestListView from '@/components/GuestListView';
import TentMappingView from '@/components/TentMappingView';
import CheckInView from '@/components/CheckInView';
import GuestModal from '@/components/GuestModal';

const STORAGE_KEYS = {
  GUESTS: 'bajamba_sawahlunto_guests_v2',
  TABLES: 'bajamba_sawahlunto_tables_v2',
  TENTS: 'bajamba_sawahlunto_tents_v2',
  ACTIVITIES: 'bajamba_sawahlunto_activities_v2',
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

  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [tables, setTables] = useState<TableItem[]>(INITIAL_TABLES);
  const [tents, setTents] = useState<TentBlock[]>(INITIAL_TENTS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [isHydrated, setIsHydrated] = useState(false);

  // Modal State
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // Load from localStorage on client mount with requestAnimationFrame
  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      try {
        const savedGuests = localStorage.getItem(STORAGE_KEYS.GUESTS);
        const savedTables = localStorage.getItem(STORAGE_KEYS.TABLES);
        const savedTents = localStorage.getItem(STORAGE_KEYS.TENTS);
        const savedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);

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
    } catch {
      // Ignore quota
    }
  }, [guests, tables, tents, activities, isHydrated]);

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
  };

  const handleRegisterGuest = (newGuest: Guest) => {
    setGuests((prev) => [newGuest, ...prev]);
    recordActivity(newGuest, 'registered');
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
    }
  };

  const handleDeleteGuest = (guestId: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
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
        prev.map((t) => (t.id === existingId ? { ...t, ...tentData } : t))
      );
    } else {
      const newTentId = `tenda-${Date.now()}`;
      const newTent: TentBlock = {
        id: newTentId,
        ...tentData,
        tableIds: [],
      };
      setTents((prev) => [...prev, newTent]);
    }
  };

  const handleDeleteTent = (tentId: string) => {
    // Sesuai konfirmasi user: Pindahkan tamu otomatis ke status belum memiliki tenda
    const nowLabel = formatIndonesianTime(new Date());
    setGuests((prev) =>
      prev.map((g) => {
        if (g.tentId === tentId) {
          return {
            ...g,
            tentId: null,
            tableId: null,
            updatedAt: nowLabel,
          };
        }
        return g;
      })
    );

    // Hapus meja yang berada di dalam tenda ini
    setTables((prev) => prev.filter((t) => t.tentId !== tentId));

    // Hapus tenda dari daftar
    setTents((prev) => prev.filter((t) => t.id !== tentId));
  };

  const handleSaveTable = (
    tableData: Omit<TableItem, 'id'>,
    existingId?: number
  ) => {
    if (existingId !== undefined) {
      setTables((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...tableData } : t))
      );
    } else {
      const nextId =
        tables.length > 0 ? Math.max(...tables.map((t) => t.id)) + 1 : 1;
      const newTable: TableItem = {
        id: nextId,
        ...tableData,
      };
      setTables((prev) => [...prev, newTable]);

      // Hubungkan ke tableIds pada tenda terkait
      setTents((prev) =>
        prev.map((t) =>
          t.id === tableData.tentId
            ? { ...t, tableIds: [...t.tableIds, nextId] }
            : t
        )
      );
    }
  };

  const handleDeleteTable = (tableId: number) => {
    const nowLabel = formatIndonesianTime(new Date());
    // Lepas nomor meja dari tamu yang duduk di meja ini
    setGuests((prev) =>
      prev.map((g) => {
        if (g.tableId === tableId) {
          return {
            ...g,
            tableId: null,
            updatedAt: nowLabel,
          };
        }
        return g;
      })
    );

    // Hapus meja
    setTables((prev) => prev.filter((t) => t.id !== tableId));

    // Update tableIds di tenda
    setTents((prev) =>
      prev.map((t) => ({
        ...t,
        tableIds: t.tableIds.filter((id) => id !== tableId),
      }))
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
        if (nextCheckedIn) {
          recordActivity(updated, 'checkin');
        }
        return updated;
      })
    );
  };

  const handleResetDemoData = () => {
    setGuests(INITIAL_GUESTS);
    setTables(INITIAL_TABLES);
    setTents(INITIAL_TENTS);
    setActivities(INITIAL_ACTIVITIES);
    try {
      localStorage.removeItem(STORAGE_KEYS.GUESTS);
      localStorage.removeItem(STORAGE_KEYS.TABLES);
      localStorage.removeItem(STORAGE_KEYS.TENTS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
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
    { id: 'register', label: 'Pendaftaran & E-Tiket', icon: Ticket },
    { id: 'guests', label: 'Daftar Tamu', icon: Users, badge: String(guests.length) },
    { id: 'tents', label: 'Pemetaan Tenda', icon: Tent, badge: `${tents.length} Tenda` },
    {
      id: 'checkin',
      label: 'Check-in Tamu (QR)',
      icon: QrCode,
      badge: `${guests.filter((g) => g.checkedIn).length}`,
    },
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
                setActiveTab('dashboard');
                setMobileSidebarOpen(false);
              }}
              className="flex items-center gap-3 text-left group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#6355E5] text-white shadow-md group-hover:bg-[#7265F0] transition-colors">
                <Check className="h-5 w-5 stroke-[3]" />
              </div>
              <div className="min-w-0">
                <span className="block text-base font-extrabold tracking-tight text-white leading-tight truncate" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                  Bajamba Event
                </span>
                <span className="block text-[11px] font-medium text-slate-400 truncate">
                  Sawahlunto · RSVP & Tenda
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

        {/* Bottom Info & Reset */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="rounded-2xl bg-[#221D42] px-3.5 py-3 text-xs">
            <div className="font-bold text-white truncate">Makan Bajamba Sawahlunto</div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono tabular-nums">
              {guests.reduce((a, b) => a + b.membersCount, 0)} Jiwa · {guests.length} Rombongan
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetDemoData}
            className="w-full rounded-xl bg-[#2B244D] hover:bg-[#372E61] py-2.5 px-3 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Data Awal (12 Tamu)</span>
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
                onClick={() => setActiveTab('dashboard')}
                className="hover:text-[#1E194D] transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                <Home className="h-4 w-4 text-slate-400" />
                <span className="hidden sm:inline">Makan Bajamba</span>
              </button>
              <span className="text-slate-300" aria-hidden="true">/</span>
              <span className="font-bold text-[#1E194D] truncate">{activeNavLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#6355E5] bg-white px-3.5 py-2 text-xs font-bold text-[#6355E5] hover:bg-[#EDE9FE]/40 transition-colors whitespace-nowrap"
            >
              <Ticket className="h-3.5 w-3.5" />
              <span>Link E-Tiket Tamu</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingGuest(null);
                setIsGuestModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#6355E5] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#5243D4] transition-colors shadow-2xs whitespace-nowrap"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>+ Tambah Tamu</span>
            </button>
          </div>
        </header>

        {/* Viewport Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1360px] w-full mx-auto">
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
            />
          )}

          {activeTab === 'register' && (
            <PublicRegisterView
              guests={guests}
              tents={tents}
              tables={tables}
              onRegisterGuest={handleRegisterGuest}
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
              onAssignTent={handleAssignTent}
              onSaveTent={handleSaveTent}
              onDeleteTent={handleDeleteTent}
              onSaveTable={handleSaveTable}
              onDeleteTable={handleDeleteTable}
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
    </div>
  );
}
