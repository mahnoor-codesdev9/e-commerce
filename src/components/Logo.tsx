import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';

export function Logo({
  className = '',
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  const { settings } = useSettings();

  const brandName = settings?.brand_name ?? 'OutreX Fashion';
  const shortName = brandName.split(' ')[0] || 'OutreX';
  const tagline = settings?.brand_tagline ?? 'Luxury Fashion & Accessories';

  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 group ${className}`}
      aria-label={`${brandName} home`}
    >
      {settings?.logo_url ? (
        <motion.img
          src={settings.logo_url}
          alt={brandName}
          whileHover={{ scale: 1.05 }}
          className="h-10 w-auto object-contain"
        />
      ) : (
        <motion.img
          src="/favicon.ico"
          alt="Logo"
          whileHover={{ scale: 1.05 }}
          className="h-10 w-auto object-contain"
        />
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