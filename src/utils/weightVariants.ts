import { Product } from '../types';

/**
 * Mendeteksi apakah suatu produk memiliki varian berat.
 * Menghindari produk kemasan baku (pcs, sachet, pack, botol, dll).
 */
export function isWeightVariantProduct(product: Product | null | undefined): boolean {
  if (!product) return false;
  const unit = (product.unit || '').toLowerCase().trim();

  // JIKA satuannya adalah pcs, piece, bungkus, pack, sachet, renceng, botol, kaleng, box -> BUKAN varian timbangan
  if (['pcs', 'pc', 'piece', 'pieces', 'pack', 'bungkus', 'bks', 'sachet', 'renceng', 'botol', 'btl', 'kaleng', 'box', 'dus'].includes(unit)) {
    return false;
  }

  // Jika satuannya jelas kg/kilogram/kilo
  if (unit === 'kg' || unit === 'kilogram' || unit === 'kilo') {
    // Jika produk Beras, pengguna meminta hilangkan varian 1/4 kg dan 1/2 kg (hanya dijual per kg utuh 1 kg, dsb.)
    // Kita tetap kembalikan false agar beras tidak memunculkan chip 1/4 kg atau 1/2 kg, melainkan step 1 kg
    if (isBerasProduct(product)) {
      return false;
    }
    return true;
  }

  return false;
}

export function isBerasProduct(product: Product | null | undefined): boolean {
  if (!product) return false;
  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  return name.includes('beras') || category.includes('beras');
}

export function isBawangProduct(product: Product | null | undefined): boolean {
  if (!product) return false;
  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  return name.includes('bawang') || category.includes('bawang');
}

export interface WeightVariantOption {
  value: number; // kuantitas dalam kg: 0.1, 0.25, 0.5, 1
  label: string; // '100 gr', '1/4 kg', '1/2 kg', '1 kg'
  sublabel: string; // '100 gr', '250 gr', '500 gr', '1.000 gr'
}

export const DEFAULT_WEIGHT_VARIANTS: WeightVariantOption[] = [
  { value: 0.25, label: '1/4 kg', sublabel: '250 gr' },
  { value: 0.5, label: '1/2 kg', sublabel: '500 gr' },
  { value: 1.0, label: '1 kg', sublabel: '1.000 gr' },
];

export const BAWANG_WEIGHT_VARIANTS: WeightVariantOption[] = [
  { value: 0.1, label: '100 gr', sublabel: '100 gr' },
  { value: 0.25, label: '1/4 kg', sublabel: '250 gr' },
  { value: 0.5, label: '1/2 kg', sublabel: '500 gr' },
  { value: 1.0, label: '1 kg', sublabel: '1.000 gr' },
];

/**
 * Mengambil daftar varian berat berdasarkan jenis produk:
 * - Produk Bawang: 100 gr, 1/4 kg (250 gr), 1/2 kg (500 gr), 1 kg
 * - Produk Beras: Tidak ada varian pecahan (dijual utuh 1 kg / per kg)
 * - Produk Timbangan Lain (Tepung, Gula, Cabai, Telur, dll): 1/4 kg, 1/2 kg, 1 kg
 */
export function getProductWeightVariants(product: Product | null | undefined): WeightVariantOption[] {
  if (!product) return [];
  if (isBerasProduct(product)) {
    return [];
  }
  if (isBawangProduct(product)) {
    return BAWANG_WEIGHT_VARIANTS;
  }
  return DEFAULT_WEIGHT_VARIANTS;
}

export const WEIGHT_VARIANTS: WeightVariantOption[] = DEFAULT_WEIGHT_VARIANTS;

/**
 * Menghitung subtotal dengan aturan pembulatan ke atas untuk pembelian di bawah 1 kg.
 * Sesuai aturan pasar/warung tradisional:
 * Misalnya harga 1 kg = Rp 15.000.
 * Pembelian 1/4 kg (0.25 kg) = 15.000 * 0.25 = 3.750 -> dibulatkan ke atas menjadi Rp 4.000.
 * Pembelian 100 gr (0.1 kg) = 15.000 * 0.1 = 1.500.
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

  // Pembelian di bawah 1 kg (misal 0.1 kg, 0.25 kg, atau 0.5 kg)
  if (cleanQty < 1) {
    const raw = basePrice * cleanQty;
    // Pembulatan ke atas ke kelipatan 500 terdekat
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
 * Menghitung harga untuk varian berat tertentu (misal 0.1, 0.25 atau 0.5 kg)
 */
export function getVariantPrice(product: Product, variantValue: number): number {
  return calculateItemSubtotal(product, variantValue);
}
