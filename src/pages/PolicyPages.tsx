import { PageHeader } from '@/components/PageHeader';
import { ScrollReveal } from '@/components/motion/MotionPrimitives';
import { motion } from 'framer-motion';
import { usePageContent } from '@/lib/hooks';
import { useSEO } from '@/lib/seo';
import { useState } from 'react';

function PolicyPage({ slug, fallbackTitle }: { slug: string; fallbackTitle: string }) {
  const { page, loading } = usePageContent(slug);
  const [content] = useState('');

  useSEO({
    title: page?.seo_title ?? `${fallbackTitle} | OutreX Fashion`,
    description: page?.seo_description ?? undefined,
    keywords: page?.seo_keywords ?? undefined,
    canonical: window.location.href,
  });

  if (loading) {
    return (
      <>
        <PageHeader title={fallbackTitle} breadcrumbs={[{ label: 'Home', to: '/' }, { label: fallbackTitle }]} />
        <div className="container-lux pb-20">
          <div className="max-w-3xl mx-auto space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 skeleton" />)}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={page?.title ?? fallbackTitle} breadcrumbs={[{ label: 'Home', to: '/' }, { label: page?.title ?? fallbackTitle }]} />
      <div className="container-lux pb-20">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="card-lux p-8">
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{page?.content ?? content}</p>
            </div>
          </ScrollReveal>
          <div className="text-center pt-4">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs text-white/30">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </motion.p>
          </div>
        </div>
      </div>
    </>
  );
}

export function PrivacyPolicyPage() { return <PolicyPage slug="privacy-policy" fallbackTitle="Privacy Policy" />; }
export function ReturnPolicyPage() { return <PolicyPage slug="return-policy" fallbackTitle="Return Policy" />; }
export function RefundPolicyPage() { return <PolicyPage slug="refund-policy" fallbackTitle="Refund Policy" />; }
export function ShippingPolicyPage() { return <PolicyPage slug="shipping-policy" fallbackTitle="Shipping Policy" />; }
export function TermsPage() { return <PolicyPage slug="terms" fallbackTitle="Terms & Conditions" />; }
