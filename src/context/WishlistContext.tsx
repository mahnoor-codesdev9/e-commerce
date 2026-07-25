import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

type WishlistContextType = {
  ids: string[];
  toggle: (productId: string) => Promise<void>;
  has: (productId: string) => boolean;
  loading: boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!session?.user) {
      setIds(JSON.parse(localStorage.getItem('outrex-wishlist') ?? '[]'));
      return;
    }
    setLoading(true);
    const { data } = await supabase.from('wishlist').select('product_id').eq('user_id', session.user.id);
    setIds((data ?? []).map((r: { product_id: string }) => r.product_id));
    setLoading(false);
  }, [session?.user]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (productId: string) => {
    if (!session?.user) {
      setIds((prev) => {
        const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId];
        localStorage.setItem('outrex-wishlist', JSON.stringify(next));
        return next;
      });
      return;
    }
    if (ids.includes(productId)) {
      await supabase.from('wishlist').delete().eq('user_id', session.user.id).eq('product_id', productId);
      setIds((prev) => prev.filter((id) => id !== productId));
    } else {
      await supabase.from('wishlist').insert({ user_id: session.user.id, product_id: productId });
      setIds((prev) => [...prev, productId]);
    }
  };

  const has = (productId: string) => ids.includes(productId);

  return (
    <WishlistContext.Provider value={{ ids, toggle, has, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
