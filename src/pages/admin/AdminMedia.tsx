import { useEffect, useState, useRef } from 'react';
import { Upload, Trash2, Search, Copy, ImageIcon, Loader2, Folder } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import type { MediaFile } from '@/lib/types';

const FOLDERS = ['general', 'products', 'hero', 'banners'] as const;
type FolderName = typeof FOLDERS[number];

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function AdminMedia() {
  const { toast } = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState<FolderName>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('media_files').select('*').order('created_at', { ascending: false });
    setFiles((data ?? []) as MediaFile[]);
    setLoading(false);
  };

  useEffect(() => { load();   }, []);

  const filtered = files.filter((f) => f.filename.toLowerCase().includes(search.toLowerCase()) && (folder === 'general' || f.folder === folder));

  const upload = async (fileList: FileList) => {
    if (!fileList.length) return;
    setUploading(true);
    let success = 0;
    for (const file of Array.from(fileList)) {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('product-images').upload(fileName, file, { cacheControl: '3600' });
      if (upErr) {
        toast(`Upload failed: ${upErr.message}`, 'error');
        continue;
      }
      const { data: url } = supabase.storage.from('product-images').getPublicUrl(fileName);
      const { error: dbErr } = await supabase.from('media_files').insert({
        url: url.publicUrl,
        filename: file.name,
        folder,
        file_size: file.size,
        mime_type: file.type,
      });
      if (dbErr) toast(`DB insert failed: ${dbErr.message}`, 'error');
      else success++;
    }
    setUploading(false);
    if (success) toast(`${success} file(s) uploaded`, 'success');
    load();
  };

  const onDelete = async (m: MediaFile) => {
    if (!confirm(`Delete ${m.filename}?`)) return;
    // Extract storage path from URL
    const path = m.url.split('/product-images/')[1];
    if (path) {
      const { error: stErr } = await supabase.storage.from('product-images').remove([path]);
      if (stErr) toast(`Storage delete failed: ${stErr.message}`, 'error');
    }
    const { error } = await supabase.from('media_files').delete().eq('id', m.id);
    if (error) toast('Could not delete record', 'error');
    else { toast('File deleted', 'success'); load(); }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast('URL copied', 'success');
    } catch {
      toast('Could not copy', 'error');
    }
  };

  const displayFiles = filtered;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-medium text-gold-gradient">Media Library</h1>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={uploading} onClick={() => fileInputRef.current?.click()} className="btn-primary">
          {uploading ? <Loader2 width={16} height={16} className="animate-spin" /> : <Upload width={16} height={16} />} Upload
        </motion.button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && upload(e.target.files)} />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by filename..." className="input pl-10" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Folder width={14} height={14} className="text-gold-400/40" />
          {FOLDERS.map((f) => (
            <button key={f} onClick={() => setFolder(f)} className={cn('px-3 py-1.5 text-xs uppercase tracking-wider rounded-sm transition-colors', folder === f ? 'bg-gold-400 text-ink' : 'bg-white/5 text-white/50 hover:text-accent')}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square skeleton" />)}</div>
      ) : displayFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <ImageIcon width={48} height={48} className="mb-3" />
          <p className="text-sm">No files found. Upload some images.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {displayFiles.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className="card-lux overflow-hidden group">
              <div className="aspect-square bg-white/5 overflow-hidden relative">
                {m.mime_type?.startsWith('image/') || m.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                  <img src={m.url} alt={m.filename} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="flex items-center justify-center h-full"><ImageIcon className="text-white/20" /></div>
                )}
                <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => copyUrl(m.url)} className="p-2 bg-ink/80 backdrop-blur-sm rounded-full text-gold-400 hover:bg-gold-400 hover:text-ink transition-colors" title="Copy URL"><Copy width={14} height={14} /></button>
                  <button onClick={() => onDelete(m)} className="p-2 bg-ink/80 backdrop-blur-sm rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-colors" title="Delete"><Trash2 width={14} height={14} /></button>
                </div>
                <span className="absolute top-2 left-2 text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-ink/80 text-gold-400 rounded-full">{m.folder}</span>
              </div>
              <div className="p-3">
                <p className="text-xs text-accent truncate font-medium" title={m.filename}>{m.filename}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{formatBytes(m.file_size)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
