import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Heart, ShoppingBag, Check } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { discountPercent, effectivePrice } from '@/lib/utils';
import { StarRating } from './StarRating';

export function ProductCard({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView?: (p: Product) => void;
}) {
  const { format } = useCurrency();
  const { toggle, has } = useWishlist();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);
  const discount = discountPercent(product.price, product.sale_price);
  const price = effectivePrice(product.price, product.sale_price);
  const image = product.images?.[0] ?? '';
  const isWishlisted = has(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      image,
      price: product.price,
      sale_price: product.sale_price,
      quantity: 1,
      color: product.colors?.[0] ?? null,
      size: product.sizes?.[0] ?? null,
      stock: product.stock,
    });
    setAdded(true);
    toast('Added to cart', 'success');
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative"
    >
      <div className="relative overflow-hidden bg-graphite aspect-[3/4] border border-white/5 group-hover:border-gold-400/30 transition-colors duration-500">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <motion.img
            src={image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_new && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="badge-new"
            >
              New
            </motion.span>
          )}
          {discount && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="badge-sale"
            >
              -{discount}%
            </motion.span>
          )}
        </div>

        {/* Wishlist */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 bg-ink/60 backdrop-blur-sm rounded-full hover:bg-gold-400 transition-colors z-10"
          aria-label="Toggle wishlist"
        >
          <AnimatePresence mode="wait">
            {isWishlisted ? (
              <motion.div
                key="filled"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Heart width={16} height={16} className="fill-gold-400 text-gold-400" />
              </motion.div>
            ) : (
              <motion.div
                key="outline"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Heart width={16} height={16} className="text-accent" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Hover actions */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-gold-400 text-ink text-xs font-semibold uppercase tracking-wider py-2.5 px-3 hover:bg-gold-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
                  <Check width={14} height={14} /> Added
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
                  <ShoppingBag width={14} height={14} /> Add to Cart
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          {onQuickView && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="p-2.5 bg-ink/80 backdrop-blur-sm text-accent hover:text-gold-400 transition-colors"
              aria-label="Quick view"
            >
              <Eye width={16} height={16} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 space-y-1">
        {product.category && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-400/50">{product.category.name}</p>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-serif text-base font-medium text-accent hover:text-gold-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gold-400">{format(price)}</span>
          {product.sale_price && (
            <span className="text-xs text-white/30 line-through">{format(product.price)}</span>
          )}
        </div>
        {product.rating > 0 && (
          <StarRating rating={product.rating} size={12} showValue />
        )}
      </div>
    </motion.div>
  );
}
