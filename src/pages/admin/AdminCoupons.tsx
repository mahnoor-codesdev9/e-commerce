import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import type { Coupon } from '@/lib/types';

export function AdminCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState({ code: '', description: '', discount_type: 'percentage', discount_value: 10, min_order: 0, is_active: true });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons((data ?? []) as Coupon[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ code: '', description: '', discount_type: 'percentage', discount_value: 10, min_order: 0, is_active: true }); setShowForm(true); };
  const openEdit = (c: Coupon) => { setEditing(c); setForm({ code: c.code, description: c.description ?? '', discount_type: c.discount_type, discount_value: c.discount_value, min_order: c.min_order, is_active: c.is_active }); setShowForm(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, code: form.code.toUpperCase(), discount_value: Number(form.discount_value), min_order: Number(form.min_order) };
    if (editing) {
      const { error } = await supabase.from('coupons').update(payload).eq('id', editing.id);
      if (error) toast(error.message, 'error'); else { toast('Coupon updated', 'success'); setShowForm(false); load(); }
    } else {
      const { error } = await supabase.from('coupons').insert(payload);
      if (error) toast(error.message, 'error'); else { toast('Coupon created', 'success'); setShowForm(false); load(); }
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) toast('Could not delete', 'error'); else { toast('Deleted', 'success'); load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-medium text-gold-gradient">Coupons</h1>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openNew} className="btn-primary"><Plus width={16} height={16} /> Add Coupon</motion.button>
      </div>
      {loading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 skeleton" />)}</div> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase text-white/30 border-b border-gold-400/10">
              <th className="p-4">Code</th><th className="p-4">Type</th><th className="p-4">Value</th><th className="p-4">Min Order</th><th className="p-4">Used</th><th className="p-4">Status</th><th className="p-4">Actions</th>
            </tr></thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono font-medium text-gold-400">{c.code}</td>
                  <td className="p-4 text-white/60 capitalize">{c.discount_type}</td>
                  <td className="p-4 text-accent">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `Rs. ${c.discount_value}`}</td>
                  <td className="p-4 text-white/60">{c.min_order}</td>
                  <td className="p-4 text-white/60">{c.used_count}</td>
                  <td className="p-4"><span className={cn('text-xs px-2 py-1 rounded-full', c.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-white/40')}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="p-4"><div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gold-400/10 text-gold-400 transition-colors"><Pencil width={14} height={14} /></button>
                    <button onClick={() => del(c.id)} className="p-1.5 hover:bg-rose-500/10 text-rose-500 transition-colors"><Trash2 width={14} height={14} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-graphite max-w-md w-full shadow-2xl border border-gold-400/20">
              <div className="flex items-center justify-between p-6 border-b border-gold-400/10">
                <h2 className="font-serif text-xl font-medium text-gold-gradient">{editing ? 'Edit' : 'Add'} Coupon</h2>
                <button onClick={() => setShowForm(false)} className="text-accent hover:text-gold-400 transition-colors"><X width={20} height={20} /></button>
              </div>
              <form onSubmit={save} className="p-6 space-y-4">
                <div><label className="label">Code *</label><input required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} className="input" /></div>
                <div><label className="label">Description</label><input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Type</label><select value={form.discount_type} onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value }))} className="input"><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select></div>
                  <div><label className="label">Value</label><input type="number" value={form.discount_value} onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))} className="input" /></div>
                </div>
                <div><label className="label">Minimum Order (PKR)</label><input type="number" value={form.min_order} onChange={(e) => setForm((f) => ({ ...f, min_order: Number(e.target.value) }))} className="input" /></div>
                <label className="flex items-center gap-2 text-sm cursor-pointer text-accent"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="accent-gold-400" /> Active</label>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn-primary w-full">{editing ? 'Update' : 'Create'}</motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
