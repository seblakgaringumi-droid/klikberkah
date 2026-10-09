import React from 'react';
import { CartItem } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatRupiah, formatQty } from '../utils/formatters';
import { formatVariantSublabel } from '../utils/weightVariants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartKey: string, newQty: number) => void;
  onRemoveItem: (cartKey: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-emerald-600 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-yellow-300" />
              <h2 className="font-['Outfit',sans-serif] font-bold text-lg">
                Keranjang Belanja
              </h2>
              <span className="bg-yellow-400 text-emerald-950 text-xs px-2 py-0.5 rounded-full font-black">
                {items.length} Barang
              </span>
            </div>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  id="clear-cart-btn"
                  onClick={onClearCart}
                  className="text-xs text-emerald-100 hover:text-white px-2 py-1 rounded-md hover:bg-emerald-700 transition flex items-center gap-1"
                  title="Kosongkan keranjang"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Keranjang Anda Masih Kosong</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Yuk jelajahi produk beras, telur, bawang, bumbu, dan sembako berkualitas di Toko Berkah!
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition shadow-xs"
                >
                  Mulai Belanja Sekarang
                </button>
              </div>
            ) : (
              items.map((item) => {
                const cartKey = item.id || (item.selectedVariant ? `${item.product.id}__${item.selectedVariant.name}` : item.product.id);
                const hasVariant = !!item.selectedVariant;
                const unitPrice = item.selectedVariant ? item.selectedVariant.price : item.product.selling_price;
                const variantSublabel = hasVariant ? formatVariantSublabel(item.selectedVariant, item.product.unit) : '';

                return (
                  <div key={cartKey} className="py-3.5 flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <span className="text-xl">📦</span>
                      )}
                    </div>

                    {/* Info & Controls */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(cartKey)}
                          className="text-slate-400 hover:text-red-500 p-1 transition"
                          title="Hapus barang ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variant Badge / Satuan */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {hasVariant ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Varian: {item.selectedVariant?.name}
                            {variantSublabel ? ` (${variantSublabel})` : ''}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {formatRupiah(unitPrice)} / {item.unit}
                          </span>
                        )}
                        {hasVariant && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {formatRupiah(unitPrice)}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        {/* Stepper */}
                        <div className="flex items-center border border-slate-200 rounded-md">
                          <button
                            onClick={() => onUpdateQuantity(cartKey, item.quantity - 1)}
                            className="px-2 py-0.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold text-xs transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="min-w-[48px] px-1.5 py-0.5 text-xs font-black text-slate-800 text-center font-mono">
                            {hasVariant ? `${item.quantity}x` : formatQty(item.quantity, item.unit)}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(cartKey, item.quantity + 1)}
                            className="px-2 py-0.5 font-bold text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="font-bold text-xs sm:text-sm text-emerald-600 font-mono">
                          {formatRupiah(item.subtotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-4 bg-emerald-900 text-white space-y-3">
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Total Belanja ({totalItemsCount} item)</span>
                <span className="font-bold text-yellow-400 font-mono text-base">
                  {formatRupiah(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Ongkos Kirim</span>
                <span className="font-semibold text-emerald-300">
                  Gratis / Sesuai Area
                </span>
              </div>

              <button
                id="cart-checkout-btn"
                onClick={onProceedToCheckout}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 group active:scale-95 text-sm"
              >
                <span>Lanjut ke Formulir Pesanan</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
