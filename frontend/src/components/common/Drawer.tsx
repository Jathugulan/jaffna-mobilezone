import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    left: {
      sm: 'w-72',
      md: 'w-96',
      lg: 'w-[480px]',
    },
    right: {
      sm: 'w-72',
      md: 'w-96',
      lg: 'w-[480px]',
    },
    bottom: {
      sm: 'h-1/3',
      md: 'h-1/2',
      lg: 'h-3/4 max-h-[85vh]',
    },
  };

  const positionClasses = {
    left: 'left-0 top-0 bottom-0 h-full border-r animate-slideInLeft',
    right: 'right-0 top-0 bottom-0 h-full border-l animate-slideInRight',
    bottom:
      'left-0 right-0 bottom-0 w-full rounded-t-modal border-t animate-slideDownSoft',
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-200 dark:bg-black/70"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'fixed z-50 flex max-w-full flex-col border-line bg-elevated shadow-premium',
          positionClasses[position],
          position === 'bottom'
            ? sizeClasses.bottom[size]
            : sizeClasses[position][size]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-line p-5">
          <h3 className="text-lg font-extrabold tracking-[-0.02em] text-ink">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="focus-ring shrink-0 rounded-full border border-line bg-card p-2 text-ink-3 transition-all duration-150 hover:border-primary hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
};
