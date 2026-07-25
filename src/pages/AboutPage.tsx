import { motion } from 'framer-motion';
import { Sparkles, Award, Globe, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { ScrollReveal, StaggerGroup, staggerItem } from '@/components/motion/MotionPrimitives';
import { useAboutContent } from '@/lib/hooks';
import { useSEO } from '@/lib/seo';

const valueIcons = [Award, Globe, Heart];

export function AboutPage() {
  const { content } = useAboutContent();

  useSEO({
    title: content?.seo_title ?? 'Our Story | OutreX Fashion',
    description: content?.seo_description ?? content?.description ?? undefined,
    canonical: window.location.href,
  });

  const values = content?.values ?? [];
  const timeline = content?.timeline ?? [];

  return (
    <>
      <PageHeader
        title={content?.heading ?? 'Our Story'}
        subtitle={content?.description ?? undefined}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
      />

      {/* Story */}
      <section className="container-lux py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div className="aspect-[4/5] overflow-hidden bg-graphite border border-white/5">
              {content?.image_url && (
                <motion.img
                  initial={{ scale: 1.2 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2 }}
                  src={content.image_url}
                  alt="OutreX craftsmanship"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          </ScrollReveal>
          <ScrollReveal variants={{ hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } }}>
            <p className="eyebrow">Est. 2024</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-gold-gradient mb-6">A study in restraint</h2>
            <div className="space-y-4 text-sm text-white/60 leading-relaxed">
              <p>{content?.description ?? ''}</p>
              {content?.mission && <p><strong className="text-gold-400">Our Mission:</strong> {content.mission}</p>}
              {content?.vision && <p><strong className="text-gold-400">Our Vision:</strong> {content.vision}</p>}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      {values.length > 0 && (
        <section className="container-lux py-16">
          <ScrollReveal className="text-center mb-12">
            <p className="eyebrow">What we stand for</p>
            <h2 className="section-title">Our Values</h2>
            <div className="gold-divider mx-auto mt-4" />
          </ScrollReveal>
          <StaggerGroup className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const Icon = valueIcons[i % valueIcons.length];
              return (
                <motion.div key={i} variants={staggerItem} className="card-lux p-8 text-center">
                  <motion.div whileHover={{ scale: 1.1, y: -4 }} className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold-400/10 border border-gold-400/20 mb-5">
                    <Icon width={24} height={24} className="text-gold-400" />
                  </motion.div>
                  <h3 className="text-lg font-serif font-medium text-accent mb-2">{v.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{v.description}</p>
                </motion.div>
              );
            })}
          </StaggerGroup>
        </section>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <section className="container-lux py-16">
          <ScrollReveal className="text-center mb-12">
            <p className="eyebrow">Our Journey</p>
            <h2 className="section-title">Timeline</h2>
            <div className="gold-divider mx-auto mt-4" />
          </ScrollReveal>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gold-400/20" />
            <div className="space-y-8">
              {timeline.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-3 top-2 w-3 h-3 rounded-full bg-gold-400 ring-4 ring-ink" />
                  <div className="card-lux p-5">
                    <p className="text-gold-400 font-serif text-lg">{t.year}</p>
                    <h3 className="text-base font-medium text-accent mt-1">{t.title}</h3>
                    <p className="text-sm text-white/50 mt-1">{t.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-lux py-20 text-center">
        <ScrollReveal>
          <Sparkles width={24} height={24} className="text-gold-400 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-5xl font-serif font-medium text-gold-gradient mb-4">Experience OutreX</h2>
          <p className="text-white/50 max-w-xl mx-auto mb-8 text-sm sm:text-base">Browse our collection and discover pieces crafted for the modern wardrobe.</p>
          <Link to="/shop" className="btn-primary group">Shop Collection <ArrowRight width={16} height={16} className="group-hover:translate-x-1 transition-transform" /></Link>
        </ScrollReveal>
      </section>
    </>
  );
}
