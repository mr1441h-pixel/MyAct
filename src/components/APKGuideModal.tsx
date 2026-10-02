import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  ShieldCheck, 
  Terminal, 
  Sparkles 
} from 'lucide-react';

interface APKGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const APKGuideModal: React.FC<APKGuideModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 dark:amoled-mode:bg-zinc-950 w-full max-w-lg rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Panduan Mendapatkan APK Android</h2>
              <p className="text-xs text-slate-500">Cara mengonversi MyAct menjadi file .APK atau memasangnya di Android</p>
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
          {/* Quick Copy App URL Banner */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
              Tautan Aplikasi Anda (URL Manifest Siap APK):
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-[11px] font-mono select-all truncate"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin URL'}</span>
              </button>
            </div>
          </div>

          {/* METODE 1: WebAPK Otomatis (Rekomendasi Tanpa Komputer) */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px]">1</span>
              <span>Cara Tercepat: WebAPK Otomatis (Bawaan Android)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Google Chrome di ponsel Android memiliki teknologi bernama <strong>WebAPK</strong>. Anda tidak perlu repot men-download file .apk secara manual:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300 pl-1 font-medium">
              <li>Buka tautan aplikasi ini di Google Chrome di HP Android Anda.</li>
              <li>Ketuk menu titik tiga (<strong>⋮</strong>) di pojok kanan atas Chrome.</li>
              <li>Pilih <strong>Tambahkan ke Layar Utama</strong> (Install App).</li>
              <li>Sistem Android otomatis meng-generate paket aplikasi native (WebAPK) yang muncul di daftar aplikasi (App Drawer), bisa dibuka 100% offline, dan terasa seperti APK biasa!</li>
            </ol>
          </div>

          {/* METODE 2: PWABuilder (Unduh Berkas .APK Nyata) */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-bold">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">2</span>
                <span>Cara Unduh File .APK Nyata via PWABuilder</span>
              </div>
              <a
                href="https://www.pwabuilder.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                <span>Buka Situs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Jika Anda memerlukan berkas fisik berformat <strong>.apk</strong> untuk dikirim lewat WhatsApp atau diinstal offline ke HP lain:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-700 dark:text-slate-300 pl-1">
              <li>Salin tautan aplikasi MyAct menggunakan tombol di atas.</li>
              <li>Buka website resmi <strong>pwabuilder.com</strong> (alat open-source gratis dari Microsoft &amp; Google).</li>
              <li>Tempelkan tautan URL aplikasi lalu klik <strong>Start</strong>.</li>
              <li>Pilih tombol <strong>Package for Android</strong>.</li>
              <li>PWABuilder akan memvalidasi Manifest &amp; Service Worker MyAct yang sudah kami pasang, lalu meng-generate berkas <strong>.apk</strong> yang siap diunduh dan diinstal di Android!</li>
            </ol>
          </div>

          {/* METODE 3: Google Bubblewrap CLI (Untuk Developer) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span>Metode Developer: Google Bubblewrap (TWA)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Jika Anda memiliki Node.js dan Android SDK / Android Studio di komputer:
            </p>
            <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto">
              npx @bubblewrap/cli init --manifest={appUrl}/manifest.webmanifest<br />
              npx @bubblewrap/cli build
            </div>
            <p className="text-[11px] text-slate-500">
              Perintah ini langsung mem-build file release APK atau AAB untuk dipublikasikan ke Google Play Store.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>PWA Manifest &amp; Offline Cache Sudah 100% Siap</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
