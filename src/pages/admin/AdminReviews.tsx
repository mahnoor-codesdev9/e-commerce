import { useEffect, useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { StarRating } from '@/components/StarRating';
import { cn } from '@/lib/utils';
import type { Review } from '@/lib/types';
import { StaggerGroup, staggerItem } from '@/components/motion/MotionPrimitives';

export function AdminReviews() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<(Review & { product_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('reviews').select('*, product:products(name)').order('created_at', { ascending: false });
    setReviews((data ?? []).map((r: Record<string, unknown>) => ({ ...(r as Review), product_name: (r.product as { name: string })?.name })) as typeof reviews);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    const { error } = await supabase.from('reviews').update({ is_approved: true }).eq('id', id);
    if (error) toast('Failed', 'error'); else { toast('Review approved', 'success'); load(); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) toast('Failed', 'error'); else { toast('Deleted', 'success'); load(); }
  };

  return (
    <div>
      <h1 className="text-2xl font-serif font-medium text-gold-gradient mb-8">Reviews</h1>
      {loading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 skeleton" />)}</div> : reviews.length === 0 ? <p className="text-sm text-white/40">No reviews yet.</p> : (
        <StaggerGroup className="space-y-4">
          {reviews.map((r) => (
            <motion.div key={r.id} variants={staggerItem} className="card-lux p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-accent">{r.author_name}</span>
                    <StarRating rating={r.rating} size={12} />
                    {r.product_name && <span className="text-xs text-gold-400/50">on {r.product_name}</span>}
                  </div>
                  {r.title && <p className="font-serif font-medium mt-2 text-accent">{r.title}</p>}
                  <p className="text-sm text-white/50 mt-1">{r.body}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs px-2 py-1 rounded-full', r.is_approved ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500')}>{r.is_approved ? 'Approved' : 'Pending'}</span>
                  {!r.is_approved && <motion.button whileTap={{ scale: 0.9 }} onClick={() => approve(r.id)} className="p-1.5 hover:bg-emerald-500/10 text-emerald-500 transition-colors"><Check width={14} height={14} /></motion.button>}
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => del(r.id)} className="p-1.5 hover:bg-rose-500/10 text-rose-500 transition-colors"><Trash2 width={14} height={14} /></motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
