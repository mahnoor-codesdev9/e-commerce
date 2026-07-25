import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/lib/utils';
import { StaggerGroup, staggerItem } from '@/components/motion/MotionPrimitives';

export function AdminCustomers() {
  const { format } = useCurrency();
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [orderCounts, setOrderCounts] = useState<Record<string, { count: number; total: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: profiles }, { data: orders }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('user_id, total'),
      ]);
      setCustomers((profiles ?? []) as Profile[]);
      const map: Record<string, { count: number; total: number }> = {};
      (orders ?? []).forEach((o: { user_id: string | null; total: number }) => {
        if (o.user_id) {
          map[o.user_id] = map[o.user_id] ?? { count: 0, total: 0 };
          map[o.user_id].count++;
          map[o.user_id].total += Number(o.total);
        }
      });
      setOrderCounts(map);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-serif font-medium text-gold-gradient mb-8">Customers</h1>
      {loading ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 skeleton" />)}</div> : (
        <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <motion.div key={c.id} variants={staggerItem} whileHover={{ y: -4 }} className="card-lux p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-ink flex items-center justify-center font-serif font-bold">
                  {(c.full_name?.[0] || c.email?.[0] || 'U').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-accent truncate">{c.full_name || 'Member'}</p>
                  <p className="text-xs text-white/30 truncate">{c.email}</p>
                </div>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full ml-auto', c.role === 'admin' ? 'bg-gold-400 text-ink' : 'bg-white/10 text-white/40')}>{c.role}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-white/30">Orders</p><p className="text-accent font-medium">{orderCounts[c.id]?.count ?? 0}</p></div>
                <div><p className="text-xs text-white/30">Spent</p><p className="text-gold-400 font-medium">{format(orderCounts[c.id]?.total ?? 0)}</p></div>
              </div>
            </motion.div>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
