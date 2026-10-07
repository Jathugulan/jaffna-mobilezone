import React from 'react';
import { CheckCircle2, Tag, Inbox } from 'lucide-react';

export const CustomerNotifications: React.FC = () => {
  const notifications = [
    {
      id: '1',
      title: 'Welcome to Jaffna Mobile Zone!',
      desc: 'Your customer account is now active. Explore our flagships and islandwide delivery.',
      date: 'Just now',
      icon: CheckCircle2,
      color: 'bg-blue-500/10 text-primary',
    },
    {
      id: '2',
      title: 'Weekend Flash Deals Scheduled',
      desc: 'Check out active promotions on Apple and Samsung phones under the Deals tab.',
      date: 'Today',
      icon: Tag,
      color: 'bg-rose-500/10 text-rose-500',
    },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page Header */}
      <div className="border-b border-line pb-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-ink-2">
          <span className="h-1.5 w-1.5 rounded-full bg-grad-primary" aria-hidden="true" />
          Activity Feed
        </span>
        <h1 className="mt-2.5 text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-3xl">
          Notifications
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-3">
          Account updates, promotions and delivery alerts in one calm feed.
        </p>
      </div>

      <div className="rounded-card border border-line bg-card">
        {notifications.map((n, idx) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className={`flex items-start gap-4 p-5 transition-colors hover:bg-surface dark:hover:bg-elevated/60 ${
                idx > 0 ? 'border-t border-line' : ''
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${n.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold text-ink">{n.title}</h2>
                  <span className="shrink-0 text-[11px] text-ink-3">{n.date}</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-3">{n.desc}</p>
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-center gap-2 border-t border-line px-5 py-6 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
          <Inbox className="h-3.5 w-3.5" />
          You are all caught up
        </div>
      </div>
    </div>
  );
};
