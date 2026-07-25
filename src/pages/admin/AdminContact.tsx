import { useEffect, useState } from 'react';
import { Save, Loader2, Mail, Phone, MessageCircle, Clock, MapPin, Share2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import type { ContactContent } from '@/lib/types';

type FormState = {
  heading: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  business_hours: string;
  google_maps_embed: string;
  instagram_url: string;
  facebook_url: string;
  twitter_url: string;
  youtube_url: string;
  tiktok_url: string;
  linkedin_url: string;
  seo_title: string;
  seo_description: string;
};

const emptyForm: FormState = {
  heading: '',
  description: '',
  address: '',
  phone: '',
  whatsapp: '',
  email: '',
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
};

export function AdminContact() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('contact_content').select('*').eq('id', 1).maybeSingle();
    if (error) toast(error.message, 'error');
    if (data) setForm({ ...emptyForm, ...(data as ContactContent) } as unknown as FormState);
    setLoading(false);
  };

  useEffect(() => { load();   }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    const payload = {
      heading: form.heading,
      description: form.description || null,
      address: form.address || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      email: form.email || null,
      business_hours: form.business_hours || null,
      google_maps_embed: form.google_maps_embed || null,
      instagram_url: form.instagram_url || null,
      facebook_url: form.facebook_url || null,
      twitter_url: form.twitter_url || null,
      youtube_url: form.youtube_url || null,
      tiktok_url: form.tiktok_url || null,
      linkedin_url: form.linkedin_url || null,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
    };
    const { error } = await supabase.from('contact_content').upsert({ ...payload, id: 1 }).eq('id', 1);
    if (error) toast(error.message, 'error');
    else toast('Contact content saved', 'success');
    setSaving(false);
  };

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 skeleton" />)}</div>;
  }

  const input = 'input !py-2 text-sm';

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-medium text-gold-gradient">Contact Page</h1>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={saving} onClick={save} className="btn-primary">
          {saving ? <Loader2 width={16} height={16} className="animate-spin" /> : <Save width={16} height={16} />} Save
        </motion.button>
      </div>

      {/* Main */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-lux p-6 mb-6">
        <h2 className="font-serif text-lg font-medium text-accent mb-5">Main Content</h2>
        <div className="space-y-4">
          <div><label className="label">Heading</label><input value={form.heading} onChange={(e) => set('heading', e.target.value)} className={input} /></div>
          <div><label className="label">Description</label><textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className="input resize-none" /></div>
        </div>
      </motion.section>

      {/* Contact Info */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-lux p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Phone width={18} height={18} className="text-gold-400" />
          <h2 className="font-serif text-lg font-medium text-accent">Contact Info</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div><label className="label"><Mail width={12} height={12} className="inline mr-1" />Email</label><input value={form.email} onChange={(e) => set('email', e.target.value)} className={input} /></div>
          <div><label className="label"><Phone width={12} height={12} className="inline mr-1" />Phone</label><input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={input} /></div>
          <div><label className="label"><MessageCircle width={12} height={12} className="inline mr-1" />WhatsApp</label><input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={input} /></div>
          <div><label className="label"><Clock width={12} height={12} className="inline mr-1" />Business Hours</label><input value={form.business_hours} onChange={(e) => set('business_hours', e.target.value)} className={input} /></div>
          <div className="lg:col-span-2"><label className="label"><MapPin width={12} height={12} className="inline mr-1" />Address</label><textarea rows={2} value={form.address} onChange={(e) => set('address', e.target.value)} className="input resize-none" /></div>
          <div className="lg:col-span-2"><label className="label"><MapPin width={12} height={12} className="inline mr-1" />Google Maps Embed (iframe src or full HTML)</label><textarea rows={3} value={form.google_maps_embed} onChange={(e) => set('google_maps_embed', e.target.value)} className="input resize-none text-xs font-mono" /></div>
        </div>
      </motion.section>

      {/* Social */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-lux p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Share2 width={18} height={18} className="text-gold-400" />
          <h2 className="font-serif text-lg font-medium text-accent">Social Links</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div><label className="label">Instagram URL</label><input value={form.instagram_url} onChange={(e) => set('instagram_url', e.target.value)} className={input} /></div>
          <div><label className="label">Facebook URL</label><input value={form.facebook_url} onChange={(e) => set('facebook_url', e.target.value)} className={input} /></div>
          <div><label className="label">Twitter / X URL</label><input value={form.twitter_url} onChange={(e) => set('twitter_url', e.target.value)} className={input} /></div>
          <div><label className="label">YouTube URL</label><input value={form.youtube_url} onChange={(e) => set('youtube_url', e.target.value)} className={input} /></div>
          <div><label className="label">TikTok URL</label><input value={form.tiktok_url} onChange={(e) => set('tiktok_url', e.target.value)} className={input} /></div>
          <div><label className="label">LinkedIn URL</label><input value={form.linkedin_url} onChange={(e) => set('linkedin_url', e.target.value)} className={input} /></div>
        </div>
      </motion.section>

      {/* SEO */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-lux p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Search width={18} height={18} className="text-gold-400" />
          <h2 className="font-serif text-lg font-medium text-accent">SEO</h2>
        </div>
        <div className="space-y-4">
          <div><label className="label">SEO Title</label><input value={form.seo_title} onChange={(e) => set('seo_title', e.target.value)} className={input} /></div>
          <div><label className="label">SEO Description</label><textarea rows={2} value={form.seo_description} onChange={(e) => set('seo_description', e.target.value)} className="input resize-none" /></div>
        </div>
      </motion.section>

      <div className="flex justify-end">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={saving} onClick={save} className="btn-primary">
          {saving ? <Loader2 width={16} height={16} className="animate-spin" /> : <Save width={16} height={16} />} Save Contact Content
        </motion.button>
      </div>
    </div>
  );
}
