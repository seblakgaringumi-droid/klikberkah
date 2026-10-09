import React, { useState, useEffect } from 'react';
import { Product, CartItem, ProductVariant } from '../types';
import { X, Plus, Minus, Check, AlertTriangle, Store, Share2, Copy, MessageCircle } from 'lucide-react';
import { formatRupiah, formatStock, formatQty } from '../utils/formatters';
import {
  getProductVariants,
  formatVariantSublabel,
  calculateItemSubtotal,
} from '../utils/weightVariants';

interface ProductDetailModalProps {
  product: Product | null;
  cartItems?: CartItem[];
  cartItem?: CartItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number, variant?: ProductVariant | null) => void;
  onUpdateQuantity: (cartKey: string, newQty: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  cartItems = [],
  cartItem,
  isOpen,
  onClose,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const [imageError, setImageError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const variants = product ? getProductVariants(product) : [];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedQty, setSelectedQty] = useState(1);

  // Set initial selected variant and quantity when product changes
  useEffect(() => {
    if (product) {
      const pVariants = getProductVariants(product);
      if (pVariants.length > 0) {
        setSelectedVariant(pVariants[0]);
      } else {
        setSelectedVariant(null);
      }
      setSelectedQty(1);
    }
  }, [product]);

  // Reset copied toast states when product changes
  useEffect(() => {
    setCopiedLink(false);
    setShareToast(null);
  }, [product]);

  if (!isOpen || !product) return null;

  const stock = Number(product.stock_kg) || 0;
  const isOutOfStock = stock <= 0;

  // Determine current quantity in cart for the selected variant
  const currentVariantCartItem = cartItems.find((it) => {
    if (it.product.id !== product.id) return false;
    if (selectedVariant) {
      return it.selectedVariant?.name === selectedVariant.name;
    }
    return !it.selectedVariant;
  }) || (cartItem && cartItem.product.id === product.id ? cartItem : undefined);

  const currentCartQty = currentVariantCartItem?.quantity || 0;
  const currentCartKey = currentVariantCartItem?.id || (selectedVariant ? `${product.id}__${selectedVariant.name}` : product.id);

  const handleAdd = () => {
    if (isOutOfStock) return;
    const qtyToAdd = selectedQty > 0 ? selectedQty : 1;
    onAddToCart(product, qtyToAdd, selectedVariant);
    onClose();
  };

  const getProductShareUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    return `${origin}${pathname}?product=${encodeURIComponent(product.id)}`;
  };

  const handleNativeShare = async () => {
    const shareUrl = getProductShareUrl();
    const currentPrice = selectedVariant ? selectedVariant.price : product.selling_price;
    const unitLabel = selectedVariant ? selectedVariant.name : (product.unit || 'PCS');
    const shareText = `*${product.name}*\nHarga: ${formatRupiah(currentPrice)} / ${unitLabel}\n\nYuk beli di Toko Berkah! Klik link di bawah:\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} - Toko Berkah`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    copyShareLink();
  };

  const copyShareLink = async () => {
    const shareUrl = getProductShareUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedLink(true);
      setShareToast('Link produk berhasil disalin!');
      setTimeout(() => {
        setCopiedLink(false);
        setShareToast(null);
      }, 3000);
    } catch {
      setShareToast('Gagal menyalin link');
      setTimeout(() => setShareToast(null), 3000);
    }
  };

  const shareViaWhatsApp = () => {
    const shareUrl = getProductShareUrl();
    const currentPrice = selectedVariant ? selectedVariant.price : product.selling_price;
    const unitLabel = selectedVariant ? selectedVariant.name : (product.unit || 'pcs');
    const text = `*${product.name}*\nHarga: *${formatRupiah(currentPrice)}* / ${unitLabel}\n\nLihat & pesan langsung di Toko Berkah:\n${shareUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const currentPrice = selectedVariant ? selectedVariant.price : product.selling_price;
  const subtotalPrice = calculateItemSubtotal(product, selectedQty, selectedVariant);

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
          <div className="flex items-center gap-1">
            <button
              id="btn-share-product-header"
              onClick={handleNativeShare}
              title="Bagikan Produk"
              className="p-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-700 transition flex items-center justify-center"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              id="btn-close-product-detail"
              onClick={onClose}
              className="p-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Share Toast Notification */}
        {shareToast && (
          <div className="bg-emerald-800 text-white text-xs font-semibold px-4 py-2 text-center animate-in slide-in-from-top duration-200 flex items-center justify-center gap-2">
            <Check className="w-3.5 h-3.5 text-yellow-300 stroke-[3]" />
            <span>{shareToast}</span>
          </div>
        )}

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
                {formatRupiah(currentPrice)}
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                {selectedVariant 
                  ? `Varian: ${selectedVariant.name}` 
                  : `Satuan: ${product.unit ? product.unit.toUpperCase() : 'PCS'}`}
              </span>
            </div>
          </div>

          {/* Share Product Bar */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Bagikan Produk:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                id="btn-share-whatsapp"
                onClick={shareViaWhatsApp}
                type="button"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs active:scale-95"
                title="Bagikan ke WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                id="btn-copy-link"
                onClick={copyShareLink}
                type="button"
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-xs active:scale-95 ${
                  copiedLink
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
                title="Salin Link Produk"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
              </button>
            </div>
          </div>

          {/* Stock Availability Alert */}
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

          {/* Variants Selector Sesuai Katalog Kasir */}
          {variants.length > 0 && !isOutOfStock && (
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-emerald-600" />
                  Pilih Varian (Katalog Kasir):
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  {variants.length} Varian
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {variants.map((v) => {
                  const isSelected = selectedVariant?.name === v.name;
                  const sublabel = formatVariantSublabel(v, product.unit);
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(v);
                        setSelectedQty(1);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 relative ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-black text-xs leading-tight">{v.name}</span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      {sublabel && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          {sublabel}
                        </span>
                      )}
                      <span className="text-xs font-black font-mono text-emerald-600 mt-1">
                        {formatRupiah(v.price)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Variant Summary Card */}
              {selectedVariant && (
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-emerald-900 font-medium">
                    Varian Dipilih: <strong className="font-bold">{selectedVariant.name}</strong>{' '}
                    {formatVariantSublabel(selectedVariant, product.unit) ? `(${formatVariantSublabel(selectedVariant, product.unit)})` : ''}
                  </span>
                  <span className="font-black font-mono text-emerald-700">
                    {formatRupiah(selectedVariant.price)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quantity selector if in stock */}
          {!isOutOfStock && currentCartQty === 0 && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                {selectedVariant ? `Jumlah (${selectedVariant.name}):` : 'Jumlah Pembelian:'}
              </span>
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
                <button
                  onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                  disabled={selectedQty <= 1}
                  className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold text-sm shadow-xs disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="min-w-[50px] px-1 text-center font-black text-sm text-slate-900 font-mono">
                  {selectedQty} {selectedVariant ? '' : (product.unit || 'pcs')}
                </span>
                <button
                  onClick={() => setSelectedQty(selectedQty + 1)}
                  className="w-8 h-8 rounded-lg bg-yellow-400 text-emerald-950 flex items-center justify-center font-bold text-sm shadow-xs disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* If already in cart for this variant */}
          {currentCartQty > 0 && !isOutOfStock && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-950 font-bold">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>
                  Sudah di keranjang {selectedVariant ? `(${selectedVariant.name})` : ''}:
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onUpdateQuantity(currentCartKey, currentCartQty - 1)}
                  className="w-7 h-7 bg-white rounded-lg border border-yellow-300 flex items-center justify-center font-bold text-slate-800"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-black text-xs px-1.5 text-emerald-950">
                  {currentCartQty} {selectedVariant ? '' : (product.unit || 'pcs')}
                </span>
                <button
                  onClick={() => onUpdateQuantity(currentCartKey, currentCartQty + 1)}
                  className="w-7 h-7 bg-yellow-400 text-emerald-950 rounded-lg flex items-center justify-center font-bold"
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
                <span>+ TAMBAH KE KERANJANG ({formatRupiah(subtotalPrice)})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
