import React from 'react';
import { Truck, Store, ShieldCheck, CreditCard, Sparkles, PhoneCall } from 'lucide-react';
import { STORE_PHONE } from '../utils/whatsapp';

export const PromoBanner: React.FC = () => {
  return (
    <section className="mb-5 sm:mb-6">
      {/* Vibrant Palette Banner Card with Dashed Border & Emerald Background */}
      <div className="relative overflow-hidden rounded-2xl bg-emerald-100 border-2 border-dashed border-emerald-400 p-4 sm:p-5 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            {/* White Circular Icon Container */}
            <div className="bg-white p-3 sm:p-3.5 rounded-full shadow-sm text-emerald-600 shrink-0">
              <Truck className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-emerald-950 font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-900" />
                <span>Layanan Belanja Mudah & Cepat</span>
              </div>

              <h2 className="text-base sm:text-xl lg:text-2xl font-black text-emerald-900 leading-snug font-['Outfit',sans-serif]">
                Siap Melayani Pesan-Antar (COD) & Belanja ke Toko
              </h2>

              <p className="text-xs sm:text-sm text-emerald-700 font-medium leading-relaxed max-w-2xl">
                Belanja praktis dari rumah, barang kami antar sampai depan pintu, bayar aman saat barang sampai (COD / QRIS / Bon Pelanggan).
              </p>
            </div>
          </div>

          {/* Action / Contact Card */}
          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-emerald-300">
            <a
              id="banner-call-store"
              href={`tel:${STORE_PHONE}`}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition active:scale-95"
            >
              <PhoneCall className="w-4 h-4 text-yellow-300" />
              <span>0852-9499-6696</span>
            </a>
            <span className="text-[11px] font-bold text-emerald-800">
              Sindangkasih • Ciamis
            </span>
          </div>
        </div>

        {/* Feature Badges Grid */}
        <div className="mt-4 pt-3 border-t border-emerald-300/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs">
            <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-emerald-900 font-bold text-[11px] sm:text-xs">Antar Cepat COD</span>
          </div>
          <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs">
            <Store className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-emerald-900 font-bold text-[11px] sm:text-xs">Ambil di Toko</span>
          </div>
          <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs">
            <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-emerald-900 font-bold text-[11px] sm:text-xs">COD / QRIS / Bon</span>
          </div>
          <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-emerald-900 font-bold text-[11px] sm:text-xs">Harga Kasir Resmi</span>
          </div>
        </div>
      </div>
    </section>
  );
};
