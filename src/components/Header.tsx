import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Heart, ShoppingBag, Menu, X, ChevronDown, User, LogOut, LayoutDashboard,
} from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useCategories, useHeaderConfig } from '@/lib/hooks';
import { CURRENCIES } from '@/lib/types';
import { cn } from '@/lib/utils';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { count } = useCart();
  const { ids: wishlistIds } = useWishlist();
  const { currency, setCurrency } = useCurrency();
  const { profile, signOut, isAdmin } = useAuth();
  const { settings } = useSettings();
  const { categories } = useCategories();
  const { config } = useHeaderConfig();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = config?.nav_items ?? [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const showSearch = config?.show_search ?? true;
  const showWishlist = config?.show_wishlist ?? true;
  const showCart = config?.show_cart ?? true;
  const showAccount = config?.show_account ?? true;

  return (
    <>
      {/* Announcement bar */}
      {settings?.announcement_enabled && (
        <div className="bg-ink text-gold-400 text-center text-[10px] tracking-[0.25em] uppercase py-2 px-4 border-b border-gold-400/10">
          {settings?.announcement_text}
        </div>
      )}

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'sticky top-0 z-50 transition-all duration-500',
          scrolled
            ? 'glass shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-transparent border-b border-transparent'
        )}
      >
        <div className="container-lux">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button
              className="lg:hidden p-2 -ml-2 text-accent hover:text-gold-400 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu width={22} height={22} />
            </button>

            <Logo />

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'text-sm font-medium tracking-wide link transition-colors',
                      isActive ? 'text-gold-400' : 'text-accent hover:text-gold-400'
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              {/* Categories mega menu */}
              <div
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <button className="text-sm font-medium tracking-wide flex items-center gap-1 text-accent hover:text-gold-400 transition-colors">
                  Categories
                  <motion.span animate={{ rotate: megaMenuOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown width={14} height={14} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {megaMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                    >
                      <div className="bg-graphite/95 backdrop-blur-xl border border-gold-400/20 shadow-2xl min-w-[220px] py-3 overflow-hidden">
                        {categories.map((c, i) => (
                          <motion.div
                            key={c.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <Link
                              to={`/shop?category=${c.slug}`}
                              className="flex items-center px-5 py-2.5 text-sm text-accent hover:text-gold-400 hover:bg-gold-400/5 transition-all group"
                            >
                              <span className="w-1 h-1 rounded-full bg-gold-400/0 group-hover:bg-gold-400 transition-all mr-3" />
                              {c.name}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {showSearch && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-accent hover:text-gold-400 transition-colors"
                  aria-label="Search"
                >
                  <Search width={20} height={20} />
                </motion.button>
              )}

              {/* Currency */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setCurrencyOpen((o) => !o)}
                  className="p-2 text-accent hover:text-gold-400 transition-colors text-xs font-medium tracking-wide"
                  aria-label="Currency"
                >
                  {currency.code}
                </button>
                <AnimatePresence>
                  {currencyOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-1 bg-graphite border border-gold-400/20 shadow-xl min-w-[100px] py-1 z-50"
                    >
                      {CURRENCIES.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setCurrency(c.code); setCurrencyOpen(false); }}
                          className={cn(
                            'block w-full text-left px-3 py-1.5 text-xs hover:bg-gold-400/10 transition-colors',
                            c.code === currency.code ? 'text-gold-400 font-semibold' : 'text-accent'
                          )}
                        >
                          {c.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Account */}
              {showAccount && (
                <div
                  className="relative"
                  onMouseEnter={() => setAccountOpen(true)}
                  onMouseLeave={() => setAccountOpen(false)}
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-accent hover:text-gold-400 transition-colors"
                    aria-label="Account"
                  >
                    <User width={20} height={20} />
                  </motion.button>
                  <AnimatePresence>
                    {accountOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full pt-3"
                      >
                        <div className="bg-graphite/95 backdrop-blur-xl border border-gold-400/20 shadow-2xl min-w-[220px] py-2">
                          {profile ? (
                            <>
                              <div className="px-4 py-2.5 border-b border-gold-400/10">
                                <p className="text-sm font-medium text-gold-400 truncate">{profile.full_name || 'Account'}</p>
                                <p className="text-xs text-white/40 truncate">{profile.email}</p>
                              </div>
                              <Link to="/account" className="flex items-center gap-2 px-4 py-2.5 text-sm text-accent hover:text-gold-400 hover:bg-gold-400/5 transition-all">
                                <User width={14} height={14} /> Dashboard
                              </Link>
                              {isAdmin && (
                                <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-accent hover:text-gold-400 hover:bg-gold-400/5 transition-all">
                                  <LayoutDashboard width={14} height={14} /> Admin
                                </Link>
                              )}
                              <button
                                onClick={() => signOut()}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-accent hover:text-gold-400 hover:bg-gold-400/5 transition-all text-left"
                              >
                                <LogOut width={14} height={14} /> Sign out
                              </button>
                            </>
                          ) : (
                            <>
                              <Link to="/login" className="block px-4 py-2.5 text-sm text-accent hover:text-gold-400 hover:bg-gold-400/5 transition-all">Sign in</Link>
                              <Link to="/register" className="block px-4 py-2.5 text-sm text-accent hover:text-gold-400 hover:bg-gold-400/5 transition-all">Create account</Link>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {showWishlist && (
                <Link to="/wishlist" className="p-2 text-accent hover:text-gold-400 transition-colors relative" aria-label="Wishlist">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Heart width={20} height={20} />
                  </motion.div>
                  <AnimatePresence>
                    {wishlistIds.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-0.5 -right-0.5 bg-gold-400 text-ink text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        {wishlistIds.length}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )}

              {showCart && (
                <Link to="/cart" className="p-2 text-accent hover:text-gold-400 transition-colors relative" aria-label="Cart">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <ShoppingBag width={20} height={20} />
                  </motion.div>
                  <AnimatePresence>
                    {count > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-0.5 -right-0.5 bg-gold-400 text-ink text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        {count}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-ink/95 backdrop-blur-xl"
          >
            <div className="container-lux py-20">
              <div className="flex justify-end mb-6">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="text-accent hover:text-gold-400 transition-colors"
                >
                  <X width={28} height={28} />
                </motion.button>
              </div>
              <motion.form
                onSubmit={submitSearch}
                className="max-w-2xl mx-auto"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <div className="flex items-center gap-3 border-b-2 border-gold-400/40 pb-3 focus-within:border-gold-400 transition-colors">
                  <Search width={24} height={24} className="text-gold-400/60" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={settings?.search_placeholder ?? 'Search for products...'}
                    className="flex-1 bg-transparent text-2xl font-serif text-accent focus:outline-none placeholder:text-white/30"
                  />
                </div>
                <p className="mt-4 text-sm text-white/40">Try: watches, tee, trousers, cap</p>
              </motion.form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-ink shadow-2xl overflow-y-auto border-r border-gold-400/10"
            >
              <div className="flex items-center justify-between p-4 border-b border-gold-400/10">
                <Logo />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="text-accent hover:text-gold-400 transition-colors"
                >
                  <X width={24} height={24} />
                </motion.button>
              </div>
              <nav className="p-4 space-y-1">
                {navLinks.map((l, i) => (
                  <motion.div
                    key={l.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 text-base font-medium text-accent hover:text-gold-400 border-b border-white/5 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-4">
                  <p className="label">Categories</p>
                  {categories.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                    >
                      <Link
                        to={`/shop?category=${c.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="block py-2 text-sm text-white/60 hover:text-gold-400 transition-colors"
                      >
                        {c.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
                <div className="pt-4">
                  <p className="label">Currency</p>
                  <div className="flex flex-wrap gap-2">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => setCurrency(c.code)}
                        className={cn(
                          'px-3 py-1.5 text-xs border transition-all',
                          c.code === currency.code
                            ? 'border-gold-400 bg-gold-400 text-ink'
                            : 'border-white/10 text-accent hover:border-gold-400/40'
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
