import { useEffect, useState } from 'react';
import { X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/lib/utils';
import type { Order, OrderItem } from '@/lib/types';

export function AdminOrders() {
  const { toast } = useToast();
  const { format } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('admin-orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const view = async (o: Order) => {
    setViewing(o);
    const { data } = await supabase.from('order_items').select('*').eq('order_id', o.id);
    setItems((data ?? []) as OrderItem[]);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) toast('Update failed', 'error');
    else { toast('Status updated', 'success'); load(); if (viewing) setViewing({ ...viewing, status: status as Order['status'] }); }
  };

  const statusColor: Record<string, string> = {
    pending: 'text-amber-500 bg-amber-500/10', processing: 'text-sky-500 bg-sky-500/10',
    shipped: 'text-gold-400 bg-gold-400/10', delivered: 'text-emerald-500 bg-emerald-500/10',
    cancelled: 'text-rose-500 bg-rose-500/10', refunded: 'text-white/40 bg-white/5',
  };

  return (
    <div>
      <h1 className="text-2xl font-serif font-medium text-gold-gradient mb-8">Orders</h1>
      {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 skeleton" />)}</div> : orders.length === 0 ? <p className="text-sm text-white/40">No orders yet.</p> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase text-white/30 border-b border-gold-400/10">
              <th className="p-4">Order #</th><th className="p-4">Customer</th><th className="p-4">Total</th><th className="p-4">Payment</th><th className="p-4">Status</th><th className="p-4">Date</th><th className="p-4"></th>
            </tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-accent">{o.order_number}</td>
                  <td className="p-4"><p className="text-accent">{o.customer_name}</p><p className="text-xs text-white/30">{o.customer_email}</p></td>
                  <td className="p-4 text-gold-400">{format(o.total)}</td>
                  <td className="p-4 text-white/60 capitalize">{o.payment_method}</td>
                  <td className="p-4">
                    <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className={cn('text-xs px-2 py-1 rounded-full border-0 capitalize cursor-pointer', statusColor[o.status])}>
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-white/40">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="p-4"><button onClick={() => view(o)} className="p-1.5 hover:bg-gold-400/10 text-gold-400 transition-colors"><Eye width={14} height={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {viewing && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setViewing(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-graphite max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gold-400/20">
              <div className="flex items-center justify-between p-6 border-b border-gold-400/10 sticky top-0 bg-graphite z-10">
                <h2 className="font-serif text-xl font-medium text-gold-gradient">{viewing.order_number}</h2>
                <button onClick={() => setViewing(null)} className="text-accent hover:text-gold-400 transition-colors"><X width={20} height={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="label">Customer</p><p className="text-accent">{viewing.customer_name}</p><p className="text-xs text-white/30">{viewing.customer_email}</p><p className="text-xs text-white/30">{viewing.customer_phone}</p></div>
                  <div><p className="label">Status</p><span className={cn('text-xs px-2 py-1 rounded-full capitalize', statusColor[viewing.status])}>{viewing.status}</span></div>
                  <div><p className="label">Shipping Address</p><p className="text-xs text-white/60">{viewing.shipping_address.line1}, {viewing.shipping_address.city}, {viewing.shipping_address.state} {viewing.shipping_address.postal_code}</p></div>
                  <div><p className="label">Payment</p><p className="text-accent capitalize">{viewing.payment_method}</p></div>
                </div>
                {viewing.order_notes && <div><p className="label">Notes</p><p className="text-sm text-white/60">{viewing.order_notes}</p></div>}
                <div className="border-t border-gold-400/10 pt-4">
                  <p className="label">Items</p>
                  <div className="space-y-2">
                    {items.map((it) => (
                      <div key={it.id} className="flex items-center gap-3 text-sm">
                        <div className="w-10 h-12 bg-white/5 overflow-hidden shrink-0">{it.product_image && <img src={it.product_image} alt={it.product_name} className="w-full h-full object-cover" />}</div>
                        <div className="flex-1"><p className="text-accent">{it.product_name}</p><p className="text-xs text-white/30">Qty: {it.quantity}{it.size ? ` · ${it.size}` : ''}</p></div>
                        <span className="text-gold-400">{format(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gold-400/10 pt-4 space-y-1 text-sm">
                  <div className="flex justify-between text-white/60"><span>Subtotal</span><span>{format(viewing.subtotal)}</span></div>
                  {viewing.discount > 0 && <div className="flex justify-between text-emerald-500"><span>Discount</span><span>-{format(viewing.discount)}</span></div>}
                  <div className="flex justify-between text-white/60"><span>Shipping</span><span>{format(viewing.shipping_cost)}</span></div>
                  <div className="flex justify-between font-medium text-base pt-2"><span className="text-accent">Total</span><span className="text-gold-400">{format(viewing.total)}</span></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
