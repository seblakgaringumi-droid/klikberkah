import React, { useState } from 'react';
import { OnlineOrder } from '../types';
import { 
  CheckCircle2, 
  MessageSquare, 
  Copy, 
  Check, 
  ArrowRight, 
  Store, 
  Truck,
  QrCode,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { STORE_PHONE_INTL, STORE_PHONE, STORE_NAME } from '../utils/whatsapp';
import { QRISCard } from './QRISCard';

interface OrderSuccessModalProps {
  order: OnlineOrder | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewOrders,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQrisBarcode, setShowQrisBarcode] = useState(true);

  if (!order) return null;

  const isQris = order.payment_method?.toUpperCase().includes('QRIS');
  const orderCode = order.id ? `#TB-${String(order.id).padStart(4, '0')}` : `#TB-${Date.now().toString().slice(-4)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReopenWhatsApp = () => {
    // Reopen WA chat
    const text = encodeURIComponent(
      `Halo Toko Berkah, saya mengonfirmasi pesanan ${orderCode} atas nama ${order.customer_name}. Mohon diproses ya. Terima kasih!`
    );
    window.open(`https://wa.me/${STORE_PHONE_INTL}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100">
        {/* Header Ribbon - Vibrant Palette Emerald 600 */}
        <div className="bg-emerald-600 text-white p-6 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-yellow-400 text-emerald-900 flex items-center justify-center mx-auto mb-3 shadow-md border-2 border-yellow-300">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="font-['Outfit',sans-serif] font-black text-xl text-white">
            Pesanan Berhasil Dibuat!
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            Data pesanan telah tersimpan di sistem kasir Toko Berkah
          </p>

          <div className="mt-3 inline-flex items-center gap-2 bg-emerald-800 px-3.5 py-1.5 rounded-full border border-emerald-500/50 shadow-inner">
            <span className="text-xs text-emerald-200">Nomor Pesanan:</span>
            <span className="text-sm font-black text-yellow-400 font-mono tracking-wider">{orderCode}</span>
            <button
              onClick={handleCopyCode}
              className="text-emerald-200 hover:text-white transition"
              title="Salin nomor pesanan"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-yellow-300" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Status Pesanan:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-900 font-black text-[11px] border border-yellow-300">
                {order.status || 'PENDING (Menunggu Kasir)'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Nama Penerima:</span>
              <span className="font-bold text-slate-900">{order.customer_name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">No. WhatsApp:</span>
              <span className="font-bold text-slate-900 font-mono">{order.customer_phone}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Metode Bayar:</span>
              <span className="font-bold text-slate-900">{order.payment_method}</span>
            </div>

            <div className="flex justify-between items-start pt-1">
              <span className="text-slate-500 shrink-0">Tujuan:</span>
              <span className="font-medium text-slate-900 text-right max-w-[200px] truncate">
                {order.delivery_address}
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-slate-900">
              <span className="font-bold text-xs">Total Pembayaran:</span>
              <span className="font-mono font-black text-base text-emerald-600">
                {formatRupiah(order.total_amount)}
              </span>
            </div>
          </div>

          {/* QRIS Guidance Box when QRIS method is used */}
          {isQris && (
            <div className="bg-red-50/90 border border-red-200 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-start gap-2 text-red-950">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold">Langkah Pembayaran QRIS:</span> Lakukan transfer <strong>{formatRupiah(order.total_amount)}</strong> via QRIS di bawah ini, lalu kirimkan screenshot bukti transfer ke WhatsApp kasir.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQrisBarcode(!showQrisBarcode)}
                className="w-full py-1.5 px-3 rounded-xl bg-white border border-red-200 hover:bg-red-100/60 text-red-900 text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-2xs"
              >
                <QrCode className="w-3.5 h-3.5 text-red-600" />
                <span>{showQrisBarcode ? 'Sembunyikan Barcode QRIS' : 'Tampilkan Barcode QRIS'}</span>
                {showQrisBarcode ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
              </button>

              {showQrisBarcode && (
                <div className="pt-1">
                  <QRISCard amount={order.total_amount} orderCode={orderCode} />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              id="reopen-wa-btn"
              onClick={handleReopenWhatsApp}
              className="w-full py-3 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-emerald-900 font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-emerald-950" />
              <span>BUKA CHAT WHATSAPP KASIR</span>
            </button>

            <button
              id="view-my-orders-btn"
              onClick={onViewOrders}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <span>Pantau Status di "Pesanan Saya"</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="continue-shopping-btn"
              onClick={onClose}
              className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold transition"
            >
              Kembali Belanja di Katalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
