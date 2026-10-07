import React, { useState } from 'react';
import { Plus, Trash2, Image, ExternalLink } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  buttonLabel: string;
  buttonLink: string;
  targetPage: string;
  active: boolean;
}

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';

export const AdminHeroSlides: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([
    {
      id: 'H1',
      title: 'New Arrivals — Smartphones',
      subtitle: 'Latest Snapdragon & iOS devices in stock now',
      imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=1600&auto=format&fit=crop',
      imageAlt: 'Latest flagship smartphones',
      buttonLabel: 'Shop Now',
      buttonLink: '/products',
      targetPage: 'All Smartphones',
      active: true,
    },
    {
      id: 'H2',
      title: 'Weekend Flash Sale',
      subtitle: 'Up to 5% OFF selected sealed models',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1600&auto=format&fit=crop',
      imageAlt: 'Smartphone flash sale',
      buttonLabel: 'View Offers',
      buttonLink: '/offers',
      targetPage: 'Offers',
      active: true,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1600&auto=format&fit=crop');
  const [newButtonLabel, setNewButtonLabel] = useState('Shop Now');
  const [newTargetPage, setNewTargetPage] = useState('/products');

  const handleCreateSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSlide: HeroSlide = {
      id: `H${Date.now()}`,
      title: newTitle,
      subtitle: newSubtitle,
      imageUrl: newImageUrl,
      imageAlt: newTitle,
      buttonLabel: newButtonLabel,
      buttonLink: newTargetPage,
      targetPage: newTargetPage,
      active: true,
    };

    setSlides([...slides, newSlide]);
    setShowAddModal(false);
    setNewTitle('');
    setNewSubtitle('');
  };

  const handleToggleSlide = (id: string) => {
    setSlides(slides.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  const handleDeleteSlide = (id: string) => {
    if (window.confirm('Delete this hero slide?')) {
      setSlides(slides.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
            Storefront
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Hero Slider Management
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Compose the primary carousel your customers see first — imagery, CTA, and link destination
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setShowAddModal(true);
            setNewTitle('');
            setNewSubtitle('');
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Slide
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slides.map((s) => (
          <article
            key={s.id}
            className="rounded-card border border-line bg-card shadow-soft overflow-hidden flex flex-col"
          >
            {/* Image Preview */}
            <div className="relative h-52 overflow-hidden bg-elevated border-b border-line shrink-0">
              <img
                src={s.imageUrl}
                alt={s.imageAlt}
                className="w-full h-full object-cover transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                {s.active ? (
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-bold text-[10px] uppercase tracking-wide">
                    Live
                  </span>
                ) : (
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-ink/60 text-white font-bold text-[10px] uppercase tracking-wide">
                    Draft
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3 flex-1 flex flex-col">
              <div>
                <h2 className="font-heading font-bold text-ink leading-tight">{s.title}</h2>
                <p className="text-sm text-ink-3 mt-1">{s.subtitle}</p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-ink-2 font-bold border border-line bg-surface rounded-lg px-2.5 py-1">
                  {s.buttonLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-primary font-bold">
                  <ExternalLink className="w-3.5 h-3.5" />
                  {s.targetPage}
                </span>
              </div>

              <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-line">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowImageModal(s.imageUrl)}
                    title="Preview image"
                    className="p-2 rounded-lg border border-line bg-surface text-ink-2 hover:text-ink hover:bg-elevated transition-colors"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleSlide(s.id)}
                    className="px-3 py-2 rounded-lg border border-line bg-surface font-bold text-[11px] text-ink-2 hover:text-ink hover:bg-elevated transition-colors"
                  >
                    {s.active ? 'Hide Slide' : 'Activate'}
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteSlide(s.id)}
                  title="Delete slide"
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Hero Slide">
        <form onSubmit={handleCreateSlide} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="slideTitle">
              Slide Title
            </label>
            <input
              id="slideTitle"
              type="text"
              required
              placeholder="e.g. New Arrivals — Smartphones"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="slideSubtitle">
              Subtitle
            </label>
            <input
              id="slideSubtitle"
              type="text"
              placeholder="e.g. Latest Snapdragon devices in stock"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="slideImageUrl">
              Image URL
            </label>
            <input
              id="slideImageUrl"
              type="text"
              placeholder="https://..."
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className={inputCls}
            />
            <div className="mt-2 rounded-lg overflow-hidden border border-line h-24 bg-elevated">
              {newImageUrl ? (
                <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink-3 text-xs">
                  Image preview
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="slideButtonLabel">
                CTA Label
              </label>
              <input
                id="slideButtonLabel"
                type="text"
                value={newButtonLabel}
                onChange={(e) => setNewButtonLabel(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-3 mb-1" htmlFor="slideTarget">
                Target Page
              </label>
              <input
                id="slideTarget"
                type="text"
                value={newTargetPage}
                onChange={(e) => setNewTargetPage(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Add Slide
            </Button>
          </div>
        </form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        isOpen={Boolean(showImageModal)}
        onClose={() => setShowImageModal(null)}
        title="Slide Image Preview"
        size="lg"
      >
        {showImageModal && (
          <div className="rounded-lg overflow-hidden border border-line">
            <img src={showImageModal} alt="Slide preview" className="w-full h-auto" />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminHeroSlides;