import React from 'react';
import { ShoppingBag, Search, MapPin, Store, Clock, History, RefreshCw, Info } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { formatRupiah } from '../utils/formatters';
import { STORE_ADDRESS } from '../utils/whatsapp';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  onOpenStoreInfo?: () => void;
  isSyncing: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenOrders,
  onOpenStoreInfo,
  isSyncing,
  onRefresh,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-emerald-600 text-white shadow-md">
      {/* Top Yellow Accent Bar - Vibrant Palette Signature */}
      <div className="bg-yellow-400 text-emerald-900 py-1.5 px-3 sm:px-6 flex items-center justify-between text-xs sm:text-sm font-bold border-b border-yellow-500 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
          <button
            onClick={onOpenStoreInfo}
            className="flex items-center gap-1.5 text-emerald-950 font-black hover:opacity-80 transition"
            title="Lihat informasi resmi toko"
          >
            <Store className="w-3.5 h-3.5 shrink-0 text-emerald-800" />
            <span className="font-extrabold">Toko Berkah</span>
          </button>
          <button
            onClick={onOpenStoreInfo}
            className="hidden md:inline-flex items-center gap-1 text-emerald-900 font-medium hover:underline text-left truncate max-w-md"
            title="Klik untuk detail alamat lengkap"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
            <span className="truncate">{STORE_ADDRESS}</span>
          </button>
          <span className="hidden lg:inline-flex items-center gap-1 text-emerald-900 font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
            <span>06.00 - 21.00 WIB</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="animate-pulse hidden sm:flex items-center gap-1 text-[11px] sm:text-xs text-emerald-950 font-black bg-yellow-300/80 px-2 py-0.5 rounded-full border border-yellow-500/50">
            <span>⚡ PROMO: Pesan-Antar COD & Ambil di Toko!</span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-900/20 px-2 py-0.5 rounded-full text-[10px] text-emerald-950 font-bold border border-emerald-700/30">
            <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-600 animate-ping' : 'bg-emerald-700'}`}></span>
            <span className="hidden sm:inline">Kasir POS Live</span>
            <span className="sm:hidden">POS Live</span>
          </div>

          <button
            id="refresh-catalog-btn"
            onClick={onRefresh}
            className="p-1 rounded-full text-emerald-900 hover:text-emerald-950 hover:bg-yellow-300 transition"
            title="Muat ulang data produk dari kasir"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer" onClick={() => onSearchChange('')}>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-yellow-400 text-emerald-900 flex items-center justify-center font-black text-base sm:text-xl shadow-sm border-2 border-yellow-300 hover:scale-105 transition-transform">
              TB
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-['Outfit',sans-serif] font-black text-xl sm:text-2xl leading-none italic tracking-tight text-white drop-shadow-xs">
                  TOKO BERKAH
                </h1>
                <span className="bg-yellow-400 text-emerald-950 font-black text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider hidden xs:inline-block shadow-xs">
                  Sembako
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-100 opacity-90 mt-0.5">
                Sindangkasih • Sembako Murah Terpercaya
              </p>
            </div>
          </div>

          {/* Search Bar - Desktop & Tablet */}
          <div className="flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <input
                id="search-input-desktop"
                type="text"
                placeholder="Cari beras, minyak, bumbu, gula, sabun..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white text-slate-800 placeholder-slate-400 text-sm rounded-full pl-10 pr-10 py-2 border-2 border-transparent focus:outline-none focus:border-yellow-400 shadow-inner transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons: Riwayat, Install App, Cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* PWA Install */}
            <PWAInstallButton />

            {/* Info Toko Button */}
            <button
              id="store-info-btn"
              onClick={onOpenStoreInfo}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white px-2.5 sm:px-3 py-2 text-xs font-bold border border-emerald-500/50 transition hover:shadow-sm"
              title="Lihat alamat & info resmi toko"
            >
              <MapPin className="w-4 h-4 text-yellow-300" />
              <span className="hidden sm:inline">Info Toko</span>
            </button>

            {/* Riwayat Pesanan Button */}
            <button
              id="order-history-btn"
              onClick={onOpenOrders}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white px-2.5 sm:px-3 py-2 text-xs font-bold border border-emerald-500/50 transition hover:shadow-sm"
              title="Lihat status pesanan online saya"
            >
              <History className="w-4 h-4 text-yellow-300" />
              <span className="hidden lg:inline">Pesanan Saya</span>
            </button>

            {/* Cart Button with Vibrant Palette Yellow styling */}
            <button
              id="open-cart-btn"
              onClick={onOpenCart}
              className="relative bg-yellow-400 text-emerald-900 px-3.5 py-2 sm:p-2.5 sm:px-4 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-300 transition-colors shadow-sm active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-emerald-900" />
                {cartCount > 0 && (
                  <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm font-black animate-pulse">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] text-emerald-800 font-bold hidden sm:inline">Keranjang</span>
                <span className="text-xs sm:text-sm font-black text-emerald-950 font-mono">
                  {cartTotal > 0 ? formatRupiah(cartTotal) : 'Rp 0'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 md:hidden">
          <div className="relative">
            <input
              id="search-input-mobile"
              type="text"
              placeholder="Cari beras, minyak, sabun..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm rounded-full pl-9 pr-9 py-2 border-2 border-transparent focus:outline-none focus:border-yellow-400 shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
