import { useEffect, useState, useRef } from 'react';
import { Save, Upload, Loader2, Building2, Mail, Share2, Search, Truck, ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import type { SiteSettings } from '@/lib/types';

type FormState = Omit<SiteSettings, 'id'>;

const emptyForm: FormState = {
  logo_url: '',
  favicon_url: '',
  brand_name: '',
  brand_tagline: '',
  primary_color: '#d4af37',
  accent_color: '#d4af37',
  announcement_text: '',
  announcement_enabled: false,
  search_placeholder: 'Search products...',
  contact_email: '',
  contact_phone: '',
  whatsapp_number: '',
  address_line1: '',
  address_line2: '',
  city: '',
  country: '',
  business_hours: '',
  google_maps_embed: '',
  instagram_url: '',
  facebook_url: '',
  twitter_url: '',
  youtube_url: '',
  tiktok_url: '',
  linkedin_url: '',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  google_analytics_id: '',
  meta_pixel_id: '',
  gtm_id: '',
  copyright_text: '',
  free_shipping_threshold: 0,
  shipping_flat_rate: 0,
};

export function AdminSettings() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'favicon' | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (error) toast(error.message, 'error');
    if (data) setForm({ ...emptyForm, ...(data as SiteSettings) });
    setLoading(false);
  };

  useEffect(() => { load();   }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const uploadImage = async (file: File, field: 'logo_url' | 'favicon_url') => {
    setUploading(field === 'logo_url' ? 'logo' : 'favicon');
    const ext = file.name.split('.').pop() ?? 'png';
    const fileName = `${field}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, file, { cacheControl: '3600' });
    if (error) {
      toast(`Upload failed: ${error.message}`, 'error');
    } else {
      const { data: url } = supabase.storage.from('product-images').getPublicUrl(fileName);
      set(field, url.publicUrl);
      toast(`${field === 'logo_url' ? 'Logo' : 'Favicon'} uploaded`, 'success');
    }
    setUploading(null);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('site_settings').upsert({ ...form, id: 1 }).eq('id', 1);
    if (error) toast(error.message, 'error');
    else toast('Settings saved', 'success');
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 skeleton" />)}
      </div>
    );
  }

  const input = 'input !py-2 text-sm';

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-medium text-gold-gradient">Site Settings</h1>
      </div>

      {/* Brand */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-lux p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 width={18} height={18} className="text-gold-400" />
          <h2 className="font-serif text-lg font-medium text-accent">Brand</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <label className="label">Logo</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                {form.logo_url ? <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain" /> : <ImageIcon width={20} height={20} className="text-white/30" />}
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], 'logo_url')} />
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={uploading === 'logo'} onClick={() => logoInputRef.current?.click()} className="btn-dark !py-2 !text-xs flex items-center gap-2">
                {uploading === 'logo' ? <Loader2 width={14} height={14} className="animate-spin" /> : <Upload width={14} height={14} />} Upload
              </motion.button>
              {form.logo_url && <button type="button" onClick={() => set('logo_url', '')} className="p-1.5 hover:bg-rose-500/10 text-rose-500 transition-colors"><X width={14} height={14} /></button>}
            </div>
            <input value={form.logo_url ?? ''} onChange={(e) => set('logo_url', e.target.value)} placeholder="Logo URL" className={input + ' mt-2'} />
          </div>
          <div>
            <label className="label">Favicon</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                {form.favicon_url ? <img src={form.favicon_url} alt="Favicon" className="w-full h-full object-contain" /> : <ImageIcon width={20} height={20} className="text-white/30" />}
              </div>
              <input ref={faviconInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], 'favicon_url')} />
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={uploading === 'favicon'} onClick={() => faviconInputRef.current?.click()} className="btn-dark !py-2 !text-xs flex items-center gap-2">
                {uploading === 'favicon' ? <Loader2 width={14} height={14} className="animate-spin" /> : <Upload width={14} height={14} />} Upload
              </motion.button>
              {form.favicon_url && <button type="button" onClick={() => set('favicon_url', '')} className="p-1.5 hover:bg-rose-500/10 text-rose-500 transition-colors"><X width={14} height={14} /></button>}
            </div>
            <input value={form.favicon_url ?? ''} onChange={(e) => set('favicon_url', e.target.value)} placeholder="Favicon URL" className={input + ' mt-2'} />
          </div>
          <div><label className="label">Brand Name</label><input value={form.brand_name} onChange={(e) => set('brand_name', e.target.value)} className={input} /></div>
          <div><label className="label">Brand Tagline</label><input value={form.brand_tagline} onChange={(e) => set('brand_tagline', e.target.value)} className={input} /></div>
          <div><label className="label">Search Placeholder</label><input value={form.search_placeholder} onChange={(e) => set('search_placeholder', e.target.value)} className={input} /></div>
          <div><label className="label">Copyright Text</label><input value={form.copyright_text} onChange={(e) => set('copyright_text', e.target.value)} className={input} /></div>
          <div className="lg:col-span-2">
            <label className="label">Announcement</label>
            <div className="flex items-center gap-3 mb-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer text-accent">
                <input type="checkbox" checked={form.announcement_enabled} onChange={(e) => set('announcement_enabled', e.target.checked)} className="accent-gold-400" /> Enabled
              </label>
            </div>
            <input value={form.announcement_text} onChange={(e) => set('announcement_text', e.target.value)} placeholder="Announcement text" className={input} />
          </div>
        </div>
      </motion.section>

      {/* Contact */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-lux p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Mail width={18} height={18} className="text-gold-400" />
          <h2 className="font-serif text-lg font-medium text-accent">Contact</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div><label className="label">Contact Email</label><input value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} className={input} /></div>
          <div><label className="label">Contact Phone</label><input value={form.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} className={input} /></div>
          <div><label className="label">WhatsApp Number</label><input value={form.whatsapp_number} onChange={(e) => set('whatsapp_number', e.target.value)} className={input} /></div>
          <div><label className="label">Business Hours</label><input value={form.business_hours} onChange={(e) => set('business_hours', e.target.value)} className={input} /></div>
          <div><label className="label">Address Line 1</label><input value={form.address_line1 ?? ''} onChange={(e) => set('address_line1', e.target.value)} className={input} /></div>
          <div><label className="label">Address Line 2</label><input value={form.address_line2 ?? ''} onChange={(e) => set('address_line2', e.target.value)} className={input} /></div>
          <div><label className="label">City</label><input value={form.city} onChange={(e) => set('city', e.target.value)} className={input} /></div>
          <div><label className="label">Country</label><input value={form.country} onChange={(e) => set('country', e.target.value)} className={input} /></div>
          <div className="lg:col-span-2"><label className="label">Google Maps Embed (iframe src or full HTML)</label><textarea rows={3} value={form.google_maps_embed ?? ''} onChange={(e) => set('google_maps_embed', e.target.value)} className="input resize-none text-xs font-mono" /></div>
        </div>
      </motion.section>

      {/* Social */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-lux p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Share2 width={18} height={18} className="text-gold-400" />
          <h2 className="font-serif text-lg font-medium text-accent">Social</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div><label className="label">Instagram URL</label><input value={form.instagram_url ?? ''} onChange={(e) => set('instagram_url', e.target.value)} className={input} /></div>
          <div><label className="label">Facebook URL</label><input value={form.facebook_url ?? ''} onChange={(e) => set('facebook_url', e.target.value)} className={input} /></div>
          <div><label className="label">Twitter / X URL</label><input value={form.twitter_url ?? ''} onChange={(e) => set('twitter_url', e.target.value)} className={input} /></div>
          <div><label className="label">YouTube URL</label><input value={form.youtube_url ?? ''} onChange={(e) => set('youtube_url', e.target.value)} className={input} /></div>
          <div><label className="label">TikTok URL</label><input value={form.tiktok_url ?? ''} onChange={(e) => set('tiktok_url', e.target.value)} className={input} /></div>
          <div><label className="label">LinkedIn URL</label><input value={form.linkedin_url ?? ''} onChange={(e) => set('linkedin_url', e.target.value)} className={input} /></div>
        </div>
      </motion.section>

      {/* SEO */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-lux p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Search width={18} height={18} className="text-gold-400" />
          <h2 className="font-serif text-lg font-medium text-accent">SEO & Analytics</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div><label className="label">SEO Title</label><input value={form.seo_title} onChange={(e) => set('seo_title', e.target.value)} className={input} /></div>
          <div><label className="label">SEO Keywords</label><input value={form.seo_keywords} onChange={(e) => set('seo_keywords', e.target.value)} className={input} /></div>
          <div className="lg:col-span-2"><label className="label">SEO Description</label><textarea rows={2} value={form.seo_description} onChange={(e) => set('seo_description', e.target.value)} className="input resize-none" /></div>
          <div><label className="label">Google Analytics ID</label><input value={form.google_analytics_id ?? ''} onChange={(e) => set('google_analytics_id', e.target.value)} placeholder="G-XXXXXXX" className={input} /></div>
          <div><label className="label">Meta Pixel ID</label><input value={form.meta_pixel_id ?? ''} onChange={(e) => set('meta_pixel_id', e.target.value)} placeholder="1234567890" className={input} /></div>
          <div><label className="label">GTM ID</label><input value={form.gtm_id ?? ''} onChange={(e) => set('gtm_id', e.target.value)} placeholder="GTM-XXXXXXX" className={input} /></div>
        </div>
      </motion.section>

      {/* Shipping */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-lux p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Truck width={18} height={18} className="text-gold-400" />
          <h2 className="font-serif text-lg font-medium text-accent">Shipping</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div><label className="label">Free Shipping Threshold</label><input type="number" value={form.free_shipping_threshold} onChange={(e) => set('free_shipping_threshold', Number(e.target.value))} className={input} /></div>
          <div><label className="label">Shipping Flat Rate</label><input type="number" value={form.shipping_flat_rate} onChange={(e) => set('shipping_flat_rate', Number(e.target.value))} className={input} /></div>
        </div>
      </motion.section>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-ink/90 backdrop-blur-xl border-t border-gold-400/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-xs text-white/40">Changes are saved to the live site settings.</p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={saving} onClick={save} className="btn-primary">
            {saving ? <Loader2 width={16} height={16} className="animate-spin" /> : <Save width={16} height={16} />} Save Settings
          </motion.button>
        </div>
      </div>
    </div>
  );
}
