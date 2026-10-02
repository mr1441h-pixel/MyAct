import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Flame, 
  Award, 
  Target, 
  BarChart2, 
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { ActivityItem, DailyCollectiveScore } from '../types';
import { formatDateKey, formatShortDate } from '../utils/storage';
import { CalendarMode, formatDualDateString } from '../utils/hijriCalendar';

interface AnalyticsViewProps {
  activities: ActivityItem[];
  selectedDate: string;
  calendarMode?: CalendarMode;
  dailyMetrics: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  activities,
  selectedDate,
  calendarMode = 'dual',
  dailyMetrics,
}) => {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);
  const [hoveredPoint, setHoveredPoint] = useState<DailyCollectiveScore | null>(null);

  // Compute collective scores across historical range
  const scoreHistory = useMemo(() => {
    const list: DailyCollectiveScore[] = [];
    const today = new Date();

    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateKey = formatDateKey(d);
      const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d);
      const dateLabel = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(d);

      // Evaluate score for dateKey
      let totalActivities = 0;
      let completedActivities = 0;
      let totalScoreSum = 0;

      activities.forEach((act) => {
        totalActivities++;
        const isToday = dateKey === formatDateKey();
        const hist = act.history?.[dateKey];

        if (isToday) {
          if (act.completed) {
            completedActivities++;
            totalScoreSum += 100;
          } else if (act.type === 'counter' || act.type === 'duration') {
            const ratio = act.targetValue > 0 ? (act.currentValue / act.targetValue) * 100 : 0;
            totalScoreSum += Math.min(100, Math.round(ratio));
          } else if (act.subtasks && act.subtasks.length > 0) {
            const subDone = act.subtasks.filter((s) => s.completed).length;
            totalScoreSum += Math.round((subDone / act.subtasks.length) * 100);
          }
        } else if (hist) {
          if (hist.completed) {
            completedActivities++;
            totalScoreSum += 100;
          } else if (hist.targetValue > 0) {
            const ratio = (hist.value / hist.targetValue) * 100;
            totalScoreSum += Math.min(100, Math.round(ratio));
          } else if (hist.totalSubtasks > 0) {
            totalScoreSum += Math.round((hist.subtasksCompleted / hist.totalSubtasks) * 100);
          }
        }
      });

      const completionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
      const collectiveScore = totalActivities > 0 ? Math.min(100, Math.round(totalScoreSum / totalActivities)) : 0;

      list.push({
        date: dateKey,
        dateLabel,
        dayName,
        totalActivities,
        completedActivities,
        completionRate,
        totalCounterProgress: collectiveScore,
        collectiveScore,
      });
    }

    return list;
  }, [activities, timeRange]);

  // SVG Curve Dimensions & Math
  const svgWidth = 340;
  const svgHeight = 150;
  const paddingX = 20;
  const paddingY = 20;

  const points = useMemo(() => {
    if (scoreHistory.length === 0) return [];
    const count = scoreHistory.length;
    const stepX = (svgWidth - paddingX * 2) / (count - 1 || 1);

    return scoreHistory.map((item, idx) => {
      const x = paddingX + idx * stepX;
      // y goes from svgHeight - paddingY (0%) to paddingY (100%)
      const y = (svgHeight - paddingY) - (item.collectiveScore / 100) * (svgHeight - paddingY * 2);
      return { x, y, data: item };
    });
  }, [scoreHistory, svgWidth, svgHeight, paddingX, paddingY]);

  // Build smooth bezier curve path d string
  const curvePath = useMemo(() => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX1 = current.x + (next.x - current.x) / 2;
      const controlY1 = current.y;
      const controlX2 = current.x + (next.x - current.x) / 2;
      const controlY2 = next.y;
      d += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${next.x} ${next.y}`;
    }
    return d;
  }, [points]);

  // Area path with closed bottom for gradient fill
  const areaPath = useMemo(() => {
    if (points.length < 2) return '';
    const last = points[points.length - 1];
    const first = points[0];
    return `${curvePath} L ${last.x} ${svgHeight - paddingY} L ${first.x} ${svgHeight - paddingY} Z`;
  }, [curvePath, points, svgHeight, paddingY]);

  // Calculate Streak & Stats
  const stats = useMemo(() => {
    const scores = scoreHistory.map((s) => s.collectiveScore);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));
    const highestScore = Math.max(...scores, 0);

    // Calculate active streak
    let streak = 0;
    for (let i = scoreHistory.length - 1; i >= 0; i--) {
      if (scoreHistory[i].collectiveScore >= 50) {
        streak++;
      } else {
        break;
      }
    }

    return { avgScore, highestScore, streak: Math.max(streak, 1) };
  }, [scoreHistory]);

  // Category completion summary
  const categoryStats = useMemo(() => {
    const map: Record<string, { total: number; completed: number; color: string }> = {};

    activities.forEach((act) => {
      if (!map[act.category]) {
        map[act.category] = { total: 0, completed: 0, color: act.color || '#4F46E5' };
      }
      map[act.category].total++;
      if (act.completed) map[act.category].completed++;
    });

    return Object.entries(map).map(([name, data]) => ({
      category: name,
      ...data,
      pct: Math.round((data.completed / (data.total || 1)) * 100),
    }));
  }, [activities]);

  return (
    <div className="space-y-4 pb-6">
      {/* Collective Score Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-5 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-white/10 backdrop-blur-md">
              <Award className="w-4 h-4 text-amber-300" />
            </div>
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              Rekam Jejak Hari Ini
            </span>
          </div>
          <span className="text-xs text-white/70">
            {dailyMetrics.completed} dari {dailyMetrics.total} Selesai
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-4xl font-extrabold tracking-tight tabular-nums flex items-baseline gap-1">
              <span>{dailyMetrics.percentage}</span>
              <span className="text-2xl font-light text-cyan-300">%</span>
            </div>
            <p className="text-xs text-indigo-100 mt-1">
              {dailyMetrics.percentage >= 80
                ? 'Luar biasa! Konsistensi Anda sangat tinggi hari ini.'
                : dailyMetrics.percentage >= 50
                ? 'Kerja bagus, lebih dari separuh target tercapai!'
                : 'Ayo mulai selesaikan kegiatan Anda hari ini.'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
            <Flame className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>Streak {stats.streak} Hari</span>
          </div>
        </div>
      </div>

      {/* THE PROGRESS CURVE (Kurva Grafik Kolektif) */}
      <div className="bg-white dark:bg-slate-900 dark:amoled-mode:bg-zinc-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              <span>Kurva Progres Harian Kolektif</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Evaluasi konsistensi capaian aktivitas dari waktu ke waktu
            </p>
          </div>

          {/* Time range segmented tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px]">
            <button
              type="button"
              onClick={() => setTimeRange(7)}
              className={`px-2 py-1 rounded-md font-semibold transition-all ${
                timeRange === 7
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setTimeRange(14)}
              className={`px-2 py-1 rounded-md font-semibold transition-all ${
                timeRange === 14
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              14 Hari
            </button>
            <button
              type="button"
              onClick={() => setTimeRange(30)}
              className={`px-2 py-1 rounded-md font-semibold transition-all ${
                timeRange === 30
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              30 Hari
            </button>
          </div>
        </div>

        {/* Hovered point tooltip banner */}
        <div className="h-6 flex items-center text-xs">
          {hoveredPoint ? (
            <span className="text-indigo-600 dark:text-indigo-400 font-medium truncate">
              {formatDualDateString(hoveredPoint.date, calendarMode)}: <strong>{hoveredPoint.collectiveScore}% tercapai</strong> ({hoveredPoint.completedActivities}/{hoveredPoint.totalActivities} kegiatan)
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">
              Ketuk titik grafik untuk melihat rincian tanggal tertentu
            </span>
          )}
        </div>

        {/* Interactive SVG Chart Container */}
        <div className="relative w-full overflow-hidden mt-1">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Subtle horizontal grid lines */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = (svgHeight - paddingY) - (val / 100) * (svgHeight - paddingY * 2);
              return (
                <g key={val}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 4}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[8px] fill-slate-400 dark:fill-slate-600 tabular-nums"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Gradient filled area under curve */}
            {areaPath && <path d={areaPath} fill="url(#curveGradient)" />}

            {/* Smooth Spline Curve Line */}
            {curvePath && (
              <path
                d={curvePath}
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Points */}
            {points.map((pt, index) => {
              const isSelected = hoveredPoint?.date === pt.data.date;
              return (
                <g key={pt.data.date}>
                  {/* Outer touch hitbox circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 10 : 7}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(pt.data)}
                    onTouchStart={() => setHoveredPoint(pt.data)}
                  />
                  {/* Visible point circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 5 : 3.5}
                    fill={isSelected ? '#06B6D4' : '#4F46E5'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all duration-200 pointer-events-none"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* X-Axis Day Labels */}
        <div className="flex justify-between items-center px-4 mt-2 text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
          {points.length > 0 && (
            <>
              <span>{points[0].data.dayName}, {points[0].data.dateLabel}</span>
              {points.length > 4 && <span>{points[Math.floor(points.length / 2)].data.dayName}</span>}
              <span>{points[points.length - 1].data.dayName}, {points[points.length - 1].data.dateLabel}</span>
            </>
          )}
        </div>
      </div>

      {/* Performance Summary Cards (3-col) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] text-slate-500 block mb-0.5">Rata-rata</span>
          <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
            {stats.avgScore}%
          </span>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] text-slate-500 block mb-0.5">Skor Terbaik</span>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {stats.highestScore}%
          </span>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] text-slate-500 block mb-0.5">Hari Aktif</span>
          <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
            {scoreHistory.filter((s) => s.collectiveScore > 0).length} Hari
          </span>
        </div>
      </div>

      {/* Category Progress Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
          <span>Distribusi Kategori Kegiatan</span>
        </h3>

        <div className="space-y-2.5">
          {categoryStats.map((item) => (
            <div key={item.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="capitalize text-slate-700 dark:text-slate-300 font-medium">
                  {item.category}
                </span>
                <span className="text-slate-500 tabular-nums text-[11px]">
                  {item.completed}/{item.total} ({item.pct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
