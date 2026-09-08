import React from 'react';
import { CartItem } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatRupiah, formatQty } from '../utils/formatters';
import { isWeightVariantProduct } from '../utils/weightVariants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
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
          <div className="p-4 bg-emerald-600 text-white flex items-center justify-between shadow-sm">
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
                  <span className="hidden sm:inline">Kosongkan</span>
                </button>
              )}
              <button
                id="close-cart-btn"
                onClick={onClose}
                className="p-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body: Item List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl">
                  🛒
                </div>
                <h3 className="font-bold text-slate-800 text-base">Keranjang Anda Masih Kosong</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Yuk jelajahi produk beras, minyak, bumbu, dan sembako berkualitas di Toko Berkah!
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition shadow-sm"
                >
                  Mulai Belanja Sekarang
                </button>
              </div>
            ) : (
              items.map((item) => {
                const stock = Number(item.product.stock_kg) || 0;
                const isWeight = isWeightVariantProduct(item.product);
                // 0.25 kg step for weight products (tepung, bawang, gula, etc.)
                const step = isWeight ? 0.25 : 1;

                return (
                  <div key={item.product.id} className="py-3.5 flex items-center gap-3">
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
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-slate-400 hover:text-red-500 p-1 transition"
                          title="Hapus barang ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-0.5">
                        <span>{formatRupiah(item.product.selling_price)} / {item.unit}</span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        {/* Stepper with Vibrant Palette Yellow Style */}
                        <div className="flex items-center border border-slate-200 rounded-md">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, Math.round((item.quantity - step) * 100) / 100)}
                            className="px-2 py-0.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold text-xs transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="min-w-[48px] px-1.5 py-0.5 text-xs font-black text-slate-800 text-center font-mono">
                            {formatQty(item.quantity, item.unit)}
                          </span>
                          <button
                            disabled={item.quantity >= stock}
                            onClick={() => onUpdateQuantity(item.product.id, Math.round((item.quantity + step) * 100) / 100)}
                            className={`px-2 py-0.5 font-bold text-xs transition ${
                              item.quantity >= stock
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
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

          {/* Footer & Checkout CTA - Vibrant Palette Emerald 900 Banner with Yellow CTA */}
          {items.length > 0 && (
            <div className="p-4 bg-emerald-900 text-white space-y-3">
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Total Belanja ({totalItemsCount} item)</span>
                <span className="font-bold text-yellow-400 font-mono text-base">
                  {formatRupiah(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Ongkos Kirim (Pesan-Antar)</span>
                <span className="font-bold text-emerald-400">GRATIS / COD</span>
              </div>

              <button
                id="proceed-checkout-btn"
                onClick={onProceedToCheckout}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-emerald-900 py-3 rounded-xl font-black text-center shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>LANJUT KE FORM CHECKOUT</span>
                <ArrowRight className="w-4 h-4 text-emerald-950 stroke-[3]" />
              </button>

              <p className="text-[10px] text-center text-emerald-200/70">
                Pesanan langsung tersimpan ke sistem Toko Berkah & chat WA kasir akan terbuka.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
