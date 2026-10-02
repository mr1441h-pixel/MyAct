import React, { useState } from 'react';
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Minus, 
  Clock, 
  ListChecks, 
  MoreVertical, 
  Edit3, 
  Trash2 
} from 'lucide-react';
import { ActivityItem } from '../types';

interface ActivityCardProps {
  activity: ActivityItem;
  categoryLabel?: string;
  state: {
    completed: boolean;
    value: number;
    targetValue: number;
    subtasks: { id: string; text: string; completed: boolean }[];
  };
  onToggleComplete: () => void;
  onUpdateCounter: (delta: number) => void;
  onToggleSubtask: (subtaskId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  categoryLabel,
  state,
  onToggleComplete,
  onUpdateCounter,
  onToggleSubtask,
  onEdit,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const hasSubtasks = state.subtasks && state.subtasks.length > 0;
  const isCounter = activity.type === 'counter' || activity.type === 'duration';

  // Progress percentage
  const progressPercent = isCounter
    ? Math.min(100, Math.round((state.value / (state.targetValue || 1)) * 100))
    : hasSubtasks
    ? Math.round((state.subtasks.filter((s) => s.completed).length / state.subtasks.length) * 100)
    : state.completed
    ? 100
    : 0;

  // Category labels in Indonesian
  const categoryLabels: Record<string, string> = {
    rutinitas: 'Rutinitas',
    kesehatan: 'Kesehatan',
    pekerjaan: 'Pekerjaan',
    belajar: 'Belajar',
    ibadah: 'Ibadah',
    olahraga: 'Olahraga',
    lainnya: 'Lainnya',
  };

  return (
    <div
      className={`relative bg-white dark:bg-slate-900/90 dark:amoled-mode:bg-zinc-950 rounded-2xl p-4 transition-all border ${
        state.completed
          ? 'border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10'
          : 'border-slate-200/80 dark:border-slate-800/80 shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Left Action: Checkbox button */}
        <button
          type="button"
          onClick={onToggleComplete}
          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all ${
            state.completed
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              : 'border-2 border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-transparent'
          }`}
          aria-label={state.completed ? 'Batalkan penyelesaian' : 'Tandai selesai'}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Center: Title & Unboxed Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h3
              onClick={onToggleComplete}
              className={`text-sm font-semibold cursor-pointer truncate transition-colors ${
                state.completed
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              {activity.title}
            </h3>

            {/* Meatballs menu toggle */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
                aria-label="Menu Opsi"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-6 z-50 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onEdit();
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onDelete();
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Clean Unboxed Metadata (Zero-Pill Discipline) */}
          <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span
              className="font-medium"
              style={{ color: activity.color || '#4F46E5' }}
            >
              {categoryLabel || categoryLabels[activity.category] || activity.category}
            </span>
            {activity.scheduledTime && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {activity.scheduledTime}
                </span>
              </>
            )}
            {hasSubtasks && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {state.subtasks.filter((s) => s.completed).length}/{state.subtasks.length} sub-kegiatan
                </span>
              </>
            )}
          </div>

          {/* Activity Description if present */}
          {activity.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
              {activity.description}
            </p>
          )}

          {/* Counter Controls if quantitative activity */}
          {isCounter && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateCounter(-1)}
                  disabled={state.value <= 0}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  aria-label="Kurangi"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums px-1">
                  <span>{state.value}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-normal ml-0.5">
                    / {state.targetValue} {activity.unit || ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateCounter(1)}
                  className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-colors"
                  aria-label="Tambah"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mini progress bar */}
              <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Subtasks Accordion Toggle */}
          {hasSubtasks && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between w-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors py-0.5"
              >
                <span className="flex items-center gap-1">
                  <ListChecks className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Rincian Langkah ({state.subtasks.filter((s) => s.completed).length}/{state.subtasks.length})</span>
                </span>
                {expanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Subtasks List */}
              {expanded && (
                <div className="mt-2 space-y-1.5 pl-1.5 border-l-2 border-indigo-200 dark:border-indigo-900/60 ml-1">
                  {state.subtasks.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => onToggleSubtask(st.id)}
                      className="flex items-center gap-2 py-1 px-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-xs"
                    >
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                          st.completed
                            ? 'bg-emerald-500 text-white'
                            : 'border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {st.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span
                        className={`truncate ${
                          st.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {st.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
