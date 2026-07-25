import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Home, Search } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { ScrollReveal } from '@/components/motion/MotionPrimitives';
import { useFAQs } from '@/lib/hooks';
import { useSEO } from '@/lib/seo';

export function FaqPage() {
  const { faqs } = useFAQs();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  useSEO({
    title: 'FAQ | OutreX Fashion',
    description: 'Find answers to common questions about orders, shipping, returns, and more.',
    canonical: window.location.href,
  });

  return (
    <>
      <PageHeader title="Frequently Asked Questions" subtitle="Find answers to common questions about orders, shipping, returns, and more." breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]} />
      <div className="container-lux pb-20">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={faq.id} className="card-lux overflow-hidden">
                  <button
                    onClick={() => setOpenIdx(openIdx === i ? null : i)}
                    className="flex items-center justify-between w-full p-5 text-left"
                  >
                    <span className="text-sm font-medium text-accent">{faq.question}</span>
                    <motion.div animate={{ rotate: openIdx === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <ChevronDown width={18} height={18} className="text-gold-400" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openIdx === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm text-white/50 leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </ScrollReveal>
          <div className="text-center mt-12">
            <p className="text-sm text-white/40 mb-4">Still have questions?</p>
            <Link to="/contact" className="btn-outline">Contact Us</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export function NotFoundPage() {
  useSEO({ title: '404 | OutreX Fashion', canonical: window.location.href });

  return (
    <div className="min-h-[70vh] flex items-center justify-center container-lux text-center">
      <div>
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-[120px] sm:text-[180px] font-serif font-bold text-gold-gradient leading-none"
        >
          404
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl font-serif text-accent mb-2">Page Not Found</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm text-white/40 mb-8">The page you're looking for doesn't exist or has been moved.</motion.p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary group"><Home width={16} height={16} /> Go Home</Link>
          <Link to="/shop" className="btn-outline"><Search width={16} height={16} /> Browse Shop</Link>
        </div>
      </div>
    </div>
  );
}
