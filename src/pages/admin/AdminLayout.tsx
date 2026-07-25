import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Ticket, Star, Mail, MessageSquare, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

export function AdminLayout() {
  const { profile, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-ink"><p className="text-sm text-gold-400/60">Loading...</p></div>;
  if (!profile) return <Navigate to="/login" replace />;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-ink">
      <p className="text-white/40">You do not have admin access.</p>
      <button onClick={() => navigate('/')} className="btn-outline">Back to store</button>
    </div>
  );

  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
    { to: '/admin/reviews', label: 'Reviews', icon: Star },
    { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
    { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { to: '/admin/homepage', label: 'Homepage CMS', icon: LayoutDashboard },
    { to: '/admin/about', label: 'About CMS', icon: LayoutDashboard },
    { to: '/admin/contact', label: 'Contact CMS', icon: LayoutDashboard },
    { to: '/admin/pages', label: 'Pages', icon: LayoutDashboard },
    { to: '/admin/faqs', label: 'FAQs', icon: LayoutDashboard },
    { to: '/admin/media', label: 'Media Library', icon: LayoutDashboard },
    { to: '/admin/settings', label: 'Site Settings', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-ink">
      {/* Top bar */}
      <header className="glass sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-accent hover:text-gold-400 transition-colors"><Menu width={20} height={20} /></button>
            <Logo />
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] bg-gold-400 text-ink px-2 py-1 font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/40 hidden sm:block">{profile.email}</span>
            <button onClick={() => { signOut(); navigate('/'); }} className="p-2 text-accent hover:text-gold-400 hover:bg-gold-400/5 transition-colors" aria-label="Sign out"><LogOut width={18} height={18} /></button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn('fixed lg:sticky top-16 left-0 z-20 h-[calc(100vh-4rem)] w-64 bg-graphite border-r border-gold-400/10 overflow-y-auto transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
          <div className="lg:hidden flex justify-end p-4"><button onClick={() => setSidebarOpen(false)} className="text-accent hover:text-gold-400"><X width={20} height={20} /></button></div>
          <nav className="p-4 space-y-1">
            {links.map((l, i) => (
              <motion.div key={l.to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 text-sm transition-all', isActive ? 'bg-gold-400/10 text-gold-400 border-l-2 border-gold-400 font-medium' : 'text-white/60 hover:text-gold-400 hover:bg-white/5')}
                >
                  <l.icon width={16} height={16} /> {l.label}
                </NavLink>
              </motion.div>
            ))}
          </nav>
        </aside>

        <AnimatePresence>
          {sidebarOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-10 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        </AnimatePresence>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
