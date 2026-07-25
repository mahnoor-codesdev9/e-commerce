import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

export function DiscountPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const seen = sessionStorage.getItem('outrex-popup-seen');
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 6000);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    setOpen(false);
    sessionStorage.setItem('outrex-popup-seen', '1');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('newsletter_subscribers').insert({ email });
    if (!error || error.code === '23505') {
      toast('Use code WELCOME10 for 10% off your first order!', 'success');
    } else {
      toast('Something went wrong.', 'error');
    }
    close();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={close} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative bg-graphite max-w-md w-full shadow-2xl overflow-hidden border border-gold-400/20"
          >
            <button onClick={close} className="absolute top-4 right-4 z-10 p-2 bg-ink/60 backdrop-blur-sm rounded-full text-accent hover:text-gold-400 transition-colors" aria-label="Close">
              <X width={18} height={18} />
            </button>
            <div className="aspect-[16/9] bg-ink overflow-hidden relative">
              <img
                src="https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="OutreX collection"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-graphite via-transparent to-transparent" />
            </div>
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center gap-1.5 text-gold-400 text-xs uppercase tracking-[0.25em] mb-3"
              >
                <Sparkles width={14} height={14} /> Welcome to OutreX
              </motion.div>
              <h2 className="text-2xl font-serif font-medium mb-2 text-gold-gradient">10% off your first order</h2>
              <p className="text-sm text-white/50 mb-6">
                Join our list for early access to collections and an exclusive welcome discount.
              </p>
              <form onSubmit={submit} className="space-y-3">
                <div className="relative">
                  <Mail width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="input pl-10"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn-primary w-full"
                >
                  Claim my discount
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
