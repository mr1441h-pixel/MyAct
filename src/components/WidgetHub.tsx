import React, { useState } from 'react';
import { 
  Check, 
  Plus, 
  Minus, 
  Smartphone, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Maximize2,
  Copy,
  Info
} from 'lucide-react';
import { ActivityItem } from '../types';

interface WidgetHubProps {
  activities: ActivityItem[];
  dailyMetrics: {
    total: number;
    completed: number;
    percentage: number;
  };
  onToggleComplete: (id: string) => void;
  onUpdateCounter: (id: string, delta: number) => void;
  selectedDate: string;
}

export const WidgetHub: React.FC<WidgetHubProps> = ({
  activities,
  dailyMetrics,
  onToggleComplete,
  onUpdateCounter,
  selectedDate,
}) => {
  const [activeWidgetType, setActiveWidgetType] = useState<'4x2' | '2x2' | '4x4'>('4x2');
  const [wallpaper, setWallpaper] = useState<'slate' | 'nature' | 'aurora' | 'oled'>('slate');
  const [copiedNote, setCopiedNote] = useState(false);

  // Counter item for 2x2 widget
  const counterActivity = activities.find((a) => a.type === 'counter' || a.type === 'duration') || activities[0];

  const wallpaperClasses = {
    slate: 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950',
    nature: 'bg-gradient-to-b from-emerald-950 via-teal-900 to-slate-950',
    aurora: 'bg-gradient-to-b from-purple-950 via-slate-900 to-indigo-950',
    oled: 'bg-black',
  };

  const copyWidgetInstructions = () => {
    navigator.clipboard.writeText(
      'Untuk menambahkan widget KegiatanKu di Android: Buka Google Chrome di ponsel -> Kunjungi tautan aplikasi -> Pilih menu titik tiga -> Ketuk "Tambahkan ke Layar Utama" / "Install App".'
    );
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2500);
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-transparent p-4 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-1">
          <Smartphone className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Simulasi Widget Beranda Android
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Uji coba langsung widget interaktif yang dapat beroperasi secara luring (offline) di layar beranda ponsel Anda.
        </p>
      </div>

      {/* Widget Type Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveWidgetType('4x2')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            activeWidgetType === '4x2'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Widget 4×2 (Agenda)
        </button>
        <button
          type="button"
          onClick={() => setActiveWidgetType('2x2')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            activeWidgetType === '2x2'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Widget 2×2 (Counter)
        </button>
        <button
          type="button"
          onClick={() => setActiveWidgetType('4x4')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            activeWidgetType === '4x4'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Widget 4×4 (Lengkap)
        </button>
      </div>

      {/* Android Device Mockup Screen */}
      <div className="relative rounded-3xl p-3 shadow-xl border-4 border-slate-700/60 dark:border-slate-800 bg-slate-900 overflow-hidden">
        {/* Device Wallpaper Canvas */}
        <div className={`rounded-2xl p-4 min-h-[380px] flex flex-col justify-between ${wallpaperClasses[wallpaper]} transition-colors duration-500`}>
          {/* Android Status Bar */}
          <div className="flex items-center justify-between text-white/80 text-[11px] font-medium tracking-tight mb-3">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-5 h-2.5 rounded-sm border border-white/60 p-0.5 flex items-center">
                <div className="w-3 h-full bg-white rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Clock & Date Widget on Homescreen (Masehi & KHGT Hijriah) */}
          <div className="text-center my-1 text-white">
            <div className="text-3xl font-light tracking-tight tabular-nums">09:41</div>
            <div className="text-[11px] text-white/85 font-medium">Jumat, 2 Oktober 2026</div>
            <div className="text-[10px] text-cyan-300 font-semibold mt-0.5">21 Rabiul Akhir 1448 H (KHGT)</div>
          </div>

          {/* THE INTERACTIVE WIDGET ITSELF */}
          <div className="my-auto py-2">
            {/* WIDGET 4x2: Agenda & Quick Checklist */}
            {activeWidgetType === '4x2' && (
              <div className="bg-slate-900/85 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 shadow-lg text-white">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center text-white">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold">Kegiatan Hari Ini</span>
                  </div>
                  <span className="text-[11px] text-indigo-300 font-semibold tabular-nums">
                    {dailyMetrics.completed}/{dailyMetrics.total} ({dailyMetrics.percentage}%)
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[170px] overflow-y-auto">
                  {activities.slice(0, 4).map((act) => (
                    <div
                      key={act.id}
                      onClick={() => onToggleComplete(act.id)}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            act.completed
                              ? 'bg-emerald-500 text-white'
                              : 'border border-white/40 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span
                          className={`text-xs truncate ${
                            act.completed ? 'line-through text-white/40' : 'text-white'
                          }`}
                        >
                          {act.title}
                        </span>
                      </div>
                      {act.scheduledTime && (
                        <span className="text-[10px] text-white/50 shrink-0">
                          {act.scheduledTime}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WIDGET 2x2: Quick Target Counter */}
            {activeWidgetType === '2x2' && counterActivity && (
              <div className="w-48 mx-auto bg-slate-900/85 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 shadow-lg text-white text-center">
                <div className="text-[11px] text-white/70 font-medium truncate mb-1">
                  {counterActivity.title}
                </div>
                
                {/* Circular indicator */}
                <div className="my-2 relative w-20 h-20 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="#06B6D4"
                      strokeWidth="3"
                      strokeDasharray="94.2"
                      strokeDashoffset={
                        94.2 - (94.2 * Math.min(100, (counterActivity.currentValue / (counterActivity.targetValue || 1)) * 100)) / 100
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-bold tabular-nums">
                      {counterActivity.currentValue}
                    </span>
                    <span className="text-[9px] text-white/60">
                      /{counterActivity.targetValue}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => onUpdateCounter(counterActivity.id, -1)}
                    disabled={counterActivity.currentValue <= 0}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateCounter(counterActivity.id, 1)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+{counterActivity.stepSize || 1}</span>
                  </button>
                </div>
              </div>
            )}

            {/* WIDGET 4x4: Collective Progress & Mini Curve */}
            {activeWidgetType === '4x4' && (
              <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg text-white">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                  <div>
                    <h3 className="text-xs font-bold">Progres Kolektif Harian</h3>
                    <p className="text-[10px] text-white/60">Ringkasan Aktivitas Terkini</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-cyan-400 tabular-nums">
                      {dailyMetrics.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${dailyMetrics.percentage}%` }}
                  />
                </div>

                {/* Mini Checklist Summary */}
                <div className="space-y-1.5">
                  {activities.slice(0, 3).map((act) => (
                    <div
                      key={act.id}
                      onClick={() => onToggleComplete(act.id)}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer text-xs"
                    >
                      <span className={`truncate ${act.completed ? 'line-through text-white/40' : 'text-white'}`}>
                        {act.title}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                          act.completed ? 'bg-emerald-500 text-white' : 'border border-white/40'
                        }`}
                      >
                        {act.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Android Dock Mockup */}
          <div className="flex items-center justify-around py-2 px-3 bg-white/10 backdrop-blur-md rounded-2xl mt-3">
            <div className="w-8 h-8 rounded-xl bg-green-500/80 flex items-center justify-center text-white text-[10px] font-bold">
              📞
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-500/80 flex items-center justify-center text-white text-[10px] font-bold">
              💬
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shadow-md shadow-indigo-500/50">
              ✓
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/80 flex items-center justify-center text-white text-[10px] font-bold">
              🌐
            </div>
          </div>
        </div>
      </div>

      {/* Wallpaper selector */}
      <div className="flex items-center justify-between gap-2 px-1 text-xs">
        <span className="text-slate-600 dark:text-slate-400">Pilih Wallpaper Simulasi:</span>
        <div className="flex items-center gap-1.5">
          {(['slate', 'nature', 'aurora', 'oled'] as const).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWallpaper(w)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-all ${
                wallpaper === w
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Real Android Installation Guide Card */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Cara Pasang di HP Android Asli
            </h3>
          </div>
          <button
            type="button"
            onClick={copyWidgetInstructions}
            className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <Copy className="w-3 h-3" />
            <span>{copiedNote ? 'Tersalin!' : 'Salin Petunjuk'}</span>
          </button>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          1. Buka aplikasi ini di browser Chrome di ponsel Android Anda.<br />
          2. Ketuk ikon titik tiga (⋮) di pojok kanan atas Chrome.<br />
          3. Pilih <strong>Tambahkan ke Layar Utama</strong> (Install App).<br />
          4. Ikon MyAct akan langsung terpasang di layar utama dengan akses instan &amp; dapat dibuka tanpa internet (100% offline).
        </p>
      </div>
    </div>
  );
};
