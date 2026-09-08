import { CartItem, DeliveryType, PaymentMethod } from '../types';
import { formatRupiah, formatQty } from './formatters';

export const STORE_PHONE = '085294996696';
export const STORE_PHONE_INTL = '6285294996696';
export const STORE_NAME = 'Toko Berkah';
export const STORE_ADDRESS = 'Jalan Kalapanunggal I, Sebrang Masjid Al-Falah, Sindangkasih, Ciamis';

export interface WhatsAppOrderPayload {
  orderId?: number | string;
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  deliveryAddress: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  totalAmount: number;
  notes?: string;
}

export function generateWhatsAppOrderMessage(payload: WhatsAppOrderPayload): string {
  const {
    orderId,
    customerName,
    customerPhone,
    deliveryType,
    deliveryAddress,
    paymentMethod,
    items,
    totalAmount,
    notes,
  } = payload;

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const orderCode = orderId ? `#TB-${String(orderId).padStart(4, '0')}` : `#TB-${Date.now().toString().slice(-4)}`;

  const serviceLabel = deliveryType === 'DELIVERY' 
    ? '🛵 Pesan-Antar / Delivery (COD)' 
    : '🏪 Ambil Langsung di Toko (Pick-Up)';

  const itemsList = items
    .map((item, idx) => {
      const qtyStr = formatQty(item.quantity, item.unit);
      return `${idx + 1}. *${item.product.name}* (${qtyStr}) = ${formatRupiah(item.subtotal)}`;
    })
    .join('\n');

  let text = `*PESANAN BARU - ${STORE_NAME.toUpperCase()}* 🛒\n`;
  text += `*No. Pesanan:* ${orderCode}\n`;
  text += `*Waktu:* ${dateStr} WIB\n`;
  text += `*Alamat Toko:* ${STORE_ADDRESS}\n`;
  text += `-----------------------------------------\n`;
  text += `*DATA PELANGGAN:*\n`;
  text += `👤 *Nama:* ${customerName}\n`;
  text += `📞 *No. WA:* ${customerPhone}\n`;
  text += `📦 *Layanan:* ${serviceLabel}\n`;
  if (deliveryType === 'DELIVERY') {
    text += `📍 *Alamat Pengantaran:* ${deliveryAddress}\n`;
  } else {
    text += `📍 *Lokasi Ambil di Toko:* ${STORE_ADDRESS}\n`;
  }
  text += `💳 *Pembayaran:* ${paymentMethod}\n`;
  text += `-----------------------------------------\n`;
  text += `*RINCIAN BARANG:*\n`;
  text += `${itemsList}\n`;
  text += `-----------------------------------------\n`;
  text += `💰 *TOTAL TAGIHAN: ${formatRupiah(totalAmount)}*\n`;
  if (notes && notes.trim().length > 0) {
    text += `📝 *Catatan:* ${notes.trim()}\n`;
  }
  text += `-----------------------------------------\n`;

  const isQris = paymentMethod.toUpperCase().includes('QRIS');
  const isTransfer = paymentMethod.toUpperCase().includes('TRANSFER');
  if (isQris) {
    text += `📲 *PETUNJUK PEMBAYARAN QRIS:*\n`;
    text += `1. Nominal Transfer: *${formatRupiah(totalAmount)}*\n`;
    text += `2. Scan QRIS Toko Berkah di WebApp atau minta gambar barcode QRIS di chat ini.\n`;
    text += `3. Menerima Dana, GoPay, OVO, ShopeePay, BCA, BRI, Mandiri & Seluruh M-Banking.\n`;
    text += `4. 📸 *PENTING:* Mohon kirimkan foto/tangkapan layar (screenshot) bukti transfer ke chat ini agar kasir dapat segera memproses pesanan Anda.\n`;
    text += `-----------------------------------------\n`;
  } else if (isTransfer) {
    text += `🏦 *PETUNJUK TRANSFER BANK:*\n`;
    text += `1. Bank: *BRI (Bank Rakyat Indonesia)*\n`;
    text += `2. No. Rekening: *0145-01-002345-53-1*\n`;
    text += `3. Atas Nama: *TOKO BERKAH*\n`;
    text += `4. Nominal Transfer: *${formatRupiah(totalAmount)}*\n`;
    text += `5. 📸 *PENTING:* Kirimkan bukti struk/screenshot transfer ke chat ini agar pesanan segera disiapkan.\n`;
    text += `-----------------------------------------\n`;
  } else {
    text += `💵 *PETUNJUK PEMBAYARAN COD:*\n`;
    text += `Silakan siapkan uang tunai pas sebesar *${formatRupiah(totalAmount)}* saat barang sampai / saat diambil di toko.\n`;
    text += `-----------------------------------------\n`;
  }

  text += `Halo Toko Berkah, saya sudah buat pesanan ini melalui aplikasi WebApp Toko Berkah. Mohon segera dicek dan diproses ya. Terima kasih! 🙏`;

  return text;
}

export function openWhatsAppOrder(payload: WhatsAppOrderPayload): void {
  const text = generateWhatsAppOrderMessage(payload);
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/${STORE_PHONE_INTL}?text=${encodedText}`;
  window.open(url, '_blank');
}
