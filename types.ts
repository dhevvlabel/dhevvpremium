export type Category = 'All' | 'Streaming' | 'Music' | 'Design' | 'Productivity' | 'Other';

export interface Variant {
  type: string;
  duration: string;
  price: number;
  note?: string;
}

export interface Product {
  id?: string;
  appName: string;
  category: Category;
  variants: Variant[];
  tags?: string[];
  sort_order?: number;
  icon_url?: string; // <--- PASTIKAN BARIS INI ADA
}

export interface CartItem {
  id: string;
  product: Product;
  selectedVariantIndex: number;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  timestamp?: number;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Processing' | 'Completed';
  paymentProof?: string; // Base64 or URL placeholder
}

export interface User {
  name: string;
  email: string;
  phoneNumber?: string;
  memberSince: string;
  password?: string; // Added for password change simulation
  avatarColor?: string; // Added for visual customization
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'info';
}

export interface Voucher {
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  applicableProduct: string; // 'all' or specific product name
  isActive: boolean;
}

export type Theme = 'light' | 'dark';