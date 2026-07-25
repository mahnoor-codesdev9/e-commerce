import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { slugify } from '@/lib/utils';
import type { PageContent } from '@/lib/types';

export function AdminPages() {
  const { toast } = useToast();
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PageContent | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('page_contents').select('*').order('title');
    setPages((data ?? []) as PageContent[]);
    setLoading(false);
  };

  useEffect(() => { load();   }, []);

  const filtered = pages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase()));

  const onDelete = async (id: string) => {
    if (!confirm('Delete this page?')) return;
    const { error } = await supabase.from('page_contents').delete().eq('id', id);
    if (error) toast('Could not delete', 'error');
    else { toast('Page deleted', 'success'); load(); }
  };

  const onSave = async (data: Partial<PageContent>) => {
    if (editing) {
      const { error } = await supabase.from('page_contents').update(data).eq('id', editing.id);
      if (error) toast(error.message, 'error');
      else { toast('Page updated', 'success'); setShowForm(false); setEditing(null); load(); }
    } else {
      const { error } = await supabase.from('page_contents').insert({
        slug: data.slug || slugify(data.title ?? ''),
        title: data.title,
        content: data.content,
        seo_title: data.seo_title,
        seo_description: data.seo_description,
        seo_keywords: data.seo_keywords,
      });
      if (error) toast(error.message, 'error');
      else { toast('Page created', 'success'); setShowForm(false); load(); }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-medium text-gold-gradient">Pages</h1>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary"><Plus width={16} height={16} /> Add Page</motion.button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400/40" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pages..." className="input pl-10" />
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 skeleton" />)}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase text-white/30 border-b border-gold-400/10">
              <th className="p-4">Title</th><th className="p-4">Slug</th><th className="p-4">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-accent">{p.title}</td>
                  <td className="p-4 text-white/40 text-xs font-mono">/{p.slug}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(p); setShowForm(true); }} className="p-1.5 hover:bg-gold-400/10 text-gold-400 transition-colors"><Pencil width={14} height={14} /></button>
                      <button onClick={() => onDelete(p.id)} className="p-1.5 hover:bg-rose-500/10 text-rose-500 transition-colors"><Trash2 width={14} height={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={3} className="p-8 text-center text-white/30 text-sm">No pages found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showForm && <PageForm page={editing} onSave={onSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
      </AnimatePresence>
    </div>
  );
}

function PageForm({ page, onSave, onClose }: { page: PageContent | null; onSave: (d: Partial<PageContent>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    slug: page?.slug ?? '',
    title: page?.title ?? '',
    content: page?.content ?? '',
    seo_title: page?.seo_title ?? '',
    seo_description: page?.seo_description ?? '',
    seo_keywords: page?.seo_keywords ?? '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      slug: form.slug || slugify(form.title),
      title: form.title,
      content: form.content || null,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      seo_keywords: form.seo_keywords || null,
    });
  };

  const input = 'input !py-2 text-sm';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-graphite max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gold-400/20">
        <div className="flex items-center justify-between p-6 border-b border-gold-400/10 sticky top-0 bg-graphite z-10">
          <h2 className="font-serif text-xl font-medium text-gold-gradient">{page ? 'Edit' : 'Add'} Page</h2>
          <button onClick={onClose} className="text-accent hover:text-gold-400 transition-colors"><X width={20} height={20} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div><label className="label">Title *</label><input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={input} /></div>
          <div><label className="label">Slug (leave blank to auto-generate)</label><input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={input} /></div>
          <div><label className="label">Content</label><textarea rows={8} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="input resize-none text-xs font-mono" /></div>
          <div><label className="label">SEO Title</label><input value={form.seo_title} onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))} className={input} /></div>
          <div><label className="label">SEO Description</label><textarea rows={2} value={form.seo_description} onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))} className="input resize-none" /></div>
          <div><label className="label">SEO Keywords</label><input value={form.seo_keywords} onChange={(e) => setForm((f) => ({ ...f, seo_keywords: e.target.value }))} className={input} /></div>
          <div className="flex gap-3 pt-4 border-t border-gold-400/10">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn-primary flex-1">{page ? 'Update' : 'Create'} Page</motion.button>
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
