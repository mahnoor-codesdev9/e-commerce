import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { Logo } from '@/components/Logo';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) toast(error.message, 'error');
    else {
      setSent(true);
      toast('Reset link sent to your email', 'success');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.pexels.com/photos/9558760/pexels-photo-9558760.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-ink/90" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8"><div className="inline-block"><Logo /></div></div>
        <div className="card-lux p-8">
          {sent ? (
            <div className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-400/10 border border-gold-400/30 mb-6">
                <Check width={28} height={28} className="text-gold-400" />
              </motion.div>
              <h1 className="text-2xl font-serif font-medium text-gold-gradient mb-3">Check your email</h1>
              <p className="text-sm text-white/50 mb-6">We've sent a password reset link to <span className="text-gold-400">{email}</span></p>
              <Link to="/login" className="btn-outline">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-serif font-medium text-gold-gradient text-center mb-2">Reset Password</h1>
              <p className="text-sm text-white/40 text-center mb-8">Enter your email and we'll send you a reset link</p>
              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400/40" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="you@example.com" />
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="btn-primary w-full group">
                  {loading ? 'Sending...' : <>Send Reset Link <ArrowRight width={16} height={16} className="group-hover:translate-x-1 transition-transform" /></>}
                </motion.button>
              </form>
              <p className="mt-6 text-center text-sm text-white/40">
                <Link to="/login" className="text-gold-400 hover:text-gold-300 transition-colors">Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
