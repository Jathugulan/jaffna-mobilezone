import React from 'react';
import { Button } from './Button';
import { PackageOpen } from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'my-4 flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-card p-10 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-featured border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
        {icon || <PackageOpen className="h-8 w-8" />}
      </div>
      <h3 className="mb-1.5 text-lg font-extrabold tracking-[-0.02em] text-ink">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-ink-3">
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};
