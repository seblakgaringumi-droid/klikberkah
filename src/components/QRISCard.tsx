import React, { useState } from 'react';
import { QrCode, Copy, Check, ExternalLink, Download, Smartphone } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export const QRIS_STATIC_IMAGE_URL = 'https://kquxfvcbgogjpthhsseg.supabase.co/storage/v1/object/public/assets/qris.jpeg';

interface QRISCardProps {
  amount: number;
  orderCode?: string;
  className?: string;
}

export const QRISCard: React.FC<QRISCardProps> = ({ amount, orderCode, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(amount.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-2xl border-2 border-emerald-500/30 overflow-hidden shadow-sm ${className}`}>
      {/* Top QRIS Banner Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-white text-red-600 font-black text-[11px] px-1.5 py-0.5 rounded tracking-tighter leading-none">
            QRIS
          </div>
          <span className="text-[10px] tracking-wider uppercase font-bold text-red-100">
            Standar Pembayaran Digital Nasional
          </span>
        </div>
        <span className="text-[9px] font-mono bg-red-800/60 px-1.5 py-0.5 rounded text-red-200">
          GPN
        </span>
      </div>

      {/* Merchant Details */}
      <div className="p-4 text-center border-b border-slate-100 bg-slate-50/50">
        <h4 className="font-['Outfit',sans-serif] font-black text-sm text-slate-900 tracking-wide uppercase">
          TOKO BERKAH
        </h4>
        <div className="text-[10px] text-slate-500 font-mono">
          NMID: ID2026090600889 • Merchant: TOKO BERKAH GoWes
        </div>
      </div>

      {/* QR Code Presentation */}
      <div className="p-4 flex flex-col items-center justify-center bg-white">
        <div className="relative p-2.5 bg-white rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center max-w-[280px]">
          {!imageError ? (
            <img
              src={QRIS_STATIC_IMAGE_URL}
              alt="QRIS Toko Berkah GoWes"
              className="w-56 h-auto max-h-72 object-contain rounded-xl border border-slate-100 bg-white"
              onError={() => setImageError(true)}
              loading="eager"
            />
          ) : (
            <svg
              viewBox="0 0 200 200"
              className="w-44 h-44 text-slate-900"
              fill="currentColor"
            >
              <rect x="10" y="10" width="50" height="50" rx="6" fill="#0f172a" />
              <rect x="18" y="18" width="34" height="34" rx="3" fill="#ffffff" />
              <rect x="26" y="26" width="18" height="18" rx="2" fill="#0f172a" />
              <rect x="140" y="10" width="50" height="50" rx="6" fill="#0f172a" />
              <rect x="148" y="18" width="34" height="34" rx="3" fill="#ffffff" />
              <rect x="156" y="26" width="18" height="18" rx="2" fill="#0f172a" />
              <rect x="10" y="140" width="50" height="50" rx="6" fill="#0f172a" />
              <rect x="18" y="148" width="34" height="34" rx="3" fill="#ffffff" />
              <rect x="26" y="156" width="18" height="18" rx="2" fill="#0f172a" />
              <rect x="76" y="76" width="48" height="48" rx="8" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
              <text x="100" y="104" fill="#059669" fontSize="11" fontWeight="900" textAnchor="middle">BERKAH</text>
            </svg>
          )}

          <div className="mt-2 text-center">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              Scan dengan Semua Aplikasi Pembayaran
            </span>
            <a
              href={QRIS_STATIC_IMAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 mt-1"
            >
              <span>Buka gambar penuh</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Nominal Transfer Box */}
        <div className="w-full mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">
              Nominal Yang Harus Dibayar:
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-emerald-700">
              {formatRupiah(amount)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyAmount}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center gap-1 shadow-xs"
            title="Salin nominal transfer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>

        {/* E-Wallets & Banks Supported */}
        <div className="w-full mt-2.5 text-center">
          <div className="text-[10px] text-slate-400 font-medium mb-1">
            Menerima Pembayaran Melalui:
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold text-slate-600">
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Dana</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">GoPay</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">OVO</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">ShopeePay</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">BCA</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">BRI</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Mandiri</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">All M-Banking</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="w-full mt-3 p-2.5 bg-yellow-50 rounded-xl border border-yellow-200 text-yellow-900 text-[11px] space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-emerald-950">
            <Smartphone className="w-3.5 h-3.5 text-yellow-600" />
            <span>Cara Pembayaran QRIS:</span>
          </div>
          <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
            <li>Buka aplikasi e-Wallet atau Mobile Banking Anda.</li>
            <li>Scan kode QRIS di atas.</li>
            <li>Pastikan nama merchant: <strong>TOKO BERKAH</strong>.</li>
            <li>Masukkan nominal tepat <strong>{formatRupiah(amount)}</strong>.</li>
            <li>Simpan bukti bayar dan kirimkan via WhatsApp setelah pesanan dibuat.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
