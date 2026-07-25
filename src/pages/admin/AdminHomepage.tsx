import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import type { HomepageSlide, HomepageSection } from '@/lib/types';

type Tab = 'slides' | 'sections';

export function AdminHomepage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('slides');
  const [slides, setSlides] = useState<HomepageSlide[]>([]);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: sec }] = await Promise.all([
      supabase.from('homepage_slides').select('*').order('sort_order'),
      supabase.from('homepage_sections').select('*').order('sort_order'),
    ]);
    setSlides((s ?? []) as HomepageSlide[]);
    setSections((sec ?? []) as HomepageSection[]);
    setLoading(false);
  };

  useEffect(() => { load();   }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-medium text-gold-gradient">Homepage CMS</h1>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gold-400/10">
        {([['slides', 'Hero Slides'], ['sections', 'Sections']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={cn('px-5 py-3 text-sm font-medium tracking-wide uppercase transition-colors', tab === id ? 'text-gold-400 border-b-2 border-gold-400' : 'text-white/40 hover:text-accent')}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'slides' ? (
        <SlidesTab slides={slides} loading={loading} reload={load} toast={toast} />
      ) : (
        <SectionsTab sections={sections} loading={loading} reload={load} toast={toast} />
      )}
    </div>
  );
}

/* ---------------- Slides Tab ---------------- */

type SlideForm = {
  image_url: string;
  heading: string;
  subheading: string;
  button_text: string;
  button_link: string;
  sort_order: number;
  is_active: boolean;
};

function SlidesTab({ slides, loading, reload, toast }: { slides: HomepageSlide[]; loading: boolean; reload: () => void; toast: (m: string, t?: 'success' | 'error' | 'info' | 'warning') => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HomepageSlide | null>(null);
  const [form, setForm] = useState<SlideForm>({
    image_url: '', heading: '', subheading: '', button_text: '', button_link: '', sort_order: 0, is_active: true,
  });

  const openNew = () => {
    setEditing(null);
    setForm({ image_url: '', heading: '', subheading: '', button_text: '', button_link: '', sort_order: slides.length, is_active: true });
    setShowForm(true);
  };
  const openEdit = (s: HomepageSlide) => {
    setEditing(s);
    setForm({
      image_url: s.image_url, heading: s.heading, subheading: s.subheading ?? '', button_text: s.button_text ?? '',
      button_link: s.button_link ?? '', sort_order: s.sort_order, is_active: s.is_active,
    });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, subheading: form.subheading || null, button_text: form.button_text || null, button_link: form.button_link || null };
    if (editing) {
      const { error } = await supabase.from('homepage_slides').update(payload).eq('id', editing.id);
      if (error) toast(error.message, 'error'); else { toast('Slide updated', 'success'); setShowForm(false); reload(); }
    } else {
      const { error } = await supabase.from('homepage_slides').insert(payload);
      if (error) toast(error.message, 'error'); else { toast('Slide created', 'success'); setShowForm(false); reload(); }
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this slide?')) return;
    const { error } = await supabase.from('homepage_slides').delete().eq('id', id);
    if (error) toast('Could not delete', 'error'); else { toast('Slide deleted', 'success'); reload(); }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openNew} className="btn-primary"><Plus width={16} height={16} /> Add Slide</motion.button>
      </div>
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 skeleton" />)}</div>
      ) : slides.length === 0 ? (
        <p className="text-sm text-white/40">No slides yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-lux overflow-hidden group">
              <div className="aspect-video bg-white/5 overflow-hidden relative">
                {s.image_url ? <img src={s.image_url} alt={s.heading} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><ImageIcon className="text-white/20" /></div>}
                <span className={cn('absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full', s.is_active ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/10 text-white/40')}>{s.is_active ? 'Active' : 'Hidden'}</span>
              </div>
              <div className="p-4">
                <h3 className="font-serif font-medium text-accent">{s.heading}</h3>
                {s.subheading && <p className="text-xs text-white/40 mt-1 line-clamp-2">{s.subheading}</p>}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gold-400/50">Order: {s.sort_order}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-gold-400/10 text-gold-400 transition-colors"><Pencil width={14} height={14} /></button>
                    <button onClick={() => del(s.id)} className="p-1.5 hover:bg-rose-500/10 text-rose-500 transition-colors"><Trash2 width={14} height={14} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && <SlideFormModal form={form} setForm={setForm} editing={!!editing} onSave={save} onClose={() => setShowForm(false)} toast={toast} />}
      </AnimatePresence>
    </div>
  );
}

function SlideFormModal({ form, setForm, editing, onSave, onClose, toast }: { form: SlideForm; setForm: React.Dispatch<React.SetStateAction<SlideForm>>; editing: boolean; onSave: (e: React.FormEvent) => void; onClose: () => void; toast: (m: string, t?: 'success' | 'error' | 'info' | 'warning') => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `slide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, file, { cacheControl: '3600' });
    if (error) toast(`Upload failed: ${error.message}`, 'error');
    else {
      const { data: url } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setForm((f) => ({ ...f, image_url: url.publicUrl }));
      toast('Image uploaded', 'success');
    }
    setUploading(false);
  };

  const input = 'input !py-2 text-sm';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-graphite max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gold-400/20">
        <div className="flex items-center justify-between p-6 border-b border-gold-400/10 sticky top-0 bg-graphite z-10">
          <h2 className="font-serif text-xl font-medium text-gold-gradient">{editing ? 'Edit' : 'Add'} Slide</h2>
          <button onClick={onClose} className="text-accent hover:text-gold-400 transition-colors"><X width={20} height={20} /></button>
        </div>
        <form onSubmit={onSave} className="p-6 space-y-4">
          <div>
            <label className="label">Image</label>
            <div className="aspect-video bg-white/5 border border-white/10 overflow-hidden mb-2">
              {form.image_url ? <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><ImageIcon className="text-white/20" /></div>}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <div className="flex gap-2">
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={uploading} onClick={() => fileInputRef.current?.click()} className="btn-dark !py-2 !text-xs flex items-center gap-2">
                {uploading ? <Loader2 width={14} height={14} className="animate-spin" /> : <Upload width={14} height={14} />} Upload
              </motion.button>
              <input type="url" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="Or paste URL" className="input flex-1 !py-2 text-sm" />
            </div>
          </div>
          <div><label className="label">Heading *</label><input required value={form.heading} onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))} className={input} /></div>
          <div><label className="label">Subheading</label><textarea rows={2} value={form.subheading} onChange={(e) => setForm((f) => ({ ...f, subheading: e.target.value }))} className="input resize-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Button Text</label><input value={form.button_text} onChange={(e) => setForm((f) => ({ ...f, button_text: e.target.value }))} className={input} /></div>
            <div><label className="label">Button Link</label><input value={form.button_link} onChange={(e) => setForm((f) => ({ ...f, button_link: e.target.value }))} className={input} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Sort Order</label><input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} className={input} /></div>
            <div><label className="label">Active</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer text-accent h-[38px]">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="accent-gold-400" /> Active
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gold-400/10">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Create'}</motion.button>
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ---------------- Sections Tab ---------------- */

type SectionForm = {
  section_type: string;
  title: string;
  subtitle: string;
  content: string;
  image_url: string;
  button_text: string;
  button_link: string;
  sort_order: number;
  is_active: boolean;
};

function SectionsTab({ sections, loading, reload, toast }: { sections: HomepageSection[]; loading: boolean; reload: () => void; toast: (m: string, t?: 'success' | 'error' | 'info' | 'warning') => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HomepageSection | null>(null);
  const [form, setForm] = useState<SectionForm>({
    section_type: 'feature', title: '', subtitle: '', content: '{}', image_url: '', button_text: '', button_link: '', sort_order: 0, is_active: true,
  });

  const openNew = () => {
    setEditing(null);
    setForm({ section_type: 'feature', title: '', subtitle: '', content: '{}', image_url: '', button_text: '', button_link: '', sort_order: sections.length, is_active: true });
    setShowForm(true);
  };
  const openEdit = (s: HomepageSection) => {
    setEditing(s);
    setForm({
      section_type: s.section_type, title: s.title ?? '', subtitle: s.subtitle ?? '',
      content: JSON.stringify(s.content ?? {}, null, 2), image_url: s.image_url ?? '',
      button_text: s.button_text ?? '', button_link: s.button_link ?? '', sort_order: s.sort_order, is_active: s.is_active,
    });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    let parsedContent: Record<string, unknown> = {};
    try { parsedContent = JSON.parse(form.content); } catch { toast('Content is not valid JSON', 'error'); return; }
    const payload = {
      section_type: form.section_type, title: form.title || null, subtitle: form.subtitle || null,
      content: parsedContent, image_url: form.image_url || null, button_text: form.button_text || null,
      button_link: form.button_link || null, sort_order: form.sort_order, is_active: form.is_active,
    };
    if (editing) {
      const { error } = await supabase.from('homepage_sections').update(payload).eq('id', editing.id);
      if (error) toast(error.message, 'error'); else { toast('Section updated', 'success'); setShowForm(false); reload(); }
    } else {
      const { error } = await supabase.from('homepage_sections').insert(payload);
      if (error) toast(error.message, 'error'); else { toast('Section created', 'success'); setShowForm(false); reload(); }
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this section?')) return;
    const { error } = await supabase.from('homepage_sections').delete().eq('id', id);
    if (error) toast('Could not delete', 'error'); else { toast('Section deleted', 'success'); reload(); }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openNew} className="btn-primary"><Plus width={16} height={16} /> Add Section</motion.button>
      </div>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 skeleton" />)}</div>
      ) : sections.length === 0 ? (
        <p className="text-sm text-white/40">No sections yet.</p>
      ) : (
        <div className="space-y-3">
          {sections.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-lux p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-gold-400/10 text-gold-400 rounded-full">{s.section_type}</span>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full', s.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-white/40')}>{s.is_active ? 'Active' : 'Hidden'}</span>
                  </div>
                  <h3 className="font-serif font-medium text-accent">{s.title ?? 'Untitled'}</h3>
                  {s.subtitle && <p className="text-xs text-white/40 mt-1 line-clamp-1">{s.subtitle}</p>}
                  <p className="text-xs text-gold-400/40 mt-1">Order: {s.sort_order}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-gold-400/10 text-gold-400 transition-colors"><Pencil width={14} height={14} /></button>
                  <button onClick={() => del(s.id)} className="p-1.5 hover:bg-rose-500/10 text-rose-500 transition-colors"><Trash2 width={14} height={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && <SectionFormModal form={form} setForm={setForm} editing={!!editing} onSave={save} onClose={() => setShowForm(false)} toast={toast} />}
      </AnimatePresence>
    </div>
  );
}

function SectionFormModal({ form, setForm, editing, onSave, onClose, toast }: { form: SectionForm; setForm: React.Dispatch<React.SetStateAction<SectionForm>>; editing: boolean; onSave: (e: React.FormEvent) => void; onClose: () => void; toast: (m: string, t?: 'success' | 'error' | 'info' | 'warning') => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, file, { cacheControl: '3600' });
    if (error) toast(`Upload failed: ${error.message}`, 'error');
    else {
      const { data: url } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setForm((f) => ({ ...f, image_url: url.publicUrl }));
      toast('Image uploaded', 'success');
    }
    setUploading(false);
  };

  const input = 'input !py-2 text-sm';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-graphite max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gold-400/20">
        <div className="flex items-center justify-between p-6 border-b border-gold-400/10 sticky top-0 bg-graphite z-10">
          <h2 className="font-serif text-xl font-medium text-gold-gradient">{editing ? 'Edit' : 'Add'} Section</h2>
          <button onClick={onClose} className="text-accent hover:text-gold-400 transition-colors"><X width={20} height={20} /></button>
        </div>
        <form onSubmit={onSave} className="p-6 space-y-4">
          <div><label className="label">Section Type *</label>
            <select value={form.section_type} onChange={(e) => setForm((f) => ({ ...f, section_type: e.target.value }))} className={input}>
              {['feature', 'banner', 'cta', 'gallery', 'testimonial', 'promo', 'custom'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="label">Title</label><input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={input} /></div>
          <div><label className="label">Subtitle</label><input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} className={input} /></div>
          <div><label className="label">Content (JSON)</label><textarea rows={6} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="input resize-none text-xs font-mono" /></div>
          <div>
            <label className="label">Image</label>
            <div className="aspect-video bg-white/5 border border-white/10 overflow-hidden mb-2">
              {form.image_url ? <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><ImageIcon className="text-white/20" /></div>}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <div className="flex gap-2">
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={uploading} onClick={() => fileInputRef.current?.click()} className="btn-dark !py-2 !text-xs flex items-center gap-2">
                {uploading ? <Loader2 width={14} height={14} className="animate-spin" /> : <Upload width={14} height={14} />} Upload
              </motion.button>
              <input type="url" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="Or paste URL" className="input flex-1 !py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Button Text</label><input value={form.button_text} onChange={(e) => setForm((f) => ({ ...f, button_text: e.target.value }))} className={input} /></div>
            <div><label className="label">Button Link</label><input value={form.button_link} onChange={(e) => setForm((f) => ({ ...f, button_link: e.target.value }))} className={input} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Sort Order</label><input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} className={input} /></div>
            <div><label className="label">Active</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer text-accent h-[38px]">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="accent-gold-400" /> Active
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gold-400/10">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Create'}</motion.button>
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
