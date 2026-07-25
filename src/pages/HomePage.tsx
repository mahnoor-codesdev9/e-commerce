import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';
import { useProducts, useCategories, useHomepageSlides, useHomepageSections } from '@/lib/hooks';
import { useSettings } from '@/context/SettingsContext';
import { ProductCard } from '@/components/ProductCard';
import { QuickViewModal } from '@/components/QuickViewModal';
import { ScrollReveal, StaggerGroup, staggerItem, AnimatedCounter } from '@/components/motion/MotionPrimitives';
import { useSEO } from '@/lib/seo';
import type { Product, HomepageSection } from '@/lib/types';

// ✅ your local custom hero image
import CustomHeroBanner from '/banner.png';

const featureIcons: Record<string, typeof Truck> = {
  truck: Truck,
  shield: ShieldCheck,
  rotate: RotateCcw,
  headphones: Headphones,
};

export function HomePage() {
  const { settings } = useSettings();
  const { slides, loading: slidesLoading } = useHomepageSlides();
  const { sections } = useHomepageSections();
  const { products, loading } = useProducts({ limit: 8 });
  const { products: newProducts } = useProducts({ isNew: true, limit: 4 });
  const { products: bestProducts } = useProducts({ bestSeller: true, limit: 4 });
  const { categories } = useCategories();

  const [quickView, setQuickView] = useState<Product | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  // ✅ Combine local custom banner + DB slides
  const allSlides = useMemo(() => {
    const customSlide = {
      id: 'custom-banner',
      image_url: CustomHeroBanner,
      heading: 'STYLE THAT DEFINES YOU',
      subheading: 'Premium. Trendy. Timeless.',
      button_text: 'Shop Now',
      button_link: '/shop',
    };

    return [customSlide, ...(slides ?? [])];
  }, [slides]);

  // ✅ SEO image should use the combined slides
  useSEO({
    title: settings?.seo_title,
    description: settings?.seo_description,
    keywords: settings?.seo_keywords,
    image: allSlides[0]?.image_url,
    canonical: window.location.href,
  });

  // ✅ Auto-rotate hero correctly with cleanup
  useEffect(() => {
    if (allSlides.length <= 1) return;

    const interval = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % allSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [allSlides.length]);

  // ✅ Keep hero index in range when slide count changes
  useEffect(() => {
    if (heroIdx >= allSlides.length) {
      setHeroIdx(0);
    }
  }, [allSlides.length, heroIdx]);

  const renderSection = (section: HomepageSection) => {
    switch (section.section_type) {
      case 'features':
        return (
          <section key={section.id} className="border-y border-gold-400/10 bg-ink">
            <div className="container-lux">
              <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-gold-400/10">
                {((section.content as { items?: { icon: string; title: string; desc: string }[] })?.items ?? []).map((f, i) => {
                  const Icon = featureIcons[f.icon] ?? Truck;
                  return (
                    <motion.div
                      key={i}
                      variants={staggerItem}
                      className="flex items-center gap-3 px-4 py-6 lg:py-8 hover:bg-gold-400/5 transition-colors"
                    >
                      <Icon width={22} height={22} className="text-gold-400 shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-accent">{f.title}</h3>
                        <p className="text-xs text-white/40">{f.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </StaggerGroup>
            </div>
          </section>
        );

      case 'categories':
        return categories.length > 0 ? (
          <section key={section.id} className="container-lux py-20">
            <ScrollReveal className="text-center mb-12">
              {section.subtitle && <p className="eyebrow">{section.subtitle}</p>}
              <h2 className="section-title">{section.title}</h2>
              <div className="gold-divider mx-auto mt-4" />
            </ScrollReveal>

            <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {categories.map((cat) => (
                <motion.div key={cat.id} variants={staggerItem}>
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className="group block relative overflow-hidden aspect-[3/4] bg-graphite border border-white/5 hover:border-gold-400/30 transition-colors duration-500"
                  >
                    {cat.image_url && (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-center">
                      <h3 className="text-xl font-serif font-medium text-accent group-hover:text-gold-400 transition-colors">
                        {cat.name}
                      </h3>
                      <span className="mt-2 text-xs uppercase tracking-wider text-gold-400/60 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Shop now <ArrowRight width={12} height={12} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </StaggerGroup>
          </section>
        ) : null;

      case 'featured':
        return (
          <section key={section.id} className="container-lux py-20">
            <ScrollReveal className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
              <div>
                {section.subtitle && <p className="eyebrow">{section.subtitle}</p>}
                <h2 className="section-title">{section.title}</h2>
              </div>

              {section.button_text && (
                <Link to={section.button_link ?? '/shop'} className="btn-outline group">
                  {section.button_text}{' '}
                  <ArrowRight width={16} height={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </ScrollReveal>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] skeleton" />
                ))}
              </div>
            ) : (
              <StaggerGroup className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((p) => (
                  <motion.div key={p.id} variants={staggerItem}>
                    <ProductCard product={p} onQuickView={setQuickView} />
                  </motion.div>
                ))}
              </StaggerGroup>
            )}
          </section>
        );

      case 'brand_story':
        return (
          <section key={section.id} className="relative py-32 overflow-hidden">
            {section.image_url && (
              <div className="absolute inset-0">
                <img src={section.image_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-ink/85" />
              </div>
            )}

            <div className="container-lux relative text-center">
              <ScrollReveal>
                {section.subtitle && <p className="eyebrow text-gold-400/60">{section.subtitle}</p>}
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium max-w-3xl mx-auto leading-tight text-gold-gradient">
                  {section.title}
                </h2>
                <p className="mt-6 text-white/50 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                  {(section.content as { text?: string })?.text ?? ''}
                </p>
                {section.button_text && (
                  <Link to={section.button_link ?? '/about'} className="btn-outline mt-8 group">
                    {section.button_text}{' '}
                    <ArrowRight width={16} height={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </ScrollReveal>
            </div>
          </section>
        );

      case 'new_arrivals':
        return newProducts.length > 0 ? (
          <section key={section.id} className="container-lux py-20">
            <ScrollReveal className="text-center mb-12">
              {section.subtitle && <p className="eyebrow">{section.subtitle}</p>}
              <h2 className="section-title">{section.title}</h2>
              <div className="gold-divider mx-auto mt-4" />
            </ScrollReveal>

            <StaggerGroup className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newProducts.map((p) => (
                <motion.div key={p.id} variants={staggerItem}>
                  <ProductCard product={p} onQuickView={setQuickView} />
                </motion.div>
              ))}
            </StaggerGroup>
          </section>
        ) : null;

      case 'stats':
        return (
          <section key={section.id} className="border-y border-gold-400/10 bg-graphite/30">
            <div className="container-lux py-16">
              <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                {((section.content as { items?: { value: number; suffix: string; label: string }[] })?.items ?? []).map((stat, i) => (
                  <motion.div key={i} variants={staggerItem}>
                    <div className="text-4xl lg:text-5xl font-serif font-medium text-gold-gradient">
                      <AnimatedCounter value={stat.value} duration={2} />
                      {stat.suffix}
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/40">{stat.label}</p>
                  </motion.div>
                ))}
              </StaggerGroup>
            </div>
          </section>
        );

      case 'best_sellers':
        return bestProducts.length > 0 ? (
          <section key={section.id} className="container-lux py-20">
            <ScrollReveal className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
              <div>
                {section.subtitle && <p className="eyebrow">{section.subtitle}</p>}
                <h2 className="section-title">{section.title}</h2>
              </div>

              {section.button_text && (
                <Link to={section.button_link ?? '/shop'} className="btn-outline group">
                  {section.button_text}{' '}
                  <ArrowRight width={16} height={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </ScrollReveal>

            <StaggerGroup className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestProducts.map((p) => (
                <motion.div key={p.id} variants={staggerItem}>
                  <ProductCard product={p} onQuickView={setQuickView} />
                </motion.div>
              ))}
            </StaggerGroup>
          </section>
        ) : null;

      case 'cta':
        return (
          <section key={section.id} className="container-lux py-20">
            <ScrollReveal className="relative overflow-hidden bg-gradient-to-br from-graphite to-ink border border-gold-400/20 p-12 lg:p-20 text-center">
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #d4af37, transparent 60%)' }}
              />
              <div className="relative">
                <h2 className="text-3xl sm:text-5xl font-serif font-medium text-gold-gradient mb-4">
                  {section.title}
                </h2>
                <p className="text-white/50 max-w-xl mx-auto mb-8 text-sm sm:text-base">
                  {(section.content as { text?: string })?.text ?? section.subtitle ?? ''}
                </p>
                {section.button_text && (
                  <Link to={section.button_link ?? '/shop'} className="btn-primary group">
                    {section.button_text}
                    <ArrowRight width={16} height={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </ScrollReveal>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* HERO — custom local slide + DB slides */}
      {!slidesLoading && allSlides.length > 0 && (
        <section ref={heroRef} className="relative h-screen min-h-[600px] overflow-hidden">
          <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
            {allSlides.map((img, i) => (
              <motion.div
                key={img.id}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: i === heroIdx ? 1 : 0 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              >
                <img
                  src={img.image_url}
                  alt={img.heading ?? 'Hero banner'}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            style={{ opacity: heroOpacity }}
            className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/50 to-ink"
          />

          <motion.div
            style={{ opacity: heroOpacity }}
            className="relative h-full flex flex-col items-center justify-center text-center px-4"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xs sm:text-sm uppercase tracking-[0.3em] text-gold-400 mb-4"
            >
              <Sparkles width={14} height={14} className="inline mr-2" />
              {settings?.brand_tagline ?? 'Luxury Fashion & Accessories'}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-7xl lg:text-8xl font-serif font-medium tracking-tight max-w-4xl leading-[1.05]"
            >
              {allSlides[heroIdx]?.heading}
            </motion.h1>

            {allSlides[heroIdx]?.subheading && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-6 text-white/60 max-w-xl text-sm sm:text-lg"
              >
                {allSlides[heroIdx].subheading}
              </motion.p>
            )}

            {allSlides[heroIdx]?.button_text && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="mt-10"
              >
                <Link to={allSlides[heroIdx].button_link ?? '/shop'} className="btn-primary group">
                  {allSlides[heroIdx].button_text}
                  <ArrowRight width={16} height={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            )}
          </motion.div>

          {allSlides.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {allSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIdx(i)}
                  className={`h-1 rounded-full transition-all ${
                    i === heroIdx ? 'w-8 bg-gold-400' : 'w-2 bg-white/30'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}

          <motion.div style={{ opacity: heroOpacity }} className="absolute bottom-8 right-8">
            <div className="w-6 h-10 border-2 border-gold-400/40 rounded-full flex justify-center pt-2">
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1 h-2 bg-gold-400 rounded-full"
              />
            </div>
          </motion.div>
        </section>
      )}

      {/* Dynamic sections from DB */}
      {sections.map(renderSection)}

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}