import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock, Hash, CheckSquare, ListOrdered, Palette } from 'lucide-react';
import { ActivityItem, ActivityCategory, ActivityType, ScheduleFrequency, SubTask, CategoryItem } from '../types';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activityData: any) => void;
  initialData?: ActivityItem | null;
  categories: CategoryItem[];
  onOpenCategoryManager: () => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  onOpenCategoryManager,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ActivityCategory>(() => categories[0]?.id || 'rutinitas');
  const [type, setType] = useState<ActivityType>('checklist');
  const [targetValue, setTargetValue] = useState(1);
  const [unit, setUnit] = useState('');
  const [stepSize, setStepSize] = useState(1);
  const [schedule, setSchedule] = useState<ScheduleFrequency>('daily');
  const [scheduledTime, setScheduledTime] = useState('');
  const [color, setColor] = useState('#4F46E5');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setCategory(initialData.category);
      setType(initialData.type);
      setTargetValue(initialData.targetValue || 1);
      setUnit(initialData.unit || '');
      setStepSize(initialData.stepSize || 1);
      setSchedule(initialData.schedule || 'daily');
      setScheduledTime(initialData.scheduledTime || '');
      setColor(initialData.color || '#4F46E5');
      setSubtasks(initialData.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setCategory('rutinitas');
      setType('checklist');
      setTargetValue(1);
      setUnit('');
      setStepSize(1);
      setSchedule('daily');
      setScheduledTime('');
      setColor('#4F46E5');
      setSubtasks([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: ActivityCategory) => {
    setCategory(newCat);
    const catItem = categories.find((c) => c.id === newCat);
    if (catItem) setColor(catItem.color);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      {
        id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        text: newSubtaskText.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((st) => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      type,
      targetValue: type === 'checklist' ? 1 : Math.max(1, Number(targetValue)),
      unit: type === 'checklist' ? undefined : unit.trim() || undefined,
      stepSize: type === 'checklist' ? undefined : Math.max(1, Number(stepSize)),
      subtasks,
      schedule,
      scheduledTime: scheduledTime.trim() || undefined,
      color,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 dark:amoled-mode:bg-zinc-950 w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {initialData ? 'Ubah Kegiatan' : 'Tambah Kegiatan Baru'}
            </h2>
            <p className="text-xs text-slate-500">
              Atur checklist, rincian, atau target kuantitas kegiatan Anda
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nama Kegiatan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Minum Air Putih 2L, Baca Buku..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Rincian & Catatan Tambahan (Opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan catatan tujuan atau motivasi..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs resize-none"
            />
          </div>

          {/* Type Selector: Checklist vs Counter/Kuantitas */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Bentuk Pelacakan
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('checklist')}
                className={`py-2 px-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  type === 'checklist'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Checklist</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('counter');
                  if (targetValue === 1) setTargetValue(5);
                  if (!unit) setUnit('kali');
                }}
                className={`py-2 px-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  type === 'counter'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Hash className="w-4 h-4" />
                <span>Jumlah / Hitungan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('duration');
                  if (targetValue === 1) setTargetValue(30);
                  if (!unit) setUnit('menit');
                  setStepSize(5);
                }}
                className={`py-2 px-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  type === 'duration'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Durasi Waktu</span>
              </button>
            </div>
          </div>

          {/* If Counter / Duration: Target and Unit inputs */}
          {(type === 'counter' || type === 'duration') && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Target Jumlah
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="gelas, ml, halaman..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Kenaikan per Tap (+/-)
                </label>
                <input
                  type="number"
                  min="1"
                  value={stepSize}
                  onChange={(e) => setStepSize(Number(e.target.value))}
                  placeholder="Misal: 250 untuk ml air"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>
            </div>
          )}

          {/* Subtasks (Rincian Langkah-Langkah) */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Rincian Langkah Kegiatan (Sub-kegiatan)
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map((st, index) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                >
                  <span className="text-slate-700 dark:text-slate-300 truncate">
                    {index + 1}. {st.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Tambah butir rincian kegiatan..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* Category & Scheduled Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Kategori
                </label>
                <button
                  type="button"
                  onClick={onOpenCategoryManager}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  + Kelola Kategori
                </button>
              </div>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as ActivityCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Jadwal Waktu (Jam)
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>
          </div>

          {/* Schedule Frequency */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Pengulangan Jadwal
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSchedule('daily')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                  schedule === 'daily'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Setiap Hari
              </button>
              <button
                type="button"
                onClick={() => setSchedule('weekdays')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                  schedule === 'weekdays'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Hari Kerja (Sen-Jum)
              </button>
              <button
                type="button"
                onClick={() => setSchedule('weekends')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                  schedule === 'weekends'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Akhir Pekan
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-500/20 transition-all"
            >
              Simpan Kegiatan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
