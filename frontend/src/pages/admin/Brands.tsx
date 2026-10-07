import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { brandsApi } from '../../api/brands.api';
import type { Brand } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';

export const AdminBrands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [cardImageUrl, setCardImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  const loadBrands = () => {
    brandsApi.getBrands().then((res) => {
      if (res.success && res.data) {
        setBrands(res.data);
      }
    });
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const openCreate = () => {
    setEditingBrand(null);
    setName('');
    setSlug('');
    setLogoUrl('');
    setBannerUrl('');
    setCardImageUrl('');
    setDescription('');
    setFeatured(false);
    setActive(true);
    setDisplayOrder(0);
    setIsModalOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setName(brand.name);
    setSlug(brand.slug);
    setLogoUrl(brand.logoUrl || '');
    setBannerUrl(brand.bannerUrl || '');
    setCardImageUrl(brand.cardImageUrl || brand.bannerUrl || '');
    setDescription(brand.description || '');
    setFeatured(brand.featured);
    setActive(brand.active);
    setDisplayOrder(brand.displayOrder || 0);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Brand> = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      logoUrl: logoUrl || undefined,
      bannerUrl: bannerUrl || undefined,
      cardImageUrl: cardImageUrl || undefined,
      description,
      featured,
      active,
      displayOrder: Number(displayOrder),
    };

    try {
      if (editingBrand) {
        await brandsApi.updateBrand(editingBrand._id, payload);
      } else {
        await brandsApi.createBrand(payload);
      }
      setIsModalOpen(false);
      loadBrands();
    } catch {
      alert('Failed to save brand.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    try {
      await brandsApi.deleteBrand(id);
      loadBrands();
    } catch {
      alert('Failed to delete brand.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
            Manufacturers
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Brand Management ({brands.length})
          </h1>
        </div>

        <Button variant="primary" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Brand
        </Button>
      </div>

      {/* Brands Table */}
      <div className="rounded-card border border-line bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-line text-ink-3 uppercase text-[11px] tracking-wide font-semibold">
              <tr>
                <th className="px-4 py-3">Brand Logo</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Display Order</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {brands.map((brand) => (
                <tr key={brand._id} className="hover:bg-elevated transition-colors">
                  <td className="px-4 py-3">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="w-10 h-10 object-contain rounded-lg bg-surface border border-line p-1"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-ink">{brand.name}</td>
                  <td className="px-4 py-3 font-mono text-ink-3 text-xs">/brand/{brand.slug}</td>
                  <td className="px-4 py-3">
                    {brand.featured ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        Featured
                      </span>
                    ) : (
                      <span className="text-ink-3">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        brand.active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-elevated text-ink-3'
                      }`}
                    >
                      {brand.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink-2">{brand.displayOrder}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/brand/${brand.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-ink-3 hover:text-primary hover:bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => openEdit(brand)}
                        className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        title="Edit Brand"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(brand._id)}
                        className="p-1.5 rounded-lg text-ink-3 hover:text-rose-500 hover:bg-rose-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        title="Delete Brand"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? 'Edit Brand' : 'Create New Brand'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="brandName">
                Brand Name *
              </label>
              <input
                id="brandName"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingBrand) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }
                }}
                placeholder="e.g. Samsung"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="brandSlug">
                Public Slug (URL) *
              </label>
              <input
                id="brandSlug"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="samsung"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="brandLogo">
              Logo Image URL (Transparent PNG Preferred)
            </label>
            <input
              id="brandLogo"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/brand-logo.png"
              className={inputCls}
            />
            {logoUrl && (
              <div className="mt-2 p-2 rounded-xl bg-surface border border-line inline-block">
                <img src={logoUrl} alt="Logo preview" className="w-12 h-12 object-contain" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="brandBanner">
              Brand Hero Banner URL
            </label>
            <input
              id="brandBanner"
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="brandCard">
              Carousel Card Image URL
              <span className="ml-2 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
                Shown large on the home &ldquo;Shop by Global Brand&rdquo; cards
              </span>
            </label>
            <input
              id="brandCard"
              type="url"
              value={cardImageUrl}
              onChange={(e) => setCardImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... (two phones on dark background works best)"
              className={inputCls}
            />
            {cardImageUrl && (
              <div className="mt-2 overflow-hidden rounded-xl border border-line bg-elevated">
                <img
                  src={cardImageUrl}
                  alt="Carousel card preview"
                  className="h-36 w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <p className="px-3 py-1.5 text-[11px] font-semibold text-ink-3">
                  Card preview — portrait phone shots fill the card best
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="brandDesc">
              Brand Description
            </label>
            <textarea
              id="brandDesc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Official manufacturer of Galaxy flagships and A-series devices..."
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-ink-2 text-xs">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded text-primary"
              />
              <span>Featured Brand</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-ink-2 text-xs">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span>Active on Site</span>
            </label>

            <div>
              <label className="block text-xs font-bold text-ink-3 mb-0.5" htmlFor="brandOrder">
                Order
              </label>
              <input
                id="brandOrder"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-20 px-2 py-1 rounded-lg border border-line bg-surface text-ink text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-line">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Brand
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
