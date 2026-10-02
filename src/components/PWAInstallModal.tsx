import React from 'react';
import { X, Smartphone, Download, CheckCircle, Share, PlusSquare } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => Promise<boolean>;
  isInstallable: boolean;
  isIOS: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isInstallable,
  isIOS,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 dark:amoled-mode:bg-zinc-950 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold">Pasang MyAct</h3>
            <p className="text-xs text-slate-500">Aplikasi Android Mandiri &amp; Luring</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
          Pasang aplikasi ini langsung di layar utama smartphone Anda untuk menikmati pengalaman aplikasi native, akses offline 100%, dan respons super cepat tanpa kuota internet.
        </p>

        <div className="space-y-2 mb-5 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Berfungsi penuh saat offline (tanpa sinyal)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Dapat diakses langsung dari beranda Android</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Tanpa iklan dan konsumsi memori sangat hemat</span>
          </div>
        </div>

        {/* Action Button for Android Chromium */}
        {isInstallable ? (
          <button
            type="button"
            onClick={async () => {
              const res = await onInstall();
              if (res) onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Pasang Sekarang ke Layar Utama</span>
          </button>
        ) : isIOS ? (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-slate-900 dark:text-white">
              Cara pasang di iPhone / iPad:
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Share className="w-3.5 h-3.5 text-indigo-500" />
              <span>1. Ketuk tombol <strong>Bagikan (Share)</strong> di Safari</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <PlusSquare className="w-3.5 h-3.5 text-indigo-500" />
              <span>2. Gulir ke bawah lalu pilih <strong>Tambah ke Layar Utama</strong></span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-slate-900 dark:text-white">
              Cara pasang di browser Chrome Android:
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Ketuk menu titik tiga (⋮) di pojok kanan atas browser Anda, lalu pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> atau <strong>&quot;Install App&quot;</strong>.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 py-2 text-center text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
