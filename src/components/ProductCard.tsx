import React, { useState } from 'react';
import { Product, CartItem, ProductVariant } from '../types';
import { Plus, Minus } from 'lucide-react';
import { formatRupiah, formatQty } from '../utils/formatters';
import { getProductVariants, formatVariantSublabel } from '../utils/weightVariants';

interface ProductCardProps {
  product: Product;
  cartItems?: CartItem[];
  cartItem?: CartItem;
  onAddToCart: (product: Product, quantity?: number, variant?: ProductVariant | null) => void;
  onUpdateQuantity: (cartKey: string, newQty: number) => void;
  onViewDetail?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cartItems = [],
  cartItem,
  onAddToCart,
  onUpdateQuantity,
  onViewDetail,
}) => {
  const [imageError, setImageError] = useState(false);
  const variants = getProductVariants(product);
  const hasVariants = variants.length > 0;

  // Selected variant state on card
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    () => (variants.length > 0 ? variants[0] : null)
  );

  const stock = Number(product.stock_kg) || 0;
  const isOutOfStock = stock <= 0;

  // Find if the currently selected variant (or base product) is in cart
  const currentVariantCartItem = cartItems.find((it) => {
    if (it.product.id !== product.id) return false;
    if (selectedVariant) {
      return it.selectedVariant?.name === selectedVariant.name;
    }
    return !it.selectedVariant;
  }) || (cartItem && cartItem.product.id === product.id ? cartItem : undefined);

  const currentCartQty = currentVariantCartItem?.quantity || 0;
  const currentCartKey = currentVariantCartItem?.id || (selectedVariant ? `${product.id}__${selectedVariant.name}` : product.id);

  const currentPrice = selectedVariant ? selectedVariant.price : product.selling_price;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (currentCartQty === 0) {
      onAddToCart(product, 1, selectedVariant);
    } else {
      onUpdateQuantity(currentCartKey, currentCartQty + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentCartQty <= 1) {
      onUpdateQuantity(currentCartKey, 0);
    } else {
      onUpdateQuantity(currentCartKey, currentCartQty - 1);
    }
  };

  // Helper for category fallback icon/color
  const getCategoryTheme = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('beras')) return { bg: 'bg-emerald-50', text: 'text-emerald-800', icon: '🍚' };
    if (c.includes('minyak')) return { bg: 'bg-yellow-50', text: 'text-yellow-800', icon: '🛢️' };
    if (c.includes('telur')) return { bg: 'bg-orange-50', text: 'text-orange-800', icon: '🥚' };
    if (c.includes('minum')) return { bg: 'bg-blue-50', text: 'text-blue-800', icon: '🧃' };
    if (c.includes('bumbu')) return { bg: 'bg-red-50', text: 'text-red-800', icon: '🧂' };
    return { bg: 'bg-slate-100', text: 'text-slate-700', icon: '🛍️' };
  };

  const theme = getCategoryTheme(product.category || '');

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onViewDetail?.(product)}
      className={`bg-white rounded-2xl p-3 border border-slate-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between cursor-pointer ${
        isOutOfStock 
          ? 'bg-slate-50/80' 
          : currentCartQty > 0 
            ? 'ring-2 ring-emerald-500 shadow-md' 
            : ''
      }`}
    >
      {/* Top Image Container */}
      <div className="relative w-full aspect-square bg-slate-100 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
        {product.image_url && !imageError ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className={`w-full h-full object-contain p-2 transition duration-300 hover:scale-105 ${
              isOutOfStock ? 'grayscale opacity-50' : ''
            }`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <span className="text-4xl mb-1">{theme.icon}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {product.category || 'Toko Berkah'}
            </span>
          </div>
        )}

        {/* Category Pill Tag */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-white/95 text-emerald-950 backdrop-blur-xs shadow-xs border border-slate-100">
            {product.category || 'Sembako'}
          </span>
          {hasVariants && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-700 text-white shadow-xs">
              {variants.length} Varian
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
            <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 justify-between gap-2">
        <div>
          <h3 className={`font-bold text-xs sm:text-sm line-clamp-2 leading-snug transition ${
            isOutOfStock ? 'text-slate-500' : 'text-slate-800 hover:text-emerald-700'
          }`}>
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 mb-1">
            {selectedVariant
              ? `Varian: ${selectedVariant.name}`
              : product.unit ? (product.unit.toLowerCase() === 'kg' ? 'Kg' : product.unit) : 'pcs'}
          </p>

          {/* Kasir POS Variant Chips */}
          {hasVariants && !isOutOfStock && (
            <div className="flex flex-wrap items-center gap-1 my-1" onClick={(e) => e.stopPropagation()}>
              {variants.map((v) => {
                const isSelected = selectedVariant?.name === v.name;
                const sublabel = formatVariantSublabel(v, product.unit);
                return (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                    title={sublabel ? `${v.name} (${sublabel}) - ${formatRupiah(v.price)}` : `${v.name} - ${formatRupiah(v.price)}`}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Price & Action Section */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className={`text-sm sm:text-base font-black ${isOutOfStock ? 'text-slate-400 line-through' : 'text-emerald-600 font-mono'}`}>
              {formatRupiah(currentPrice)}
            </div>
            {selectedVariant && !isOutOfStock && (
              <div className="text-[10px] text-slate-500 font-medium truncate max-w-[110px]">
                {selectedVariant.name}
                {formatVariantSublabel(selectedVariant, product.unit) ? ` (${formatVariantSublabel(selectedVariant, product.unit)})` : ''}
              </div>
            )}
          </div>

          {/* Action Button: [+ Tambah] or Stepper or Disabled Gray Button */}
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {isOutOfStock ? (
              <button
                id={`btn-add-${product.id}`}
                disabled={true}
                aria-disabled="true"
                className="bg-slate-200 text-slate-500 cursor-not-allowed px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center select-none shadow-none"
                title="Stok saat ini tidak tersedia"
              >
                Habis
              </button>
            ) : currentCartQty > 0 ? (
              <div className="flex items-center bg-yellow-100 border border-yellow-300 rounded-lg p-0.5 shadow-xs">
                <button
                  id={`btn-dec-${product.id}`}
                  onClick={handleDecrement}
                  aria-label="Kurangi kuantitas"
                  className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-emerald-900 hover:bg-yellow-200 transition active:scale-95 shadow-xs font-bold text-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="min-w-[36px] px-1 text-center text-[11px] font-black text-emerald-950 font-mono">
                  {currentCartQty}
                </span>
                <button
                  id={`btn-inc-${product.id}`}
                  onClick={handleIncrement}
                  aria-label="Tambah kuantitas"
                  className="w-7 h-7 flex items-center justify-center rounded-md transition active:scale-95 shadow-xs font-black text-xs bg-yellow-400 text-emerald-900 hover:bg-yellow-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id={`btn-add-${product.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product, 1, selectedVariant);
                }}
                className="bg-yellow-400 hover:bg-yellow-300 text-emerald-900 px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-xs"
                title="Tambah ke keranjang"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-950 stroke-[3]" />
                <span className="hidden xs:inline">Tambah</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
