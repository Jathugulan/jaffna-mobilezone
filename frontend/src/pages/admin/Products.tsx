import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { brandsApi } from '../../api/brands.api';
import type { Brand, Product } from '../../types';
import { Button } from '../../components/common/Button';
import { formatLKR, DEFAULT_PRODUCT_IMAGE } from '../../utils/helpers';
import { Skeleton } from '../../components/common/Skeleton';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productsApi.getProducts({
        page,
        limit: 15,
        search: search || undefined,
        brand: selectedBrand || undefined,
        category: selectedCategory || undefined,
        published:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'published'
            ? true
            : false,
      });

      if (res.success) {
        setProducts(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalCount(res.pagination.total || 0);
        }
      }
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, selectedBrand, selectedCategory, statusFilter]);

  useEffect(() => {
    brandsApi.getBrands().then((res) => {
      if (res.success && res.data) setBrands(res.data);
    });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const handleTogglePublish = async (product: Product) => {
    try {
      const res = await productsApi.updateProduct(product._id, {
        published: !product.published,
      });
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, published: !p.published } : p))
        );
      }
    } catch {
      alert('Failed to update published status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsApi.deleteProduct(id);
      loadProducts();
    } catch {
      alert('Failed to delete product.');
    }
  };

  const handleDuplicate = async (product: Product) => {
    try {
      const duplicated: Partial<Product> = {
        ...product,
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy-${Date.now().toString().slice(-4)}`,
        sku: `${product.sku}-COPY-${Date.now().toString().slice(-4)}`,
        published: false,
      };
      delete (duplicated as { _id?: string })._id;
      const res = await productsApi.createProduct(duplicated);
      if (res.success) {
        loadProducts();
        alert('Product duplicated as draft.');
      }
    } catch {
      alert('Failed to duplicate product.');
    }
  };

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkPublish = async (publish: boolean) => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      await Promise.all(
        selectedIds.map((id) => productsApi.updateProduct(id, { published: publish }))
      );
      setSelectedIds([]);
      loadProducts();
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected products?`)) return;
    setIsBulkProcessing(true);
    try {
      await Promise.all(selectedIds.map((id) => productsApi.deleteProduct(id)));
      setSelectedIds([]);
      loadProducts();
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
            Inventory &amp; Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Product Management ({totalCount})
          </h1>
        </div>

        <Link to="/admin/products/create">
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Add New Smartphone
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-card border border-line bg-card shadow-soft flex flex-col lg:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by model, SKU, or name..."
              aria-label="Search products"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-line text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <Search className="w-4 h-4 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Brand Filter */}
          <select
            value={selectedBrand}
            aria-label="Filter by brand"
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b._id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            aria-label="Filter by status"
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="all">All Status</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Controls */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-card bg-blue-500/10 border border-blue-500/30 flex flex-wrap items-center justify-between gap-4 text-xs">
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {selectedIds.length} products selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              isLoading={isBulkProcessing}
              onClick={() => handleBulkPublish(true)}
            >
              Publish Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              isLoading={isBulkProcessing}
              onClick={() => handleBulkPublish(false)}
            >
              Unpublish Selected
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isBulkProcessing}
              onClick={handleBulkDelete}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Products Data Table */}
      <div className="rounded-card border border-line bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-line text-ink-3 uppercase text-[11px] tracking-wide font-semibold">
              <tr>
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedIds.length === products.length}
                    onChange={toggleSelectAll}
                    aria-label="Select all products"
                    className="rounded text-primary"
                  />
                </th>
                <th className="px-4 py-3 min-w-[220px]">Product</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Regular Price</th>
                <th className="px-4 py-3">Offer Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-4 py-3">
                      <Skeleton className="h-10 w-full rounded-xl" />
                    </td>
                  </tr>
                ))
              ) : products.length > 0 ? (
                products.map((prod) => {
                  const brandName =
                    typeof prod.brand === 'object' && prod.brand !== null
                      ? prod.brand.name
                      : '—';
                  const isSelected = selectedIds.includes(prod._id);
                  return (
                    <tr
                      key={prod._id}
                      className={`hover:bg-elevated transition-colors ${
                        isSelected ? 'bg-blue-500/5' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(prod._id)}
                          aria-label={`Select ${prod.name}`}
                          className="rounded text-primary"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images?.[0] || DEFAULT_PRODUCT_IMAGE}
                            alt=""
                            className="w-10 h-10 object-contain rounded-lg bg-surface border border-line p-1 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-ink block truncate text-sm">
                              {prod.name}
                            </span>
                            <span className="text-[11px] text-ink-3 font-mono">
                              SKU: {prod.sku}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-semibold text-ink-2">{brandName}</td>

                      <td className="px-4 py-3 font-bold text-ink">{formatLKR(prod.price)}</td>

                      <td className="px-4 py-3">
                        {prod.offerPrice && prod.offerPrice < prod.price ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                              {formatLKR(prod.offerPrice)}
                            </span>
                            <span className="text-[10px] font-semibold text-rose-500">
                              {prod.discountPercentage || 0}% OFF
                            </span>
                          </div>
                        ) : (
                          <span className="text-ink-3">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`font-bold ${
                            prod.stock <= 5 ? 'text-rose-500' : 'text-ink-2'
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleTogglePublish(prod)}
                          title={prod.published ? 'Click to unpublish' : 'Click to publish'}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-colors ${
                            prod.published
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-elevated text-ink-3 border-line hover:bg-surface'
                          }`}
                        >
                          {prod.published ? 'Published' : 'Draft'}
                        </button>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/product/${prod.slug}`}
                            target="_blank"
                            title="View Public Page"
                            className="p-1.5 rounded-lg text-ink-3 hover:text-primary hover:bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            to={`/admin/products/${prod._id}/edit`}
                            title="Edit Product"
                            className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDuplicate(prod)}
                            title="Duplicate Product"
                            className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(prod._id)}
                            title="Delete Product"
                            className="p-1.5 rounded-lg text-ink-3 hover:text-rose-500 hover:bg-rose-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink-3">
                    No products found. Click &quot;Add New Smartphone&quot; above to create your
                    first listing!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-line bg-surface flex items-center justify-between text-xs">
            <span className="text-ink-3">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
