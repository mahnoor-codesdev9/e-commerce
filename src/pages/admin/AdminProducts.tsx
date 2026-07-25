import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Search, Upload, ImageIcon, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { useCurrency } from '@/context/CurrencyContext';
import { slugify, cn } from '@/lib/utils';
import type { Product, Category } from '@/lib/types';

export function AdminProducts() {
  const { toast } = useToast();
  const { format } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts((prods ?? []) as Product[]);
    setCategories((cats ?? []) as Category[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const onDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast('Could not delete', 'error');
    else { toast('Product deleted', 'success'); load(); }
  };

  const onSave = async (data: Partial<Product>) => {
    if (editing) {
      const { error } = await supabase.from('products').update(data).eq('id', editing.id);
      if (error) toast(error.message, 'error');
      else { toast('Product updated', 'success'); setShowForm(false); setEditing(null); load(); }
    } else {
      const { error } = await supabase.from('products').insert({
        ...data,
        slug: data.slug || slugify(data.name ?? ''),
        images: (data.images as unknown as string[]) ?? [],
        colors: (data.colors as unknown as string[]) ?? [],
        sizes: (data.sizes as unknown as string[]) ?? [],
      });
      if (error) toast(error.message, 'error');
      else { toast('Product created', 'success'); setShowForm(false); load(); }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-medium text-gold-gradient">Products</h1>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary"><Plus width={16} height={16} /> Add Product</motion.button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400/40" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="input pl-10" />
      </div>

      {loading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 skeleton" />)}</div> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase text-white/30 border-b border-gold-400/10">
              <th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Status</th><th className="p-4">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-white/5 overflow-hidden shrink-0">{p.images[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}</div>
                      <div><p className="font-medium text-accent">{p.name}</p><p className="text-xs text-white/30">{p.slug}</p></div>
                    </div>
                  </td>
                  <td className="p-4 text-white/60">{p.category?.name ?? '—'}</td>
                  <td className="p-4 text-gold-400">{format(p.sale_price ?? p.price)}</td>
                  <td className="p-4 text-white/60">{p.stock}</td>
                  <td className="p-4"><span className={cn('text-xs px-2 py-1 rounded-full', p.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-white/40')}>{p.is_active ? 'Active' : 'Hidden'}</span></td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(p); setShowForm(true); }} className="p-1.5 hover:bg-gold-400/10 text-gold-400 transition-colors"><Pencil width={14} height={14} /></button>
                      <button onClick={() => onDelete(p.id)} className="p-1.5 hover:bg-rose-500/10 text-rose-500 transition-colors"><Trash2 width={14} height={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showForm && <ProductForm product={editing} categories={categories} onSave={onSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
      </AnimatePresence>
    </div>
  );
}

function ProductForm({ product, categories, onSave, onClose }: { product: Product | null; categories: Category[]; onSave: (d: Partial<Product>) => void; onClose: () => void }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageList, setImageList] = useState<string[]>(product?.images ?? []);
  const [imageUrl, setImageUrl] = useState('');
  const [form, setForm] = useState({
    name: product?.name ?? '', slug: product?.slug ?? '', description: product?.description ?? '',
    price: product?.price ?? 0, sale_price: product?.sale_price ?? 0, category_id: product?.category_id ?? categories[0]?.id ?? '',
    stock: product?.stock ?? 0, is_new: product?.is_new ?? false, is_best_seller: product?.is_best_seller ?? false,
    is_featured: product?.is_featured ?? false, is_active: product?.is_active ?? true,
    colors: (product?.colors ?? []).join(','), sizes: (product?.sizes ?? []).join(','),
    specifications: JSON.stringify(product?.specifications ?? {}, null, 2),
    seo_title: product?.seo_title ?? '', seo_description: product?.seo_description ?? '', seo_keywords: product?.seo_keywords ?? '',
  });

  const uploadImages = async (files: FileList) => {
    if (!files.length) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(fileName, file, { cacheControl: '3600' });
      if (error) {
        toast(`Upload failed: ${error.message}`, 'error');
      } else {
        const { data: url } = supabase.storage.from('product-images').getPublicUrl(fileName);
        uploaded.push(url.publicUrl);
      }
    }
    setImageList((prev) => [...prev, ...uploaded]);
    setUploading(false);
    if (uploaded.length) toast(`${uploaded.length} image(s) uploaded`, 'success');
  };

  const addImageUrl = () => {
    if (imageUrl.trim()) {
      setImageList((prev) => [...prev, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const removeImage = (idx: number) => {
    setImageList((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: form.name, slug: form.slug || slugify(form.name), description: form.description,
      price: Number(form.price), sale_price: form.sale_price ? Number(form.sale_price) : null,
      category_id: form.category_id || null, stock: Number(form.stock),
      is_new: form.is_new, is_best_seller: form.is_best_seller, is_featured: form.is_featured, is_active: form.is_active,
      images: imageList,
      colors: form.colors.split(',').map((s) => s.trim()).filter(Boolean),
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      specifications: (() => { try { return JSON.parse(form.specifications); } catch { return {}; } })(),
      seo_title: form.seo_title || null, seo_description: form.seo_description || null, seo_keywords: form.seo_keywords || null,
    });
  };

  const input = "input !py-2 text-sm";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-graphite max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gold-400/20">
        <div className="flex items-center justify-between p-6 border-b border-gold-400/10 sticky top-0 bg-graphite z-10">
          <h2 className="font-serif text-xl font-medium text-gold-gradient">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-accent hover:text-gold-400 transition-colors"><X width={20} height={20} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div><label className="label">Name *</label><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={input} /></div>
          <div><label className="label">Slug (leave blank to auto-generate)</label><input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={input} /></div>
          <div><label className="label">Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input resize-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Price (PKR) *</label><input required type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} className={input} /></div>
            <div><label className="label">Sale Price (PKR)</label><input type="number" value={form.sale_price} onChange={(e) => setForm((f) => ({ ...f, sale_price: Number(e.target.value) }))} className={input} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Category</label>
              <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))} className={input}>
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="label">Stock</label><input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))} className={input} /></div>
          </div>
          <div>
              <label className="label">Product Images</label>
              <div className="flex gap-2 mb-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && uploadImages(e.target.files)}
                  className="hidden"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-dark !py-2 !text-xs flex items-center gap-2"
                >
                  <Upload width={14} height={14} /> {uploading ? 'Uploading...' : 'Upload Images'}
                </motion.button>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL..."
                  className="input flex-1 !py-2 text-sm"
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={addImageUrl}
                  className="btn-outline !py-2 !px-3"
                >
                  <Link2 width={14} height={14} />
                </motion.button>
              </div>
              {imageList.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {imageList.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square bg-white/5 overflow-hidden border border-white/10">
                      <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-ink/80 backdrop-blur-sm rounded-full text-rose-500 hover:bg-rose-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X width={12} height={12} />
                      </button>
                      {idx === 0 && <span className="absolute bottom-1 left-1 text-[9px] bg-gold-400 text-ink px-1.5 py-0.5 font-medium">MAIN</span>}
                    </div>
                  ))}
                </div>
              )}
              {imageList.length === 0 && (
                <div className="flex items-center justify-center aspect-video bg-white/5 border border-dashed border-white/10 text-white/30 text-sm">
                  <div className="text-center">
                    <ImageIcon width={24} height={24} className="mx-auto mb-2" />
                    <p>No images yet. Upload or paste URLs.</p>
                  </div>
                </div>
              )}
            </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Colors (comma-separated)</label><input value={form.colors} onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))} className={input} placeholder="Black,White" /></div>
            <div><label className="label">Sizes (comma-separated)</label><input value={form.sizes} onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))} className={input} placeholder="S,M,L,XL" /></div>
          </div>
          <div><label className="label">Specifications (JSON)</label><textarea rows={4} value={form.specifications} onChange={(e) => setForm((f) => ({ ...f, specifications: e.target.value }))} className="input resize-none text-xs font-mono" /></div>
          <div className="border-t border-gold-400/10 pt-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gold-400/60 mb-3">SEO Settings</h3>
            <div className="space-y-3">
              <div><label className="label">SEO Title</label><input value={form.seo_title} onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))} className={input} placeholder="Custom title for search engines" /></div>
              <div><label className="label">SEO Description</label><textarea rows={2} value={form.seo_description} onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))} className="input resize-none text-sm" placeholder="Meta description" /></div>
              <div><label className="label">SEO Keywords</label><input value={form.seo_keywords} onChange={(e) => setForm((f) => ({ ...f, seo_keywords: e.target.value }))} className={input} placeholder="comma, separated, keywords" /></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {([['is_new', 'New Arrival'], ['is_best_seller', 'Best Seller'], ['is_featured', 'Featured'], ['is_active', 'Active']] as const).map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 text-sm cursor-pointer text-accent">
                <input type="checkbox" checked={form[k] as boolean} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.checked }))} className="accent-gold-400" /> {label}
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-4 border-t border-gold-400/10">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn-primary flex-1">{product ? 'Update' : 'Create'} Product</motion.button>
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
