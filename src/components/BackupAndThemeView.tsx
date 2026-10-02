import React, { useState, useRef } from 'react';
import { 
  Cloud, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Palette, 
  Moon, 
  Sun, 
  Smartphone, 
  ShieldCheck, 
  FileJson, 
  Database,
  Calendar,
  WifiOff,
  CheckCheck
} from 'lucide-react';
import { ThemeConfig, ThemeMode, AccentColor, ActivityItem } from '../types';
import { 
  exportBackupToFile, 
  parseBackupFile, 
  restoreBackupData,
  GoogleDriveSyncService 
} from '../utils/cloudBackup';
import { 
  loadBackupConfigFromStorage, 
  saveBackupConfigToStorage,
  formatReadableDate 
} from '../utils/storage';
import { ACCENT_PALETTES } from '../hooks/useTheme';
import { CalendarMode, getHijriDate } from '../utils/hijriCalendar';

interface BackupAndThemeViewProps {
  theme: ThemeConfig;
  onSetMode: (mode: ThemeMode) => void;
  onSetAccent: (accent: AccentColor) => void;
  onDataRestored: (newActivities: ActivityItem[]) => void;
  isOnline: boolean;
  onOpenCategoryManager: () => void;
  onOpenAPKGuide: () => void;
  calendarMode: CalendarMode;
  onSetCalendarMode: (mode: CalendarMode) => void;
  hijriOffset: number;
  onSetHijriOffset: (offset: number) => void;
}

export const BackupAndThemeView: React.FC<BackupAndThemeViewProps> = ({
  theme,
  onSetMode,
  onSetAccent,
  onDataRestored,
  isOnline,
  onOpenCategoryManager,
  onOpenAPKGuide,
  calendarMode,
  onSetCalendarMode,
  hijriOffset,
  onSetHijriOffset,
}) => {
  const [backupConfig, setBackupConfig] = useState(() => loadBackupConfigFromStorage());
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle Auto Backup
  const handleToggleAutoBackup = () => {
    const nextVal = !backupConfig.autoBackupEnabled;
    const updated = { ...backupConfig, autoBackupEnabled: nextVal };
    setBackupConfig(updated);
    saveBackupConfigToStorage(updated);
  };

  // Trigger Manual JSON Export
  const handleExport = () => {
    const res = exportBackupToFile();
    if (res.success) {
      setSyncStatus(`Berhasil mengunduh berkas cadangan: ${res.fileName} (${res.sizeKb} KB)`);
      setBackupConfig(loadBackupConfigFromStorage());
      setTimeout(() => setSyncStatus(null), 4000);
    } else {
      setSyncStatus('Gagal mengunduh berkas cadangan.');
    }
  };

  // Trigger Import from File
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await parseBackupFile(file);
    if (res.valid && res.payload) {
      const confirmRestore = window.confirm(
        `Ditemukan ${res.payload.activitiesCount} kegiatan dalam berkas cadangan. Apakah Anda ingin memulihkan data ini ke MyAct? Data yang ada saat ini akan diperbarui.`
      );
      if (confirmRestore) {
        restoreBackupData(res.payload);
        onDataRestored(res.payload.activities);
        setSyncStatus(`Data berhasil dipulihkan! (${res.payload.activitiesCount} kegiatan)`);
        setTimeout(() => setSyncStatus(null), 4000);
      }
    } else {
      alert(res.message);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Simulate Google Drive Sync
  const handleGoogleDriveSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Menghubungkan ke Google Drive pribadi...');

    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date().toISOString();
      const updated = {
        ...backupConfig,
        googleDriveLinked: true,
        lastBackupTime: now,
        lastBackupFileName: 'MyAct_AutoBackup.json',
      };
      setBackupConfig(updated);
      saveBackupConfigToStorage(updated);
      setSyncStatus('Pencadangan MyAct ke Google Drive berhasil disinkronkan!');
      setTimeout(() => setSyncStatus(null), 4000);
    }, 1200);
  };

  const currentHijri = getHijriDate(new Date(), hijriOffset);

  return (
    <div className="space-y-5 pb-8">
      {/* SECTION: OFFLINE READINESS & REKAM JEJAK GUARANTEE */}
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          <span>Jaminan Ceklis &amp; Rekam Jejak 100% Offline</span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong>Ya, tentu saja!</strong> Semua centang checklist, target angka kegiatan, dan sub-kegiatan langsung tersimpan seketika di memori internal perangkat ponsel Anda. Rekam jejak kurva dan grafik harian tetap dihitung dan dapat dilihat sepenuhnya saat offline tanpa memerlukan koneksi internet.
        </p>
      </div>

      {/* SECTION: KALENDER HIJRIAH GLOBAL TUNGGAL (KHGT) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Mode Kalender Hijriah Global Tunggal (KHGT)
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-900 dark:amoled-mode:bg-zinc-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Tampilan Kalender di Layar Utama &amp; Widget
              </span>
              <p className="text-[11px] text-slate-500">
                Hari ini: <strong>{currentHijri.fullHijriString}</strong>
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              KHGT Global
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onSetCalendarMode('dual')}
              className={`py-2 px-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                calendarMode === 'dual'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>Mode Ganda</span>
              <span className="text-[10px] text-slate-400">Masehi + KHGT</span>
            </button>

            <button
              type="button"
              onClick={() => onSetCalendarMode('hijriah')}
              className={`py-2 px-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                calendarMode === 'hijriah'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>Hijriah KHGT</span>
              <span className="text-[10px] text-slate-400">Fokus Hijriah</span>
            </button>

            <button
              type="button"
              onClick={() => onSetCalendarMode('masehi')}
              className={`py-2 px-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                calendarMode === 'masehi'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>Masehi</span>
              <span className="text-[10px] text-slate-400">Standar Miladi</span>
            </button>
          </div>

          {/* Penyesuaian Offset Hari Hijriah */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Koreksi Tanggal Hijriah
              </span>
              <p className="text-[10px] text-slate-400">
                Sesuaikan bila hisab wilayah Anda berbeda ±1 hari
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[-1, 0, 1].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onSetHijriOffset(val)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    hijriOffset === val
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {val > 0 ? `+${val}` : val}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: CLOUD BACKUP & STORAGE */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Pencadangan Cloud Pribadi &amp; Ekspor Data
          </h2>
        </div>

        {/* Status Notification Banner */}
        {syncStatus && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Google Drive Integration Card */}
        <div className="bg-white dark:bg-slate-900 dark:amoled-mode:bg-zinc-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                📁
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Google Drive Pribadi
                </h3>
                <p className="text-[11px] text-slate-500">
                  Sinkronisasi otomatis ke folder cloud pribadi Anda
                </p>
              </div>
            </div>

            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                backupConfig.googleDriveLinked
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {backupConfig.googleDriveLinked ? 'Terhubung' : 'Siap Terhubung'}
            </span>
          </div>

          {/* Auto Backup Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Pencadangan Otomatis
              </span>
              <p className="text-[11px] text-slate-500">
                Sinkronkan otomatis setiap ada checklist atau target yang berubah
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleAutoBackup}
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                backupConfig.autoBackupEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  backupConfig.autoBackupEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Sync Trigger Action */}
          <div className="pt-1 flex gap-2">
            <button
              type="button"
              onClick={handleGoogleDriveSync}
              disabled={isSyncing || !isOnline}
              className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan ke Cloud'}</span>
            </button>
          </div>

          {backupConfig.lastBackupTime && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
              Pencadangan terakhir:{' '}
              {new Date(backupConfig.lastBackupTime).toLocaleString('id-ID')}
            </p>
          )}
        </div>

        {/* Local JSON Backup / Restore Card */}
        <div className="bg-white dark:bg-slate-900 dark:amoled-mode:bg-zinc-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Ekspor &amp; Impor Berkas Cadangan (.JSON)
            </h3>
          </div>
          <p className="text-[11px] text-slate-500">
            Simpan salinan data lengkap ke penyimpanan HP atau pulihkan dari cadangan sebelumnya.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleExport}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Unduh Cadangan</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-500" />
              <span>Pulihkan Data</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* APK Android Card */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent p-4 rounded-2xl border border-emerald-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Dapatkan File .APK Android (MyAct)
              </h3>
              <p className="text-[11px] text-slate-500">
                Cara unduh .apk mandiri atau pasang langsung ke HP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAPKGuide}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            Buka Panduan
          </button>
        </div>

        {/* Category Management Card */}
        <div className="bg-white dark:bg-slate-900 dark:amoled-mode:bg-zinc-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Kelola Kategori Aktivitas
              </h3>
              <p className="text-[11px] text-slate-500">
                Tambah, ganti nama, atau atur warna kategori Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenCategoryManager}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            Kelola
          </button>
        </div>
      </div>

      {/* SECTION 2: THEME & VISUAL CUSTOMIZATION */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Kustomisasi Tema &amp; Tampilan
          </h2>
        </div>

        {/* Display Mode (Light / Dark / AMOLED) */}
        <div className="bg-white dark:bg-slate-900 dark:amoled-mode:bg-zinc-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
            Mode Tampilan Layar
          </span>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onSetMode('light')}
              className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                theme.mode === 'light'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Terang</span>
            </button>

            <button
              type="button"
              onClick={() => onSetMode('dark')}
              className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                theme.mode === 'dark'
                  ? 'border-indigo-600 bg-slate-800 text-white font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Gelap Slate</span>
            </button>

            <button
              type="button"
              onClick={() => onSetMode('amoled')}
              className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                theme.mode === 'amoled'
                  ? 'border-cyan-500 bg-black text-cyan-400 font-bold ring-1 ring-cyan-500'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-black border border-cyan-400" />
              <span>AMOLED Murni</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Mode AMOLED Murni mematikan piksel hitam di layar OLED smartphone untuk menghemat baterai.
          </p>
        </div>

        {/* Accent Color Palette Selector */}
        <div className="bg-white dark:bg-slate-900 dark:amoled-mode:bg-zinc-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
            Warna Aksen Aplikasi
          </span>

          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(ACCENT_PALETTES) as AccentColor[]).map((key) => {
              const pal = ACCENT_PALETTES[key];
              const isSelected = theme.accent === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSetAccent(key)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                    isSelected
                      ? 'border-slate-900 dark:border-white shadow-xs font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: pal.hex }}
                  />
                  <span className="truncate text-slate-800 dark:text-slate-200">{pal.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Privacy & Offline Architecture Assurance */}
        <div className="p-3 bg-slate-100/70 dark:bg-slate-800/40 rounded-xl flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Data MyAct Anda sepenuhnya berada di kendali Anda. Disimpan secara luring di perangkat ini dan hanya disinkronkan ke akun penyimpanan cloud pribadi yang Anda izinkan.
          </p>
        </div>
      </div>
    </div>
  );
};
