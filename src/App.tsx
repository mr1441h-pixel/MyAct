import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  CalendarDays,
  Target,
  ArrowRight,
  Settings,
  Tag
} from 'lucide-react';
import { useActivities } from './hooks/useActivities';
import { useTheme } from './hooks/useTheme';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePWAInstall } from './hooks/usePWAInstall';
import { TopBar } from './components/TopBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { ActivityCard } from './components/ActivityCard';
import { ActivityModal } from './components/ActivityModal';
import { WidgetHub } from './components/WidgetHub';
import { AnalyticsView } from './components/AnalyticsView';
import { BackupAndThemeView } from './components/BackupAndThemeView';
import { PWAInstallModal } from './components/PWAInstallModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { APKGuideModal } from './components/APKGuideModal';
import { ActivityItem, ActivityCategory, CategoryItem } from './types';
import { 
  formatReadableDate, 
  loadCategoriesFromStorage, 
  saveCategoriesToStorage, 
  DEFAULT_CATEGORIES 
} from './utils/storage';
import { 
  CalendarMode, 
  getStoredCalendarMode, 
  saveStoredCalendarMode, 
  getStoredHijriOffset, 
  saveStoredHijriOffset, 
  formatDualDateString 
} from './utils/hijriCalendar';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('kegiatan');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isAPKGuideOpen, setIsAPKGuideOpen] = useState(false);

  // Calendar Mode (KHGT Hijriah / Masehi / Dual) & Offset
  const [calendarMode, setCalendarMode] = useState<CalendarMode>(() => getStoredCalendarMode());
  const [hijriOffset, setHijriOffset] = useState<number>(() => getStoredHijriOffset());

  const handleToggleCalendarMode = () => {
    const modes: CalendarMode[] = ['dual', 'hijriah', 'masehi'];
    const nextIdx = (modes.indexOf(calendarMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setCalendarMode(nextMode);
    saveStoredCalendarMode(nextMode);
  };

  const handleSetCalendarMode = (mode: CalendarMode) => {
    setCalendarMode(mode);
    saveStoredCalendarMode(mode);
  };

  const handleSetHijriOffset = (offset: number) => {
    setHijriOffset(offset);
    saveStoredHijriOffset(offset);
  };

  // Dynamic Categories state
  const [categories, setCategories] = useState<CategoryItem[]>(() => loadCategoriesFromStorage());

  useEffect(() => {
    saveCategoriesToStorage(categories);
  }, [categories]);

  const {
    activities,
    scheduledActivities,
    selectedDate,
    setSelectedDate,
    todayKey,
    dailyMetrics,
    getActivityStateForDate,
    toggleComplete,
    updateCounterValue,
    toggleSubtask,
    addActivity,
    updateActivity,
    deleteActivity,
    replaceAllActivities,
  } = useActivities();

  const { theme, setMode, setAccent, currentPalette } = useTheme();
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Celebration Confetti when 100% completion is reached
  useEffect(() => {
    if (dailyMetrics.total > 0 && dailyMetrics.percentage === 100) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // fail silently if canvas not supported
      }
    }
  }, [dailyMetrics.percentage, dailyMetrics.total]);

  // Category management handlers
  const handleAddCategory = (catData: Omit<CategoryItem, 'id'>) => {
    const id = 'cat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setCategories((prev) => [...prev, { ...catData, id }]);
  };

  const handleUpdateCategory = (id: string, updates: Partial<CategoryItem>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  };

  const handleDeleteCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    
    // Check if activities are using this category
    const usedCount = activities.filter((a) => a.category === id).length;
    const confirmMsg = usedCount > 0
      ? `Kategori "${cat.label}" digunakan oleh ${usedCount} kegiatan. Jika dihapus, kegiatan tersebut akan dialihkan ke kategori "Lainnya". Yakin ingin menghapus?`
      : `Hapus kategori "${cat.label}"?`;

    if (window.confirm(confirmMsg)) {
      if (usedCount > 0) {
        activities.forEach((a) => {
          if (a.category === id) {
            updateActivity(a.id, { category: 'lainnya' });
          }
        });
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (selectedCategory === id) setSelectedCategory('all');
    }
  };

  const handleResetCategories = () => {
    if (window.confirm('Kembalikan daftar kategori ke pengaturan awal?')) {
      setCategories(DEFAULT_CATEGORIES);
      saveCategoriesToStorage(DEFAULT_CATEGORIES);
    }
  };

  // Filter activities based on category and search query
  const filteredActivities = scheduledActivities.filter((act) => {
    const matchesCategory = selectedCategory === 'all' || act.category === selectedCategory;
    const matchesSearch = 
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.description && act.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter pills list based on dynamic categories
  const categoriesFilterList = [
    { id: 'all', label: 'Semua' },
    ...categories.map((c) => ({ id: c.id, label: c.label })),
  ];

  const handleSaveActivity = (data: any) => {
    if (editingActivity) {
      updateActivity(editingActivity.id, data);
      setEditingActivity(null);
    } else {
      addActivity(data);
    }
  };

  const handleEditClick = (act: ActivityItem) => {
    setEditingActivity(act);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (id: string, title: string) => {
    if (window.confirm(`Hapus kegiatan "${title}"?`)) {
      deleteActivity(id);
    }
  };

  const toggleThemeMode = () => {
    if (theme.mode === 'light') setMode('dark');
    else if (theme.mode === 'dark') setMode('amoled');
    else setMode('light');
  };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://myact.web.app';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:amoled-mode:bg-black text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Application Bar */}
      <TopBar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        isOnline={isOnline}
        theme={theme}
        calendarMode={calendarMode}
        onToggleCalendarMode={handleToggleCalendarMode}
        onToggleTheme={toggleThemeMode}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenAPKGuide={() => setIsAPKGuideOpen(true)}
        isInstallable={isInstallable}
        isStandalone={isInstalled}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-24">
        {/* TAB 1: DAFTAR KEGIATAN & CHECKLIST */}
        {activeTab === 'kegiatan' && (
          <div className="space-y-4">
            {/* Daily Collective Progress Summary Header Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 dark:amoled-mode:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Progres Kolektif Hari Ini
                  </span>
                </div>
                <span className="text-xs font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                  {dailyMetrics.completed}/{dailyMetrics.total} Selesai ({dailyMetrics.percentage}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${dailyMetrics.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                <span>{formatDualDateString(selectedDate, calendarMode, hijriOffset)}</span>
                {dailyMetrics.percentage === 100 && dailyMetrics.total > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Target Penuh Tercapai!
                  </span>
                )}
              </div>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kegiatan atau rincian..."
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 dark:amoled-mode:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
              </div>

              {/* Category Segmented Scrollable Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                {categoriesFilterList.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 dark:amoled-mode:bg-zinc-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}

                {/* Manage Categories Button right on the bar */}
                <button
                  type="button"
                  onClick={() => setIsCategoryManagerOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 whitespace-nowrap flex items-center gap-1 transition-colors"
                  title="Kelola & edit kategori kegiatan"
                >
                  <Tag className="w-3 h-3" />
                  <span>Kelola Kategori</span>
                </button>
              </div>
            </div>

            {/* Activities List */}
            {filteredActivities.length > 0 ? (
              <div className="space-y-2.5">
                {filteredActivities.map((act) => {
                  const state = getActivityStateForDate(act, selectedDate);
                  const catLabel = categories.find((c) => c.id === act.category)?.label;
                  return (
                    <ActivityCard
                      key={act.id}
                      activity={act}
                      categoryLabel={catLabel}
                      state={state}
                      onToggleComplete={() => toggleComplete(act.id)}
                      onUpdateCounter={(delta) => updateCounterValue(act.id, delta)}
                      onToggleSubtask={(subId) => toggleSubtask(act.id, subId)}
                      onEdit={() => handleEditClick(act)}
                      onDelete={() => handleDeleteClick(act.id, act.title)}
                    />
                  );
                })}
              </div>
            ) : (
              /* Empty Zero-State */
              <div className="text-center py-12 px-4 bg-white dark:bg-slate-900/50 dark:amoled-mode:bg-zinc-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 mx-auto flex items-center justify-center mb-3">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Belum Ada Kegiatan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4">
                  {searchQuery
                    ? 'Tidak ditemukan kegiatan yang cocok dengan kata kunci pencarian.'
                    : 'Mulai buat daftar aktivitas, checklist, atau target kuantitas pertama Anda hari ini.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingActivity(null);
                    setIsAddModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kegiatan Baru</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WIDGET ANDROID HUB */}
        {activeTab === 'widget' && (
          <WidgetHub
            activities={activities}
            dailyMetrics={dailyMetrics}
            onToggleComplete={toggleComplete}
            onUpdateCounter={updateCounterValue}
            selectedDate={selectedDate}
          />
        )}

        {/* TAB 3: KURVA REKAM JEJAK & PROGRES KOLEKTIF */}
        {activeTab === 'kurva' && (
          <AnalyticsView
            activities={activities}
            selectedDate={selectedDate}
            calendarMode={calendarMode}
            dailyMetrics={dailyMetrics}
          />
        )}

        {/* TAB 4: CADANGAN CLOUD & TEMA */}
        {activeTab === 'pengaturan' && (
          <BackupAndThemeView
            theme={theme}
            onSetMode={setMode}
            onSetAccent={setAccent}
            onDataRestored={replaceAllActivities}
            isOnline={isOnline}
            onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
            onOpenAPKGuide={() => setIsAPKGuideOpen(true)}
            calendarMode={calendarMode}
            onSetCalendarMode={handleSetCalendarMode}
            hijriOffset={hijriOffset}
            onSetHijriOffset={handleSetHijriOffset}
          />
        )}
      </main>

      {/* Floating Action Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => {
          setEditingActivity(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Add / Edit Activity Modal with Dynamic Categories */}
      <ActivityModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
        initialData={editingActivity}
        categories={categories}
        onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
      />

      {/* Guided PWA Install Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstall={install}
        isInstallable={isInstallable}
        isIOS={isIOS}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onResetDefaults={handleResetCategories}
      />

      {/* APK Guide & Download Modal */}
      <APKGuideModal
        isOpen={isAPKGuideOpen}
        onClose={() => setIsAPKGuideOpen(false)}
        appUrl={appUrl}
      />
    </div>
  );
}
