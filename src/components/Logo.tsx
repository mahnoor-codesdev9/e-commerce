import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';

export function Logo({ className = '', showText = true }: { className?: string; showText?: boolean }) {
  const { settings } = useSettings();
  const brandName = settings?.brand_name ?? 'OutreX Fashion';
  const shortName = brandName.split(' ')[0] || 'OutreX';
  const tagline = settings?.brand_tagline ?? 'Fashion';

  return (
    <Link to="/" className={`flex items-center gap-2.5 group ${className}`} aria-label={`${brandName} home`}>
      {settings?.logo_url ? (
        <motion.img
          src={settings.logo_url}
          alt={brandName}
          whileHover={{ scale: 1.05 }}
          className="h-9 w-auto object-contain"
        />
      ) : (
        <motion.span
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center justify-center w-9 h-9 bg-gradient-to-br from-gold-300 via-gold-400 to-gold-600 text-ink font-serif font-bold text-lg tracking-tight"
        >
          {/* {shortName.slice(0, 2).toUpperCase()} */}
          <img src="/public/favicon.ico" alt="logo" />
        </motion.span>
      )}
      {showText && (
        <span className="font-serif text-xl font-semibold tracking-tight leading-none text-accent">
          {shortName}
          <span className="block text-[10px] font-sans font-medium uppercase tracking-[0.3em] text-gold-400/60 mt-0.5">
            {tagline}
          </span>
        </span>
      )}
    </Link>
  );
}
