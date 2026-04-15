import React from 'react';
import { ToastMessage } from '../types';
import { Check, Info } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts }) => {
  return (
    <div className="fixed top-0 left-0 z-[100] w-full flex flex-col items-center pt-6 pointer-events-none gap-2">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-5 py-2.5 rounded-full bg-burgundy-950/80 dark:bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-toast-in-out transform transition-all hover:scale-[1.02]"
        >
          {toast.type === 'success' ? (
            <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <Check size={12} className="text-white stroke-[3]" />
            </div>
          ) : (
            <div className="h-5 w-5 rounded-full bg-gold-500 flex items-center justify-center shrink-0 shadow-lg shadow-gold-500/30">
              <Info size={12} className="text-black stroke-[3]" />
            </div>
          )}
          <p className="text-xs font-semibold text-stone-100 tracking-wide pr-1">
            {toast.message}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Toast;