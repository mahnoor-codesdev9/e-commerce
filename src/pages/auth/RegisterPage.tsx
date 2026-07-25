import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Logo } from '@/components/Logo';

export function RegisterPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast('Password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      toast(error, 'error');
    } else {
      toast('Account created! Welcome to OutreX.', 'success');
      navigate('/account');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="" className="w-full h-full object-cover" />
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
          <h1 className="text-2xl font-serif font-medium text-gold-gradient text-center mb-2">Create Account</h1>
          <p className="text-sm text-white/40 text-center mb-8">Join the OutreX community</p>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400/40" />
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input pl-10" placeholder="Your name" />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400/40" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400/40" />
                <input type={showPass ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10 pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-gold-400 transition-colors">
                  {showPass ? <EyeOff width={16} height={16} /> : <Eye width={16} height={16} />}
                </button>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="btn-primary w-full group">
              {loading ? 'Creating...' : <>Create Account <ArrowRight width={16} height={16} className="group-hover:translate-x-1 transition-transform" /></>}
            </motion.button>
          </form>
          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account? <Link to="/login" className="text-gold-400 hover:text-gold-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
