import { useEffect, useState } from 'react';
import { ArrowUp, MessageCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export function FloatingWidgets() {
  const [showTop, setShowTop] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* WhatsApp */}
      <motion.a
        href="https://wa.me/923174120995"
        target="_blank"
        rel="noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 left-6 z-40 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-emerald-500/30 transition-shadow"
        aria-label="WhatsApp"
      >
        <MessageCircle width={22} height={22} />
      </motion.a>

      {/* Back to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-gradient-to-br from-gold-300 to-gold-500 text-ink rounded-full flex items-center justify-center shadow-lg hover:shadow-gold-400/30 transition-shadow"
            aria-label="Back to top"
          >
            <ArrowUp width={20} height={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sticky cart (mobile) */}
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="sm:hidden fixed bottom-20 right-4 z-40"
          >
            <Link
              to="/cart"
              className="bg-gold-400 text-ink px-5 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-semibold"
            >
              <ShoppingBag width={16} height={16} /> {count}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
