import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface ModalCyberProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-[95vw] h-[95vh]',
};

export function ModalCyber({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
}: ModalCyberProps) {
  // Lock body scroll when modal is open
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

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={`
          relative w-full ${sizeStyles[size]} bg-white dark:bg-slate-800
          border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl
          animate-scale-in overflow-hidden
          ${size === 'full' ? 'flex flex-col' : ''}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="relative px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {title && (
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`relative ${size === 'full' ? 'flex-1 overflow-y-auto' : 'max-h-[calc(90vh-200px)] overflow-y-auto'} p-6 bg-white dark:bg-slate-800`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="relative px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Quick footer layouts
export function ModalFooterActions({
  onCancel,
  onConfirm,
  cancelText = 'CANCELAR',
  confirmText = 'CONFIRMAR',
  confirmVariant = 'primary',
  isLoading = false,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: 'primary' | 'danger';
  isLoading?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-3">
      <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
        {cancelText}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={onConfirm}
        isLoading={isLoading}
      >
        {confirmText}
      </Button>
    </div>
  );
}
