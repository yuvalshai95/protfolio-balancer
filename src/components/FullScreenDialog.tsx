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
          {/* Hidden title for accessibility */}
          <h1 id="fullscreen-dialog-title" className="sr-only">
            {title}
          </h1>

          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-6 top-6 rounded-lg p-2.5 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 opacity-90 ring-offset-background transition-all duration-200 hover:opacity-100 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-10"
            aria-label="Close dialog">
            <X className="h-5 w-5 text-gray-700" />
          </button>

          {/* Content Area */}
          <div className="h-full w-full p-6 overflow-hidden">{children}</div>
        </div>
      </div>
    </>
  );
};
