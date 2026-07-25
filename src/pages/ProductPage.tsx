import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ShoppingBag, Check, Minus, Plus,
  Truck, ShieldCheck, RotateCcw,
} from 'lucide-react';
import { useProduct, useReviews, useProducts } from '@/lib/hooks';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { useSEO } from '@/lib/seo';
import { ProductCard } from '@/components/ProductCard';
import { StarRating } from '@/components/StarRating';
import { Breadcrumb } from '@/components/PageHeader';
import { ScrollReveal, StaggerGroup, staggerItem } from '@/components/motion/MotionPrimitives';
import { effectivePrice, discountPercent, cn } from '@/lib/utils';

export function ProductPage() {
  const { slug } = useParams();
  const { product, loading } = useProduct(slug);
  const { reviews, loading: reviewsLoading } = useReviews(product?.id);
  const { products: related } = useProducts({ category: product?.category?.slug, limit: 4 });
  const { format } = useCurrency();
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const { toast } = useToast();
  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [zoomOpen, setZoomOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      setActiveImage(0);
      setColor(product.colors?.[0] ?? null);
      setSize(product.sizes?.[0] ?? null);
      setQty(1);
    }
  }, [product]);

  useSEO({
    title: product?.seo_title ?? `${product?.name} | OutreX Fashion`,
    description: product?.seo_description ?? product?.description ?? undefined,
    keywords: product?.seo_keywords ?? undefined,
    image: product?.images?.[0],
    canonical: window.location.href,
  });

  if (loading) {
    return (
      <div className="container-lux py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="aspect-square skeleton" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 skeleton" />
            <div className="h-6 w-1/3 skeleton" />
            <div className="h-24 w-full skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-lux py-20 text-center">
        <p className="text-white/40 text-lg">Product not found.</p>
        <Link to="/shop" className="btn-outline mt-4">Back to Shop</Link>
      </div>
    );
  }

  const price = effectivePrice(product.price, product.sale_price);
  const discount = discountPercent(product.price, product.sale_price);
  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    addItem({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      sale_price: product.sale_price,
      quantity: qty,
      color,
      size,
      stock: product.stock,
    });
    setAdded(true);
    toast('Added to cart', 'success');
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <div className="container-lux py-8">
        <Breadcrumb items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          { label: product.name },
        ]} />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-4">
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex lg:flex-col gap-3 lg:w-20">
                {product.images.map((img, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      'aspect-square w-16 lg:w-full overflow-hidden border-2 transition-colors',
                      activeImage === i ? 'border-gold-400' : 'border-white/10 hover:border-gold-400/40'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </motion.button>
                ))}
              </div>
            )}
            {/* Main image */}
            <div className="flex-1 relative overflow-hidden bg-graphite border border-white/5 group" ref={galleryRef}>
              <motion.img
                key={activeImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full aspect-square object-cover cursor-zoom-in"
                onClick={() => setZoomOpen(true)}
              />
              {discount && <span className="badge-sale">-{discount}%</span>}
              {product.is_new && <span className="badge-new mt-8">New</span>}
            </div>
          </div>

          {/* Purchase panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {product.category && (
                <p className="text-xs uppercase tracking-[0.2em] text-gold-400/50 mb-2">{product.category.name}</p>
              )}
              <h1 className="text-3xl lg:text-4xl font-serif font-medium text-accent">{product.name}</h1>
              {product.rating > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <StarRating rating={product.rating} size={16} />
                  <span className="text-sm text-white/40">({product.review_count} reviews)</span>
                </div>
              )}
              <div className="flex items-center gap-3 mt-5">
                <span className="text-3xl font-semibold text-gold-400">{format(price)}</span>
                {product.sale_price && (
                  <span className="text-lg text-white/30 line-through">{format(product.price)}</span>
                )}
                {discount && (
                  <span className="text-sm text-rose-500 font-medium">Save {discount}%</span>
                )}
              </div>

              <p className="mt-6 text-sm text-white/60 leading-relaxed">{product.description}</p>

              {/* Colors */}
              {product.colors.length > 0 && (
                <div className="mt-6">
                  <p className="label">Color: {color}</p>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((c) => (
                      <motion.button
                        key={c}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setColor(c)}
                        className={cn(
                          'px-4 py-2 text-xs border transition-all',
                          color === c ? 'border-gold-400 bg-gold-400 text-ink' : 'border-white/10 text-accent hover:border-gold-400/40'
                        )}
                      >
                        {c}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes.length > 0 && (
                <div className="mt-4">
                  <p className="label">Size: {size}</p>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((s) => (
                      <motion.button
                        key={s}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSize(s)}
                        className={cn(
                          'px-4 py-2 text-xs border transition-all',
                          size === s ? 'border-gold-400 bg-gold-400 text-ink' : 'border-white/10 text-accent hover:border-gold-400/40'
                        )}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + Add */}
              <div className="flex gap-3 mt-8">
                <div className="flex items-center border border-white/10">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 text-accent hover:text-gold-400 transition-colors">
                    <Minus width={16} height={16} />
                  </motion.button>
                  <span className="w-12 text-center text-sm font-medium">{qty}</span>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="p-3 text-accent hover:text-gold-400 transition-colors">
                    <Plus width={16} height={16} />
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  disabled={product.stock === 0}
                  className="btn-primary flex-1"
                >
                  {added ? <><Check width={16} height={16} /> Added to Cart</> : <><ShoppingBag width={16} height={16} /> Add to Cart</>}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggle(product.id)}
                  className="btn-outline !px-4"
                  aria-label="Wishlist"
                >
                  <Heart width={18} height={18} className={has(product.id) ? 'fill-gold-400 text-gold-400' : ''} />
                </motion.button>
              </div>

              {product.stock <= 5 && product.stock > 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-rose-400">
                  Only {product.stock} left in stock
                </motion.p>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gold-400/10">
                {[
                  { icon: Truck, label: 'Free Shipping' },
                  { icon: ShieldCheck, label: 'Secure Payment' },
                  { icon: RotateCcw, label: '7-Day Returns' },
                ].map((t) => (
                  <div key={t.label} className="flex flex-col items-center text-center gap-2">
                    <t.icon width={20} height={20} className="text-gold-400" />
                    <span className="text-[10px] uppercase tracking-wider text-white/40">{t.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-20">
          <div className="flex gap-8 border-b border-gold-400/10">
            {(['description', 'specs', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'relative pb-4 text-sm uppercase tracking-wider transition-colors',
                  activeTab === tab ? 'text-gold-400' : 'text-white/40 hover:text-accent'
                )}
              >
                {tab === 'specs' ? 'Specifications' : tab === 'reviews' ? `Reviews (${reviews.length})` : 'Description'}
                {activeTab === tab && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400" />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="py-8"
            >
              {activeTab === 'description' && (
                <p className="text-white/60 leading-relaxed max-w-3xl text-sm">{product.description}</p>
              )}
              {activeTab === 'specs' && (
                <div className="max-w-2xl">
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    <dl className="divide-y divide-white/5">
                      {Object.entries(product.specifications).map(([key, val]) => (
                        <div key={key} className="flex justify-between py-3 text-sm">
                          <dt className="text-gold-400/60 uppercase tracking-wider text-xs">{key}</dt>
                          <dd className="text-accent">{val}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-white/40 text-sm">No specifications available.</p>
                  )}
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="max-w-3xl">
                  {reviewsLoading ? (
                    <p className="text-white/40 text-sm">Loading reviews...</p>
                  ) : reviews.length === 0 ? (
                    <p className="text-white/40 text-sm">No reviews yet. Be the first to review this product.</p>
                  ) : (
                    <StaggerGroup className="space-y-6">
                      {reviews.map((r) => (
                        <motion.div key={r.id} variants={staggerItem} className="card p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-sm font-medium text-accent">{r.author_name}</p>
                              <StarRating rating={r.rating} size={12} className="mt-1" />
                            </div>
                            <span className="text-xs text-white/30">{new Date(r.created_at).toLocaleDateString()}</span>
                          </div>
                          {r.title && <h4 className="text-sm font-medium text-gold-400 mb-1">{r.title}</h4>}
                          <p className="text-sm text-white/60 leading-relaxed">{r.body}</p>
                        </motion.div>
                      ))}
                    </StaggerGroup>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <ScrollReveal className="text-center mb-12">
              <p className="eyebrow">You May Also Like</p>
              <h2 className="section-title">Related Products</h2>
              <div className="gold-divider mx-auto mt-4" />
            </ScrollReveal>
            <StaggerGroup className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <motion.div key={p.id} variants={staggerItem}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </StaggerGroup>
          </div>
        )}
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 backdrop-blur-xl p-4"
            onClick={() => setZoomOpen(false)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={product.images[activeImage]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
