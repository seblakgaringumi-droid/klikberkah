export interface Product {
  id: string;
  name: string;
  category: string;
  cost_price: number;
  selling_price: number;
  stock_kg: number;
  min_stock?: number;
  is_active: boolean;
  image_url?: string | null;
  unit: string;
  variants_json?: unknown[];
  barcode?: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
  unit: string;
  notes?: string;
}

export type DeliveryType = 'DELIVERY' | 'PICKUP';

export type PaymentMethod = 
  | 'COD (Bayar di Tempat / Tunai)'
  | 'QRIS / Non-Tunai'
  | 'COD (Bayar di Tempat)'
  | 'Transfer Bank / QRIS'
  | 'Transfer Bank'
  | 'Utang / Bon Pelanggan';

export interface OrderItemJson {
  product_id?: string;
  product_name: string;
  unit: string;
  quantity: number;
  price?: number;
  subtotal: number;
}

export interface OnlineOrder {
  id?: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items_json: OrderItemJson[];
  total_amount: number;
  payment_method: string;
  status: 'PENDING' | 'DIPROSES' | 'SELESAI' | 'DIBATALKAN' | string;
  created_at?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CustomerProfile {
  id: number;
  phone: string;
  full_name: string;
  name?: string;
  address: string;
  created_at?: string;
}

export type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'name_asc' | 'stock_desc';
