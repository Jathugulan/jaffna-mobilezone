import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
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
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-[95vw] h-[90vh]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-200 dark:bg-black/70"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'animate-fadeInSoft relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-modal border border-line bg-elevated shadow-premium',
          sizeClasses[size]
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-line p-6">
            <div>
              {title && (
                <h3 className="text-xl font-extrabold tracking-[-0.02em] text-ink">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-ink-3">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="focus-ring shrink-0 rounded-full border border-line bg-card p-2 text-ink-3 transition-all duration-150 hover:border-primary hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};
