import React, { useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { X, Plus, Minus, Check, ShoppingBag, AlertTriangle, Store, ShieldCheck, Sparkles } from 'lucide-react';
import { formatRupiah, formatStock, formatQty } from '../utils/formatters';
import { isWeightVariantProduct, calculateItemSubtotal, WEIGHT_VARIANTS } from '../utils/weightVariants';

interface ProductDetailModalProps {
  product: Product | null;
  cartItem?: CartItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onUpdateQuantity: (productId: string, newQty: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  cartItem,
  isOpen,
  onClose,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const [imageError, setImageError] = useState(false);
  const isWeight = isWeightVariantProduct(product);
  const [selectedQty, setSelectedQty] = useState(1);

  // Set initial selectedQty depending on whether it is a weight product
  useEffect(() => {
    if (product) {
      const weightProd = isWeightVariantProduct(product);
      setSelectedQty(weightProd ? 0.25 : 1);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const stock = Number(product.stock_kg) || 0;
  const isOutOfStock = stock <= 0;
  const currentCartQty = cartItem?.quantity || 0;

  // Step increment: 0.25 for weight products (tepung, bawang, gula, etc.), 1 for pcs
  const step = isWeight ? 0.25 : 1;

  const handleAdd = () => {
    if (isOutOfStock) return;
    const qtyToAdd = selectedQty > 0 ? selectedQty : step;
    onAddToCart(product, qtyToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100">
        {/* Modal Header */}
        <div className="bg-emerald-600 text-white p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="bg-yellow-400 text-emerald-950 font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
              {product.category || 'Sembako'}
            </span>
            <span className="text-xs text-emerald-100 font-medium">Detail Produk</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Image Container */}
          <div className="relative w-full aspect-4/3 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200">
            {product.image_url && !imageError ? (
              <img
                src={product.image_url}
                alt={product.name}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className={`w-full h-full object-contain p-4 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <span className="text-5xl mb-2">🛍️</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {product.category || 'Toko Berkah'}
                </span>
              </div>
            )}

            {/* Out of Stock Overlay on Detail Image */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center">
                <span className="bg-red-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg border border-red-300 animate-pulse">
                  STOK HABIS
                </span>
                <span className="text-xs text-white/95 font-medium mt-1.5">
                  Stok saat ini tidak tersedia
                </span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {product.name}
            </h2>

            <div className="flex items-center justify-between">
              <div className="text-2xl font-black font-mono text-emerald-600">
                {formatRupiah(product.selling_price)}
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                Satuan: {product.unit ? product.unit.toUpperCase() : 'PCS'}
              </span>
            </div>
          </div>

          {/* Stock Availability Alert (Requirement 1) */}
          {isOutOfStock ? (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs uppercase tracking-wide">
                  Stok Saat Ini Tidak Tersedia
                </div>
                <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
                  Mohon maaf, barang ini sedang habis di gudang Toko Berkah. Kasir kami akan segera melakukan restock.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2 font-medium">
                <Store className="w-4 h-4 text-emerald-700" />
                <span>Stok Resmi Kasir POS:</span>
              </div>
              <span className="font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Tersedia {formatStock(stock, product.unit)}
              </span>
            </div>
          )}

          {/* Weight Variants Selector for items like tepung, bawang, gula */}
          {isWeight && !isOutOfStock && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Pilih Varian Berat:</span>
                <span className="text-[11px] text-emerald-600 font-semibold">Tersedia 1/4 kg & 1/2 kg</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {WEIGHT_VARIANTS.map((v) => {
                  const isSelected = Math.abs(selectedQty - v.value) < 0.01;
                  const vPrice = calculateItemSubtotal(product, v.value);
                  return (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() => setSelectedQty(v.value)}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-black text-xs sm:text-sm">{v.label}</span>
                      <span className="text-[10px] text-slate-500">{v.sublabel}</span>
                      <span className="text-[11px] font-black font-mono text-emerald-600 mt-1">
                        {formatRupiah(vPrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity selector if in stock */}
          {!isOutOfStock && currentCartQty === 0 && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Jumlah Pembelian:</span>
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
                <button
                  onClick={() => setSelectedQty(Math.max(step, Math.round((selectedQty - step) * 100) / 100))}
                  disabled={selectedQty <= step}
                  className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold text-sm shadow-xs disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="min-w-[50px] px-1 text-center font-black text-sm text-slate-900 font-mono">
                  {formatQty(selectedQty, product.unit)}
                </span>
                <button
                  onClick={() => setSelectedQty(Math.min(stock, Math.round((selectedQty + step) * 100) / 100))}
                  disabled={selectedQty >= stock}
                  className="w-8 h-8 rounded-lg bg-yellow-400 text-emerald-950 flex items-center justify-center font-bold text-sm shadow-xs disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* If already in cart */}
          {currentCartQty > 0 && !isOutOfStock && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-950 font-bold">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Sudah ada di keranjang:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onUpdateQuantity(product.id, Math.round((currentCartQty - step) * 100) / 100)}
                  className="w-7 h-7 bg-white rounded-lg border border-yellow-300 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-black text-xs px-1.5">
                  {formatQty(currentCartQty, product.unit)}
                </span>
                <button
                  onClick={() => onUpdateQuantity(product.id, Math.min(stock, Math.round((currentCartQty + step) * 100) / 100))}
                  disabled={currentCartQty >= stock}
                  className="w-7 h-7 bg-yellow-400 text-emerald-950 rounded-lg flex items-center justify-center font-bold disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            {isOutOfStock ? (
              <button
                disabled
                className="w-full py-3.5 px-4 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs sm:text-sm cursor-not-allowed flex items-center justify-center gap-2 select-none"
              >
                <span>Stok Saat Ini Tidak Tersedia (Habis)</span>
              </button>
            ) : currentCartQty > 0 ? (
              <button
                onClick={onClose}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 text-yellow-300" />
                <span>Sudah di Keranjang (Tutup & Lanjut Belanja)</span>
              </button>
            ) : (
              <button
                onClick={handleAdd}
                className="w-full py-3.5 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ TAMBAH KE KERANJANG ({formatRupiah(calculateItemSubtotal(product, selectedQty))})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
