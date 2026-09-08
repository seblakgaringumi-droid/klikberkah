import { Product } from '../types';

/**
 * Mendeteksi apakah suatu produk memiliki varian berat (1/4 kg, 1/2 kg, 1 kg)
 * Mencakup produk dengan satuan 'kg' serta bahan pokok seperti tepung, bawang, gula, beras, cabai, telur, dll.
 */
export function isWeightVariantProduct(product: Product | null | undefined): boolean {
  if (!product) return false;
  const unit = (product.unit || '').toLowerCase().trim();

  // JIKA satuannya adalah pcs, piece, bungkus, pack, sachet, renceng, botol, kaleng, box -> BUKAN varian KG
  if (['pcs', 'pc', 'piece', 'pieces', 'pack', 'bungkus', 'bks', 'sachet', 'renceng', 'botol', 'btl', 'kaleng', 'box', 'dus'].includes(unit)) {
    return false;
  }

  // Hanya jika satuannya jelas kg/kilogram/kilo, ATAU satuan kosong tapi namanya curah timbangan
  if (unit === 'kg' || unit === 'kilogram' || unit === 'kilo') {
    return true;
  }

  return false;
}

export interface WeightVariantOption {
  value: number; // kuantitas dalam kg: 0.25, 0.5, 1
  label: string; // '1/4 kg', '1/2 kg', '1 kg'
  sublabel: string; // '250 gr', '500 gr', '1000 gr'
}

export const WEIGHT_VARIANTS: WeightVariantOption[] = [
  { value: 0.25, label: '1/4 kg', sublabel: '250 gr' },
  { value: 0.5, label: '1/2 kg', sublabel: '500 gr' },
  { value: 1.0, label: '1 kg', sublabel: '1.000 gr' },
];

/**
 * Menghitung subtotal dengan aturan pembulatan ke atas untuk pembelian di bawah 1 kg.
 * Sesuai aturan pasar/warung tradisional:
 * Misalnya harga 1 kg = Rp 15.000.
 * Pembelian 1/4 kg (0.25 kg) = 15.000 * 0.25 = 3.750 -> dibulatkan ke atas menjadi Rp 4.000.
 * Dibulatkan ke kelipatan Rp 500 terdekat ke atas.
 */
export function calculateItemSubtotal(product: Product, quantity: number): number {
  if (!product) return 0;
  const cleanQty = Number(quantity) || 0;
  if (cleanQty <= 0) return 0;

  const isWeight = isWeightVariantProduct(product);
  const basePrice = Number(product.selling_price) || 0;

  if (!isWeight) {
    return Math.round(cleanQty * basePrice);
  }

  // Pembelian di bawah 1 kg (misal 0.25 kg atau 0.5 kg)
  if (cleanQty < 1) {
    const raw = basePrice * cleanQty;
    // Pembulatan ke atas ke kelipatan 500 terdekat
    // Contoh: 3.750 / 500 = 7.5 -> Math.ceil(7.5) = 8 -> 8 * 500 = 4.000
    return Math.ceil(raw / 500) * 500;
  }

  // Pembelian 1 kg ke atas
  const whole = Math.floor(cleanQty);
  const frac = Math.round((cleanQty - whole) * 100) / 100;
  const wholePrice = whole * basePrice;
  const fracPrice = frac > 0 ? Math.ceil((frac * basePrice) / 500) * 500 : 0;

  return wholePrice + fracPrice;
}

/**
 * Menghitung harga untuk varian berat tertentu (misal 0.25 atau 0.5 kg)
 */
export function getVariantPrice(product: Product, variantValue: number): number {
  return calculateItemSubtotal(product, variantValue);
}
