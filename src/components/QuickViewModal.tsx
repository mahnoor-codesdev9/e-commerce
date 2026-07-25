import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Check } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { StarRating } from './StarRating';
import { effectivePrice, discountPercent, cn } from '@/lib/utils';

export function QuickViewModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { format } = useCurrency();
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const { toast } = useToast();
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setColor(product.colors?.[0] ?? null);
      setSize(product.sizes?.[0] ?? null);
      setAdded(false);
    }
  }, [product]);

  if (!product) return null;
  const price = effectivePrice(product.price, product.sale_price);
  const discount = discountPercent(product.price, product.sale_price);

  const handleAdd = () => {
    addItem({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      sale_price: product.sale_price,
      quantity: 1,
      color,
      size,
      stock: product.stock,
    });
    setAdded(true);
    toast('Added to cart', 'success');
    setTimeout(() => onClose(), 1000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative bg-graphite max-w-4xl w-full max-h-[90vh] overflow-y-auto grid md:grid-cols-2 shadow-2xl border border-gold-400/20"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-ink/80 backdrop-blur-sm rounded-full text-accent hover:text-gold-400 transition-colors"
            aria-label="Close"
          >
            <X width={20} height={20} />
          </button>

          <div className="aspect-square bg-ink overflow-hidden">
            <motion.img
              src={product.images[0]}
              alt={product.name}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8 flex flex-col">
            {product.category && (
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold-400/50">{product.category.name}</p>
            )}
            <h2 className="text-2xl font-serif font-medium mt-1 text-accent">{product.name}</h2>
            {product.rating > 0 && <StarRating rating={product.rating} size={14} showValue className="mt-2" />}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-2xl font-semibold text-gold-400">{format(price)}</span>
              {discount && <span className="text-rose-500 text-sm font-medium">-{discount}%</span>}
              {product.sale_price && (
                <span className="text-white/30 line-through text-sm">{format(product.price)}</span>
              )}
            </div>
            <p className="mt-4 text-sm text-white/60 line-clamp-4 leading-relaxed">{product.description}</p>

            {product.colors.length > 0 && (
              <div className="mt-6">
                <p className="label">Color</p>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn(
                        'px-3 py-1.5 text-xs border transition-all',
                        color === c
                          ? 'border-gold-400 bg-gold-400 text-ink'
                          : 'border-white/10 text-accent hover:border-gold-400/40'
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div className="mt-4">
                <p className="label">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={cn(
                        'px-3 py-1.5 text-xs border transition-all',
                        size === s
                          ? 'border-gold-400 bg-gold-400 text-ink'
                          : 'border-white/10 text-accent hover:border-gold-400/40'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-6 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                className="btn-primary flex-1"
              >
                {added ? (
                  <><Check width={16} height={16} /> Added</>
                ) : (
                  <><ShoppingBag width={16} height={16} /> Add to Cart</>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggle(product.id)}
                className="btn-outline !px-4"
                aria-label="Wishlist"
              >
                <Heart width={16} height={16} className={has(product.id) ? 'fill-gold-400 text-gold-400' : ''} />
              </motion.button>
            </div>
            <Link
              to={`/product/${product.slug}`}
              onClick={onClose}
              className="mt-3 text-center text-xs underline underline-offset-4 text-white/40 hover:text-gold-400 transition-colors"
            >
              View full details
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
