import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  Mail,
  Phone,
  Ban,
  CheckCircle2,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import type { User as UserType } from '../../types';
import { formatDate, formatLKR } from '../../utils/helpers';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<{
    user: UserType;
    orders: unknown[];
    reviews: unknown[];
    totalSpent: number;
  } | null>(null);
  const [statusTogglingId, setStatusTogglingId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getUsers('customer');
      if (res.success && res.data) {
        setCustomers(res.data);
      }
    } catch (error) {
      console.error('Failed to load customers', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (customer: UserType) => {
    setStatusTogglingId(customer._id);
    try {
      const newStatus = !customer.isActive;
      const res = await adminApi.updateUserStatus(customer._id, newStatus);
      if (res.success) {
        setCustomers((prev) =>
          prev.map((c) => (c._id === customer._id ? { ...c, isActive: newStatus } : c))
        );
        if (selectedCustomer && selectedCustomer.user._id === customer._id) {
          setSelectedCustomer({
            ...selectedCustomer,
            user: { ...selectedCustomer.user, isActive: newStatus },
          });
        }
      }
    } catch (error) {
      console.error('Failed to update status', error);
    } finally {
      setStatusTogglingId(null);
    }
  };

  const handleViewCustomer = async (userId: string) => {
    try {
      const res = await adminApi.getCustomerDetail(userId);
      if (res.success && res.data) {
        setSelectedCustomer(res.data);
      }
    } catch (error) {
      console.error('Failed to load customer details', error);
    } finally {
    }
  };

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = `${c.username || ''}`.toLowerCase();
    const email = c.email?.toLowerCase() || '';
    const phone = c.phone?.toLowerCase() || '';
    return name.includes(q) || email.includes(q) || phone.includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
            Buyer Accounts
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Customers
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Manage customer accounts, purchase history, and account activity
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCustomers} isLoading={isLoading}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="rounded-card border border-line bg-card shadow-soft p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            aria-label="Search customers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-line rounded-xl text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div className="text-xs text-ink-3">
          Showing <span className="text-ink font-semibold">{filtered.length}</span> registered customers
        </div>
      </div>

      {/* Customer Table */}
      <div className="rounded-card border border-line bg-card shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-12 h-12 text-ink-3 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-ink">No customers found</h3>
            <p className="text-ink-3 text-sm mt-1">
              {search ? 'Try adjusting your search query' : 'Registered customer accounts will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-surface border-b border-line text-ink-3 uppercase text-[11px] tracking-wide font-semibold">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((customer) => (
                  <tr key={customer._id} className="hover:bg-elevated transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {(customer.username?.[0] || 'C').toUpperCase()}
                        </div>
                        <div>
                          <div className="text-ink font-medium">{customer.username}</div>
                          <div className="text-xs text-ink-3">@{customer.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-ink-2 text-xs flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-ink-3" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="text-ink-3 text-xs flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-ink-3" />
                          {customer.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-ink-3 text-xs">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      {customer.isActive !== false ? (
                        <Badge variant="success" size="sm">Active</Badge>
                      ) : (
                        <Badge variant="danger" size="sm">Suspended</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCustomer(customer._id)}
                          title="View customer details"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                        <Button
                          variant={customer.isActive !== false ? 'ghost' : 'outline'}
                          size="sm"
                          disabled={statusTogglingId === customer._id}
                          onClick={() => handleToggleStatus(customer)}
                          className={
                            customer.isActive !== false
                              ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-500/10'
                              : 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                          }
                        >
                          {customer.isActive !== false ? (
                            <>
                              <Ban className="w-3.5 h-3.5 mr-1" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={Boolean(selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
          title="Customer Profile & Activity"
          size="lg"
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="p-4 bg-surface rounded-xl border border-line flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-primary font-bold text-lg">
                  {(selectedCustomer.user.username?.[0] || 'C').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">
                    {selectedCustomer.user.username}
                  </h3>
                  <p className="text-xs text-ink-3">{selectedCustomer.user.email}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={selectedCustomer.user.isActive !== false ? 'danger' : 'outline'}
                onClick={() => handleToggleStatus(selectedCustomer.user)}
              >
                {selectedCustomer.user.isActive !== false ? 'Suspend Account' : 'Activate Account'}
              </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-surface border border-line rounded-xl text-center">
                <p className="text-[11px] uppercase tracking-wide text-ink-3">Total Spent</p>
                <p className="text-lg font-bold text-primary mt-0.5">
                  {formatLKR(selectedCustomer.totalSpent || 0)}
                </p>
              </div>
              <div className="p-3 bg-surface border border-line rounded-xl text-center">
                <p className="text-[11px] uppercase tracking-wide text-ink-3">Total Orders</p>
                <p className="text-lg font-bold text-ink mt-0.5">
                  {selectedCustomer.orders?.length || 0}
                </p>
              </div>
              <div className="p-3 bg-surface border border-line rounded-xl text-center">
                <p className="text-[11px] uppercase tracking-wide text-ink-3">Reviews Written</p>
                <p className="text-lg font-bold text-ink mt-0.5">
                  {selectedCustomer.reviews?.length || 0}
                </p>
              </div>
            </div>

            {/* Order History */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Recent Orders</h4>
              {selectedCustomer.orders?.length === 0 ? (
                <p className="text-xs text-ink-3 italic p-3 bg-elevated rounded-xl border border-line">
                  No orders placed yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedCustomer.orders.map((order: any, idx: number) => (
                    <div key={idx} className="p-3 bg-surface border border-line rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-medium text-ink">#{order.orderNumber || order._id?.slice(-6)}</span>
                        <span className="text-ink-3 ml-2">{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">{formatLKR(order.total || 0)}</span>
                        <Badge size="sm" variant="default">{order.orderStatus}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default AdminCustomers;