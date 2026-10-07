import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Package, CreditCard } from 'lucide-react';
import { ordersApi } from '../../api/orders.api';
import type { Order, OrderStatus } from '../../types';
import { formatLKR, formatDate } from '../../utils/helpers';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';

export const CustomerOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    ordersApi.getOrderById(id).then((res) => {
      if (res.success && res.data) {
        setOrder(res.data);
      }
      setIsLoading(false);
    });
  }, [id]);

  const handleCancel = async () => {
    if (!order || !window.confirm('Are you sure you want to cancel this order?')) return;
    setIsCancelling(true);
    try {
      const res = await ordersApi.cancelOrder(order._id);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch {
      alert('Unable to cancel order at this stage.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 rounded-card" />;
  }

  if (!order) {
    return (
      <div className="rounded-card border border-line bg-card p-10 text-center">
        <p className="text-sm text-ink-3">Order not found.</p>
        <Link
          to="/customer/orders"
          className="mt-2 block text-xs font-semibold text-primary underline"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  const steps: Array<{ status: OrderStatus; label: string }> = [
    { status: 'pending', label: 'Order Placed' },
    { status: 'confirmed', label: 'Confirmed' },
    { status: 'processing', label: 'Processing' },
    { status: 'shipped', label: 'Dispatched from Jaffna' },
    { status: 'delivered', label: 'Delivered' },
  ];

  const currentIdx = steps.findIndex((s) => s.status === order.orderStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Link
            to="/customer/orders"
            aria-label="Back to orders"
            className="focus-ring rounded-xl border border-line bg-card p-2 text-ink-3 transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
              Order Tracking
            </span>
            <h1 className="mt-0.5 text-xl font-extrabold tracking-[-0.03em] text-ink sm:text-2xl">
              Order #{order._id.slice(-8)}
            </h1>
            <p className="text-xs text-ink-3">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              order.orderStatus === 'delivered'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                : order.orderStatus === 'cancelled'
                  ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400'
                  : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400'
            }`}
          >
            {order.orderStatus}
          </span>

          {['pending', 'confirmed'].includes(order.orderStatus) && (
            <Button
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={handleCancel}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Progress Timeline */}
      <section className="rounded-card border border-line bg-card p-6">
        <h2 className="mb-6 text-sm font-extrabold tracking-[-0.01em] text-ink">Delivery Status</h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {steps.map((step, idx) => {
            const isCompleted = currentIdx >= idx;
            const isCurrent = currentIdx === idx;
            return (
              <div key={step.status} className="flex flex-col items-center space-y-2 text-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-grad-primary text-white shadow-soft'
                      : 'border border-line bg-surface text-ink-3'
                  } ${isCurrent ? 'ring-2 ring-primary/40 ring-offset-2 ring-offset-card' : ''}`}
                >
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? 'text-primary'
                      : isCompleted
                        ? 'text-ink-2'
                        : 'text-ink-3'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Items List & Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-card border border-line bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-extrabold tracking-[-0.01em] text-ink">
              Purchased Devices
            </h2>
          </div>

          <div className="divide-y divide-line">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 py-4 text-xs">
                <div>
                  <span className="block text-sm font-bold text-ink">{item.nameSnapshot}</span>
                  <span className="text-ink-3">Qty: {item.quantity}</span>
                </div>
                <span className="text-sm font-bold text-ink">
                  {formatLKR(item.priceSnapshot * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Shipping & Payment summary */}
        <section className="rounded-card border border-line bg-card p-6 text-xs">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-extrabold tracking-[-0.01em] text-ink">
              Delivery &amp; Payment
            </h2>
          </div>

          <div className="space-y-2 text-ink-3">
            <div>
              <span className="mb-0.5 block font-bold text-ink">Recipient</span>
              <span>{order.shippingAddress.fullName}</span>
              <span className="block">{order.shippingAddress.phone}</span>
            </div>

            <div className="border-t border-line pt-2">
              <span className="mb-0.5 block font-bold text-ink">Shipping Address</span>
              <span>{order.shippingAddress.addressLine1}</span>
              <span className="block">
                {order.shippingAddress.city}, {order.shippingAddress.district}
              </span>
              <span>Sri Lanka ({order.shippingAddress.postalCode})</span>
            </div>

            <div className="border-t border-line pt-2">
              <span className="mb-0.5 block font-bold text-ink">Payment Status</span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-primary">
                {order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-1.5 border-t border-line pt-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatLKR(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                <span>Discount:</span>
                <span>-{formatLKR(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : formatLKR(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-sm font-extrabold text-ink">
              <span>Total:</span>
              <span className="text-primary">{formatLKR(order.total)}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
