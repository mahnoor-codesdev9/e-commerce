import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/lib/types';

type SettingsContextType = {
  settings: SiteSettings | null;
  loading: boolean;
};

const defaultSettings: SiteSettings = {
  id: 1,
  logo_url: null,
  favicon_url: '/favicon.svg',
  brand_name: 'OutreX Fashion',
  brand_tagline: 'Luxury Fashion & Accessories',
  primary_color: '#000000',
  accent_color: '#D4AF37',
  announcement_text: 'Free shipping on orders over Rs. 15,000 — Crafted for the modern wardrobe',
  announcement_enabled: true,
  search_placeholder: 'Search for products...',
  contact_email: 'bhattihashir102@gmail.com',
  contact_phone: '03174120995',
  whatsapp_number: '923174120995',
  address_line1: null,
  address_line2: null,
  city: 'Pakistan',
  country: 'Pakistan',
  business_hours: 'Mon - Sat: 9AM - 9PM',
  google_maps_embed: null,
  instagram_url: null,
  facebook_url: null,
  twitter_url: null,
  youtube_url: null,
  tiktok_url: null,
  linkedin_url: null,
  seo_title: 'OutreX Fashion — Luxury Fashion, Watches & Accessories',
  seo_description: 'Premium watches, t-shirts, trousers and caps crafted for the modern wardrobe.',
  seo_keywords: 'luxury fashion, watches, t-shirts, trousers, caps, OutreX, premium accessories',
  google_analytics_id: null,
  meta_pixel_id: null,
  gtm_id: null,
  copyright_text: 'OutreX Fashion. All rights reserved.',
  free_shipping_threshold: 15000,
  shipping_flat_rate: 100,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings(data as SiteSettings);
        setLoading(false);
      });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
