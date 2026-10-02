import React from 'react';
import { Calendar, Wifi, WifiOff, Moon, Sun, Smartphone, Sparkles, Compass } from 'lucide-react';
import { formatDateKey, formatShortDate, formatReadableDate } from '../utils/storage';
import { ThemeConfig } from '../types';
import { CalendarMode, formatDualDateString, getHijriDate, getHijriDayNumber } from '../utils/hijriCalendar';

interface TopBarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  isOnline: boolean;
  theme: ThemeConfig;
  calendarMode: CalendarMode;
  onToggleCalendarMode: () => void;
  onToggleTheme: () => void;
  onOpenInstallModal: () => void;
  onOpenAPKGuide: () => void;
  isInstallable: boolean;
  isStandalone: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  selectedDate,
  onSelectDate,
  isOnline,
  theme,
  calendarMode,
  onToggleCalendarMode,
  onToggleTheme,
  onOpenInstallModal,
  onOpenAPKGuide,
  isInstallable,
  isStandalone,
}) => {
  const todayKey = formatDateKey();

  // Generate 7-day carousel: 5 days past, today, 1 day ahead
  const dateOptions = React.useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 5; i >= -1; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = formatDateKey(d);
      const hijriInfo = getHijriDate(d);
      list.push({
        key,
        dayName: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d),
        masehiDay: d.getDate(),
        hijriDay: hijriInfo.day,
        isToday: key === todayKey,
      });
    }
    return list;
  }, [todayKey]);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 dark:amoled-mode:bg-black/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 pt-3 pb-2.5 transition-colors">
      <div className="max-w-md mx-auto">
        {/* Row 1: Brand & Top Utilities */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  MyAct
                </h1>
                {/* Calendar Mode Indicator / Toggle Chip */}
                <button
                  type="button"
                  onClick={onToggleCalendarMode}
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors shrink-0"
                  title="Klik untuk beralih mode Kalender: Masehi / Hijriah KHGT / Ganda"
                >
                  {calendarMode === 'hijriah' ? 'KHGT' : calendarMode === 'dual' ? 'Dual' : 'Masehi'}
                </button>
              </div>
              <p
                onClick={onToggleCalendarMode}
                className="text-[11px] text-slate-500 dark:text-slate-400 truncate cursor-pointer hover:text-indigo-600 transition-colors"
                title="Klik untuk beralih mode tampilan kalender"
              >
                {selectedDate === todayKey ? 'Hari Ini • ' : ''}
                {formatDualDateString(selectedDate, calendarMode)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Offline / Online indicator */}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                isOnline
                  ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400'
              }`}
              title={isOnline ? 'Terhubung ke jaringan' : 'Bekerja secara luring (offline)'}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* APK Guide Trigger */}
            <button
              type="button"
              onClick={onOpenAPKGuide}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-md transition-colors"
              title="Panduan mendapatkan file .APK Android"
            >
              <Smartphone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>APK</span>
            </button>

            {/* PWA Install Trigger */}
            {!isStandalone && (
              <button
                type="button"
                onClick={onOpenInstallModal}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                title="Pasang aplikasi di layar utama Android"
              >
                <span className="hidden sm:inline">Instal</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              title={`Mode saat ini: ${theme.mode}`}
              aria-label="Ganti Tema"
            >
              {theme.mode === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Horizontal Date Scroller with Hijriah KHGT support */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-1 scrollbar-none">
          {dateOptions.map((item) => {
            const isSelected = item.key === selectedDate;
            const primaryNumber = calendarMode === 'hijriah' ? item.hijriDay : item.masehiDay;
            const secondaryNumber = calendarMode === 'dual' ? `${item.hijriDay}H` : null;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectDate(item.key)}
                className={`flex flex-col items-center justify-center min-w-[44px] py-1 px-2 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-sm font-semibold scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider">{item.dayName}</span>
                <span className="text-sm font-bold tabular-nums mt-0.5 leading-tight">
                  {primaryNumber}
                </span>
                {secondaryNumber && (
                  <span className="text-[9px] opacity-75 tabular-nums">
                    {secondaryNumber}
                  </span>
                )}
                {item.isToday && (
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      isSelected ? 'bg-white' : 'bg-indigo-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
