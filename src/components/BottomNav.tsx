import React from 'react';
import { CheckSquare, LayoutGrid, LineChart, Settings2, Plus } from 'lucide-react';

export type NavTab = 'kegiatan' | 'widget' | 'kurva' | 'pengaturan';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 dark:amoled-mode:bg-black/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 pb-safe transition-colors">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Tab 1: Kegiatan */}
        <button
          type="button"
          onClick={() => onTabChange('kegiatan')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
            activeTab === 'kegiatan'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Kegiatan</span>
        </button>

        {/* Tab 2: Widget Android */}
        <button
          type="button"
          onClick={() => onTabChange('widget')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
            activeTab === 'widget'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Widget</span>
        </button>

        {/* Centered Floating Action Button (+) */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center justify-center active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            aria-label="Tambah Kegiatan Baru"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Kurva & Analitik */}
        <button
          type="button"
          onClick={() => onTabChange('kurva')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
            activeTab === 'kurva'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <LineChart className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Kurva</span>
        </button>

        {/* Tab 4: Pengaturan & Cadangan */}
        <button
          type="button"
          onClick={() => onTabChange('pengaturan')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
            activeTab === 'pengaturan'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Settings2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Cadangan</span>
        </button>
      </div>
    </nav>
  );
};
