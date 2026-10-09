import { Product, ProductVariant } from '../types';

/**
 * Mengambil daftar varian produk sesuai pengaturan di Katalog Kasir Toko Berkah.
 * Membaca product.variants atau product.variants_json dari database Supabase.
 */
export function getProductVariants(product: Product | null | undefined): ProductVariant[] {
  if (!product) return [];

  let rawList: unknown[] = [];
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    rawList = product.variants;
  } else if (typeof product.variants === 'string') {
    try {
      const parsed = JSON.parse(product.variants as string);
      if (Array.isArray(parsed)) rawList = parsed;
    } catch {}
  }

  if (rawList.length === 0) {
    if (Array.isArray(product.variants_json) && product.variants_json.length > 0) {
      rawList = product.variants_json;
    } else if (typeof product.variants_json === 'string') {
      try {
        const parsed = JSON.parse(product.variants_json as string);
        if (Array.isArray(parsed)) rawList = parsed;
      } catch {}
    }
  }

  const valid: ProductVariant[] = rawList
    .filter((v): v is Record<string, unknown> => typeof v === 'object' && v !== null)
    .filter((v) => typeof v.name === 'string' && v.name.trim() !== '' && Number(v.price) > 0)
    .map((v) => ({
      name: String(v.name).trim(),
      price: Number(v.price),
      weight: v.weight !== undefined && v.weight !== null ? Number(v.weight) : undefined,
    }));

  if (valid.length === 0) return [];

  // Urutkan varian: bobot terendah ke tertinggi (misal Saons -> Saparapat -> Satengah -> Sakilo)
  // Jika bobot sama atau tidak ada, urutkan berdasarkan harga terendah ke tertinggi
  return valid.sort((a, b) => {
    const wA = a.weight ?? 0;
    const wB = b.weight ?? 0;
    if (wA > 0 && wB > 0 && wA !== wB) {
      return wA - wB;
    }
    return a.price - b.price;
  });
}

/**
 * Mengecek apakah produk memiliki varian resmi dari Kasir
 */
export function hasProductVariants(product: Product | null | undefined): boolean {
  return getProductVariants(product).length > 0;
}

/**
 * Mendeteksi apakah produk memiliki varian berat (dari Kasir atau satuan kg)
 */
export function isWeightVariantProduct(product: Product | null | undefined): boolean {
  if (!product) return false;
  if (hasProductVariants(product)) return true;
  const unit = (product.unit || '').toLowerCase().trim();
  return unit === 'kg' || unit === 'kilogram' || unit === 'kilo';
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

/**
 * Format sublabel takaran / bobot varian:
 * Contoh: 0.065 kg -> "65 gr (~1 butir)"
 *         0.1 kg   -> "100 gr"
 *         0.25 kg  -> "250 gr"
 *         0.5 kg   -> "500 gr"
 *         1 kg     -> "1 kg"
 *         1.5 kg   -> "1.5 kg"
 *         2 kg     -> "2 kg"
 */
export function formatVariantSublabel(variant: ProductVariant | null | undefined, baseUnit = 'kg'): string {
  if (!variant || variant.weight === undefined || variant.weight === null || variant.weight <= 0) {
    return '';
  }
  const w = variant.weight;
  const lowerName = variant.name.toLowerCase();
  if (lowerName.includes('butir') || lowerName.includes('satuan')) {
    return `${Math.round(w * 1000)} gr (~1 butir)`;
  }
  if (w >= 1) {
    return `${w} ${baseUnit}`;
  }
  const grams = Math.round(w * 1000);
  return `${grams} gr`;
}

export interface WeightVariantOption {
  value: number; // kuantitas atau bobot dalam kg
  label: string; // nama varian kasir atau '1/4 kg'
  sublabel: string; // takaran '250 gr', '500 gr', dll
  price?: number; // harga pasti varian kasir
  rawVariant?: ProductVariant;
}

/**
 * Mengambil daftar varian untuk ditampilkan di UI.
 * Mengutamakan 100% varian dari Kasir POS!
 */
export function getProductWeightVariants(product: Product | null | undefined): WeightVariantOption[] {
  if (!product) return [];

  const kasirVariants = getProductVariants(product);
  if (kasirVariants.length > 0) {
    return kasirVariants.map((v) => ({
      value: v.weight && v.weight > 0 ? v.weight : 1,
      label: v.name,
      sublabel: formatVariantSublabel(v, product.unit || 'kg'),
      price: v.price,
      rawVariant: v,
    }));
  }

  // Fallback untuk produk kg tanpa varian spesifik (misal Beras Gunung Cupu)
  const unit = (product.unit || '').toLowerCase().trim();
  if (unit === 'kg' || unit === 'kilogram' || unit === 'kilo') {
    return [
      { value: 1.0, label: '1 kg', sublabel: '1.000 gr', price: product.selling_price },
    ];
  }

  return [];
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

export const WEIGHT_VARIANTS: WeightVariantOption[] = DEFAULT_WEIGHT_VARIANTS;

/**
 * Menghitung subtotal dengan akurat:
 * - Jika menggunakan varian Kasir: subtotal = qty * variant.price
 * - Jika produk biasa: subtotal = qty * product.selling_price
 */
export function calculateItemSubtotal(
  product: Product,
  quantity: number,
  variant?: ProductVariant | null
): number {
  if (!product) return 0;
  const cleanQty = Number(quantity) || 0;
  if (cleanQty <= 0) return 0;

  if (variant && Number(variant.price) > 0) {
    return Math.round(cleanQty * Number(variant.price));
  }

  // Cek apakah ada varian kasir yang cocok berdasarkan weight
  const kasirVariants = getProductVariants(product);
  if (kasirVariants.length > 0) {
    const matched = kasirVariants.find((v) => v.weight !== undefined && Math.abs(v.weight - cleanQty) < 0.001);
    if (matched && Number(matched.price) > 0) {
      return Number(matched.price);
    }
  }

  const basePrice = Number(product.selling_price) || 0;
  return Math.round(cleanQty * basePrice);
}

export function getVariantPrice(
  product: Product,
  _variantValue?: number,
  variant?: ProductVariant | null
): number {
  return calculateItemSubtotal(product, 1, variant);
}
