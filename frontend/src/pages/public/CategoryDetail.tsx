import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  ArrowUpDown,
  Filter,
  Sparkles,
} from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import type { Product, Category } from '../../types';
import { ProductGrid } from '../../components/product/ProductGrid';
import { Button } from '../../components/common/Button';

export const CategoryDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [relatedCategories, setRelatedCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Category title display map
  const categoryNames: Record<string, string> = {
    flagship: 'Flagship Smartphones',
    budget: 'Budget & Mid-Range Phones',
    gaming: 'Gaming Smartphones',
    '5g': '5G Ultra-Fast Smartphones',
    camera: 'Camera Phones',
    accessories: 'Mobile Accessories',
    'feature-phones': 'Feature Phones',
  };

  const displayName =
    category?.name ||
    (slug && categoryNames[slug.toLowerCase()]) ||
    (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Category');

  useEffect(() => {
    const loadCategoryData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories list to identify active category and related
        const allCatsRes = await categoriesApi.getCategories({ active: true });
        if (allCatsRes.success && allCatsRes.data) {
          const match = allCatsRes.data.find((c) => c.slug === slug);
          if (match) setCategory(match);
          setRelatedCategories(allCatsRes.data.filter((c) => c.slug !== slug).slice(0, 4));
        }

        // Fetch products filtered by category
        const prodRes = await productsApi.getProducts({
          category: slug,
          sortBy: sortBy as 'price' | 'createdAt' | 'salesCount' | 'name',
          sortOrder: sortOrder as 'asc' | 'desc',
          limit: 20,
        });

        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data);
        } else {
          setProducts([]);
        }
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryData();
  }, [slug, sortBy, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-ink-3">
        <Link to="/" className="transition-colors hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link to="/categories" className="transition-colors hover:text-primary">
          Categories
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="font-bold text-ink">{displayName}</span>
      </nav>

      {/* Category Hero Banner */}
      <header className="relative overflow-hidden rounded-hero border border-line bg-card aurora-bg p-6 shadow-soft sm:p-10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Official Category Lineup
          </span>
          <h1 className="text-3xl font-black leading-[1.06] tracking-[-0.03em] text-ink sm:text-4xl">
            {displayName}
          </h1>
          <p className="text-xs leading-relaxed text-ink-3 sm:text-sm">
            {category?.description ||
              `Browse genuine sealed ${displayName} available at Jaffna Mobile Zone with manufacturer warranty.`}
          </p>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-bold text-ink-2 shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            {products.length} Models Ready for Showroom Pickup / Islandwide Courier
          </span>
        </div>
      </header>

      {/* Control Bar: Sorting & Filter Link */}
      <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium text-ink-3">
          Showing {products.length} smartphones in this category
        </p>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-2 text-xs shadow-soft">
            <ArrowUpDown className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <select
              value={`${sortBy}:${sortOrder}`}
              aria-label="Sort products"
              onChange={(e) => {
                const [sb, so] = e.target.value.split(':');
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="cursor-pointer bg-transparent font-bold text-ink focus:outline-none"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="price:asc">Price: Low → High</option>
              <option value="price:desc">Price: High → Low</option>
              <option value="salesCount:desc">Most Popular</option>
            </select>
          </div>

          <Link to={`/shop?category=${slug}`}>
            <Button variant="outline" size="sm" leftIcon={<Filter className="h-3.5 w-3.5" />}>
              Advanced Filters
            </Button>
          </Link>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid
        products={products}
        isLoading={isLoading}
        emptyTitle={`No smartphones found in ${displayName}`}
        emptyDescription="We are constantly adding new inventory. Check our full shop or other categories."
      />

      {/* Related Categories */}
      {relatedCategories.length > 0 && (
        <div className="space-y-6 border-t border-line pt-10">
          <h3 className="text-xl font-black text-ink">Explore Other Categories</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relatedCategories.map((relCat) => (
              <Link
                key={relCat._id}
                to={`/categories/${relCat.slug}`}
                className="group block rounded-card border border-line bg-card p-4 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-card-hover"
              >
                <span className="block truncate text-sm font-bold text-ink transition-colors group-hover:text-primary">
                  {relCat.name}
                </span>
                <span className="mt-1 inline-block text-[11px] font-semibold text-primary">
                  View Category →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
