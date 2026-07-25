import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function StarRating({
  rating,
  size = 16,
  className = '',
  showValue = false,
}: {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(rating);
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Star
              width={size}
              height={size}
              className={filled ? 'fill-gold-400 text-gold-400' : 'text-white/15'}
            />
          </motion.div>
        );
      })}
      {showValue && (
        <span className="ml-1.5 text-xs text-gold-400/60">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
