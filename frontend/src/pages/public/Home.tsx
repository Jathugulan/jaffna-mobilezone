import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  Search,
  ChevronRight,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  CreditCard,
  CalendarCheck,
  Truck,
  Headphones,
  Flame,
  Smartphone,
  Cpu,
  Radio,
  Camera,
  RotateCcw,
  BookmarkCheck,
} from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { brandsApi } from '../../api/brands.api';
import { offersApi } from '../../api/offers.api';
import { contentApi } from '../../api/content.api';
import type { Brand, Product, Offer, FAQ } from '../../types';
import { ProductCard } from '../../components/product/ProductCard';
import { CountdownTimer } from '../../components/deals/CountdownTimer';
import { Button } from '../../components/common/Button';
import { SectionHeading } from '../../components/common/SectionHeading';
import { StoreMap } from '../../components/common/StoreMap';
import { BookingModal } from '../../components/booking/BookingModal';
import { HeroSection } from '../../components/home/HeroSection';
import { BrandCarousel } from '../../components/home/BrandCarousel';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  // Quick Search state
  const [searchQuery, setSearchQuery] = useState('');
  const popularSearches = ['iPhone 16 Pro', 'Galaxy S26 Ultra', 'Redmi Note 14', 'OnePlus 13', 'Pixel 9', '5G Gaming'];

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedProductForBooking, setSelectedProductForBooking] = useState<Product | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, brandRes, offerRes, faqRes] = await Promise.all([
          productsApi.getProducts({ limit: 30 }),
          brandsApi.getBrands({ active: true }),
          offersApi.getActiveOffers(),
          contentApi.getFaqs(),
        ]);

        const allProds = prodRes.data || [];
        setProducts(allProds);
        setFeaturedProducts(allProds.filter((p) => p.featured).slice(0, 8));
        setDeals(
          allProds.filter((p) => p.deal || (p.offerPrice && p.offerPrice < p.price)).slice(0, 4)
        );
        setNewArrivals(
          allProds.filter((p) => p.newArrival || !p.featured).slice(0, 4)
        );

        if (brandRes.success && brandRes.data) {
          setBrands(brandRes.data);
        }
        if (offerRes.success && offerRes.data && offerRes.data.length > 0) {
          setActiveOffer(offerRes.data[0]);
        }
        if (faqRes.success && faqRes.data) {
          setFaqs(faqRes.data);
        }
      } catch {
        // Safe fallback
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleOpenBooking = (prod?: Product) => {
    const targetProduct = prod || featuredProducts[0] || products[0] || ({
      _id: 'default-flagship',
      name: 'Samsung Galaxy S26 Ultra 5G',
      slug: 'samsung-galaxy-s26-ultra',
      brand: 'Samsung',
      category: 'Flagship',
      description: 'Official flagship titanium sealed device with 200MP camera and Snapdragon 8 Elite.',
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800'],
      price: 320000,
      offerPrice: 289000,
      sku: 'JMZ-S26U-256',
      stock: 12,
      specifications: { ram: '12GB', storage: '256GB', supports5G: true },
      colors: ['Titanium Gray', 'Phantom Black', 'Ocean Blue'],
      variants: [],
      featured: true,
      newArrival: true,
      bestSeller: true,
      deal: true,
      published: true,
    } as unknown as Product);

    setSelectedProductForBooking(targetProduct);
    setIsBookingOpen(true);
  };

  const categoriesList = [
    {
      name: 'Flagship',
      slug: 'flagship',
      desc: 'Supreme processors & titanium builds',
      count: '42 Models',
      icon: Flame,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Budget',
      slug: 'budget',
      desc: 'Incredible value under Rs. 100,000',
      count: '68 Models',
      icon: Smartphone,
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Gaming',
      slug: 'gaming',
      desc: '165Hz AMOLED with cooling triggers',
      count: '24 Models',
      icon: Cpu,
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: '5G Phones',
      slug: '5g',
      desc: 'Ultra-fast Gigabit wireless speeds',
      count: '95 Models',
      icon: Radio,
      image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Camera Specialists',
      slug: 'camera',
      desc: 'Periscope telephoto & 8K cinema mode',
      count: '36 Models',
      icon: Camera,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Feature Phones',
      slug: 'feature-phones',
      desc: 'Rugged battery standby & tactile keypad',
      count: '18 Models',
      icon: RotateCcw,
      image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=600&auto=format&fit=crop',
    },
  ];

  return (
    <div className="relative space-y-16 overflow-hidden pb-20 sm:space-y-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-[420px] h-[480px] w-[480px] rounded-[50%] bg-[radial-gradient(closest-side,rgba(59,130,246,0.08),transparent_70%)] dark:bg-[radial-gradient(closest-side,rgba(139,92,246,0.07),transparent_70%)]" />
        <div className="absolute -right-40 top-[1500px] h-[520px] w-[520px] rounded-[50%] bg-[radial-gradient(closest-side,rgba(99,102,241,0.07),transparent_70%)] dark:bg-[radial-gradient(closest-side,rgba(59,130,246,0.06),transparent_70%)]" />
      </div>
      {/* ================= 1. CINEMATIC HERO SECTION ================= */}
      <HeroSection onReserve={() => handleOpenBooking()} />

      {/* ================= 2. QUICK SEARCH BAR ================= */}
      <section className="relative z-10 mx-auto -mt-3 w-full max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-featured border border-line bg-card/95 p-3 text-ink shadow-card backdrop-blur-xl sm:p-4">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="shrink-0 pl-1 text-primary sm:pl-3">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search smartphones, brands, RAM, storage, or models (e.g. S26 Ultra, 256GB)..."
                  className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-ink placeholder-ink-3 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="shrink-0 px-2 text-xs font-bold text-ink-3 transition-colors hover:text-ink"
                  >
                    Clear
                  </button>
                )}
                <Button type="submit" variant="primary" size="md" className="shrink-0 whitespace-nowrap">
                  Search
                </Button>
              </form>

              {/* Popular Search Chips */}
              <div className="mt-3 flex items-center gap-2 overflow-x-auto border-t border-line pt-3 no-scrollbar text-xs">
                <span className="shrink-0 text-[11px] font-black uppercase tracking-wider text-ink-3">
                  Trending Searches:
                </span>
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      navigate(`/shop?q=${encodeURIComponent(term)}`);
                    }}
                    className="shrink-0 rounded-full bg-surface px-2.5 py-1 font-medium text-[11px] text-ink-2 transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
      </section>

      {/* ================= 3. SHOP BY GLOBAL BRAND — futuristic carousel ================= */}
      <BrandCarousel allBrandsCount={brands.length || 8} apiBrands={brands} />

      {/* ================= 4. SHOP BY CATEGORY ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Curated Collections"
          title="Shop by Category"
          linkTo="/categories"
          linkLabel="View All Categories"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {categoriesList.map((cat, index) => {
            const Icon = cat.icon;
            const spanCls =
              index === 0
                ? 'sm:col-span-2 lg:col-span-2 h-[300px]'
                : index === categoriesList.length - 1
                  ? 'sm:col-span-2 lg:col-span-3 h-[240px]'
                  : 'h-64';
            return (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                className={`group relative overflow-hidden rounded-card border border-line bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-card-hover ${spanCls}`}
              >
                {/* Background Image with Dark Gradient Overlay */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/25" />
                <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(420px_160px_at_20%_0%,rgba(59,130,246,0.24),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(59,130,246,0.6)_40%,rgba(139,92,246,0.5)_60%,transparent)]" />

                {/* Content Overlay */}
                <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-card bg-grad-primary text-white shadow-soft backdrop-blur-md">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold backdrop-blur-md">
                      {cat.count}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black tracking-[-0.02em]">{cat.name}</h3>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-300">{cat.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-200 transition-transform group-hover:translate-x-1">
                      <span>Explore Collection</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================= 5. TRENDING PRODUCTS ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Popular in Jaffna"
          title="Trending Smartphones"
          linkTo="/shop?sort=popular"
          linkLabel="View All Trending"
        />

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-line py-12 text-center text-sm text-ink-3">
            Smartphones are being loaded from the Jaffna showroom catalog...
          </div>
        )}
      </section>

      {/* ================= 6. FRESH ARRIVALS ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Just Unboxed"
          title="Fresh Arrivals"
          linkTo="/new-arrivals"
          linkLabel="View All New Arrivals"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {(newArrivals.length > 0 ? newArrivals : featuredProducts.slice(0, 4)).map((prod) => (
            <ProductCard key={prod._id} product={{ ...prod, newArrival: true }} />
          ))}
        </div>
      </section>

      {/* ================= 7. FLASH DEALS WITH COUNTDOWN ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-featured border border-line bg-[#0b1120] p-6 text-white shadow-premium sm:p-10">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-grad-deal" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,#03101F_0%,#071a33_45%,#020B17_100%)]" />
              <div className="absolute -left-24 -top-32 h-[380px] w-[520px] rounded-[50%] bg-[radial-gradient(closest-side,rgba(59,130,246,0.3),transparent_72%)]" />
              <div className="absolute -bottom-40 -right-20 h-[380px] w-[520px] rounded-[50%] bg-[radial-gradient(closest-side,rgba(244,63,94,0.18),transparent_70%)]" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(59,130,246,0.55)_35%,rgba(244,63,94,0.45)_65%,transparent)]" />
            </div>
          <div className="relative flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-center">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-rose-400">
                <Zap className="h-4 w-4 fill-rose-500 text-rose-500" /> LIMITED TIME PROMOTIONS
              </span>
              <h2 className="text-2xl font-black tracking-[-0.03em] sm:text-4xl">
                Exclusive Flash Deals
              </h2>
              <p className="text-xs text-slate-400 sm:text-sm">
                Official company-sealed devices at special campaign prices.
              </p>
            </div>

            {/* Countdown timer */}
            <div className="flex flex-col items-start md:items-end gap-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                CAMPAIGN ENDS IN
              </span>
              <CountdownTimer
                targetDate={
                  activeOffer?.endDate ||
                  new Date(Date.now() + 48 * 3600 * 1000).toISOString()
                }
                size="md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
            {(deals.length > 0 ? deals : featuredProducts.slice(0, 4)).map((dealProd) => (
              <ProductCard key={dealProd._id} product={{ ...dealProd, deal: true }} />
            ))}
          </div>

          <div className="mt-8 text-center pt-6 border-t border-white/10">
            <Link to="/deals">
              <Button variant="outline" size="md">
                View All Promotional Deals →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 8. BOOK YOUR PHONE EXPLANATION ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-featured border border-line bg-card/90 p-8 text-ink shadow-card backdrop-blur-xl sm:p-12">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute -left-28 -top-36 h-[420px] w-[560px] rounded-[50%] bg-[radial-gradient(closest-side,rgba(59,130,246,0.16),transparent_72%)]" />
              <div className="absolute -bottom-44 -right-24 h-[400px] w-[520px] rounded-[50%] bg-[radial-gradient(closest-side,rgba(139,92,246,0.14),transparent_70%)]" />
            </div>
          <SectionHeading
            align="center"
            eyebrow="Seamless Experience"
            title="How Phone Booking Works"
            description="Reserve your dream smartphone in 4 easy steps without paying anything upfront."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative overflow-hidden rounded-card border border-line bg-surface p-6 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-card-hover">
              <span className="absolute right-4 top-4 text-4xl font-black text-primary/25">
                01
              </span>
              <h4 className="mb-2 text-base font-extrabold text-ink">
                Choose Phone
              </h4>
              <p className="text-xs leading-relaxed text-ink-2">
                Browse our curated lineup of Apple, Samsung, Xiaomi, and Google flagships.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-card border border-line bg-surface p-6 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-card-hover">
              <span className="absolute right-4 top-4 text-4xl font-black text-primary/25">
                02
              </span>
              <h4 className="mb-2 text-base font-extrabold text-ink">
                Select Variant
              </h4>
              <p className="text-xs leading-relaxed text-ink-2">
                Pick your preferred RAM, internal storage capacity, and luxury color finish.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-card border border-line bg-surface p-6 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-card-hover">
              <span className="absolute right-4 top-4 text-4xl font-black text-primary/25">
                03
              </span>
              <h4 className="mb-2 text-base font-extrabold text-ink">
                Pickup / Delivery
              </h4>
              <p className="text-xs leading-relaxed text-ink-2">
                Choose flagship store counter collection in Jaffna or islandwide secured courier.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-card border border-line bg-surface p-6 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-card-hover">
              <span className="absolute right-4 top-4 text-4xl font-black text-primary/25">
                04
              </span>
              <h4 className="mb-2 text-base font-extrabold text-ink">
                Confirm Booking
              </h4>
              <p className="text-xs leading-relaxed text-ink-2">
                Receive instant reservation reference code and inspect seal before paying.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Button
              variant="glow"
              size="lg"
              onClick={() => handleOpenBooking()}
              leftIcon={<BookmarkCheck className="w-5 h-5" />}
            >
              Book Your Phone Now
            </Button>
          </div>
        </div>
      </section>

      {/* ================= 9. WHY CHOOSE US ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="Trust & Assurance"
          title="Why Jaffna Mobile Zone"
          description="Setting the standard for mobile technology retail across Northern Sri Lanka."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="group space-y-3 rounded-card border border-line bg-card p-6 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-card-hover">
            <div className="flex h-10 w-10 items-center justify-center rounded-card bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-extrabold text-ink">
              Genuine Products
            </h4>
            <p className="text-xs leading-relaxed text-ink-2">
              100% authentic mobile devices sealed with verified manufacturer warranty.
            </p>
          </div>

          <div className="group space-y-3 rounded-card border border-line bg-card p-6 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-card-hover">
            <div className="flex h-10 w-10 items-center justify-center rounded-card bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-extrabold text-ink">
              Secure Payments
            </h4>
            <p className="text-xs leading-relaxed text-ink-2">
              Card, online transfers, installment plans, or pay-on-pickup at our counter.
            </p>
          </div>

          <div className="group space-y-3 rounded-card border border-line bg-card p-6 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-card-hover">
            <div className="flex h-10 w-10 items-center justify-center rounded-card bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-extrabold text-ink">
              Flexible Booking
            </h4>
            <p className="text-xs leading-relaxed text-ink-2">
              Reserve specific mobile variants and hardware configurations with ease.
            </p>
          </div>

          <div className="group space-y-3 rounded-card border border-line bg-card p-6 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-card-hover">
            <div className="flex h-10 w-10 items-center justify-center rounded-card bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Truck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-extrabold text-ink">
              Reliable Delivery
            </h4>
            <p className="text-xs leading-relaxed text-ink-2">
              Convenient islandwide delivery tracking and prompt store counter handovers.
            </p>
          </div>

          <div className="group space-y-3 rounded-card border border-line bg-card p-6 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-card-hover">
            <div className="flex h-10 w-10 items-center justify-center rounded-card bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Headphones className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-extrabold text-ink">
              Customer Support
            </h4>
            <p className="text-xs leading-relaxed text-ink-2">
              Professional phone hardware specialists ready in Jaffna via WhatsApp & call.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 10. STORE LOCATION & LEAFLET MAP ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Physical Showroom"
          title="Store Location & Visiting Hours"
        />

        {/* Desktop: Two-Column / Mobile: Stacked */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Store Info Column */}
          <div className="space-y-6 rounded-featured border border-line bg-card p-6 shadow-card backdrop-blur-xl sm:p-8 lg:col-span-5">
            <div>
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <MapPin className="h-3.5 w-3.5" /> Jaffna City Center
              </span>
              <h3 className="text-xl font-black text-ink sm:text-2xl">
                Jaffna Mobile Zone Flagship
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-2 sm:text-sm">
                Test hands-on flagship display panels, verify original box seals, and consult directly with our local tech advisers.
              </p>
            </div>

            <div className="space-y-4 text-xs text-ink-2">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-card bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-bold text-ink">Address</span>
                  <span>No. 142, Hospital Road, Jaffna, Northern Province, Sri Lanka</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-card bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-bold text-ink">Opening Hours</span>
                  <span>Monday – Saturday: 9:00 AM – 8:00 PM</span>
                  <span className="block text-ink-3">Sunday: 10:00 AM – 4:00 PM</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-card bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-bold text-ink">Phone & WhatsApp</span>
                  <span>+94 21 222 4567 / +94 77 123 4567</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=9.6647,80.0167"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="md">
                  Get Turn-by-Turn Directions
                </Button>
              </a>
              <Link to="/contact">
                <Button variant="outline" size="md">
                  Contact Form
                </Button>
              </Link>
            </div>
          </div>

          {/* Leaflet + OpenStreetMap Canvas Column */}
          <div className="lg:col-span-7">
            <StoreMap height="460px" showDetailsCard={true} />
          </div>
        </div>
      </section>

      {/* ================= 11. FAQ ACCORDION ================= */}
      {faqs.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionHeading
            align="center"
            eyebrow="Guidance & Answers"
            title="Frequently Asked Questions"
          />

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq._id}
                className="group cursor-pointer rounded-card border border-line bg-card p-5 shadow-soft backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40 open:border-blue-500/50 open:shadow-card-hover"
              >
                <summary className="flex items-center justify-between text-sm font-extrabold text-ink [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <ChevronRight className="h-4 w-4 text-ink-3 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-xs leading-relaxed text-ink-2">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Booking Modal */}
      <BookingModal
        product={selectedProductForBooking}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};
