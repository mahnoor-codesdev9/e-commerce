import { useEffect, useState } from 'react';
import { Trash2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { StaggerGroup, staggerItem } from '@/components/motion/MotionPrimitives';

export function AdminNewsletter() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<{ id: string; email: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
    setSubscribers((data ?? []) as typeof subscribers);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const del = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return;
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    if (error) toast('Failed', 'error'); else { toast('Removed', 'success'); load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-medium text-gold-gradient">Newsletter Subscribers</h1>
        <span className="text-sm text-white/40">{subscribers.length} subscribers</span>
      </div>
      {loading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 skeleton" />)}</div> : subscribers.length === 0 ? <p className="text-sm text-white/40">No subscribers yet.</p> : (
        <StaggerGroup className="space-y-3">
          {subscribers.map((s) => (
            <motion.div key={s.id} variants={staggerItem} className="card-lux p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center"><Mail width={16} height={16} className="text-gold-400" /></div>
                <div><p className="text-sm text-accent">{s.email}</p><p className="text-xs text-white/30">{new Date(s.created_at).toLocaleDateString()}</p></div>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => del(s.id)} className="p-1.5 hover:bg-rose-500/10 text-rose-500 transition-colors"><Trash2 width={14} height={14} /></motion.button>
            </motion.div>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
