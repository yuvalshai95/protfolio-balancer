import React, { useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FullScreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

const FullScreenDialog: React.FC<FullScreenDialogProps> = ({
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

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Backdrop Overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'transition-all duration-300'
          )}
        />

        {/* Full Screen Content */}
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-0 z-50 bg-gradient-to-br from-slate-50 to-blue-50',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-100',
            'data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2',
            'transition-all duration-300 ease-out',
            'overflow-hidden'
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="fullscreen-dialog-title">
          {/* Hidden title for accessibility */}
          <DialogPrimitive.Title id="fullscreen-dialog-title" className="sr-only">
            {title}
          </DialogPrimitive.Title>

          {/* Close Button */}
          <DialogPrimitive.Close className="absolute right-6 top-6 rounded-lg p-2.5 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 opacity-90 ring-offset-background transition-all duration-200 hover:opacity-100 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10">
            <X className="h-5 w-5 text-gray-700" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          {/* Content Area */}
          <div className="h-full w-full p-6">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export { FullScreenDialog };
