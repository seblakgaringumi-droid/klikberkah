import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-1.5 rounded-full bg-amber-400 hover:bg-amber-500 text-stone-900 px-3 py-1.5 text-xs font-bold shadow-sm transition active:scale-95"
        title="Pasang Aplikasi Toko Berkah ke HP/Desktop"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Pasang App</span>
        <span className="sm:hidden">Install</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-full bg-emerald-700/80 hover:bg-emerald-700 text-white px-2.5 py-1 text-xs font-medium border border-emerald-500/50 shadow-sm transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pasang di iPhone</span>
          <span className="sm:hidden">App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    TB
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900">Pasang di iPhone / iPad</h3>
                    <p className="text-xs text-stone-500">Toko Berkah WebApp</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-stone-700">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <p className="text-xs leading-relaxed">
                    Buka halaman ini di browser <strong>Safari</strong>, lalu ketuk tombol <strong>Bagikan / Share</strong> (kotak panah ke atas) di bagian bawah.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <p className="text-xs leading-relaxed">
                    Geser ke bawah dan pilih <strong>Tambahkan ke Layar Utama</strong> (<i>Add to Home Screen</i>).
                  </p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <p className="text-xs leading-relaxed">
                    Ketuk <strong>Tambah</strong> di pojok kanan atas. Ikon Toko Berkah akan langsung muncul di HP Anda!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
