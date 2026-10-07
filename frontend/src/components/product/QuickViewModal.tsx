import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import type { Product } from '../../types';
import { Modal } from '../common/Modal';
import { PriceDisplay } from '../common/PriceDisplay';
import { Button } from '../common/Button';
import { useCart } from '../../context/CartContext';
import { DEFAULT_PRODUCT_IMAGE } from '../../utils/helpers';

export interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addToCart } = useCart();
  const brandName =
    typeof product.brand === 'object' && product.brand !== null
      ? product.brand.name
      : 'Brand';

  const specs = product.specifications || {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="grid grid-cols-1 gap-6 items-center md:grid-cols-2">
        {/* Image Gallery */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-featured border border-line bg-surface p-4 aspect-square aurora-bg">
          <img
            src={product.images?.[0] || DEFAULT_PRODUCT_IMAGE}
            alt={product.name}
            className="max-h-72 object-contain drop-shadow-lg"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <span className="inline-flex rounded-full border border-line bg-surface px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-ink-3">
              {brandName}
            </span>
            <h2 className="mt-2 text-xl font-extrabold tracking-[-0.02em] text-ink">
              {product.name}
            </h2>
            <div className="mt-2">
              <PriceDisplay
                price={product.price}
                offerPrice={product.offerPrice}
                size="lg"
                showSavings={true}
              />
            </div>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {specs.display && (
              <div className="rounded-card border border-line bg-surface p-2.5">
                <span className="block text-[10px] font-black uppercase tracking-wide text-ink-3">
                  Display
                </span>
                <span className="font-semibold text-ink">{specs.display}</span>
              </div>
            )}
            {specs.processor && (
              <div className="rounded-card border border-line bg-surface p-2.5">
                <span className="block text-[10px] font-black uppercase tracking-wide text-ink-3">
                  Processor
                </span>
                <span className="font-semibold text-ink">{specs.processor}</span>
              </div>
            )}
            {specs.camera && (
              <div className="rounded-card border border-line bg-surface p-2.5">
                <span className="block text-[10px] font-black uppercase tracking-wide text-ink-3">
                  Camera
                </span>
                <span className="font-semibold text-ink">{specs.camera}</span>
              </div>
            )}
            {specs.battery && (
              <div className="rounded-card border border-line bg-surface p-2.5">
                <span className="block text-[10px] font-black uppercase tracking-wide text-ink-3">
                  Battery
                </span>
                <span className="font-semibold text-ink">{specs.battery}</span>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="space-y-1.5 pt-2 text-xs text-ink-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>1 Year Official Warranty Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              <span>Islandwide Safe Delivery across Sri Lanka</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-violet-500" />
              <span>100% Genuine Sealed Mobile Device</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-3 sm:flex-row">
            <Button
              className="flex-1 rounded-xl bg-grad-primary font-bold shadow-soft hover:scale-[1.02] hover:shadow-glow"
              variant="primary"
              leftIcon={<ShoppingBag className="w-4 h-4" />}
              onClick={() => {
                addToCart(product, 1);
                onClose();
              }}
            >
              Add to Cart
            </Button>
            <Link to={`/product/${product.slug}`} onClick={onClose} className="sm:flex-1">
              <Button
                variant="outline"
                className="w-full rounded-xl border-line font-bold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Full Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
};
