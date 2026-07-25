import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { slugify } from '@/lib/utils';
import type { Category } from '@/lib/types';

export function AdminCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '', sort_order: 0 });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories((data ?? []) as Category[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', slug: '', description: '', image_url: '', sort_order: 0 }); setShowForm(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, slug: c.slug, description: c.description ?? '', image_url: c.image_url ?? '', sort_order: c.sort_order }); setShowForm(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, slug: form.slug || slugify(form.name) };
    if (editing) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editing.id);
      if (error) toast(error.message, 'error'); else { toast('Category updated', 'success'); setShowForm(false); load(); }
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) toast(error.message, 'error'); else { toast('Category created', 'success'); setShowForm(false); load(); }
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast('Could not delete', 'error'); else { toast('Deleted', 'success'); load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-medium text-gold-gradient">Categories</h1>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openNew} className="btn-primary"><Plus width={16} height={16} /> Add Category</motion.button>
      </div>
      {loading ? <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 skeleton" />)}</div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }} className="card-lux overflow-hidden group">
              <div className="aspect-[3/2] bg-white/5 overflow-hidden">
                {c.image_url && <img src={c.image_url} alt={c.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-medium text-accent">{c.name}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gold-400/10 text-gold-400 transition-colors"><Pencil width={14} height={14} /></button>
                    <button onClick={() => del(c.id)} className="p-1.5 hover:bg-rose-500/10 text-rose-500 transition-colors"><Trash2 width={14} height={14} /></button>
                  </div>
                </div>
                <p className="text-xs text-white/40 mt-1 line-clamp-2">{c.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-graphite max-w-md w-full shadow-2xl border border-gold-400/20">
              <div className="flex items-center justify-between p-6 border-b border-gold-400/10">
                <h2 className="font-serif text-xl font-medium text-gold-gradient">{editing ? 'Edit' : 'Add'} Category</h2>
                <button onClick={() => setShowForm(false)} className="text-accent hover:text-gold-400 transition-colors"><X width={20} height={20} /></button>
              </div>
              <form onSubmit={save} className="p-6 space-y-4">
                <div><label className="label">Name *</label><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" /></div>
                <div><label className="label">Slug</label><input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="input" /></div>
                <div><label className="label">Description</label><textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input resize-none" /></div>
                <div><label className="label">Image URL</label><input value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} className="input" /></div>
                <div><label className="label">Sort Order</label><input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} className="input" /></div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn-primary w-full">{editing ? 'Update' : 'Create'}</motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
