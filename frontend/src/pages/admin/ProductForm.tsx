import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { brandsApi } from '../../api/brands.api';
import { categoriesApi } from '../../api/categories.api';
import type { Brand, Category, Product } from '../../types';
import { Button } from '../../components/common/Button';
import { calculateDiscount, DEFAULT_PRODUCT_IMAGE } from '../../utils/helpers';

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';

const labelCls = 'block font-bold text-xs text-ink-2 mb-1';

export const AdminProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [primaryImage, setPrimaryImage] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [newImageInput, setNewImageInput] = useState('');

  // Pricing & Stock
  const [price, setPrice] = useState<number | ''>('');
  const [offerPrice, setOfferPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(10);
  const [sku, setSku] = useState('');
  const [warranty, setWarranty] = useState('1 Year Official Brand Distributor Warranty');

  // Specifications
  const [ram, setRam] = useState('8GB');
  const [storage, setStorage] = useState('256GB');
  const [display, setDisplay] = useState('');
  const [processor, setProcessor] = useState('');
  const [camera, setCamera] = useState('');
  const [battery, setBattery] = useState('');
  const [operatingSystem, setOperatingSystem] = useState('');
  const [supports5G, setSupports5G] = useState(true);

  // Colors & Variants
  const [colors, setColors] = useState<string[]>(['Titanium Black', 'Silver']);

  // Badges & Status
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [deal, setDeal] = useState(false);

  // Auto-calculated discount
  const discountPercentage =
    typeof price === 'number' && typeof offerPrice === 'number' && offerPrice < price
      ? calculateDiscount(price, offerPrice)
      : 0;

  useEffect(() => {
    brandsApi.getBrands().then((res) => {
      if (res.success && res.data) {
        setBrands(res.data);
        if (!brandId && res.data.length > 0) setBrandId(res.data[0]._id);
      }
    });
    categoriesApi.getCategories().then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
        if (!categoryId && res.data.length > 0) setCategoryId(res.data[0]._id);
      }
    });

    if (isEditing) {
      productsApi.getProductById(id).then((res) => {
        if (res.success && res.data) {
          const p = res.data;
          setName(p.name);
          setSlug(p.slug);
          setBrandId(typeof p.brand === 'object' ? p.brand?._id : p.brand);
          setCategoryId(typeof p.category === 'object' ? p.category?._id : p.category);
          setDescription(p.description || '');
          setPrimaryImage(p.images?.[0] || '');
          setAdditionalImages(p.images?.slice(1) || []);
          setPrice(p.price);
          setOfferPrice(p.offerPrice || '');
          setStock(p.stock);
          setSku(p.sku);
          setWarranty(p.warranty || '');
          setPublished(p.published);
          setFeatured(p.featured);
          setNewArrival(p.newArrival);
          setBestSeller(p.bestSeller);
          setDeal(p.deal);
          if (p.colors) setColors(p.colors);
          if (p.specifications) {
            setRam(p.specifications.ram || '');
            setStorage(p.specifications.storage || '');
            setDisplay(p.specifications.display || '');
            setProcessor(p.specifications.processor || '');
            setCamera(p.specifications.camera || '');
            setBattery(p.specifications.battery || '');
            setOperatingSystem(p.specifications.operatingSystem || '');
            setSupports5G(!!p.specifications.supports5G);
          }
        }
      });
    }
  }, [id, isEditing]);

  // Auto-generate slug and SKU from name if empty
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
      if (!sku) {
        setSku(
          `JMZ-${val
            .slice(0, 4)
            .toUpperCase()
            .replace(/[^A-Z]/g, 'X')}-${Math.floor(1000 + Math.random() * 9000)}`
        );
      }
    }
  };

  const handleAddImage = () => {
    if (newImageInput.trim()) {
      setAdditionalImages((prev) => [...prev, newImageInput.trim()]);
      setNewImageInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brandId || !categoryId || price === '' || stock === '' || !sku.trim()) {
      setError('Please fill in all mandatory product fields.');
      return;
    }

    // Validate ObjectId format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(brandId)) {
      setError('Invalid brand selected.');
      return;
    }
    if (!objectIdRegex.test(categoryId)) {
      setError('Invalid category selected.');
      return;
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug.trim().toLowerCase())) {
      setError('Slug must contain only lowercase letters, numbers, and hyphens.');
      return;
    }

    // Validate price
    const priceNum = Number(price);
    const offerPriceNum = offerPrice !== '' ? Number(offerPrice) : null;
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a valid positive number.');
      return;
    }
    if (offerPrice !== '' && (isNaN(offerPriceNum) || offerPriceNum < 0)) {
      setError('Offer price must be a valid positive number.');
      return;
    }
    if (offerPriceNum !== null && offerPriceNum > priceNum) {
      setError('Offer price cannot be greater than regular price.');
      return;
    }

    // Validate stock
    const stockNum = Number(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      setError('Stock must be a valid non-negative number.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const images = [primaryImage, ...additionalImages].filter(Boolean);

    const payload: Partial<Product> = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      brand: brandId,
      category: categoryId,
      description,
      images,
      price: priceNum,
      offerPrice: offerPriceNum,
      stock: stockNum,
      sku: sku.trim(),
      warranty,
      colors,
      published,
      featured,
      newArrival,
      bestSeller,
      deal: deal || (offerPriceNum !== null && offerPriceNum < priceNum),
      specifications: {
        ram,
        storage,
        display,
        processor,
        camera,
        battery,
        operatingSystem,
        supports5G,
      },
    };

    try {
      if (isEditing) {
        await productsApi.updateProduct(id, payload);
      } else {
        await productsApi.createProduct(payload);
      }
      navigate('/admin/products');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        const apiError = err as {
          message: string;
          errors?: Array<{ field: string; message: string }>;
        };
        const details = apiError.errors?.map((item) => `${item.field}: ${item.message}`).join(' ');
        setError(details ? `${apiError.message}: ${details}` : apiError.message);
      } else {
        setError('Failed to save product.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-line">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl border border-line bg-card text-ink-3 hover:text-ink hover:bg-elevated transition-colors"
            title="Back to products"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              {isEditing ? `Edit: ${name}` : 'Add New Smartphone'}
            </h1>
            <p className="text-xs text-ink-3">
              Configure pricing, URL images, technical specs, and flags
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="p-6 rounded-card border border-line bg-card shadow-soft space-y-4">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
            1. Device Identification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className={labelCls}>Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Samsung Galaxy S25 Ultra"
                className={`${inputCls} font-semibold`}
              />
            </div>

            <div>
              <label className={labelCls}>SEO Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="samsung-galaxy-s25-ultra"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Stock Keeping Unit (SKU) *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="JMZ-S25-BLK"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Brand *</label>
              <select
                required
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className={`${inputCls} bg-surface`}
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Category *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`${inputCls} bg-surface`}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className={labelCls}>Description &amp; Highlights</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of features, materials, and display technology..."
              className={inputCls}
            />
          </div>
        </div>

        {/* Section 2: Pricing & Stock (Auto-calculating discount) */}
        <div className="p-6 rounded-card border border-line bg-card shadow-soft space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              2. Pricing, Stock &amp; Automatic Discount
            </h2>
            {discountPercentage > 0 && (
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 text-xs font-extrabold">
                {discountPercentage}% DISCOUNT COMPUTED AUTOMATICALLY
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className={labelCls}>Regular Price (LKR) *</label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="249999"
                className={`${inputCls} font-bold`}
              />
            </div>

            <div>
              <label className={labelCls}>Offer Price (LKR - Optional)</label>
              <input
                type="number"
                min={0}
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="229999"
                className={`${inputCls} font-bold`}
              />
            </div>

            <div>
              <label className={labelCls}>Stock Quantity *</label>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value ? Number(e.target.value) : '')}
                placeholder="15"
                className={`${inputCls} font-bold`}
              />
            </div>
          </div>

          <div className="text-xs">
            <label className={labelCls}>Warranty Terms</label>
            <input
              type="text"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              placeholder="1 Year Brand Warranty"
              className={inputCls}
            />
          </div>
        </div>

        {/* Section 3: Product Image URLs with Live Preview */}
        <div className="p-6 rounded-card border border-line bg-card shadow-soft space-y-4">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
            3. Image URLs (No Local Upload Required)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3 text-xs">
              <div>
                <label className={labelCls}>Primary Mobile Image URL *</label>
                <input
                  type="url"
                  required
                  value={primaryImage}
                  onChange={(e) => setPrimaryImage(e.target.value)}
                  placeholder="https://images.unsplash.com/... or manufacturer URL"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Additional Gallery Image URLs</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageInput}
                    onChange={(e) => setNewImageInput(e.target.value)}
                    placeholder="https://example.com/gallery-angle.jpg"
                    className={inputCls}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddImage}>
                    Add
                  </Button>
                </div>

                {additionalImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {additionalImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 p-1.5 rounded-lg bg-surface border border-line text-[11px] text-ink-2"
                      >
                        <span className="truncate max-w-[150px]">{img}</span>
                        <button
                          type="button"
                          onClick={() => setAdditionalImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-0.5"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live Image Preview */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed border-line bg-surface">
              <span className="text-[11px] font-bold text-ink-3 mb-2 uppercase tracking-wider">
                Live URL Preview
              </span>
              <img
                src={primaryImage || DEFAULT_PRODUCT_IMAGE}
                alt="Preview"
                className="w-32 h-32 object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Specifications */}
        <div className="p-6 rounded-card border border-line bg-card shadow-soft space-y-4">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
            4. Hardware Specifications
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className={labelCls}>RAM Memory</label>
              <input
                type="text"
                value={ram}
                onChange={(e) => setRam(e.target.value)}
                placeholder="12GB"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Internal Storage</label>
              <input
                type="text"
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                placeholder="256GB"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Processor</label>
              <input
                type="text"
                value={processor}
                onChange={(e) => setProcessor(e.target.value)}
                placeholder="Snapdragon 8 Elite"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Battery</label>
              <input
                type="text"
                value={battery}
                onChange={(e) => setBattery(e.target.value)}
                placeholder="5000mAh"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Display</label>
              <input
                type="text"
                value={display}
                onChange={(e) => setDisplay(e.target.value)}
                placeholder="6.8-inch AMOLED 120Hz"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Camera</label>
              <input
                type="text"
                value={camera}
                onChange={(e) => setCamera(e.target.value)}
                placeholder="200MP + 50MP + 12MP"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>OS</label>
              <input
                type="text"
                value={operatingSystem}
                onChange={(e) => setOperatingSystem(e.target.value)}
                placeholder="Android 15 / One UI 7"
                className={inputCls}
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-ink-2">
                <input
                  type="checkbox"
                  checked={supports5G}
                  onChange={(e) => setSupports5G(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>5G Supported</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 5: Badges & Publishing Flags */}
        <div className="p-6 rounded-card border border-line bg-card shadow-soft space-y-4">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
            5. Storefront Badges &amp; Visibility
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-bold">
            <label className="flex items-center gap-2 p-3 rounded-xl border border-line bg-surface cursor-pointer transition-colors hover:bg-elevated">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span className="text-emerald-600 dark:text-emerald-400">Published</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-line bg-surface cursor-pointer transition-colors hover:bg-elevated">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-blue-600 dark:text-blue-400">Featured</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-line bg-surface cursor-pointer transition-colors hover:bg-elevated">
              <input
                type="checkbox"
                checked={newArrival}
                onChange={(e) => setNewArrival(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span className="text-indigo-600 dark:text-indigo-400">New Arrival</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-line bg-surface cursor-pointer transition-colors hover:bg-elevated">
              <input
                type="checkbox"
                checked={bestSeller}
                onChange={(e) => setBestSeller(e.target.checked)}
                className="rounded text-amber-600"
              />
              <span className="text-amber-600 dark:text-amber-400">Best Seller</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-line bg-surface cursor-pointer transition-colors hover:bg-elevated">
              <input
                type="checkbox"
                checked={deal}
                onChange={(e) => setDeal(e.target.checked)}
                className="rounded text-rose-600"
              />
              <span className="text-rose-600 dark:text-rose-400">Special Deal</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {isEditing ? 'Save Product Changes' : 'Publish Product to Store'}
          </Button>
        </div>
      </form>
    </div>
  );
};