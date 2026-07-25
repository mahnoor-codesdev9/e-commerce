import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X, ShoppingBag, ArrowRight, Tag, Truck, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';

const FREE_SHIPPING_THRESHOLD = 15000;

export function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, couponCode, setCouponCode, discount, setDiscount, clearCart } = useCart();
  const { format } = useCurrency();
  const { toast } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 100;
  const total = Math.max(0, subtotal - discount + shippingCost);
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const applyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    setApplying(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponInput.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      toast('Invalid coupon code', 'error');
      setApplying(false);
      return;
    }

    if (data.min_order && subtotal < data.min_order) {
      toast(`Minimum order of ${format(data.min_order)} required`, 'error');
      setApplying(false);
      return;
    }

    const disc = data.discount_type === 'percentage'
      ? (subtotal * data.discount_value) / 100
      : data.discount_value;
    setDiscount(disc);
    setCouponCode(data.code);
    toast(`Coupon applied: ${data.code}`, 'success');
    setApplying(false);
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setDiscount(0);
    setCouponInput('');
  };

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Shopping Cart" breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
        <div className="container-lux py-20 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-graphite border border-gold-400/20 rounded-full mb-8"
          >
            <ShoppingBag width={36} height={36} className="text-gold-400/40" />
          </motion.div>
          <h2 className="text-2xl font-serif font-medium text-accent mb-3">Your cart is empty</h2>
          <p className="text-white/40 mb-8 text-sm">Discover our curated collection of premium products.</p>
          <Link to="/shop" className="btn-primary group">
            Start Shopping <ArrowRight width={16} height={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Shopping Cart" breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
      <div className="container-lux pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={`${item.product_id}-${item.color}-${item.size}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="card p-4 flex gap-4 group"
                >
                  <Link to={`/product/${item.slug}`} className="shrink-0">
                    <div className="w-24 h-32 sm:w-28 sm:h-36 overflow-hidden bg-ink border border-white/5">
                      <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  </Link>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <Link to={`/product/${item.slug}`}>
                        <h3 className="font-serif text-base font-medium text-accent hover:text-gold-400 transition-colors truncate">{item.name}</h3>
                      </Link>
                      <div className="flex gap-3 mt-1 text-xs text-white/40">
                        {item.color && <span>Color: {item.color}</span>}
                        {item.size && <span>Size: {item.size}</span>}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-gold-400">
                        {format(item.sale_price ?? item.price)}
                        {item.sale_price && <span className="ml-2 text-xs text-white/30 line-through">{format(item.price)}</span>}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-white/10">
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateQuantity(item.product_id, item.color, item.size, item.quantity - 1)} className="p-2 text-accent hover:text-gold-400 transition-colors">
                          <Minus width={14} height={14} />
                        </motion.button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateQuantity(item.product_id, item.color, item.size, item.quantity + 1)} className="p-2 text-accent hover:text-gold-400 transition-colors">
                          <Plus width={14} height={14} />
                        </motion.button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeItem(item.product_id, item.color, item.size)}
                        className="text-white/30 hover:text-rose-500 transition-colors"
                        aria-label="Remove"
                      >
                        <X width={18} height={18} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button onClick={clearCart} className="text-xs text-white/30 hover:text-rose-500 transition-colors">
              Clear cart
            </button>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-lux p-6 space-y-6"
            >
              <h2 className="text-lg font-serif font-medium text-gold-gradient">Order Summary</h2>

              {/* Shipping progress */}
              <div>
                <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                  <Truck width={14} height={14} className="text-gold-400" />
                  {remaining > 0 ? (
                    <span>Add {format(remaining)} for free shipping</span>
                  ) : (
                    <span className="text-emerald-500 flex items-center gap-1"><Check width={14} height={14} /> You qualify for free shipping!</span>
                  )}
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-gold-300 to-gold-500"
                  />
                </div>
              </div>

              {/* Coupon */}
              {couponCode ? (
                <div className="flex items-center justify-between bg-gold-400/10 border border-gold-400/20 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag width={14} height={14} className="text-gold-400" />
                    <span className="text-sm text-gold-400 font-medium">{couponCode}</span>
                  </div>
                  <button onClick={removeCoupon} className="text-white/30 hover:text-rose-500 transition-colors">
                    <X width={16} height={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={applyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code"
                    className="input flex-1"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={applying}
                    className="btn-dark !px-5"
                  >
                    {applying ? '...' : 'Apply'}
                  </motion.button>
                </form>
              )}

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-gold-400/10 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span><span>{format(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount</span><span>-{format(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/60">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : format(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-lg font-medium text-accent pt-3 border-t border-gold-400/10">
                  <span>Total</span><span className="text-gold-400">{format(total)}</span>
                </div>
              </div>

              <Link to="/checkout" className="btn-primary w-full group">
                Proceed to Checkout
                <ArrowRight width={16} height={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/shop" className="block text-center text-xs text-white/40 hover:text-gold-400 transition-colors">
                Continue shopping
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
