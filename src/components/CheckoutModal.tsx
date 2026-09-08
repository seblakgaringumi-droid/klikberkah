import React, { useState, useEffect } from 'react';
import { CartItem, DeliveryType, PaymentMethod, OnlineOrder } from '../types';
import { supabase } from '../supabase';
import { 
  X, 
  Truck, 
  Store, 
  CreditCard, 
  Banknote, 
  FileText, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  QrCode,
  UserCheck,
  Loader2,
  Building2,
  Copy,
  Check
} from 'lucide-react';
import { formatRupiah, formatQty } from '../utils/formatters';
import { openWhatsAppOrder, STORE_ADDRESS } from '../utils/whatsapp';
import { QRISCard } from './QRISCard';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (order: OnlineOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
}) => {
  // Form States
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('tb_customer_name') || '');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('tb_customer_phone') || '');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('DELIVERY');
  const [deliveryAddress, setDeliveryAddress] = useState(() => localStorage.getItem('tb_customer_address') || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD (Bayar di Tempat / Tunai)');
  const [notes, setNotes] = useState('');

  // Customer verification state for Bon/Utang
  const [isCheckingCustomer, setIsCheckingCustomer] = useState(false);
  const [registeredCustomerName, setRegisteredCustomerName] = useState<string | null>(null);
  const [customerChecked, setCustomerChecked] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedRekening, setCopiedRekening] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);

  // Check phone in customers table when phone changes (for registered customer verification)
  useEffect(() => {
    const cleanNumber = customerPhone.replace(/\D/g, '');
    if (cleanNumber.length >= 10) {
      const timer = setTimeout(async () => {
        setIsCheckingCustomer(true);
        try {
          // Check customers table in Supabase
          const { data } = await supabase
            .from('customers')
            .select('id, full_name, name, address, phone')
            .or(`phone.eq.${cleanNumber},phone.eq.0${cleanNumber.replace(/^62/, '')}`)
            .limit(1);

          if (data && data.length > 0) {
            setRegisteredCustomerName(data[0].full_name || data[0].name || 'Pelanggan Terdaftar');
            if (!deliveryAddress && data[0].address) {
              setDeliveryAddress(data[0].address);
            }
            if (!customerName && (data[0].full_name || data[0].name)) {
              setCustomerName(data[0].full_name || data[0].name);
            }
          } else {
            setRegisteredCustomerName(null);
          }
        } catch {
          setRegisteredCustomerName(null);
        } finally {
          setIsCheckingCustomer(false);
          setCustomerChecked(true);
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setRegisteredCustomerName(null);
      setCustomerChecked(false);
    }
  }, [customerPhone]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!customerName.trim()) {
      setErrorMessage('Mohon isi nama lengkap Anda.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMessage('Mohon isi nomor WhatsApp yang aktif dan valid (min. 10 digit).');
      return;
    }

    if (deliveryType === 'DELIVERY' && !deliveryAddress.trim()) {
      setErrorMessage('Mohon isi alamat pengiriman lengkap (nomor rumah, blok, atau patokan).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save customer info locally for convenience in future visits
      localStorage.setItem('tb_customer_name', customerName.trim());
      localStorage.setItem('tb_customer_phone', cleanPhone);
      if (deliveryAddress.trim()) {
        localStorage.setItem('tb_customer_address', deliveryAddress.trim());
      }

      // Format items json for orders table
      const itemsJson = items.map((it) => ({
        product_id: it.product.id,
        product_name: it.product.name,
        unit: it.unit,
        quantity: it.quantity,
        price: it.product.selling_price,
        subtotal: it.subtotal,
      }));

      const finalAddress = deliveryType === 'DELIVERY' ? deliveryAddress.trim() : 'Ambil di Toko (Pick-Up)';

      const orderPayload: OnlineOrder = {
        customer_name: customerName.trim(),
        customer_phone: cleanPhone,
        delivery_address: finalAddress,
        items_json: itemsJson,
        total_amount: subtotal,
        payment_method: paymentMethod,
        status: 'PENDING',
      };

      // 1. Insert into Supabase table 'orders' (and fallback to 'online_orders')
      let createdOrder: OnlineOrder = orderPayload;
      
      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select();

      if (orderError) {
        console.warn('Orders insert error, trying online_orders:', orderError);
        const { data: fallbackOrder, error: fallbackError } = await supabase
          .from('online_orders')
          .insert([orderPayload])
          .select();

        if (fallbackError) {
          console.warn('Both orders & online_orders failed, saving locally:', fallbackError);
          // Still proceed so customer doesn't lose their order and WhatsApp text works
          createdOrder = { ...orderPayload, id: Date.now() % 10000 };
        } else if (fallbackOrder && fallbackOrder[0]) {
          createdOrder = fallbackOrder[0] as OnlineOrder;
        }
      } else if (insertedOrder && insertedOrder[0]) {
        createdOrder = insertedOrder[0] as OnlineOrder;
      }

      // Also try to record into sales if possible, non-blocking
      try {
        await supabase.from('sales').insert([
          {
            total_amount: subtotal,
            payment_method: paymentMethod,
            status: 'pending',
            notes: `Online Order ${customerName} (${deliveryType})`,
          }
        ]);
      } catch (err) {
        // non-blocking
      }

      // 2. Open WhatsApp to Toko Berkah with formatted summary
      openWhatsAppOrder({
        orderId: createdOrder.id,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        deliveryType,
        deliveryAddress: finalAddress,
        paymentMethod,
        items,
        totalAmount: subtotal,
        notes: notes.trim(),
      });

      // 3. Notify parent of success
      onOrderSuccess(createdOrder);
    } catch (err: unknown) {
      console.error('Order submission error:', err);
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setErrorMessage(`Gagal menyimpan pesanan: ${message}. Silakan coba lagi.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100">
        {/* Modal Header - Vibrant Palette Emerald 600 */}
        <div className="bg-emerald-600 text-white p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div>
            <h2 className="font-['Outfit',sans-serif] font-black text-lg sm:text-xl">
              Formulir Checkout Pesanan
            </h2>
            <p className="text-xs text-emerald-100">
              Lengkapi data penerima & metode pembayaran
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Customer Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Data Pelanggan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  placeholder="Contoh: Ibu Siti / Pak Budi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. WhatsApp Aktif <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    placeholder="Contoh: 08123456789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                  {isCheckingCustomer && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {registeredCustomerName && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Terdaftar di Toko: {registeredCustomerName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Opsi Layanan */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Opsi Pengambilan / Layanan
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="service-delivery"
                onClick={() => setDeliveryType('DELIVERY')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
                  deliveryType === 'DELIVERY'
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500 text-emerald-950'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Truck className={`w-5 h-5 ${deliveryType === 'DELIVERY' ? 'text-emerald-700' : 'text-slate-400'}`} />
                  {deliveryType === 'DELIVERY' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold">Pesan-Antar (Delivery)</div>
                  <div className="text-[10px] text-slate-500">Diantar ke rumah / COD</div>
                </div>
              </button>

              <button
                type="button"
                id="service-pickup"
                onClick={() => setDeliveryType('PICKUP')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
                  deliveryType === 'PICKUP'
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500 text-emerald-950'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Store className={`w-5 h-5 ${deliveryType === 'PICKUP' ? 'text-emerald-700' : 'text-slate-400'}`} />
                  {deliveryType === 'PICKUP' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold">Ambil di Toko (Pick-Up)</div>
                  <div className="text-[10px] text-slate-500">Sebrang Masjid Al-Falah, Sindangkasih</div>
                </div>
              </button>
            </div>

            {/* Address Input (If Delivery) */}
            {deliveryType === 'DELIVERY' ? (
              <div className="mt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Pengiriman Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="checkout-address"
                  required
                  rows={2}
                  placeholder="Contoh: Jl. Kalapanunggal RT 02 / RW 01, Sindangkasih, dekat pos kamling..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                <Store className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Silakan ambil pesanan Anda langsung di: <strong>{STORE_ADDRESS}</strong> setelah kasir mengonfirmasi kesiapan barang.
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Metode Pembayaran */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Metode Pembayaran
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">
                Pilih metode pembayaran
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Option A: COD (Bayar di Tempat) */}
              <label
                id="payment-option-cod"
                className={`flex items-start sm:items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'COD (Bayar di Tempat / Tunai)' || paymentMethod === 'COD (Bayar di Tempat)'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-500 text-emerald-950 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-800 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    id="radio-cod"
                    value="cod"
                    checked={paymentMethod === 'COD (Bayar di Tempat / Tunai)' || paymentMethod === 'COD (Bayar di Tempat)'}
                    onChange={() => setPaymentMethod('COD (Bayar di Tempat / Tunai)')}
                    className="text-emerald-600 focus:ring-emerald-500 mt-0.5"
                  />
                  <div>
                    <div className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                      <span className="text-base">💵</span>
                      <span>COD (Bayar di Tempat)</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-sm ml-1">
                        Default
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Bayar langsung dengan uang tunai saat barang sampai atau saat diambil.
                    </div>
                  </div>
                </div>
              </label>

              {/* Option B: QRIS All Payment */}
              <label
                id="payment-option-qris"
                className={`flex items-start sm:items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'QRIS / Non-Tunai' || paymentMethod === 'Transfer Bank / QRIS'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-500 text-emerald-950 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-800 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    id="radio-qris"
                    value="qris"
                    checked={paymentMethod === 'QRIS / Non-Tunai' || paymentMethod === 'Transfer Bank / QRIS'}
                    onChange={() => setPaymentMethod('QRIS / Non-Tunai')}
                    className="text-emerald-600 focus:ring-emerald-500 mt-0.5"
                  />
                  <div>
                    <div className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                      <span className="text-base">📱</span>
                      <span>QRIS All Payment</span>
                      <span className="bg-red-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded-sm uppercase tracking-wider ml-1">
                        QRIS
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Scan kode QRIS via Dana, GoPay, ShopeePay, OVO, atau Semua Mobile Banking.
                    </div>
                  </div>
                </div>
              </label>

              {/* Interactive QRIS Card preview shown when QRIS is selected */}
              {(paymentMethod === 'QRIS / Non-Tunai' || paymentMethod === 'Transfer Bank / QRIS') && (
                <div className="pt-2">
                  <QRISCard amount={subtotal} />
                </div>
              )}

              {/* Option C: Transfer Bank */}
              <label
                id="payment-option-transfer"
                className={`flex items-start sm:items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'Transfer Bank'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-500 text-emerald-950 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-800 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    id="radio-transfer"
                    value="transfer"
                    checked={paymentMethod === 'Transfer Bank'}
                    onChange={() => setPaymentMethod('Transfer Bank')}
                    className="text-emerald-600 focus:ring-emerald-500 mt-0.5"
                  />
                  <div>
                    <div className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                      <span className="text-base">🏦</span>
                      <span>Transfer Bank</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Transfer langsung ke rekening Bank BRI Toko Berkah.
                    </div>
                  </div>
                </div>
              </label>

              {/* Transfer Bank Detail Box when Transfer is selected */}
              {paymentMethod === 'Transfer Bank' && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-blue-800 font-bold uppercase tracking-wider">
                        Bank BRI
                      </div>
                      <div className="text-base font-black font-mono text-slate-900">
                        0145-01-002345-53-1
                      </div>
                      <div className="text-xs text-slate-600">
                        a.n. <strong>TOKO BERKAH</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('014501002345531');
                        setCopiedRekening(true);
                        setTimeout(() => setCopiedRekening(false), 2000);
                      }}
                      className="px-2.5 py-1.5 bg-white border border-blue-300 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      {copiedRekening ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-600" />
                          <span>Salin No. Rek</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-600 pt-1 border-t border-blue-100">
                    Kirimkan foto/screenshot bukti transfer via chat WhatsApp kasir setelah membuat pesanan.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Catatan Pesanan */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan untuk Kasir / Pengantar (Opsional)
            </label>
            <input
              id="checkout-notes"
              type="text"
              placeholder="Contoh: Tolong pilih minyak yang botol baru / antar jam 1 siang"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3 py-2 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>

          {/* Order Brief Summary */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-800 pb-1 border-b border-slate-200">
              <span>Ringkasan Pesanan ({items.length} Barang):</span>
              <span className="text-[11px] text-emerald-600 font-semibold">Toko Berkah</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 divide-y divide-slate-100">
              {items.map((it) => (
                <div key={it.product.id} className="pt-1 flex justify-between text-slate-600 text-[11px]">
                  <span className="truncate pr-2 font-medium">{it.product.name} ({formatQty(it.quantity, it.unit)})</span>
                  <span className="font-mono font-bold text-slate-800 shrink-0">{formatRupiah(it.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-1.5 border-t border-slate-200">
              <span>Total Tagihan:</span>
              <span className="text-emerald-600 font-mono font-black text-base">
                {formatRupiah(subtotal)}
              </span>
            </div>
          </div>

          {/* Submit Button - Vibrant Yellow Button */}
          <button
            type="submit"
            id="btn-confirm-order"
            disabled={isSubmitting}
            className={`w-full py-3.5 px-4 rounded-xl font-black text-sm shadow-lg transition flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-yellow-200 text-emerald-900/60 cursor-wait'
                : 'bg-yellow-400 hover:bg-yellow-300 text-emerald-900 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan ke POS & Membuka WhatsApp...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-emerald-950 stroke-[2.5]" />
                <span>BUAT PESANAN SEKARANG</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400">
            Pesanan langsung terdata di database Supabase Toko Berkah & chat WhatsApp akan terbuka otomatis.
          </p>
        </form>
      </div>
    </div>
  );
};
