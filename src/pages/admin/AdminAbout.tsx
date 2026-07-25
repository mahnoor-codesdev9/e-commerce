import { useEffect, useState, useRef } from 'react';
import { Save, Upload, Loader2, ImageIcon, X, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import type { AboutContent } from '@/lib/types';

type ValueItem = { title: string; description: string };
type TimelineItem = { year: string; title: string; description: string };

type FormState = {
  heading: string;
  description: string;
  image_url: string;
  image_url_2: string;
  mission: string;
  vision: string;
  values: ValueItem[];
  timeline: TimelineItem[];
  seo_title: string;
  seo_description: string;
};

const emptyForm: FormState = {
  heading: '',
  description: '',
  image_url: '',
  image_url_2: '',
  mission: '',
  vision: '',
  values: [],
  timeline: [],
  seo_title: '',
  seo_description: '',
};

export function AdminAbout() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'img1' | 'img2' | null>(null);
  const img1Ref = useRef<HTMLInputElement>(null);
  const img2Ref = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('about_content').select('*').eq('id', 1).maybeSingle();
    if (error) toast(error.message, 'error');
    if (data) {
      const d = data as AboutContent;
      setForm({
        heading: d.heading ?? '',
        description: d.description ?? '',
        image_url: d.image_url ?? '',
        image_url_2: d.image_url_2 ?? '',
        mission: d.mission ?? '',
        vision: d.vision ?? '',
        values: d.values ?? [],
        timeline: d.timeline ?? [],
        seo_title: d.seo_title ?? '',
        seo_description: d.seo_description ?? '',
      });
    }
    setLoading(false);
  };

  useEffect(() => { load();   }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const uploadImage = async (file: File, field: 'image_url' | 'image_url_2') => {
    setUploading(field === 'image_url' ? 'img1' : 'img2');
    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `about-${field}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, file, { cacheControl: '3600' });
    if (error) toast(`Upload failed: ${error.message}`, 'error');
    else {
      const { data: url } = supabase.storage.from('product-images').getPublicUrl(fileName);
      set(field, url.publicUrl);
      toast('Image uploaded', 'success');
    }
    setUploading(null);
  };

  // Values helpers
  const addValue = () => set('values', [...form.values, { title: '', description: '' }]);
  const updateValue = (idx: number, patch: Partial<ValueItem>) =>
    set('values', form.values.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  const removeValue = (idx: number) => set('values', form.values.filter((_, i) => i !== idx));

  // Timeline helpers
  const addTimeline = () => set('timeline', [...form.timeline, { year: '', title: '', description: '' }]);
  const updateTimeline = (idx: number, patch: Partial<TimelineItem>) =>
    set('timeline', form.timeline.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  const removeTimeline = (idx: number) => set('timeline', form.timeline.filter((_, i) => i !== idx));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('about_content').upsert({
      id: 1,
      heading: form.heading,
      description: form.description || null,
      image_url: form.image_url || null,
      image_url_2: form.image_url_2 || null,
      mission: form.mission || null,
      vision: form.vision || null,
      values: form.values,
      timeline: form.timeline,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
    }).eq('id', 1);
    if (error) toast(error.message, 'error');
    else toast('About content saved', 'success');
    setSaving(false);
  };

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 skeleton" />)}</div>;
  }

  const input = 'input !py-2 text-sm';

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-medium text-gold-gradient">About Page</h1>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={saving} onClick={save} className="btn-primary">
          {saving ? <Loader2 width={16} height={16} className="animate-spin" /> : <Save width={16} height={16} />} Save
        </motion.button>
      </div>

      {/* Main */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-lux p-6 mb-6">
        <h2 className="font-serif text-lg font-medium text-accent mb-5">Main Content</h2>
        <div className="space-y-4">
          <div><label className="label">Heading</label><input value={form.heading} onChange={(e) => set('heading', e.target.value)} className={input} /></div>
          <div><label className="label">Description</label><textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className="input resize-none" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Image 1</label>
              <div className="aspect-video bg-white/5 border border-white/10 overflow-hidden mb-2">
                {form.image_url ? <img src={form.image_url} alt="Image 1" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><ImageIcon className="text-white/20" /></div>}
              </div>
              <input ref={img1Ref} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], 'image_url')} />
              <div className="flex gap-2">
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={uploading === 'img1'} onClick={() => img1Ref.current?.click()} className="btn-dark !py-2 !text-xs flex items-center gap-2">
                  {uploading === 'img1' ? <Loader2 width={14} height={14} className="animate-spin" /> : <Upload width={14} height={14} />} Upload
                </motion.button>
                {form.image_url && <button type="button" onClick={() => set('image_url', '')} className="p-1.5 hover:bg-rose-500/10 text-rose-500 transition-colors"><X width={14} height={14} /></button>}
              </div>
            </div>
            <div>
              <label className="label">Image 2</label>
              <div className="aspect-video bg-white/5 border border-white/10 overflow-hidden mb-2">
                {form.image_url_2 ? <img src={form.image_url_2} alt="Image 2" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><ImageIcon className="text-white/20" /></div>}
              </div>
              <input ref={img2Ref} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], 'image_url_2')} />
              <div className="flex gap-2">
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={uploading === 'img2'} onClick={() => img2Ref.current?.click()} className="btn-dark !py-2 !text-xs flex items-center gap-2">
                  {uploading === 'img2' ? <Loader2 width={14} height={14} className="animate-spin" /> : <Upload width={14} height={14} />} Upload
                </motion.button>
                {form.image_url_2 && <button type="button" onClick={() => set('image_url_2', '')} className="p-1.5 hover:bg-rose-500/10 text-rose-500 transition-colors"><X width={14} height={14} /></button>}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Mission & Vision */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-lux p-6 mb-6">
        <h2 className="font-serif text-lg font-medium text-accent mb-5">Mission & Vision</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Mission</label><textarea rows={4} value={form.mission} onChange={(e) => set('mission', e.target.value)} className="input resize-none" /></div>
          <div><label className="label">Vision</label><textarea rows={4} value={form.vision} onChange={(e) => set('vision', e.target.value)} className="input resize-none" /></div>
        </div>
      </motion.section>

      {/* Values */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-lux p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-lg font-medium text-accent">Values</h2>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addValue} className="btn-outline !py-2 !text-xs flex items-center gap-2"><Plus width={14} height={14} /> Add Value</motion.button>
        </div>
        <div className="space-y-3">
          {form.values.length === 0 && <p className="text-sm text-white/40">No values added.</p>}
          {form.values.map((v, idx) => (
            <div key={idx} className="grid sm:grid-cols-[1fr_2fr_auto] gap-3 items-start">
              <input value={v.title} onChange={(e) => updateValue(idx, { title: e.target.value })} placeholder="Title" className={input} />
              <textarea rows={2} value={v.description} onChange={(e) => updateValue(idx, { description: e.target.value })} placeholder="Description" className="input resize-none" />
              <button type="button" onClick={() => removeValue(idx)} className="p-2 hover:bg-rose-500/10 text-rose-500 transition-colors mt-1"><Trash2 width={14} height={14} /></button>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Timeline */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-lux p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-lg font-medium text-accent">Timeline</h2>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addTimeline} className="btn-outline !py-2 !text-xs flex items-center gap-2"><Plus width={14} height={14} /> Add Milestone</motion.button>
        </div>
        <div className="space-y-3">
          {form.timeline.length === 0 && <p className="text-sm text-white/40">No timeline entries.</p>}
          {form.timeline.map((t, idx) => (
            <div key={idx} className="grid sm:grid-cols-[100px_1fr_2fr_auto] gap-3 items-start">
              <input value={t.year} onChange={(e) => updateTimeline(idx, { year: e.target.value })} placeholder="Year" className={input} />
              <input value={t.title} onChange={(e) => updateTimeline(idx, { title: e.target.value })} placeholder="Title" className={input} />
              <textarea rows={2} value={t.description} onChange={(e) => updateTimeline(idx, { description: e.target.value })} placeholder="Description" className="input resize-none" />
              <button type="button" onClick={() => removeTimeline(idx)} className="p-2 hover:bg-rose-500/10 text-rose-500 transition-colors mt-1"><Trash2 width={14} height={14} /></button>
            </div>
          ))}
        </div>
      </motion.section>

      {/* SEO */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-lux p-6 mb-6">
        <h2 className="font-serif text-lg font-medium text-accent mb-5">SEO</h2>
        <div className="space-y-4">
          <div><label className="label">SEO Title</label><input value={form.seo_title} onChange={(e) => set('seo_title', e.target.value)} className={input} /></div>
          <div><label className="label">SEO Description</label><textarea rows={2} value={form.seo_description} onChange={(e) => set('seo_description', e.target.value)} className="input resize-none" /></div>
        </div>
      </motion.section>

      <div className="flex justify-end">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={saving} onClick={save} className="btn-primary">
          {saving ? <Loader2 width={16} height={16} className="animate-spin" /> : <Save width={16} height={16} />} Save About Content
        </motion.button>
      </div>
    </div>
  );
}
