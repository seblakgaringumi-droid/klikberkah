import React from 'react';
import { X, MapPin, Phone, Clock, Store, Navigation, CheckCircle2, MessageSquare, Copy, Check } from 'lucide-react';
import { STORE_NAME, STORE_ADDRESS, STORE_PHONE, STORE_PHONE_INTL } from '../utils/whatsapp';

interface StoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreInfoModal: React.FC<StoreInfoModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(STORE_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMaps = () => {
    const query = encodeURIComponent(`${STORE_NAME} ${STORE_ADDRESS}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleOpenWA = () => {
    const text = encodeURIComponent(
      `Halo ${STORE_NAME}, saya ingin bertanya mengenai lokasi toko / ketersediaan barang. Terima kasih!`
    );
    window.open(`https://wa.me/${STORE_PHONE_INTL}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400 text-emerald-950 flex items-center justify-center font-black text-sm border-2 border-yellow-300 shadow-sm">
              TB
            </div>
            <div>
              <h2 className="font-['Outfit',sans-serif] font-black text-lg text-white">
                Informasi Resmi Toko
              </h2>
              <p className="text-xs text-emerald-100">
                Toko Berkah Sindangkasih, Ciamis
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

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          {/* Main Address Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Alamat Lengkap Toko
                </div>
                <div className="font-extrabold text-sm text-slate-900 leading-snug">
                  {STORE_ADDRESS}
                </div>
                <div className="inline-flex items-center gap-1.5 bg-yellow-100 text-emerald-900 px-2 py-0.5 rounded-md font-bold text-[10px]">
                  <span>Patokan: Sebrang Masjid Al-Falah Sindangkasih</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={handleCopyAddress}
                className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition flex items-center justify-center gap-1.5 text-xs shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin Alamat</span>
                  </>
                )}
              </button>

              <button
                onClick={handleOpenMaps}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-bold transition flex items-center justify-center gap-1.5 text-xs shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                <span>Buka Peta</span>
              </button>
            </div>
          </div>

          {/* Operational Hours & Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Jam Buka</span>
              </div>
              <div className="font-bold text-slate-900 text-xs">
                Setiap Hari
              </div>
              <div className="text-[11px] text-emerald-700 font-mono font-bold">
                06.00 - 21.00 WIB
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Kasir</span>
              </div>
              <div className="font-bold text-slate-900 text-xs">
                Respon Cepat
              </div>
              <div className="text-[11px] text-emerald-700 font-mono font-bold">
                {STORE_PHONE}
              </div>
            </div>
          </div>

          {/* Services Available */}
          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 space-y-1.5">
            <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Layanan Pelanggan Toko Berkah:</span>
            </div>
            <ul className="text-[11px] text-emerald-800 space-y-1 pl-5 list-disc">
              <li>Pesan-Antar (Delivery COD) langsung ke rumah warga Sindangkasih.</li>
              <li>Belanja Langsung & Ambil di Toko (Pick-Up) tanpa perlu antre.</li>
              <li>Pembayaran fleksibel: Uang Tunai / QRIS / Bon Pelanggan Terdaftar.</li>
            </ul>
          </div>

          {/* Action button */}
          <button
            onClick={handleOpenWA}
            className="w-full py-3 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-emerald-950" />
            <span>HUBUNGI KASIR VIA WHATSAPP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
