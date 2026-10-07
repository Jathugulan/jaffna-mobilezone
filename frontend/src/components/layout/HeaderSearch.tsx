import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import { categoriesApi } from '../../api/categories.api';

const FALLBACK_CATEGORIES: { name: string; slug: string }[] = [
  { name: 'Flagship Phones', slug: 'flagship' },
  { name: 'Gaming Phones', slug: 'gaming' },
  { name: '5G Phones', slug: '5g' },
  { name: 'Camera Phones', slug: 'camera' },
  { name: 'Budget Phones', slug: 'budget' },
  { name: 'Accessories', slug: 'accessories' },
];

/**
 * Large rounded header search: query input + "All Categories" scoper +
 * electric-blue Search button. Submits to the shop catalogue which honours
 * both `q` and `category` query params.
 */
export const HeaderSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    let active = true;
    categoriesApi
      .getCategories({ active: true })
      .then((res) => {
        if (!active || !res.success || !res.data) return;
        const mapped = [...res.data]
          .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999))
          .slice(0, 8)
          .map(({ name, slug }) => ({ name, slug }));
        if (mapped.length) setCategories(mapped);
      })
      .catch(() => {
        /* Offline: the curated fallback list keeps the dropdown usable. */
      });
    return () => {
      active = false;
    };
  }, []);

  const options = categories.length ? categories : FALLBACK_CATEGORIES;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const term = query.trim();
    if (term) params.set('q', term);
    if (categorySlug) params.set('category', categorySlug);
    const search = params.toString();
    navigate(search ? `/shop?${search}` : '/shop');
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-[680px] items-center gap-2 rounded-full border border-line bg-card py-1.5 pl-4 pr-1.5 shadow-soft transition-all duration-200 focus-within:border-primary focus-within:shadow-card"
    >
      <Search className="h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search phones, brands, accessories..."
        aria-label="Search phones, brands, accessories"
        className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-ink-3"
      />

      {/* Category scoper */}
      <div className="relative hidden shrink-0 items-center border-l border-line pl-2 sm:flex">
        <select
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          aria-label="Search within category"
          className="max-w-[136px] cursor-pointer appearance-none truncate rounded-lg bg-transparent py-1.5 pl-1 pr-6 text-[12px] font-bold text-ink-2 outline-none transition-colors duration-200 hover:text-primary [&>option]:bg-white [&>option]:text-slate-800 dark:[&>option]:bg-[#0c1322] dark:[&>option]:text-slate-100"
        >
          <option value="">All Categories</option>
          {options.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-1.5 h-3.5 w-3.5 text-ink-3"
          aria-hidden="true"
        />
      </div>

      <button
        type="submit"
        aria-label="Search"
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-grad-primary px-4 text-[12.5px] font-bold text-white shadow-md shadow-blue-600/25 transition-all duration-150 hover:brightness-110 active:scale-[0.98] focus-ring"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        Search
      </button>
    </form>
  );
};

export default HeaderSearch;