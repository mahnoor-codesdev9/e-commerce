import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react';
import { useProducts, useCategories } from '@/lib/hooks';
import { useSEO } from '@/lib/seo';
import { ProductCard } from '@/components/ProductCard';
import { QuickViewModal } from '@/components/QuickViewModal';
import { PageHeader } from '@/components/PageHeader';
import { GridSkeleton } from '@/components/Skeleton';
import { StaggerGroup, staggerItem } from '@/components/motion/MotionPrimitives';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

const PAGE_SIZE = 12;

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOpen, setSortOpen] = useState(false);

  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const filter = searchParams.get('filter');
  const sort = searchParams.get('sort') || 'newest';

  const { categories } = useCategories();
  const { products, loading } = useProducts({
    category,
    search,
    sort,
    featured: filter === 'featured',
    isNew: filter === 'new',
    bestSeller: filter === 'best',
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const allColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.colors?.forEach((c) => set.add(c)));
    return Array.from(set);
  }, [products]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, search, sort, filter]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const price = p.sale_price ?? p.price;
      if (price < priceRange[0] || price > priceRange[1]) return false;
      if (selectedColors.length > 0 && !p.colors?.some((c) => selectedColors.includes(c))) return false;
      return true;
    });
  }, [products, priceRange, selectedColors]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageProducts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange([0, 50000]);
    setSelectedColors([]);
  };

  const title = category
    ? categories.find((c) => c.slug === category)?.name ?? 'Shop'
    : filter === 'new'
    ? 'New Arrivals'
    : filter === 'best'
    ? 'Best Sellers'
    : search
    ? `Search: "${search}"`
    : 'All Products';

  useSEO({
    title: `${title} | OutreX Fashion`,
    description: `Shop ${title.toLowerCase()} at OutreX Fashion — premium quality, crafted for the modern wardrobe.`,
    canonical: window.location.href,
  });

  return (
    <>
      <PageHeader
        title={title}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          { label: title },
        ]}
      />

      <div className="container-lux pb-20">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden btn-ghost !px-4 !py-2 border border-white/10"
          >
            <SlidersHorizontal width={16} height={16} /> Filters
          </button>

          <p className="text-sm text-white/40 hidden lg:block">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          </p>

          {/* Sort */}
          <div className="relative ml-auto">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-2 text-sm text-accent hover:text-gold-400 transition-colors border border-white/10 px-4 py-2"
            >
              Sort: {SORTS.find((s) => s.value === sort)?.label}
              <ChevronDown width={14} height={14} className={cn('transition-transform', sortOpen && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-full mt-1 bg-graphite border border-gold-400/20 shadow-xl min-w-[200px] py-1 z-50"
                >
                  {SORTS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => {
                        setParam('sort', s.value);
                        setSortOpen(false);
                      }}
                      className={cn(
                        'flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gold-400/5 transition-colors text-left',
                        s.value === sort ? 'text-gold-400' : 'text-accent'
                      )}
                    >
                      {s.label}
                      {s.value === sort && <Check width={14} height={14} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterContent
              categories={categories}
              currentCategory={category}
              setCategory={(c) => setParam('category', c)}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              allColors={allColors}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              clearFilters={clearFilters}
            />
          </aside>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <GridSkeleton count={8} />
            ) : pageProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-white/40 text-lg">No products found.</p>
                <button onClick={clearFilters} className="btn-outline mt-4">Clear Filters</button>
              </div>
            ) : (
              <StaggerGroup className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                {pageProducts.map((p) => (
                  <motion.div key={p.id} variants={staggerItem}>
                    <ProductCard product={p} onQuickView={setQuickView} />
                  </motion.div>
                ))}
              </StaggerGroup>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCurrentPage(i + 1);
                      window.scrollTo({ top: 200, behavior: 'smooth' });
                    }}
                    className={cn(
                      'w-10 h-10 text-sm font-medium border transition-all',
                      currentPage === i + 1
                        ? 'bg-gold-400 text-ink border-gold-400'
                        : 'border-white/10 text-accent hover:border-gold-400/40'
                    )}
                  >
                    {i + 1}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-ink shadow-2xl overflow-y-auto border-l border-gold-400/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-serif font-medium text-gold-gradient">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} className="text-accent hover:text-gold-400 transition-colors">
                  <X width={22} height={22} />
                </button>
              </div>
              <FilterContent
                categories={categories}
                currentCategory={category}
                setCategory={(c) => { setParam('category', c); }}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                allColors={allColors}
                selectedColors={selectedColors}
                setSelectedColors={setSelectedColors}
                clearFilters={clearFilters}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}

function FilterContent({
  categories,
  currentCategory,
  setCategory,
  priceRange,
  setPriceRange,
  allColors,
  selectedColors,
  setSelectedColors,
  clearFilters,
}: {
  categories: { id: string; name: string; slug: string }[];
  currentCategory: string | null;
  setCategory: (c: string | null) => void;
  priceRange: [number, number];
  setPriceRange: (r: [number, number]) => void;
  allColors: string[];
  selectedColors: string[];
  setSelectedColors: (c: string[]) => void;
  clearFilters: () => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] text-gold-400/60 mb-4">Categories</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setCategory(null)}
              className={cn(
                'text-sm transition-colors link',
                !currentCategory ? 'text-gold-400' : 'text-white/60 hover:text-gold-400'
              )}
            >
              All Products
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setCategory(c.slug)}
                className={cn(
                  'text-sm transition-colors link',
                  currentCategory === c.slug ? 'text-gold-400' : 'text-white/60 hover:text-gold-400'
                )}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] text-gold-400/60 mb-4">Price Range</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-white/60">
            <span>Rs. {priceRange[0].toLocaleString()}</span>
            <span>Rs. {priceRange[1].toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={0}
            max={50000}
            step={500}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-gold-400"
          />
        </div>
      </div>

      {allColors.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-gold-400/60 mb-4">Colors</h3>
          <div className="flex flex-wrap gap-2">
            {allColors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setSelectedColors(
                    selectedColors.includes(c)
                      ? selectedColors.filter((x) => x !== c)
                      : [...selectedColors, c]
                  );
                }}
                className={cn(
                  'px-3 py-1.5 text-xs border transition-all',
                  selectedColors.includes(c)
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

      <button onClick={clearFilters} className="btn-ghost w-full border border-white/10">
        Clear All Filters
      </button>
    </div>
  );
}
