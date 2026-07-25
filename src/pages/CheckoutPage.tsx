import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, CreditCard, Truck, Wallet, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { generateOrderNumber } from '@/lib/utils';
import type { Address } from '@/lib/types';
import { cn } from '@/lib/utils';

const STEPS = ['Shipping', 'Payment', 'Review'];

export function CheckoutPage() {
  const { items, subtotal, discount, couponCode, clearCart } = useCart();
  const { format } = useCurrency();
  const { profile, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer' | 'online'>('cod');

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Pakistan',
    order_notes: '',
  });

  const shippingCost = subtotal >= 15000 ? 0 : 100;
  const total = Math.max(0, subtotal - discount + shippingCost);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const validateShipping = () => {
    if (!form.full_name || !form.email || !form.phone || !form.line1 || !form.city || !form.postal_code) {
      toast('Please fill all required fields', 'error');
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (!validateShipping()) {
      setStep(0);
      return;
    }
    setPlacing(true);
    const orderNumber = generateOrderNumber();
    const address: Address = {
      full_name: form.full_name,
      line1: form.line1,
      line2: form.line2,
      city: form.city,
      state: form.state,
      postal_code: form.postal_code,
      country: form.country,
    };

    const { data, error } = await supabase.from('orders').insert({
      user_id: session?.user?.id ?? null,
      order_number: orderNumber,
      status: 'pending',
      customer_name: form.full_name,
      customer_email: form.email,
      customer_phone: form.phone,
      billing_address: address,
      shipping_address: address,
      order_notes: form.order_notes || null,
      subtotal,
      shipping_cost: shippingCost,
      discount,
      total,
      payment_method: paymentMethod,
      payment_status: 'unpaid',
      coupon_code: couponCode,
      currency: 'PKR',
    }).select('id').single();

    if (error) {
      toast('Failed to place order. Try again.', 'error');
      setPlacing(false);
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: data.id,
      product_id: item.product_id,
      product_name: item.name,
      product_image: item.image,
      price: item.sale_price ?? item.price,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      toast('Order placed but some items failed to save. Contact support.', 'error');
    }

    if (couponCode) {
      await supabase.rpc('increment_coupon_usage', { coupon_code: couponCode });
    }

    clearCart();
    toast('Order placed successfully!', 'success');
    setPlacing(false);
    navigate('/account');
  };

  if (items.length === 0) {
    return (
      <div className="container-lux py-20 text-center">
        <p className="text-white/40 text-lg mb-4">Your cart is empty.</p>
        <Link to="/shop" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-lux py-12">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-gold-400 transition-colors mb-8">
        <ChevronLeft width={16} height={16} /> Back to cart
      </Link>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  backgroundColor: i <= step ? '#d4af37' : '#1a1a1a',
                  borderColor: i <= step ? '#d4af37' : 'rgba(255,255,255,0.1)',
                }}
                className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-medium"
              >
                {i < step ? <Check width={16} height={16} className="text-ink" /> : <span className={i <= step ? 'text-ink' : 'text-white/40'}>{i + 1}</span>}
              </motion.div>
              <span className={cn('text-sm uppercase tracking-wider hidden sm:block', i <= step ? 'text-gold-400' : 'text-white/30')}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={cn('w-12 h-px transition-colors', i < step ? 'bg-gold-400' : 'bg-white/10')} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-5">
                <h2 className="text-xl font-serif font-medium text-gold-gradient">Shipping Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="label">Full Name *</label><input className="input" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} /></div>
                  <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
                  <div><label className="label">Phone *</label><input className="input" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
                  <div><label className="label">Country</label><input className="input" value={form.country} onChange={(e) => update('country', e.target.value)} /></div>
                  <div className="sm:col-span-2"><label className="label">Address Line 1 *</label><input className="input" value={form.line1} onChange={(e) => update('line1', e.target.value)} /></div>
                  <div className="sm:col-span-2"><label className="label">Address Line 2</label><input className="input" value={form.line2} onChange={(e) => update('line2', e.target.value)} /></div>
                  <div><label className="label">City *</label><input className="input" value={form.city} onChange={(e) => update('city', e.target.value)} /></div>
                  <div><label className="label">State / Province</label><input className="input" value={form.state} onChange={(e) => update('state', e.target.value)} /></div>
                  <div><label className="label">Postal Code *</label><input className="input" value={form.postal_code} onChange={(e) => update('postal_code', e.target.value)} /></div>
                </div>
                <div><label className="label">Order Notes</label><textarea className="input min-h-[80px]" value={form.order_notes} onChange={(e) => update('order_notes', e.target.value)} /></div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => validateShipping() && setStep(1)} className="btn-primary">Continue to Payment</motion.button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-5">
                <h2 className="text-xl font-serif font-medium text-gold-gradient">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { value: 'cod' as const, icon: Truck, label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                    { value: 'bank_transfer' as const, icon: Wallet, label: 'Bank Transfer', desc: 'Transfer to our bank account' },
                    { value: 'online' as const, icon: CreditCard, label: 'Online Payment', desc: 'Pay securely with card' },
                  ].map((p) => (
                    <motion.button
                      key={p.value}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setPaymentMethod(p.value)}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 border transition-all text-left',
                        paymentMethod === p.value ? 'border-gold-400 bg-gold-400/5' : 'border-white/10 hover:border-gold-400/30'
                      )}
                    >
                      <p.icon width={22} height={22} className={paymentMethod === p.value ? 'text-gold-400' : 'text-white/40'} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-accent">{p.label}</p>
                        <p className="text-xs text-white/40">{p.desc}</p>
                      </div>
                      <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center', paymentMethod === p.value ? 'border-gold-400' : 'border-white/20')}>
                        {paymentMethod === p.value && <div className="w-2.5 h-2.5 rounded-full bg-gold-400" />}
                      </div>
                    </motion.button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="btn-ghost border border-white/10">Back</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(2)} className="btn-primary">Review Order</motion.button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-5">
                <h2 className="text-xl font-serif font-medium text-gold-gradient">Review Your Order</h2>
                <div className="card p-5 space-y-3 text-sm">
                  <div><span className="label !mb-1">Shipping To</span><p className="text-accent">{form.full_name}<br />{form.line1}{form.line2 ? `, ${form.line2}` : ''}<br />{form.city}, {form.state} {form.postal_code}<br />{form.country}</p></div>
                  <div><span className="label !mb-1">Contact</span><p className="text-accent">{form.email} · {form.phone}</p></div>
                  <div><span className="label !mb-1">Payment</span><p className="text-accent capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Online Payment'}</p></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-ghost border border-white/10">Back</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={placeOrder} disabled={placing} className="btn-primary flex-1">
                    {placing ? 'Placing Order...' : 'Place Order'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-lux p-6 space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-gold-400/60">Order Summary</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.product_id}-${item.color}-${item.size}`} className="flex gap-3">
                  <div className="w-14 h-16 overflow-hidden bg-ink shrink-0">
                    <img src={item.image} alt="" loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-accent truncate">{item.name}</p>
                    <p className="text-xs text-white/40">Qty: {item.quantity}</p>
                    <p className="text-sm text-gold-400">{format((item.sale_price ?? item.price) * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gold-400/10 space-y-2 text-sm">
              <div className="flex justify-between text-white/60"><span>Subtotal</span><span>{format(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-emerald-500"><span>Discount</span><span>-{format(discount)}</span></div>}
              <div className="flex justify-between text-white/60"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : format(shippingCost)}</span></div>
              <div className="flex justify-between text-lg font-medium pt-2 border-t border-gold-400/10"><span className="text-accent">Total</span><span className="text-gold-400">{format(total)}</span></div>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/30 pt-2">
              <ShieldCheck width={14} height={14} className="text-gold-400" /> Secure checkout · Your data is protected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
