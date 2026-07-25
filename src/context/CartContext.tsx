import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CartItem } from '@/lib/types';

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color: string | null, size: string | null) => void;
  updateQuantity: (productId: string, color: string | null, size: string | null, qty: number) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
  couponCode: string | null;
  setCouponCode: (code: string | null) => void;
  discount: number;
  setDiscount: (d: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'outrex-cart';

function sameLine(a: { product_id: string; color: string | null; size: string | null }, b: { product_id: string; color: string | null; size: string | null }) {
  return a.product_id === b.product_id && a.color === b.color && a.size === b.size;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  });
  const [couponCode, setCouponCodeState] = useState<string | null>(() => localStorage.getItem('outrex-coupon'));
  const [discount, setDiscount] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => sameLine(p, item));
      if (existing) {
        return prev.map((p) =>
          sameLine(p, item) ? { ...p, quantity: Math.min(p.quantity + item.quantity, p.stock) } : p
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (productId: string, color: string | null, size: string | null) => {
    setItems((prev) => prev.filter((p) => !sameLine(p, { product_id: productId, color, size })));
  };

  const updateQuantity = (productId: string, color: string | null, size: string | null, qty: number) => {
    setItems((prev) =>
      prev.map((p) =>
        sameLine(p, { product_id: productId, color, size })
          ? { ...p, quantity: Math.max(1, Math.min(qty, p.stock)) }
          : p
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCodeState(null);
    setDiscount(0);
  };

  const setCouponCode = (code: string | null) => {
    setCouponCodeState(code);
    if (code) localStorage.setItem('outrex-coupon', code);
    else localStorage.removeItem('outrex-coupon');
  };

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.sale_price ?? i.price) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        count,
        subtotal,
        couponCode,
        setCouponCode,
        discount,
        setDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
