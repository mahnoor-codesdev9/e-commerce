import { useEffect, useState } from 'react';
import { Trash2, Mail, Phone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { StaggerGroup, staggerItem } from '@/components/motion/MotionPrimitives';

type Message = {
  id: string; name: string; email: string; phone: string | null;
  subject: string | null; message: string; is_read: boolean; created_at: string;
};

export function AdminMessages() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<Message | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    setMessages((data ?? []) as Message[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (m: Message) => {
    if (!m.is_read) {
      const { error } = await supabase.from('contact_messages').update({ is_read: true }).eq('id', m.id);
      if (error) { toast('Failed to mark as read', 'error'); return; }
      load();
    }
    setViewing(m);
  };

  const del = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) toast('Failed', 'error'); else { toast('Deleted', 'success'); load(); setViewing(null); }
  };

  return (
    <div>
      <h1 className="text-2xl font-serif font-medium text-gold-gradient mb-8">Contact Messages</h1>
      {loading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 skeleton" />)}</div> : messages.length === 0 ? <p className="text-sm text-white/40">No messages yet.</p> : (
        <StaggerGroup className="space-y-3">
          {messages.map((m) => (
            <motion.div key={m.id} variants={staggerItem} whileHover={{ x: 4 }} className={cn('card-lux p-4 flex items-center justify-between gap-4 cursor-pointer', !m.is_read && 'border-gold-400/30')}>
              <button onClick={() => markRead(m)} className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  {!m.is_read && <span className="w-2 h-2 rounded-full bg-gold-400" />}
                  <span className="font-medium text-sm text-accent">{m.name}</span>
                  <span className="text-xs text-white/30">{m.email}</span>
                </div>
                <p className="text-sm text-white/50 mt-1 line-clamp-1">{m.subject || m.message}</p>
              </button>
              <span className="text-xs text-white/30 shrink-0">{new Date(m.created_at).toLocaleDateString()}</span>
              <button onClick={() => del(m.id)} className="p-1.5 hover:bg-rose-500/10 text-rose-500 transition-colors shrink-0"><Trash2 width={14} height={14} /></button>
            </motion.div>
          ))}
        </StaggerGroup>
      )}

      <AnimatePresence>
        {viewing && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setViewing(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-graphite max-w-md w-full shadow-2xl border border-gold-400/20">
              <div className="flex items-center justify-between p-6 border-b border-gold-400/10">
                <h2 className="font-serif text-xl font-medium text-gold-gradient">Message</h2>
                <button onClick={() => setViewing(null)} className="text-accent hover:text-gold-400 transition-colors"><X width={20} height={20} /></button>
              </div>
              <div className="p-6 space-y-3 text-sm">
                <div><p className="label">From</p><p className="font-medium text-accent">{viewing.name}</p></div>
                <div className="flex gap-4 flex-wrap">
                  <a href={`mailto:${viewing.email}`} className="flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors"><Mail width={14} height={14} /> {viewing.email}</a>
                  {viewing.phone && <a href={`tel:${viewing.phone}`} className="flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors"><Phone width={14} height={14} /> {viewing.phone}</a>}
                </div>
                {viewing.subject && <div><p className="label">Subject</p><p className="text-accent">{viewing.subject}</p></div>}
                <div><p className="label">Message</p><p className="leading-relaxed text-white/60">{viewing.message}</p></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
