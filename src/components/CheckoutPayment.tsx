import React, { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

// URL gambar QRIS statis Toko Berkah di Supabase Storage
export const QrisStaticImage = 'https://kquxfvcbgogjpthhsseg.supabase.co/storage/v1/object/public/assets/qris.jpeg';

export interface CheckoutPaymentProps {
  selectedPayment?: string;
  onSelectPayment?: (methodId: string) => void;
  amount?: number;
}

export const CheckoutPayment: React.FC<CheckoutPaymentProps> = ({
  selectedPayment: propSelected,
  onSelectPayment,
  amount,
}) => {
  const [internalSelected, setInternalSelected] = useState<string>('cod');
  const [copiedRekening, setCopiedRekening] = useState(false);

  const selectedPayment = propSelected !== undefined ? propSelected : internalSelected;

  const handleSelect = (id: string) => {
    if (onSelectPayment) {
      onSelectPayment(id);
    } else {
      setInternalSelected(id);
    }
  };

  const paymentMethods = [
    { id: 'cod', name: 'COD (Bayar di Tempat)', icon: '💵', desc: 'Bayar saat barang sampai atau diambil' },
    { id: 'qris', name: 'QRIS All Payment', icon: '📱', desc: 'Dana, GoPay, OVO, ShopeePay, M-Banking' },
    { id: 'transfer', name: 'Transfer Bank', icon: '🏦', desc: 'Transfer ke rekening bank Toko Berkah' },
  ];

  const handleCopyRek = () => {
    navigator.clipboard.writeText('014501002345531');
    setCopiedRekening(true);
    setTimeout(() => setCopiedRekening(false), 2000);
  };

  return (
    <div className="payment-container space-y-3">
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
        Pilih Metode Pembayaran
      </h3>

      <div className="payment-options space-y-2">
        {paymentMethods.map((method) => {
          const isSelected = selectedPayment === method.id;
          return (
            <label
              key={method.id}
              id={`payment-option-${method.id}`}
              className={`payment-option flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                isSelected
                  ? 'active border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-500 text-emerald-950 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-800 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  id={`radio-${method.id}`}
                  value={method.id}
                  checked={isSelected}
                  onChange={(e) => handleSelect(e.target.value)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="icon text-xl">{method.icon}</span>
                <div>
                  <span className="name text-xs sm:text-sm font-bold block">{method.name}</span>
                  <span className="text-[11px] text-slate-500 block">{method.desc}</span>
                </div>
              </div>
              {isSelected && (
                <span className="text-[10px] font-bold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                  Dipilih
                </span>
              )}
            </label>
          );
        })}
      </div>

      {/* Tampilkan Gambar QRIS jika opsi QRIS dipilih */}
      {selectedPayment === 'qris' && (
        <div className="qris-display mt-4 p-4 border border-emerald-200 rounded-2xl bg-white text-center shadow-xs">
          <p className="text-xs font-medium text-gray-700 mb-2">
            Scan kode QRIS ini dengan aplikasi pembayaran Anda:
          </p>
          <div className="relative inline-block border-2 border-emerald-500/30 rounded-xl p-2 bg-white shadow-inner">
            <img
              src={QrisStaticImage}
              alt="QRIS Toko Berkah GoWes"
              className="qris-image mx-auto w-64 h-64 object-contain rounded-lg"
              loading="eager"
            />
          </div>
          <p className="text-xs font-bold text-gray-700 mt-2">
            Nama Merchant: <span className="text-emerald-700">TOKO BERKAH</span>
          </p>
          <p className="text-[11px] text-gray-500">
            NMID: ID2026090600889 • Standard QRIS Nasional
          </p>
          {amount && amount > 0 && (
            <div className="mt-3 p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800">
              Total Tagihan: <span className="font-mono text-sm">{formatRupiah(amount)}</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-center gap-2">
            <a
              href={QrisStaticImage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
            >
              <span>Lihat Gambar Penuh</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Tampilkan Rekening jika opsi Transfer Bank dipilih */}
      {selectedPayment === 'transfer' && (
        <div className="transfer-display mt-4 p-4 border border-blue-200 rounded-2xl bg-blue-50/60 text-slate-800">
          <div className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
            <span>Rekening Resmi Toko Berkah:</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-semibold">Bank BRI</div>
              <div className="font-mono font-bold text-sm text-slate-900">0145-01-002345-53-1</div>
              <div className="text-[11px] text-slate-600">a.n. TOKO BERKAH</div>
            </div>
            <button
              type="button"
              onClick={handleCopyRek}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              {copiedRekening ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRekening ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-600 mt-2">
            Kirimkan bukti transfer bank via WhatsApp kasir setelah membuat pesanan.
          </p>
        </div>
      )}
    </div>
  );
};

export default CheckoutPayment;
