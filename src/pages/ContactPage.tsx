import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, MapPin, Send, Check } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { ScrollReveal } from '@/components/motion/MotionPrimitives';
import { useContactContent } from '@/lib/hooks';
import { useSEO } from '@/lib/seo';

export function ContactPage() {
  const { content } = useContactContent();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  useSEO({
    title: content?.seo_title ?? 'Contact Us | OutreX Fashion',
    description: content?.seo_description ?? content?.description ?? undefined,
    canonical: window.location.href,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name, email: form.email, phone: form.phone, subject: form.subject, message: form.message,
    });
    setLoading(false);
    if (error) toast('Failed to send. Try again.', 'error');
    else {
      setSent(true);
      toast('Message sent! We\'ll get back to you soon.', 'success');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }
  };

  const contactInfo = [
    { icon: Phone, label: 'Phone', value: content?.phone, href: content?.phone ? `tel:${content.phone}` : undefined },
    { icon: MessageCircle, label: 'WhatsApp', value: content?.whatsapp, href: content?.whatsapp ? `https://wa.me/${content.whatsapp.replace(/[^0-9]/g, '')}` : undefined },
    { icon: Mail, label: 'Email', value: content?.email, href: content?.email ? `mailto:${content.email}` : undefined },
    { icon: MapPin, label: 'Location', value: content?.address, href: undefined },
  ].filter((c) => c.value);

  return (
    <>
      <PageHeader
        title={content?.heading ?? 'Contact Us'}
        subtitle={content?.description ?? undefined}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      />

      <div className="container-lux pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Info */}
          <ScrollReveal>
            <h2 className="text-2xl font-serif font-medium text-gold-gradient mb-6">Get in Touch</h2>
            <p className="text-sm text-white/50 leading-relaxed mb-8">
              Whether you have a question about a product, need help with an order, or just want to say hello — we'd love to hear from you.
            </p>
            <div className="space-y-4">
              {contactInfo.map((c, i) => (
                <motion.a
                  key={i}
                  href={c.href ?? '#'}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-4 card-lux p-4 group"
                >
                  <div className="w-11 h-11 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center shrink-0 group-hover:bg-gold-400 group-hover:text-ink transition-all">
                    <c.icon width={18} height={18} className="text-gold-400 group-hover:text-ink transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gold-400/50">{c.label}</p>
                    <p className="text-sm text-accent">{c.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>
            {content?.business_hours && (
              <div className="mt-4 card-lux p-4">
                <p className="text-xs uppercase tracking-wider text-gold-400/50 mb-1">Business Hours</p>
                <p className="text-sm text-accent">{content.business_hours}</p>
              </div>
            )}
            {content?.google_maps_embed && (
              <div className="mt-4 aspect-video overflow-hidden border border-gold-400/10">
                <iframe src={content.google_maps_embed} className="w-full h-full" loading="lazy" title="Map" />
              </div>
            )}
          </ScrollReveal>

          {/* Form */}
          <ScrollReveal variants={{ hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } }}>
            <div className="card-lux p-8">
              {sent ? (
                <div className="text-center py-12">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-400/10 border border-gold-400/30 mb-6">
                    <Check width={28} height={28} className="text-gold-400" />
                  </motion.div>
                  <h3 className="text-xl font-serif font-medium text-gold-gradient mb-2">Message Sent!</h3>
                  <p className="text-sm text-white/50 mb-6">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="btn-outline">Send Another</button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-serif font-medium text-gold-gradient mb-6">Send a Message</h2>
                  <form onSubmit={submit} className="space-y-4">
                    <div><label className="label">Name *</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><label className="label">Email *</label><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                      <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                    </div>
                    <div><label className="label">Subject</label><input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
                    <div><label className="label">Message *</label><textarea className="input min-h-[120px]" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="btn-primary w-full">
                      {loading ? 'Sending...' : <><Send width={16} height={16} /> Send Message</>}
                    </motion.button>
                  </form>
                </>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
}
