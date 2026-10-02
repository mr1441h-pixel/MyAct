import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, Tag, RotateCcw } from 'lucide-react';
import { CategoryItem } from '../types';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onAddCategory: (category: Omit<CategoryItem, 'id'>) => void;
  onUpdateCategory: (id: string, updates: Partial<CategoryItem>) => void;
  onDeleteCategory: (id: string) => void;
  onResetDefaults: () => void;
}

const PRESET_COLORS = [
  '#4F46E5', // Indigo
  '#059669', // Emerald
  '#0284C7', // Ocean
  '#E11D48', // Rose
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#0D9488', // Teal
  '#EA580C', // Orange
  '#64748B', // Slate
  '#EC4899', // Pink
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onResetDefaults,
}) => {
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState(PRESET_COLORS[0]);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    onAddCategory({
      label: newLabel.trim(),
      color: newColor,
    });
    setNewLabel('');
  };

  const startEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setEditLabel(cat.label);
    setEditColor(cat.color);
  };

  const saveEdit = (id: string) => {
    if (!editLabel.trim()) return;
    onUpdateCategory(id, {
      label: editLabel.trim(),
      color: editColor,
    });
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 dark:amoled-mode:bg-zinc-950 w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Kelola Kategori</h2>
              <p className="text-xs text-slate-500">Kustomisasi, tambah, atau ubah kategori kegiatan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Category Form */}
        <form onSubmit={handleCreate} className="p-3 my-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
            Tambah Kategori Baru
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Nama kategori (misal: Finansial, Hobi...)"
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simpan</span>
            </button>
          </div>

          {/* Color preset chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] text-slate-500 mr-1">Pilih Warna:</span>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className={`w-5 h-5 rounded-full transition-transform ${
                  newColor === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </form>

        {/* List of Categories */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {categories.map((cat) => {
            const isEditing = editingId === cat.id;

            if (isEditing) {
              return (
                <div
                  key={cat.id}
                  className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2 text-xs"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="flex-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(cat.id)}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-medium text-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Selesai</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditColor(c)}
                        className={`w-4 h-4 rounded-full transition-transform ${
                          editColor === c ? 'scale-125 ring-2 ring-emerald-500' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {cat.label}
                  </span>
                  {cat.isDefault && (
                    <span className="text-[10px] text-slate-400">bawaan</span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(cat)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors"
                    title="Ubah nama atau warna"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Hapus kategori"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-2">
          <button
            type="button"
            onClick={onResetDefaults}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Kategori Bawaan</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-700 hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
