import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, Heart, Settings, LogOut, ShoppingBag, Clock, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useProducts } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';
import { ProductCard } from '@/components/ProductCard';
import { StaggerGroup, staggerItem } from '@/components/motion/MotionPrimitives';
import type { Order } from '@/lib/types';
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/lib/utils';

type Tab = 'dashboard' | 'orders' | 'wishlist' | 'settings';

export function AccountPage() {
  const { profile, session, signOut, loading, refreshProfile } = useAuth();
  const { ids: wishlistIds } = useWishlist();
  const { format } = useCurrency();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [editName, setEditName] = useState(profile?.full_name || '');
  const [editPhone, setEditPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  const { products: allProducts } = useProducts({ limit: 100 });
  const wishlistProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || '');
      setEditPhone(profile.phone || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!session?.user) return;
    setOrdersLoading(true);
    supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setOrdersLoading(false);
      });

    const channel = supabase
      .channel('customer-orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${session.user.id}` }, () => {
        supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .then(({ data }) => setOrders((data as Order[]) ?? []));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session?.user]);

  if (loading) {
    return <div className="container-lux py-20"><div className="h-64 skeleton" /></div>;
  }
  if (!session) return <Navigate to="/login" replace />;

  const saveProfile = async () => {
    setSaving(true);
    await supabase.from('profiles').update({ full_name: editName, phone: editPhone }).eq('id', profile!.id);
    await refreshProfile();
    setSaving(false);
  };

  const statusColors: Record<string, string> = {
    pending: 'text-amber-500 bg-amber-500/10',
    processing: 'text-sky-500 bg-sky-500/10',
    shipped: 'text-gold-400 bg-gold-400/10',
    delivered: 'text-emerald-500 bg-emerald-500/10',
    cancelled: 'text-rose-500 bg-rose-500/10',
    refunded: 'text-white/40 bg-white/5',
  };

  const tabs = [
    { id: 'dashboard' as Tab, icon: User, label: 'Dashboard' },
    { id: 'orders' as Tab, icon: Package, label: 'Orders' },
    { id: 'wishlist' as Tab, icon: Heart, label: 'Wishlist' },
    { id: 'settings' as Tab, icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      <PageHeader title="My Account" breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Account' }]} />
      <div className="container-lux pb-20">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="card p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-ink flex items-center justify-center text-xl font-serif font-bold mx-auto mb-4"
              >
                {(profile?.full_name?.[0] || profile?.email[0] || 'U').toUpperCase()}
              </motion.div>
              <h3 className="text-sm font-medium text-accent">{profile?.full_name || 'Member'}</h3>
              <p className="text-xs text-white/40 truncate">{profile?.email}</p>
              {profile?.role === 'admin' && (
                <Link to="/admin" className="btn-outline mt-4 w-full !py-2 !text-xs">Admin Panel</Link>
              )}
            </div>
            <nav className="mt-4 space-y-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-3 text-sm transition-all',
                    tab === t.id ? 'bg-gold-400/10 text-gold-400 border-l-2 border-gold-400' : 'text-white/60 hover:text-gold-400 hover:bg-white/5'
                  )}
                >
                  <t.icon width={16} height={16} /> {t.label}
                  {t.id === 'wishlist' && wishlistIds.length > 0 && (
                    <span className="ml-auto text-xs bg-gold-400 text-ink px-1.5 rounded-full">{wishlistIds.length}</span>
                  )}
                </button>
              ))}
              <button onClick={signOut} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/60 hover:text-rose-500 transition-colors">
                <LogOut width={16} height={16} /> Sign Out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {tab === 'dashboard' && (
                <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <h2 className="text-2xl font-serif font-medium text-gold-gradient mb-6">Welcome back, {profile?.full_name?.split(' ')[0] || 'Member'}</h2>
                  <StaggerGroup className="grid sm:grid-cols-3 gap-4">
                    {[
                      { icon: ShoppingBag, label: 'Total Orders', value: orders.length, color: 'text-gold-400' },
                      { icon: Clock, label: 'Pending', value: orders.filter((o) => o.status === 'pending').length, color: 'text-amber-500' },
                      { icon: Check, label: 'Delivered', value: orders.filter((o) => o.status === 'delivered').length, color: 'text-emerald-500' },
                    ].map((stat) => (
                      <motion.div key={stat.label} variants={staggerItem} className="card-lux p-6">
                        <stat.icon width={24} height={24} className={stat.color} />
                        <p className="text-3xl font-serif font-medium mt-3 text-accent">{stat.value}</p>
                        <p className="text-xs uppercase tracking-wider text-white/40 mt-1">{stat.label}</p>
                      </motion.div>
                    ))}
                  </StaggerGroup>
                  {orders.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-sm uppercase tracking-wider text-gold-400/60 mb-4">Recent Orders</h3>
                      <div className="space-y-3">
                        {orders.slice(0, 3).map((order) => (
                          <div key={order.id} className="card p-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-accent">{order.order_number}</p>
                              <p className="text-xs text-white/40">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={cn('text-xs px-2 py-1 rounded-full', statusColors[order.status])}>{order.status}</span>
                              <span className="text-sm font-semibold text-gold-400">{format(order.total)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {tab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <h2 className="text-2xl font-serif font-medium text-gold-gradient mb-6">Order History</h2>
                  {ordersLoading ? (
                    <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 skeleton" />)}</div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                      <Package width={40} height={40} className="text-gold-400/30 mx-auto mb-4" />
                      <p className="text-white/40">No orders yet.</p>
                      <Link to="/shop" className="btn-outline mt-4">Start Shopping</Link>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-gold-400/20" />
                      <div className="space-y-6">
                        {orders.map((order, i) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative pl-12"
                          >
                            <div className="absolute left-3 top-2 w-3 h-3 rounded-full bg-gold-400 ring-4 ring-ink" />
                            <div className="card p-5">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-sm font-medium text-accent">{order.order_number}</p>
                                  <p className="text-xs text-white/40">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className={cn('text-xs px-2.5 py-1 rounded-full capitalize', statusColors[order.status])}>{order.status}</span>
                              </div>
                              <div className="space-y-1">
                                {order.items?.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3 text-xs text-white/60">
                                    <div className="w-8 h-10 overflow-hidden bg-ink">
                                      {item.product_image && <img src={item.product_image} alt="" className="w-full h-full object-cover" />}
                                    </div>
                                    <span className="flex-1">{item.product_name} × {item.quantity}</span>
                                    <span className="text-gold-400">{format(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between mt-3 pt-3 border-t border-gold-400/10">
                                <span className="text-xs text-white/40 capitalize">{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</span>
                                <span className="text-sm font-semibold text-gold-400">{format(order.total)}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {tab === 'wishlist' && (
                <motion.div key="wish" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <h2 className="text-2xl font-serif font-medium text-gold-gradient mb-6">My Wishlist</h2>
                  {wishlistProducts.length === 0 ? (
                    <div className="text-center py-16">
                      <Heart width={40} height={40} className="text-gold-400/30 mx-auto mb-4" />
                      <p className="text-white/40">Your wishlist is empty.</p>
                      <Link to="/shop" className="btn-outline mt-4">Browse Products</Link>
                    </div>
                  ) : (
                    <StaggerGroup className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {wishlistProducts.map((p) => (
                        <motion.div key={p.id} variants={staggerItem}>
                          <ProductCard product={p} />
                        </motion.div>
                      ))}
                    </StaggerGroup>
                  )}
                </motion.div>
              )}

              {tab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <h2 className="text-2xl font-serif font-medium text-gold-gradient mb-6">Account Settings</h2>
                  <div className="card-lux p-6 max-w-lg space-y-5">
                    <div><label className="label">Full Name</label><input className="input" value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
                    <div><label className="label">Phone</label><input className="input" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} /></div>
                    <div><label className="label">Email (read-only)</label><input className="input opacity-50" value={profile?.email || ''} disabled /></div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveProfile} disabled={saving} className="btn-primary">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
