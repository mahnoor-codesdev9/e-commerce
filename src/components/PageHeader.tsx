import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {item.to ? (
            <Link to={item.to} className="hover:text-gold-400 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-gold-400">{item.label}</span>
          )}
          {i < items.length - 1 && <ChevronRight width={12} height={12} className="text-gold-400/30" />}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; to?: string }[];
}) {
  return (
    <div className="relative border-b border-gold-400/10 mb-12 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #d4af37, transparent 60%)' }} />
      <div className="container-lux py-16 text-center relative">
        {breadcrumbs && (
          <div className="flex justify-center mb-4">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-gold-gradient"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-white/50 max-w-2xl mx-auto text-sm sm:text-base"
          >
            {subtitle}
          </motion.p>
        )}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="gold-divider mx-auto mt-6"
        />
      </div>
    </div>
  );
}
