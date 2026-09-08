import React, { useState, useEffect, useCallback } from 'react';
import { OnlineOrder } from '../types';
import { supabase } from '../supabase';
import { 
  X, 
  History, 
  Search, 
  Clock, 
  CheckCircle2, 
  Package, 
  Truck, 
  MessageSquare,
  RefreshCw,
  AlertCircle 
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { STORE_PHONE_INTL } from '../utils/whatsapp';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [phone, setPhone] = useState(() => localStorage.getItem('tb_customer_phone') || '');
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchOrders = useCallback(async (phoneToSearch: string) => {
    const cleanNumber = phoneToSearch.replace(/\D/g, '');
    if (!cleanNumber) return;

    setLoading(true);
    setHasSearched(true);

    try {
      // Search with either 08... or 62...
      const raw08 = cleanNumber.startsWith('62') ? '0' + cleanNumber.substring(2) : cleanNumber;
      const raw62 = cleanNumber.startsWith('0') ? '62' + cleanNumber.substring(1) : cleanNumber;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`customer_phone.eq.${cleanNumber},customer_phone.eq.${raw08},customer_phone.eq.${raw62}`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data as OnlineOrder[]);
      } else {
        // Try fallback online_orders table
        const { data: fallback } = await supabase
          .from('online_orders')
          .select('*')
          .or(`customer_phone.eq.${cleanNumber},customer_phone.eq.${raw08},customer_phone.eq.${raw62}`)
          .order('created_at', { ascending: false });
        if (fallback) {
          setOrders(fallback as OnlineOrder[]);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && phone) {
      fetchOrders(phone);
    }
  }, [isOpen, phone, fetchOrders]);

  // Realtime subscription for customer's orders
  useEffect(() => {
    if (!isOpen || !phone) return;

    const channel = supabase
      .channel('customer-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders(phone);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, phone, fetchOrders]);

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    const s = (status || 'PENDING').toUpperCase();
    if (s.includes('SELESAI')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Selesai</span>
        </span>
      );
    }
    if (s.includes('PROSES') || s.includes('KIRIM')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center gap-1">
          <Truck className="w-3 h-3 text-blue-600" />
          <span>Sedang Dikirim / Diproses</span>
        </span>
      );
    }
    if (s.includes('BATAL')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-bold">
          Dibatalkan
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1">
        <Clock className="w-3 h-3 text-amber-600" />
        <span>Menunggu Konfirmasi Kasir</span>
      </span>
    );
  };

  const handleAskStore = (order: OnlineOrder) => {
    const orderCode = `#TB-${String(order.id).padStart(4, '0')}`;
    const text = encodeURIComponent(
      `Halo Toko Berkah, saya ingin tanya status pesanan ${orderCode} atas nama ${order.customer_name}. Terima kasih!`
    );
    window.open(`https://wa.me/${STORE_PHONE_INTL}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100">
        {/* Header - Vibrant Palette Emerald 600 */}
        <div className="bg-emerald-600 text-white p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-yellow-300" />
            <div>
              <h2 className="font-['Outfit',sans-serif] font-bold text-lg">
                Riwayat Pesanan Saya
              </h2>
              <p className="text-xs text-emerald-100">
                Pantau pesanan online Anda secara realtime
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search by Phone bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Cari Berdasarkan No. WhatsApp Pelanggan:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="search-order-phone"
                type="tel"
                placeholder="Contoh: 085335551399"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOrders(phone)}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 pl-3 pr-8 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white"
              />
            </div>
            <button
              onClick={() => fetchOrders(phone)}
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-300 text-emerald-900 px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5 text-emerald-950" />}
              <span>Cari</span>
            </button>
          </div>
        </div>

        {/* Orders List Content */}
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto divide-y divide-slate-100 space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs">Memeriksa pesanan di database Toko Berkah...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Package className="w-12 h-12 mx-auto text-slate-300" />
              <div className="font-bold text-slate-800 text-sm">
                {hasSearched ? 'Tidak Ditemukan Pesanan' : 'Masukkan Nomor WhatsApp'}
              </div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {hasSearched
                  ? 'Belum ada pesanan yang tercatat dengan nomor telepon ini. Pastikan nomor sudah tepat.'
                  : 'Ketik nomor WhatsApp yang digunakan saat membuat pesanan untuk melihat riwayat.'}
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const orderCode = `#TB-${String(order.id).padStart(4, '0')}`;
              const dateStr = order.created_at
                ? new Date(order.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '-';

              return (
                <div key={order.id} className="pt-3 first:pt-0 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs sm:text-sm text-emerald-900">
                        {orderCode}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2">{dateStr}</span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 space-y-1.5 border border-slate-200">
                    <div className="flex justify-between text-slate-600">
                      <span>Layanan:</span>
                      <span className="font-medium text-slate-900 truncate max-w-[200px]">
                        {order.delivery_address?.toLowerCase().includes('ambil') ? 'Ambil di Toko' : 'Delivery COD'}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Pembayaran:</span>
                      <span className="font-medium text-slate-900">{order.payment_method}</span>
                    </div>

                    {/* Ordered items summary */}
                    {Array.isArray(order.items_json) && (
                      <div className="pt-1.5 border-t border-slate-200 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500">Rincian Barang:</span>
                        {order.items_json.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span className="text-slate-700 truncate max-w-[220px]">
                              • {item.product_name} ({item.quantity} {item.unit})
                            </span>
                            <span className="font-medium text-slate-900">
                              {formatRupiah(item.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                      <span className="font-bold text-xs text-slate-900">Total Belanja:</span>
                      <span className="font-mono font-black text-sm text-emerald-600">
                        {formatRupiah(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAskStore(order)}
                    className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Tanyakan Status Pesanan ke WhatsApp Toko</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
