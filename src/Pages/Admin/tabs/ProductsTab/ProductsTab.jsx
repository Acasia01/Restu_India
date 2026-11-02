import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import ImageUploader from '../../components/ImageUploader';
import Spinner from '../../components/Spinner';
import { API_BASE, getImageUrl } from '../../utils/adminUtils';
import "./ProductsTab.css";

const EMPTY_PRODUCT = {
  name: '', slug: '', description: '', brand: '', category: '',
  emoji: '✨', tags: '', isFeatured: false, isNew: false,
  images: [], variants: []
};

const SIZES = ['XS','S','M','L','XL','XXL','Free Size','6','7','8','9','10','Standard','Large'];

export default function ProductsTab() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState(EMPTY_PRODUCT);
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/products?limit=100&includeInactive=true'),
      api.get('/categories'),
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data.products);
        setCategories(catRes.data);
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setForm({ ...EMPTY_PRODUCT, category: categories[0]?._id || '' });
    setModal('add');
  };

  const openEdit = (p) => {
    setForm({
      ...p,
      category: p.category?._id || p.category || '',
      tags: p.tags?.join(', ') || '',
      images: p.images || [],
      variants: p.variants || [],
    });
    setModal(p);
  };

  const addVariant    = () => setForm(f => ({ ...f, variants: [...f.variants, { size: 'Standard', stock: 0 }] }));
  const removeVariant = (i) => setForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));
  const updateVariant = (i, key, val) => setForm(f => {
    const variants = [...f.variants];
    variants[i] = { ...variants[i], [key]: key === 'stock' ? Number(val) : val };
    return { ...f, variants };
  });

  const save = async () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        images: form.images || [],
        variants: form.variants || [],
      };
      if (modal === 'add') {
        await api.post('/products', payload);
        toast.success('Product created');
      } else {
        await api.patch(`/products/${modal._id}`, payload);
        toast.success('Product updated');
      }
      setModal(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const toggleActive = async (p) => {
    try {
      await api.patch(`/products/${p._id}`, { isActive: !p.isActive });
      toast.success(p.isActive ? 'Product deactivated' : 'Product activated');
      load();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="products-toolbar">
        <input
          className="products-search-input"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={openAdd} className="products-add-btn">
          + Add Product
        </button>
      </div>

      {/* Table */}
      {loading ? <Spinner /> : (
        <div className="table-wrapper">
          <table className="products-table">
            <thead>
              <tr className="table-header-row">
                {['Product', 'Category', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#9CA3AF', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p._id} style={{ borderBottom: '1px solid #F5F0EB', background: i % 2 === 0 ? '#fff' : '#FDFBF9' }}>
                  {/* Product */}
                  <td style={{ padding: '12px 14px' }}>
                    <div className="product-info" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {p.images?.[0] ? (
                        <img src={getImageUrl(p.images[0])} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid #EDE8E3', flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 6, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{p.emoji}</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: '#1A1218' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  {/* Category */}
                  <td style={{ padding: '12px 14px', color: '#6B7280' }}>
                    <span className="table-text-val">{p.category?.name || '—'}</span>
                  </td>
                  {/* Stock */}
                  <td style={{ padding: '12px 14px', color: '#6B7280', fontSize: 12 }}>
                    <span className="table-text-val">
                      {p.variants?.length > 0
                        ? p.variants.map(v => `${v.size}: ${v.stock}`).join(', ')
                        : <span style={{ color: '#EAB308' }}>No variants</span>
                      }
                    </span>
                  </td>
                  {/* Status badges */}
                  <td style={{ padding: '12px 14px' }}>
                    <div className="status-badges table-text-val" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {p.isNew      && <span style={{ background: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>NEW</span>}
                      {p.isFeatured && <span style={{ background: '#FFF7ED', color: '#EA580C', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>FEATURED</span>}
                      {!p.isActive  && <span style={{ background: '#FEF2F2', color: '#B91C1C', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>INACTIVE</span>}
                      {p.images?.length > 0 && <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>📷 {p.images.length}</span>}
                    </div>
                  </td>
                  {/* Actions */}
                  <td style={{ padding: '12px 14px' }}>
                    <div className="action-buttons" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button onClick={() => openEdit(p)} style={{ background: '#EDE8E3', color: '#1A1218', border: 'none', padding: '5px 12px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Edit</button>
                      <button onClick={() => toggleActive(p)} style={{ background: p.isActive ? '#FFF7ED' : '#ECFDF5', color: p.isActive ? '#EA580C' : '#059669', border: 'none', padding: '5px 12px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>
                        {p.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDelete(p._id)} style={{ background: '#FEF2F2', color: '#B91C1C', border: 'none', padding: '5px 12px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '3rem' }}>No products found.</p>}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div onClick={e => e.target === e.currentTarget && setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,24,0.65)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="admin-modal-content" style={{ background: '#FDFBF9', borderRadius: 14, padding: '2rem', width: '100%', maxWidth: 620, maxHeight: '92vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 1.5rem', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.06em', fontSize: '1.6rem' }}>
              {modal === 'add' ? 'NEW PRODUCT' : 'EDIT PRODUCT'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <ImageUploader images={form.images || []} onChange={imgs => setForm(f => ({ ...f, images: imgs }))} />

              <div className="admin-grid-2col">
                {/* Name */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Product Name *</label>
                  <input type="text" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Electric Fowler Bed" style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #EDE8E3', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
                </div>

                {/* Slug */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Slug (URL-safe)</label>
                  <input type="text" value={form.slug || ''} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated if blank" style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #EDE8E3', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
                </div>

                {/* Brand & Emoji */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Brand</label>
                  <input type="text" value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Resatu India" style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #EDE8E3', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Emoji Icon</label>
                  <input type="text" value={form.emoji || ''} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="✨" style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #EDE8E3', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
                </div>

                {/* Tags */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Tags (comma separated)</label>
                  <input type="text" value={form.tags || ''} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="icu, bed, hospital" style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #EDE8E3', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
                </div>

                {/* Category */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #EDE8E3', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' }}>
                    <option value="">Select a category...</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Description</label>
                  <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #EDE8E3', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>

                {/* Checkboxes */}
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1.5rem' }}>
                  {[['isFeatured', 'Featured'], ['isNew', 'New Arrival']].map(([k, l]) => (
                    <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#1A1218' }}>
                      <input type="checkbox" checked={!!form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))} style={{ width: 16, height: 16 }} />
                      {l}
                    </label>
                  ))}
                </div>
              </div>

              {/* Variants */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sizes & Stock</label>
                  <button onClick={addVariant} style={{ background: '#EDE8E3', color: '#1A1218', border: 'none', padding: '4px 12px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>+ Add Size</button>
                </div>
                {form.variants?.length === 0 && <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>No sizes added yet.</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {form.variants?.map((v, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} style={{ flex: 1, padding: '0.5rem 0.8rem', border: '1.5px solid #EDE8E3', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }}>
                        {SIZES.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <input type="number" min="0" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} placeholder="Stock" style={{ width: 90, padding: '0.5rem 0.8rem', border: '1.5px solid #EDE8E3', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }} />
                      <button onClick={() => removeVariant(i)} style={{ background: '#FEF2F2', color: '#B91C1C', border: 'none', width: 32, height: 32, borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ background: '#EDE8E3', color: '#1A1218', border: 'none', padding: '0.65rem 1.4rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ background: '#1A1218', color: '#FDFBF9', border: 'none', padding: '0.65rem 1.6rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}