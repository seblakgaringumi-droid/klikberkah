import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './supabase';
import { Product, CartItem, SortOption, OnlineOrder } from './types';
import { Header } from './components/Header';
import { PromoBanner } from './components/PromoBanner';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { StoreInfoModal } from './components/StoreInfoModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { 
  ShoppingBag, 
  Home, 
  History, 
  Layers, 
  PhoneCall, 
  MapPin, 
  Clock, 
  RefreshCw,
  Search,
  Sparkles
} from 'lucide-react';
import { formatRupiah } from './utils/formatters';
import { calculateItemSubtotal } from './utils/weightVariants';
import { STORE_PHONE, STORE_ADDRESS } from './utils/whatsapp';

export default function App() {
  // State for products
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [showOutOfStock, setShowOutOfStock] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<SortOption>('featured');

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tb_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal states
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState<boolean>(false);
  const [isStoreInfoOpen, setIsStoreInfoOpen] = useState<boolean>(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [lastOrder, setLastOrder] = useState<OnlineOrder | null>(null);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('tb_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cartItems]);

  // Fetch products from Supabase
  const fetchProducts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setIsSyncing(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (dbError) {
        throw dbError;
      }

      if (data) {
        setProducts(data as Product[]);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch products from Supabase:', err);
      const msg = err instanceof Error ? err.message : 'Koneksi ke database terputus';
      setError(`Gagal memuat produk: ${msg}. Silakan coba muat ulang.`);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Real-time synchronization with Supabase 'products' table
  useEffect(() => {
    const channel = supabase
      .channel('realtime-products-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          setIsSyncing(true);
          if (payload.eventType === 'INSERT') {
            const newProd = payload.new as Product;
            setProducts((prev) => [...prev, newProd]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Product;
            setProducts((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
            // Also update cart items if stock changed
            setCartItems((prev) =>
              prev.map((item) => {
                if (item.product.id === updated.id) {
                  const updatedStock = Number(updated.stock_kg) || 0;
                  const newQty = Math.min(item.quantity, Math.max(0, updatedStock));
                  return {
                    ...item,
                    product: updated,
                    quantity: newQty,
                    subtotal: calculateItemSubtotal(updated, newQty),
                  };
                }
                return item;
              }).filter((it) => it.quantity > 0)
            );
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as Product;
            setProducts((prev) => prev.filter((p) => p.id !== deleted.id));
            setCartItems((prev) => prev.filter((it) => it.product.id !== deleted.id));
          }
          setTimeout(() => setIsSyncing(false), 800);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Derive categories list dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      // Must be active (is_active !== false)
      if (p.is_active === false) return false;

      // Check stock
      const stock = Number(p.stock_kg) || 0;
      if (!showOutOfStock && stock <= 0) return false;

      // Category filter
      if (selectedCategory !== 'Semua' && p.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesCategory = p.category?.toLowerCase().includes(q);
        const matchesBarcode = p.barcode?.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesBarcode) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      const stockA = Number(a.stock_kg) || 0;
      const stockB = Number(b.stock_kg) || 0;

      // Always push out of stock to bottom
      if (stockA <= 0 && stockB > 0) return 1;
      if (stockB <= 0 && stockA > 0) return -1;

      switch (sortOption) {
        case 'price_asc':
          return a.selling_price - b.selling_price;
        case 'price_desc':
          return b.selling_price - a.selling_price;
        case 'name_asc':
          return a.name.localeCompare(b.name, 'id');
        case 'stock_desc':
          return stockB - stockA;
        case 'featured':
        default:
          return 0;
      }
    });

    return list;
  }, [products, showOutOfStock, selectedCategory, searchQuery, sortOption]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const stock = Number(product.stock_kg) || 0;
      if (existing) {
        // Round to 2 decimal places to avoid floating point precision issues with 0.25
        const rawNextQty = existing.quantity + quantity;
        const roundedQty = Math.round(rawNextQty * 100) / 100;
        const nextQty = Math.min(stock, roundedQty);
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: nextQty,
                subtotal: calculateItemSubtotal(product, nextQty),
              }
            : item
        );
      } else {
        const cleanQty = Math.round(quantity * 100) / 100;
        const initQty = Math.min(stock, cleanQty);
        return [
          ...prev,
          {
            product,
            quantity: initQty,
            unit: product.unit || 'pcs',
            subtotal: calculateItemSubtotal(product, initQty),
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    const cleanQty = Math.round(newQty * 100) / 100;
    if (cleanQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const stock = Number(item.product.stock_kg) || 0;
          const cappedQty = Math.min(stock, cleanQty);
          return {
            ...item,
            quantity: cappedQty,
            subtotal: calculateItemSubtotal(item.product, cappedQty),
          };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const cartTotalCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const cartTotalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cartItems]);

  const handleOrderSuccess = (order: OnlineOrder) => {
    setLastOrder(order);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    handleClearCart();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 pb-20 sm:pb-12">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartItems.length}
        cartTotal={cartTotalPrice}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenStoreInfo={() => setIsStoreInfoOpen(true)}
        isSyncing={isSyncing}
        onRefresh={() => fetchProducts()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Promotional Banner */}
        <PromoBanner />

        {/* Categories & Filter Navigation */}
        <CategoryNav
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          showOutOfStock={showOutOfStock}
          onToggleOutOfStock={setShowOutOfStock}
          sortOption={sortOption}
          onSortChange={setSortOption}
          totalProductsCount={products.filter((p) => p.is_active !== false).length}
          filteredCount={filteredProducts.length}
        />

        {/* Products Grid Area */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <div className="text-sm font-bold text-slate-700">
              Menghubungkan ke POS Kasir Toko Berkah...
            </div>
            <p className="text-xs text-slate-400">
              Memuat katalog produk resmi dan stok terbaru
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto my-8 space-y-3">
            <div className="text-red-700 font-bold text-sm">{error}</div>
            <button
              onClick={() => fetchProducts()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
            >
              Coba Muat Ulang
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto my-6 space-y-3 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 text-3xl flex items-center justify-center mx-auto">
              🔍
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              Tidak Ada Produk Ditemukan
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchQuery
                ? `Tidak ada produk dengan kata kunci "${searchQuery}". Coba kata kunci lain atau bersihkan pencarian.`
                : 'Belum ada produk aktif pada kategori ini.'}
            </p>
            {(searchQuery || selectedCategory !== 'Semua') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Semua');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Reset Filter Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredProducts.map((product) => {
              const cartItem = cartItems.find((ci) => ci.product.id === product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  cartItem={cartItem}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onViewDetail={(p) => setSelectedProductDetail(p)}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Bar for Mobile (Vibrant Palette Klik Indomaret Style) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 sm:hidden shadow-lg">
        <div className="flex items-center justify-between gap-2">
          {/* Home / Katalog */}
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex-1 flex flex-col items-center justify-center text-emerald-700 font-bold text-[10px]"
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span>Katalog</span>
          </button>

          {/* Info Toko */}
          <button
            onClick={() => setIsStoreInfoOpen(true)}
            className="flex-1 flex flex-col items-center justify-center text-slate-600 font-medium text-[10px]"
          >
            <MapPin className="w-5 h-5 mb-0.5 text-emerald-600" />
            <span>Info Toko</span>
          </button>

          {/* Riwayat Pesanan */}
          <button
            onClick={() => setIsOrdersOpen(true)}
            className="flex-1 flex flex-col items-center justify-center text-slate-600 font-medium text-[10px]"
          >
            <History className="w-5 h-5 mb-0.5" />
            <span>Pesanan Saya</span>
          </button>

          {/* Hubungi Toko WA */}
          <a
            href={`https://wa.me/6285294996696`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex flex-col items-center justify-center text-slate-600 font-medium text-[10px]"
          >
            <PhoneCall className="w-5 h-5 mb-0.5 text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          {/* Cart trigger button - Vibrant Yellow Button */}
          <button
            id="mobile-bottom-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="flex-[1.5] bg-yellow-400 hover:bg-yellow-300 text-emerald-950 px-3 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-emerald-900" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-black border border-white">
                  {cartItems.length}
                </span>
              )}
            </div>
            <span className="font-mono font-bold">
              {cartTotalPrice > 0 ? formatRupiah(cartTotalPrice) : 'Keranjang'}
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-8 px-4 sm:px-6 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-emerald-900 flex items-center justify-center font-black text-xs border border-yellow-300 shadow-xs">
              TB
            </div>
            <div>
              <div className="font-bold text-slate-900">Toko Berkah Sindangkasih</div>
              <div className="text-[11px] text-slate-400">
                Sistem E-Commerce Pelanggan terintegrasi Kasir POS Realtime
              </div>
            </div>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-500 space-y-1">
            <button 
              onClick={() => setIsStoreInfoOpen(true)}
              className="hover:text-emerald-700 hover:underline transition block sm:inline-block font-bold text-slate-700"
              title="Klik untuk melihat informasi resmi toko"
            >
              📍 {STORE_ADDRESS}
            </button>
            <div>📞 WhatsApp Kasir: {STORE_PHONE} (Buka 06.00 - 21.00 WIB)</div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Success Receipt Modal */}
      <OrderSuccessModal
        order={lastOrder}
        onClose={() => setLastOrder(null)}
        onViewOrders={() => {
          setLastOrder(null);
          setIsOrdersOpen(true);
        }}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductDetail}
        cartItem={cartItems.find((item) => item.product.id === selectedProductDetail?.id)}
        isOpen={!!selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
      />

      {/* Store Information Modal */}
      <StoreInfoModal
        isOpen={isStoreInfoOpen}
        onClose={() => setIsStoreInfoOpen(false)}
      />

      {/* PWA Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}
