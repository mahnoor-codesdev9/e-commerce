import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Users, Ticket, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/lib/utils';
import { StaggerGroup, staggerItem, AnimatedCounter } from '@/components/motion/MotionPrimitives';

export function AdminDashboard() {
  const { format } = useCurrency();
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0, pending: 0, coupons: 0 });
  const [recentOrders, setRecentOrders] = useState<{ order_number: string; customer_name: string; total: number; status: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, o, c, cp] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total, status'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('coupons').select('id', { count: 'exact', head: true }),
      ]);
      const orders = o.data ?? [];
      const revenue = orders.reduce((s: number, x: { total: number }) => s + Number(x.total), 0);
      const pending = orders.filter((x: { status: string }) => x.status === 'pending').length;
      setStats({ products: p.count ?? 0, orders: orders.length, customers: c.count ?? 0, revenue, pending, coupons: cp.count ?? 0 });
      const { data: recent } = await supabase.from('orders').select('order_number, customer_name, total, status, created_at').order('created_at', { ascending: false }).limit(6);
      setRecentOrders((recent ?? []) as typeof recentOrders);
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: 'Total Revenue', value: stats.revenue, format: true, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Orders', value: stats.orders, format: false, icon: ShoppingCart, color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { label: 'Pending Orders', value: stats.pending, format: false, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Products', value: stats.products, format: false, icon: Package, color: 'text-gold-400', bg: 'bg-gold-400/10' },
    { label: 'Customers', value: stats.customers, format: false, icon: Users, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Coupons', value: stats.coupons, format: false, icon: Ticket, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const statusColor: Record<string, string> = {
    pending: 'text-amber-500 bg-amber-500/10',
    processing: 'text-sky-500 bg-sky-500/10',
    shipped: 'text-gold-400 bg-gold-400/10',
    delivered: 'text-emerald-500 bg-emerald-500/10',
    cancelled: 'text-rose-500 bg-rose-500/10',
    refunded: 'text-white/40 bg-white/5',
  };

  return (
    <div>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-serif font-medium text-gold-gradient mb-8">Dashboard</motion.h1>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 skeleton" />)}</div>
      ) : (
        <>
          <StaggerGroup className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {cards.map((c) => (
              <motion.div key={c.label} variants={staggerItem} whileHover={{ y: -4 }} className="card-lux p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/40">{c.label}</p>
                    <p className="text-2xl font-serif font-medium mt-2 text-accent">
                      {c.format ? format(c.value) : <AnimatedCounter value={c.value} />}
                    </p>
                  </div>
                  <div className={cn('w-11 h-11 rounded-full flex items-center justify-center', c.bg)}>
                    <c.icon className={c.color} width={22} height={22} />
                  </div>
                </div>
              </motion.div>
            ))}
          </StaggerGroup>

          <div className="card-lux p-6">
            <h2 className="font-serif text-lg font-medium text-gold-gradient mb-4">Recent Orders</h2>
            {recentOrders.length === 0 ? <p className="text-sm text-white/40">No orders yet.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs uppercase text-white/30 border-b border-gold-400/10">
                    <th className="py-3">Order</th><th className="py-3">Customer</th><th className="py-3">Total</th><th className="py-3">Status</th><th className="py-3">Date</th>
                  </tr></thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.order_number} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-medium text-accent">{o.order_number}</td>
                        <td className="py-3 text-white/60">{o.customer_name}</td>
                        <td className="py-3 text-gold-400">{format(o.total)}</td>
                        <td className="py-3"><span className={cn('text-xs px-2 py-1 rounded-full capitalize', statusColor[o.status])}>{o.status}</span></td>
                        <td className="py-3 text-white/40">{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
