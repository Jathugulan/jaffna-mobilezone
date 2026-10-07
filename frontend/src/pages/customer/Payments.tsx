import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Download, Receipt } from 'lucide-react';

interface PaymentRecord {
  id: string;
  orderNumber: string;
  amount: number;
  method: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  date: string;
}

export const CustomerPayments: React.FC = () => {
  const [payments] = useState<PaymentRecord[]>([
    {
      id: 'PAY-891230',
      orderNumber: 'JMZ-ORD-1092',
      amount: 289000,
      method: 'Showroom Counter (Cash / Card)',
      status: 'paid',
      date: '2026-09-22',
    },
    {
      id: 'PAY-782104',
      orderNumber: 'JMZ-ORD-1045',
      amount: 85000,
      method: 'Bank Transfer (Commercial Bank)',
      status: 'paid',
      date: '2026-08-14',
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-line pb-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-ink-2">
          <span className="h-1.5 w-1.5 rounded-full bg-grad-primary" aria-hidden="true" />
          Billing
        </span>
        <h1 className="mt-2.5 text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-3xl">
          Payment Transactions
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-3">
          Review payment history, invoices, and verified receipts for your mobile device purchases
        </p>
      </div>

      {/* Payment Security Badge */}
      <div className="flex items-start gap-3 rounded-card border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-xs leading-relaxed text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <span>
          All payment transactions are encrypted and audited according to Sri Lankan financial
          standards.
        </span>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-card border border-line bg-card">
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <Receipt className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-extrabold tracking-[-0.01em] text-ink">
            Transaction History
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-surface text-[10px] font-black uppercase tracking-wider text-ink-3">
              <tr>
                <th className="px-5 py-3">Payment ID</th>
                <th className="px-5 py-3">Order Ref</th>
                <th className="px-5 py-3">Amount (LKR)</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="transition-colors hover:bg-surface dark:hover:bg-elevated/60"
                >
                  <td className="px-5 py-3.5 font-mono font-bold text-ink">{p.id}</td>
                  <td className="px-5 py-3.5 font-bold text-primary">{p.orderNumber}</td>
                  <td className="px-5 py-3.5 font-extrabold text-ink">
                    Rs. {p.amount.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-ink-2">{p.method}</td>
                  <td className="px-5 py-3.5 text-ink-3">{p.date}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> {p.status === 'paid' ? 'Paid & Settled' : p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => alert(`Downloading Receipt for ${p.id}`)}
                      className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1.5 text-ink-2 transition-colors hover:border-primary hover:text-primary focus-ring"
                      title="Download Official Receipt"
                      aria-label={`Download receipt for ${p.id}`}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerPayments;
