import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Phone, Mail, MessageCircle, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { useSettings } from '@/context/SettingsContext';
import { useFooterConfig } from '@/lib/hooks';
import { useCategories } from '@/lib/hooks';

const socialIconMap: Record<string, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: Instagram,
};

export function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { settings } = useSettings();
  const { config } = useFooterConfig();
  const { categories } = useCategories();

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.from('newsletter_subscribers').insert({ email });
    setLoading(false);
    if (error) {
      if (error.code === '23505') toast('You are already subscribed.', 'info');
      else toast('Something went wrong. Try again.', 'error');
    } else {
      toast('Subscribed! Welcome to OutreX.', 'success');
      setEmail('');
    }
  };

  const quickLinks = config?.quick_links ?? [];
  const socialLinks = config?.social_links ?? [];
  const paymentIcons = config?.payment_icons ?? [];
  const newsletterTitle = config?.newsletter_title ?? 'Become an OutreX Insider';
  const newsletterDesc = config?.newsletter_description ?? 'Subscribe for early access to new collections, private sales, and style notes.';
  const copyright = config?.copyright_text ?? settings?.copyright_text ?? 'OutreX Fashion. All rights reserved.';

  const policyLinks = [
    { label: 'Shipping Policy', to: '/shipping-policy' },
    { label: 'Return Policy', to: '/return-policy' },
    { label: 'Refund Policy', to: '/refund-policy' },
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Terms & Conditions', to: '/terms' },
  ];

  return (
    <footer className="bg-ink text-white mt-24 border-t border-gold-400/10">
      {/* Newsletter */}
      <div className="border-b border-gold-400/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #d4af37, transparent 50%)' }} />
        <div className="container-lux py-20 text-center relative">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="eyebrow text-gold-400/60"
          >
            Join the list
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-serif font-medium mb-4 text-gold-gradient"
          >
            {newsletterTitle}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/50 max-w-xl mx-auto mb-10 text-sm sm:text-base"
          >
            {newsletterDesc}
          </motion.p>
          <motion.form
            onSubmit={subscribe}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex max-w-lg mx-auto gap-2"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 bg-white/5 border border-gold-400/20 px-5 py-4 text-sm text-accent placeholder:text-white/30 focus:outline-none focus:border-gold-400 transition-colors rounded-sm"
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="btn-primary !px-8 group"
            >
              {loading ? '...' : 'Subscribe'}
              <ArrowRight width={16} height={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.form>
        </div>
      </div>

      {/* Links */}
      <div className="container-lux py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-6 text-sm text-white/50 max-w-xs leading-relaxed">
            {config?.description ?? 'Luxury fashion and accessories crafted with precision and designed for the modern wardrobe.'}
          </p>
          <div className="flex gap-3 mt-6">
            {socialLinks.map((s, i) => {
              const Icon = socialIconMap[s.icon] ?? Instagram;
              return (
                <motion.a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 border border-gold-400/20 flex items-center justify-center hover:bg-gold-400 hover:text-ink hover:border-gold-400 transition-all rounded-full"
                  aria-label={s.icon}
                >
                  <Icon width={16} height={16} />
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Shop links from DB */}
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-gold-400/60 mb-5">Shop</h3>
          <ul className="space-y-3 text-sm">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-white/60 hover:text-gold-400 transition-colors link">{link.label}</Link>
              </li>
            ))}
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/shop?category=${c.slug}`} className="text-white/60 hover:text-gold-400 transition-colors link">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company links */}
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-gold-400/60 mb-5">Company</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="text-white/60 hover:text-gold-400 transition-colors link">About Us</Link></li>
            <li><Link to="/contact" className="text-white/60 hover:text-gold-400 transition-colors link">Contact</Link></li>
            <li><Link to="/faq" className="text-white/60 hover:text-gold-400 transition-colors link">FAQ</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-gold-400/60 mb-5">Policies</h3>
          <ul className="space-y-3 text-sm">
            {policyLinks.map((p) => (
              <li key={p.to}><Link to={p.to} className="text-white/60 hover:text-gold-400 transition-colors link">{p.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Contact + Payment */}
      <div className="container-lux pb-8">
        <div className="border-t border-gold-400/10 pt-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 text-sm text-white/50">
            {settings?.contact_phone && (
              <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <Phone width={14} height={14} /> {settings.contact_phone}
              </a>
            )}
            {settings?.whatsapp_number && (
              <a href={`https://wa.me/${settings.whatsapp_number}`} className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <MessageCircle width={14} height={14} /> WhatsApp
              </a>
            )}
            {settings?.contact_email && (
              <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <Mail width={14} height={14} /> {settings.contact_email}
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            {paymentIcons.map((p) => (
              <div key={p} className="px-3 py-1.5 text-[10px] font-bold tracking-wider border border-gold-400/20 text-gold-400/60 rounded-sm">
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gold-400/10">
        <div className="container-lux py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} {copyright}</p>
          <div className="flex gap-4">
            <Link to="/shipping-policy" className="hover:text-gold-400 transition-colors">Shipping</Link>
            <Link to="/return-policy" className="hover:text-gold-400 transition-colors">Returns</Link>
            <Link to="/refund-policy" className="hover:text-gold-400 transition-colors">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
