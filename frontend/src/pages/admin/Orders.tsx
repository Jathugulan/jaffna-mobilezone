import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
  User,
  MapPin,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { ordersApi } from '../../api/orders.api';
import type { Order, OrderStatus } from '../../types';
import { formatLKR, formatDate } from '../../utils/helpers';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: CheckCircle2 },
  processing: { label: 'Processing', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', icon: Package },
  packed: { label: 'Packed', color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20', icon: Truck },
  outForDelivery: { label: 'Out for Delivery', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', icon: XCircle },
  returned: { label: 'Returned', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', icon: RefreshCw },
  refunded: { label: 'Refunded', color: 'bg-elevated text-ink-3 border-line', icon: RefreshCw },
};

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await ordersApi.getAdminOrders(
        statusFilter === 'all' ? undefined : (statusFilter as OrderStatus)
      );
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    setActionError(null);
    try {
      const res = await ordersApi.updateOrderStatus(orderId, newStatus);
      if (res.success && res.data) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data : o)));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data);
        }
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setActionError(e.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const orderNum = o.orderNumber?.toLowerCase() || '';
    const name = (o.shippingAddress?.fullName || '').toLowerCase();
    const phone = o.shippingAddress?.phone?.toLowerCase() || '';
    return orderNum.includes(q) || name.includes(q) || phone.includes(q);
  });

  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'cancelled' && o.orderStatus !== 'returned')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingCount = orders.filter((o) => o.orderStatus === 'pending').length;

  const summaryCards = [
    {
      label: 'Total Orders',
      value: orders.length,
      labelClass: 'text-ink-3',
      valueClass: 'text-ink',
    },
    {
      label: 'Pending Actions',
      value: pendingCount,
      labelClass: 'text-amber-600 dark:text-amber-400',
      valueClass: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Total Revenue',
      value: formatLKR(totalRevenue),
      labelClass: 'text-emerald-600 dark:text-emerald-400',
      valueClass: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Delivered',
      value: orders.filter((o) => o.orderStatus === 'delivered').length,
      labelClass: 'text-blue-600 dark:text-blue-400',
      valueClass: 'text-blue-600 dark:text-blue-400',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
            Fulfilment Centre
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Order Management
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Track customer shipments, update fulfillment statuses, and manage returns
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} isLoading={isLoading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Orders
        </Button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="p-4 rounded-card border border-line bg-card shadow-soft">
            <p className={`text-[11px] font-bold uppercase tracking-wide ${c.labelClass}`}>
              {c.label}
            </p>
            <p className={`font-heading text-2xl font-extrabold mt-1 ${c.valueClass}`}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-card border border-line bg-card shadow-soft p-4 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
          <input
            type="text"
            placeholder="Search by Order #, Customer Name, or Phone..."
            aria-label="Search orders"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-line rounded-xl text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-ink-3 shrink-0" />
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'processing', label: 'Processing' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              aria-pressed={statusFilter === tab.id}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                statusFilter === tab.id
                  ? 'bg-grad-primary text-white shadow-soft'
                  : 'border border-line bg-surface text-ink-2 hover:text-ink hover:bg-elevated'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-card border border-line bg-card shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-ink-3 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-ink">No orders found</h3>
            <p className="text-ink-3 text-sm mt-1">
              {search ? 'Try adjusting your search terms' : 'No customer orders match the selected filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-surface border-b border-line text-ink-3 uppercase text-[11px] tracking-wide font-semibold">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredOrders.map((order) => {
                  const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;

                  return (
                    <tr key={order._id} className="hover:bg-elevated transition-colors group">
                      <td className="py-3 px-4 font-mono font-medium text-ink">
                        <span className="text-primary">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</span>
                      </td>
                      <td className="py-3 px-4 text-ink-3 text-xs">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-ink font-medium">
                          {order.shippingAddress?.fullName}
                        </div>
                        <div className="text-xs text-ink-3">{order.shippingAddress?.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-ink-2">
                        {order.items?.length || 0} items
                      </td>
                      <td className="py-3 px-4 font-semibold text-ink">
                        {formatLKR(order.total || 0)}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.orderStatus}
                          aria-label={`Status for order ${order.orderNumber || order._id}`}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value as OrderStatus)}
                          disabled={isUpdatingStatus}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-surface cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${cfg.color}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="outForDelivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="returned">Returned</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          title="View order details"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.orderNumber || selectedOrder._id.slice(-6).toUpperCase()}`}
          size="lg"
        >
          <div className="space-y-6">
            {actionError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {actionError}
              </div>
            )}

            {/* Status Selector & Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface rounded-xl border border-line gap-3">
              <div>
                <p className="text-xs text-ink-3">Order Placed On</p>
                <p className="text-sm font-semibold text-ink">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-ink-3" htmlFor="modalStatusSelect">
                  Status:
                </label>
                <select
                  id="modalStatusSelect"
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value as OrderStatus)}
                  disabled={isUpdatingStatus}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-line bg-elevated text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-primary text-[11px] font-bold uppercase tracking-wider">
                  <User className="w-4 h-4" />
                  Customer Information
                </div>
                <p className="text-sm font-semibold text-ink">
                  {selectedOrder.shippingAddress?.fullName}
                </p>
                <p className="text-xs text-ink-3">{selectedOrder.shippingAddress?.phone}</p>
                {selectedOrder.shippingAddress?.city && (
                  <p className="text-xs text-ink-3">Location: {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                )}
              </div>

              <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-primary text-[11px] font-bold uppercase tracking-wider">
                  <MapPin className="w-4 h-4" />
                  Delivery Address
                </div>
                <p className="text-xs text-ink-2">
                  {selectedOrder.shippingAddress?.addressLine1}
                  {selectedOrder.shippingAddress?.addressLine2
                    ? `, ${selectedOrder.shippingAddress.addressLine2}`
                    : ''}
                </p>
                <p className="text-xs text-ink-3">
                  {selectedOrder.shippingAddress?.district || 'Jaffna'}, Sri Lanka
                </p>
                <div className="text-xs text-ink-3 pt-1 border-t border-line">
                  Payment: <span className="text-ink font-medium uppercase">{selectedOrder.paymentMethod || 'Cash on Delivery'}</span> ({selectedOrder.paymentStatus})
                </div>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Ordered Products</h4>
              <div className="border border-line rounded-xl divide-y divide-line overflow-hidden">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-surface">
                    <div className="flex items-center gap-3">
                      {item.imageSnapshot && (
                        <img
                          src={item.imageSnapshot}
                          alt={item.nameSnapshot}
                          className="w-12 h-12 rounded-lg object-contain bg-elevated border border-line p-1"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-ink">{item.nameSnapshot}</p>
                        <p className="text-xs text-ink-3">
                          Qty: {item.quantity} × {formatLKR(item.offerPriceSnapshot ?? item.priceSnapshot)}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-ink">
                      {formatLKR((item.offerPriceSnapshot ?? item.priceSnapshot) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Cost Totals */}
            <div className="p-4 bg-surface rounded-xl border border-line space-y-2 text-xs">
              <div className="flex justify-between text-ink-3">
                <span>Subtotal</span>
                <span className="text-ink font-medium">{formatLKR(selectedOrder.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-ink-3">
                <span>Delivery Fee</span>
                <span className="text-ink font-medium">
                  {selectedOrder.deliveryFee === 0 ? 'FREE' : formatLKR(selectedOrder.deliveryFee || 0)}
                </span>
              </div>
              {selectedOrder.discount ? (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span>-{formatLKR(selectedOrder.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-bold text-ink pt-2 border-t border-line">
                <span>Total</span>
                <span className="text-primary">{formatLKR(selectedOrder.total || 0)}</span>
              </div>
            </div>

            {/* Cancellation / delivery notes if any */}
            {(selectedOrder.cancellationReason || selectedOrder.shippingAddress?.deliveryInstructions) && (
              <div className="p-3 bg-elevated border border-line rounded-xl text-xs text-ink-3 space-y-1">
                {selectedOrder.shippingAddress?.deliveryInstructions && (
                  <div>
                    <span className="font-semibold text-ink">Delivery Note: </span>
                    {selectedOrder.shippingAddress.deliveryInstructions}
                  </div>
                )}
                {selectedOrder.cancellationReason && (
                  <div>
                    <span className="font-semibold text-ink">Cancellation Reason: </span>
                    {selectedOrder.cancellationReason}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
export default AdminOrders;
