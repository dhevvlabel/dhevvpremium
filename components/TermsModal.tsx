import React from 'react';
import { X, ShieldAlert, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-burgundy-950/40 dark:bg-black/60 backdrop-blur-md transition-opacity"
            onClick={onClose}
          ></motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-lg max-h-[85vh] bg-stone-50/90 dark:bg-[#1a0505]/95 backdrop-blur-2xl border border-burgundy-900/10 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            
            <div className="flex items-center justify-between p-6 border-b border-burgundy-900/5 dark:border-white/5 bg-white/40 dark:bg-white/5">
          <h2 className="text-xl font-bold text-burgundy-950 dark:text-stone-100 flex items-center gap-2 font-serif">
            <ShieldAlert className="text-burgundy-600 dark:text-gold-500" />
            Terms & Guarantee
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-stone-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-sm text-stone-700 dark:text-stone-300 space-y-6">
          
          <div className="bg-gold-50 dark:bg-gold-900/10 p-4 rounded-xl border border-gold-200 dark:border-gold-500/20">
            <h3 className="font-bold text-gold-800 dark:text-gold-400 mb-2 uppercase tracking-wide text-xs">Important Notice</h3>
            <p className="leading-relaxed">Warranty is valid for the duration of the subscription, provided all usage rules are strictly followed.</p>
          </div>

          <section>
            <h3 className="font-bold text-burgundy-950 dark:text-stone-100 mb-3 text-base font-serif">General Rules</h3>
            <ul className="space-y-3 list-none">
              <li className="flex gap-3">
                <div className="mt-0.5 min-w-[16px]"><Check size={16} className="text-emerald-500" /></div>
                <span className="leading-relaxed">Strictly prohibited from changing Email, Password, or Profiles on Sharing accounts.</span>
              </li>
              <li className="flex gap-3">
                <div className="mt-0.5 min-w-[16px]"><Check size={16} className="text-emerald-500" /></div>
                <span className="leading-relaxed">Login is limited to 1 Device only for Sharing variants.</span>
              </li>
              <li className="flex gap-3">
                <div className="mt-0.5 min-w-[16px]"><Check size={16} className="text-emerald-500" /></div>
                <span className="leading-relaxed">Report issues (Screen Limit/Wrong Password) to Admin immediately.</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-burgundy-950 dark:text-stone-100 mb-3 text-base font-serif">Warranty Claim Procedure</h3>
            <p className="leading-relaxed">Please attach a screenshot of the issue and your Order ID when contacting Admin via WhatsApp.</p>
          </section>

        </div>

        <div className="p-6 border-t border-burgundy-900/5 dark:border-white/5 bg-white/60 dark:bg-black/20">
          <button 
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-burgundy-950 dark:bg-stone-100 text-stone-100 dark:text-burgundy-950 font-bold hover:shadow-lg transition-all uppercase tracking-widest text-xs"
          >
            I Acknowledge
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};

export default TermsModal;