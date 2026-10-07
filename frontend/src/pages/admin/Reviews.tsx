import React, { useState, useEffect } from 'react';
import {
  Star,
  EyeOff,
  Trash2,
  Filter,
  MessageSquare,
  RotateCcw,
  Check,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import type { Review } from '../../types';
import { formatDate } from '../../utils/helpers';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'hidden'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getReviews();
      if (res.success && res.data) {
        setReviews(res.data);
      }
    } catch (error) {
      console.error('Failed to load reviews', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (reviewId: string, status: 'approved' | 'hidden') => {
    setActionLoadingId(reviewId);
    try {
      const res = await adminApi.updateReviewStatus(reviewId, status);
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, status } : r))
        );
      }
    } catch (error) {
      console.error('Failed to update review status', error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer review?')) {
      return;
    }
    setActionLoadingId(reviewId);
    try {
      const res = await adminApi.deleteReview(reviewId);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } catch (error) {
      console.error('Failed to delete review', error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
            Social Proof
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Review Moderation
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Approve genuine customer feedback, hide inappropriate content, and maintain store credibility
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchReviews} isLoading={isLoading}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-ink-3" />
        {[
          { id: 'all', label: 'All Reviews' },
          { id: 'pending', label: 'Pending Approval' },
          { id: 'approved', label: 'Approved' },
          { id: 'hidden', label: 'Hidden' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            aria-pressed={filter === tab.id}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              filter === tab.id
                ? 'bg-grad-primary text-white shadow-soft'
                : 'border border-line bg-surface text-ink-2 hover:text-ink hover:bg-elevated'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-card border border-line bg-card shadow-soft p-12 text-center">
            <MessageSquare className="w-12 h-12 text-ink-3 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-ink">No reviews found</h3>
            <p className="text-ink-3 text-sm mt-1">
              Customer reviews matching this filter will appear here for moderation.
            </p>
          </div>
        ) : (
          filtered.map((rev) => (
            <div
              key={rev._id}
              className="rounded-card border border-line bg-card shadow-soft p-5 space-y-4 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-3'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-ink">
                    {typeof rev.product === 'object' && rev.product
                      ? rev.product.name
                      : 'Product Review'}
                  </span>
                  {rev.verifiedPurchase && (
                    <Badge variant="success" size="sm">Verified Buyer</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-3">
                  <span>{formatDate(rev.createdAt)}</span>
                  <Badge
                    variant={
                      rev.status === 'approved'
                        ? 'success'
                        : rev.status === 'hidden'
                        ? 'danger'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {rev.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Comment Content */}
              <p className="text-sm text-ink-2 leading-relaxed">{rev.comment}</p>

              {/* Author & Action buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-ink-3">
                  By <span className="text-ink font-medium">{rev.user?.username || 'Customer'}</span>
                  {rev.product && (
                    <span className="ml-2 text-ink-3">
                      for <span className="text-primary">{typeof rev.product === 'object' ? rev.product.name : 'Product'}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {rev.status !== 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                      disabled={actionLoadingId === rev._id}
                      onClick={() => handleUpdateStatus(rev._id, 'approved')}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Approve
                    </Button>
                  )}
                  {rev.status !== 'hidden' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-amber-500 hover:bg-amber-500/10"
                      disabled={actionLoadingId === rev._id}
                      onClick={() => handleUpdateStatus(rev._id, 'hidden')}
                    >
                      <EyeOff className="w-3.5 h-3.5 mr-1" />
                      Hide
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    disabled={actionLoadingId === rev._id}
                    onClick={() => handleDelete(rev._id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default AdminReviews;