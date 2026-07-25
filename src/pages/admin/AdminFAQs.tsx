import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import type { FAQ } from '@/lib/types';

export function AdminFAQs() {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('faqs').select('*').order('sort_order');
    setFaqs((data ?? []) as FAQ[]);
    setLoading(false);
  };

  useEffect(() => { load();   }, []);

  const onDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) toast('Could not delete', 'error');
    else { toast('FAQ deleted', 'success'); load(); }
  };

  const onSave = async (data: Partial<FAQ>) => {
    if (editing) {
      const { error } = await supabase.from('faqs').update(data).eq('id', editing.id);
      if (error) toast(error.message, 'error');
      else { toast('FAQ updated', 'success'); setShowForm(false); setEditing(null); load(); }
    } else {
      const { error } = await supabase.from('faqs').insert({
        question: data.question,
        answer: data.answer,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
      });
      if (error) toast(error.message, 'error');
      else { toast('FAQ created', 'success'); setShowForm(false); load(); }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-medium text-gold-gradient">FAQs</h1>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary"><Plus width={16} height={16} /> Add FAQ</motion.button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 skeleton" />)}</div>
      ) : faqs.length === 0 ? (
        <p className="text-sm text-white/40">No FAQs yet.</p>
      ) : (
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-lux p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle width={16} height={16} className="text-gold-400 shrink-0" />
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full', f.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-white/40')}>{f.is_active ? 'Active' : 'Hidden'}</span>
                    <span className="text-xs text-gold-400/40">Order: {f.sort_order}</span>
                  </div>
                  <h3 className="font-serif font-medium text-accent">{f.question}</h3>
                  <p className="text-sm text-white/50 mt-1 line-clamp-2">{f.answer}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditing(f); setShowForm(true); }} className="p-1.5 hover:bg-gold-400/10 text-gold-400 transition-colors"><Pencil width={14} height={14} /></button>
                  <button onClick={() => onDelete(f.id)} className="p-1.5 hover:bg-rose-500/10 text-rose-500 transition-colors"><Trash2 width={14} height={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && <FAQForm faq={editing} onSave={onSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
      </AnimatePresence>
    </div>
  );
}

function FAQForm({ faq, onSave, onClose }: { faq: FAQ | null; onSave: (d: Partial<FAQ>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    question: faq?.question ?? '',
    answer: faq?.answer ?? '',
    sort_order: faq?.sort_order ?? 0,
    is_active: faq?.is_active ?? true,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const input = 'input !py-2 text-sm';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-graphite max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gold-400/20">
        <div className="flex items-center justify-between p-6 border-b border-gold-400/10 sticky top-0 bg-graphite z-10">
          <h2 className="font-serif text-xl font-medium text-gold-gradient">{faq ? 'Edit' : 'Add'} FAQ</h2>
          <button onClick={onClose} className="text-accent hover:text-gold-400 transition-colors"><X width={20} height={20} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div><label className="label">Question *</label><input required value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} className={input} /></div>
          <div><label className="label">Answer *</label><textarea rows={4} required value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} className="input resize-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Sort Order</label><input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} className={input} /></div>
            <div><label className="label">Active</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer text-accent h-[38px]">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="accent-gold-400" /> Active
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gold-400/10">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn-primary flex-1">{faq ? 'Update' : 'Create'} FAQ</motion.button>
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
