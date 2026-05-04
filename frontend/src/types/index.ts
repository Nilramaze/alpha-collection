export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  skonto_group?: SkontoGroup | null;
  delivery_company: string | null;
  delivery_street: string | null;
  delivery_zip: string | null;
  delivery_city: string | null;
  delivery_country: string | null;
  billing_same_as_delivery: boolean;
  billing_company: string | null;
  billing_street: string | null;
  billing_zip: string | null;
  billing_city: string | null;
  billing_country: string | null;
  created_at: string;
}

export interface AddressData {
  delivery_company: string;
  delivery_street: string;
  delivery_zip: string;
  delivery_city: string;
  delivery_country: string;
  billing_same_as_delivery: boolean;
  billing_company: string;
  billing_street: string;
  billing_zip: string;
  billing_city: string;
  billing_country: string;
}

export interface SkontoGroup {
  id: number;
  name: string;
  tiers: SkontoTier[];
}

export interface SkontoTier {
  min_order_value: number;
  discount_percent: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Certificate {
  id: number;
  name: string;
  file_url: string;
  sort_order: number;
  created_at: string;
}

export interface ShippingOption {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  min_order_value: number;
  max_order_value: number | null;
  active?: boolean;
  sort_order?: number;
}

export interface Announcement {
  id: number;
  title: string;
  text: string | null;
  image_url: string | null;
  gallery_images: (string | null)[];
  title_size: string;
  text_size: string;
  background_color: string;
  enabled: boolean;
  sort_order: number;
}

export interface ProductColor {
  id: number;
  name: string;
  image_url: string | null;
  stock_quantity: number | null;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  model_number: string | null;
  size: string | null;
  height: number | null;
  colors: ProductColor[];
  sku: string | null;
  description: string | null;
  image_url: string | null;
  price: number | null;
  stock_quantity: number | null;
  stock_status: 'green' | 'yellow' | 'red' | null;
  in_stock: boolean | null;
  is_active: boolean;
  categories: Category[];
  created_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  product_color_id: number | null;
  color_name: string | null;
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
  item_count: number;
}

export interface SkontoCalculation {
  total_price: number;
  discount_percent: number;
  skonto_discount: number;
  final_price: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_color_id: number | null;
  color_name: string | null;
  product: Product;
  quantity: number;
  price_snapshot: number;
  subtotal: number;
}

export interface OrderUser {
  id: number;
  name: string;
  email: string;
  delivery_company: string | null;
  delivery_street: string | null;
  delivery_zip: string | null;
  delivery_city: string | null;
  delivery_country: string | null;
  billing_same_as_delivery: boolean;
  billing_company: string | null;
  billing_street: string | null;
  billing_zip: string | null;
  billing_city: string | null;
  billing_country: string | null;
}

export interface Order {
  id: number;
  status: 'eingegangen' | 'bearbeitet' | 'versendet' | 'bezahlt' | 'geschlossen' | 'storniert';
  status_label: string;
  total_price: number;
  skonto_discount: number;
  final_price: number;
  notes: string | null;
  shipping_name: string | null;
  shipping_price: number;
  user?: OrderUser;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  subject: string;
  content: string;
  status: 'open' | 'closed';
  status_label: string;
  admin_reply: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    next: string | null;
    prev: string | null;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface CartApiResponse {
  data: Cart;
  skonto: SkontoCalculation;
  message?: string;
}
