export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  specifications: Record<string, string> | null;
  price: number;
  sale_price: number | null;
  category_id: string | null;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  is_new: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
  is_active: boolean;
  rating: number;
  review_count: number;
  sort_order: number;
  created_at: string;
  category?: Category | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
};

export type SiteSettings = {
  id: number;
  logo_url: string | null;
  favicon_url: string | null;
  brand_name: string;
  brand_tagline: string;
  primary_color: string;
  accent_color: string;
  announcement_text: string;
  announcement_enabled: boolean;
  search_placeholder: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string;
  country: string;
  business_hours: string;
  google_maps_embed: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  linkedin_url: string | null;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  google_analytics_id: string | null;
  meta_pixel_id: string | null;
  gtm_id: string | null;
  copyright_text: string;
  free_shipping_threshold: number;
  shipping_flat_rate: number;
};

export type HomepageSlide = {
  id: string;
  image_url: string;
  heading: string;
  subheading: string | null;
  button_text: string | null;
  button_link: string | null;
  sort_order: number;
  is_active: boolean;
};

export type HomepageSection = {
  id: string;
  section_type: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  sort_order: number;
  is_active: boolean;
};

export type AboutContent = {
  id: number;
  heading: string;
  description: string | null;
  image_url: string | null;
  image_url_2: string | null;
  mission: string | null;
  vision: string | null;
  values: { title: string; description: string }[];
  timeline: { year: string; title: string; description: string }[];
  seo_title: string | null;
  seo_description: string | null;
};

export type ContactContent = {
  id: number;
  heading: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  business_hours: string | null;
  google_maps_embed: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  linkedin_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

export type HeaderConfig = {
  id: number;
  nav_items: { label: string; to: string }[];
  show_search: boolean;
  show_wishlist: boolean;
  show_cart: boolean;
  show_account: boolean;
  sticky_header: boolean;
};

export type FooterConfig = {
  id: number;
  description: string | null;
  quick_links: { label: string; to: string }[];
  social_links: { icon: string; url: string }[];
  payment_icons: string[];
  newsletter_title: string;
  newsletter_description: string;
  copyright_text: string;
};

export type PageContent = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
};

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
};

export type MediaFile = {
  id: string;
  url: string;
  filename: string;
  folder: string;
  file_size: number;
  mime_type: string | null;
  created_at: string;
};

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  billing_address: Address;
  shipping_address: Address;
  order_notes: string | null;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  payment_method: 'cod' | 'bank_transfer' | 'online';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  coupon_code: string | null;
  currency: string;
  created_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  color: string | null;
  size: string | null;
};

export type Address = {
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

export type Review = {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  image_url: string | null;
  is_approved: boolean;
  created_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'admin' | 'customer';
  created_at: string;
};

export type CartItem = {
  product_id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  sale_price: number | null;
  quantity: number;
  color: string | null;
  size: string | null;
  stock: number;
};

export type Currency = {
  code: string;
  symbol: string;
  rate: number;
  label: string;
};

export const CURRENCIES: Currency[] = [
  { code: 'PKR', symbol: 'Rs.', rate: 1, label: 'PKR' },
  { code: 'USD', symbol: '$', rate: 0.0036, label: 'USD' },
  { code: 'EUR', symbol: '€', rate: 0.0033, label: 'EUR' },
  { code: 'GBP', symbol: '£', rate: 0.0028, label: 'GBP' },
  { code: 'AED', symbol: 'AED', rate: 0.013, label: 'AED' },
];
