import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
  dismissible?: boolean;
}

/**
 * Shared modal used across the ported Persona Health screens, styled to match
 * Smart Campus AI's existing LoginModal/AIChat overlay pattern instead of
 * pulling in shadcn/Radix Dialog (Rule: no second component library/visual
 * identity for this module).
 */
export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-md', dismissible = true }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full ${maxWidth} bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto`}>
        {(title || (dismissible && onClose)) && (
          <div className="flex items-center justify-between p-5 border-b border-slate-700">
            {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
            {dismissible && onClose && (
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
