import React, { useState } from 'react';
import { Image as ImageIcon, ToggleLeft, ExternalLink } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const AdminHomepageCMS: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<string[]>([
    'ROG-Phone-9',
    'iPhone-16-Pro-Max',
    'S23-Ultra',
  ]);
  const [bannerMode, setBannerMode] = useState<'featured' | 'live'>('featured');
  const [mdSortPrice, setMdSortPrice] = useState<'cheap' | 'expensive'>('cheap');

  const liveBannerImg =
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=1600&auto=format&fit=crop';

  const handleToggleProduct = (id: string) => {
    setFeaturedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
          Content &amp; Storefront
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
          Homepage CMS & Storefront
        </h1>
        <p className="text-sm text-ink-3 mt-1">
          Decide which hero banner and smartphone lineup appears first on the KMZ Storefront — your shop window
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hero Banner Display */}
        <section className="rounded-card border border-line bg-card shadow-soft p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-ink">Hero Banner Display</h2>
              <p className="text-xs text-ink-3 mt-0.5">Primary marketing slide on the storefront</p>
            </div>
            <Badge variant="neutral">Live Config</Badge>
          </div>

          {/* Linear item */}
          <div className="border border-line rounded-xl bg-surface p-4 flex items-center gap-4">
            <div className="relative w-40 h-24 rounded-lg overflow-hidden shrink-0 bg-elevated border border-line">
              <img
                src={liveBannerImg}
                alt="Hero banner preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-ink">New Arrivals — Smartphones &amp; Tablets</p>
              <p className="text-xs text-ink-3 mt-1">
                Showcased on the public hero slider. Edit from the Hero Slides screen.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary pointer-events-none">
                <ExternalLink className="w-3.5 h-3.5" />
                Storefront link
              </span>
            </div>
          </div>

          {/* Banner mode */}
          <div>
            <label className="block text-xs font-bold text-ink-3 mb-2">Banner Editor Focus</label>
            <div className="bg-surface border border-line rounded-xl p-1 inline-flex">
              {(['featured', 'live'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setBannerMode(mode)}
                  aria-pressed={bannerMode === mode}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    bannerMode === mode
                      ? 'bg-grad-primary text-white shadow-soft'
                      : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            {bannerMode === 'featured' && (
              <p className="text-[11px] text-ink-3 mt-2 border border-line rounded-lg bg-surface p-2.5">
                Sales banner opens edited under Hero Slides in the sidebar.
              </p>
            )}
          </div>
        </section>

        {/* Featured Smartphones */}
        <section className="rounded-card border border-line bg-card shadow-soft p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-ink">Featured Smartphone Lineup</h2>
              <p className="text-xs text-ink-3 mt-0.5">Profile best-sellers on the spotlight shelf</p>
            </div>
            <Badge variant="neutral">Preview</Badge>
          </div>

          {/* Preview placeholders */}
          <div className="grid grid-cols-3 gap-3">
            {featuredProducts.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => handleToggleProduct(id)}
                title="Click to unpin from lineup"
                className="border border-line rounded-xl bg-surface p-3 aspect-[5/6] flex flex-col group hover:border-primary/40 hover:bg-elevated transition-colors text-left"
              >
                <div className="bg-elevated rounded-lg flex-1 flex items-center justify-center border border-line">
                  <ImageIcon className="w-8 h-8 text-ink-3 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-[10px] font-mono text-primary mt-2 truncate">{id}</p>
              </button>
            ))}
            {featuredProducts.length === 0 && (
              <div className="col-span-3 border border-dashed border-line rounded-xl p-6 text-center text-xs text-ink-3">
                Lineup is empty — click to restore the default pins.
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-ink-3">{featuredProducts.length} items pinned</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFeaturedProducts(['ROG-Phone-9', 'iPhone-16-Pro-Max', 'S23-Ultra'])}
            >
              Restore Default Lineup
            </Button>
          </div>
        </section>
      </div>

      {/* Miscellaneous Controls — first grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-card border border-line bg-card shadow-soft p-5 space-y-4">
          <div>
            <h2 className="font-heading font-bold text-ink">Miscellaneous Toggles</h2>
            <p className="text-xs text-ink-3 mt-0.5">Show/hide storefront modules below</p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Show Testimonials', sub: 'Customer reviews widget' },
              { label: 'Show Blog Posts', sub: 'Latest articles strip' },
              { label: 'Show Instagram Feed', sub: 'Social gallery' },
              { label: 'Show Delivery Banners', sub: 'Delivery & payment ribbons' },
            ].map((item) => (
              <div
                key={item.label}
                className="border border-line rounded-xl bg-surface p-3.5 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-ink">{item.label}</p>
                  <p className="text-[11px] text-ink-3">{item.sub}</p>
                </div>
                <ToggleLeft className="w-7 h-7 text-primary fill-primary/20" />
              </div>
            ))}
          </div>
        </section>

        {/* Marketing categorical options */}
        <section className="rounded-card border border-line bg-card shadow-soft p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-ink">Marketing Banners</h2>
              <p className="text-xs text-ink-3 mt-0.5">Compact strip for seasonal campaigns</p>
            </div>
            <Badge variant="warning">Preview</Badge>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-3 mb-2">Landing Banner (flash sale)</label>
            <div className="relative rounded-xl overflow-hidden border border-line h-24">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500" />
              <div className="relative z-10 flex items-center justify-between h-full px-5">
                <div>
                  <p className="font-heading font-extrabold text-white text-sm sm:text-base">
                    Weekend Smartphone Sale
                  </p>
                  <p className="text-blue-200 text-xs">Up to 5% OFF selected models</p>
                </div>
                <span className="bg-white/15 backdrop-blur text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                  Live
                </span>
              </div>
            </div>
            <p className="text-[11px] text-ink-3 mt-2">
              Edit this from Hero Slides in the admin sidebar.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-3 mb-2">Mega Menu Sorting (Mobile Doctor Section)</label>
            <div className="bg-surface border border-line rounded-xl p-1 inline-flex">
              {(['cheap', 'expensive'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setMdSortPrice(s)}
                  aria-pressed={mdSortPrice === s}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    mdSortPrice === s
                      ? 'bg-grad-primary text-white shadow-soft'
                      : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminHomepageCMS;