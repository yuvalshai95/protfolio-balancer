import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface FullScreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

export const FullScreenDialog: React.FC<FullScreenDialogProps> = ({
  open,
  onOpenChange,
  title,
  children,
}) => {
  // Lock body scroll when dialog is open
  useEffect(() => {
    if (open) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [open]);

  // Handle Escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-200 ease-out ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Panel Container */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={`w-[95vw] max-w-[1800px] h-[95vh] bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-2xl transition-all duration-300 ease-out ${
            open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="fullscreen-dialog-title"
          onClick={e => e.stopPropagation()}>
          {/* Dialog Content with Header */}
          <div className="h-full w-full overflow-hidden flex flex-col">
            {/* Minimal Header with Close Button */}
            <div className="flex justify-end px-4 py-2 bg-white/20 backdrop-blur-sm rounded-t-2xl">
              {/* Hidden title for accessibility */}
              <h1 id="fullscreen-dialog-title" className="sr-only">
                {title}
              </h1>
              <button
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Close dialog">
                <X className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:block">Close</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden px-4 pt-2 pb-4">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};
