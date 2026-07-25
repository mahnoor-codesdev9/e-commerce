import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useProducts } from '@/lib/hooks';
import { ProductCard } from '@/components/ProductCard';
import { PageHeader } from '@/components/PageHeader';
import { StaggerGroup, staggerItem } from '@/components/motion/MotionPrimitives';

export function WishlistPage() {
  const { ids } = useWishlist();
  const { products } = useProducts({ limit: 100 });
  const wishlistProducts = products.filter((p) => ids.includes(p.id));

  return (
    <>
      <PageHeader title="My Wishlist" breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />
      <div className="container-lux pb-20">
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-graphite border border-gold-400/20 rounded-full mb-8"
            >
              <Heart width={36} height={36} className="text-gold-400/40" />
            </motion.div>
            <h2 className="text-2xl font-serif font-medium text-accent mb-3">Your wishlist is empty</h2>
            <p className="text-white/40 mb-8 text-sm">Save items you love to find them quickly later.</p>
            <Link to="/shop" className="btn-primary group">
              Explore Products <ArrowRight width={16} height={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <StaggerGroup className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((p) => (
              <motion.div key={p.id} variants={staggerItem}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </StaggerGroup>
        )}
      </div>
    </>
  );
}
