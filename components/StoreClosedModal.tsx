import React from 'react';
import { X, MessageCircle, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StoreClosedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StoreClosedModal: React.FC<StoreClosedModalProps> = ({ isOpen, onClose }) => {
  const handleOrderManually = () => {
    const phoneNumber = "6282116505311";
    const message = "Halo Dhevv, aku liat web lagi close order nih. Apakah masih bisa order manual kak?";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/20 dark:bg-black/40 backdrop-blur-md transition-opacity"
            onClick={onClose}
          ></motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-md bg-white/80 dark:bg-[#1a0505]/80 backdrop-blur-2xl border border-burgundy-900/10 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col items-center text-center p-8 overflow-hidden"
          >
            
            {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-[-20%] left-[-20%] w-40 h-40 bg-indigo-500/30 rounded-full blur-[60px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-40 h-40 bg-purple-500/30 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-stone-500 z-10"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 flex flex-col items-center">
          <div className="h-20 w-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner border border-indigo-200 dark:border-indigo-800/50">
            <Moon size={40} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-burgundy-950 dark:text-stone-100 mb-3 font-serif">
            Toko Sedang Tutup 🌙
          </h2>
          
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
            Sistem otomatis kami sedang offline saat ini. Tapi jangan khawatir, kami mungkin masih terjaga!
          </p>

          <button
            onClick={handleOrderManually}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#20bd5a] text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            <MessageCircle size={18} />
            Order Manual via WhatsApp
          </button>
          
          <button 
            onClick={onClose}
            className="mt-4 text-xs text-stone-500 hover:text-burgundy-900 dark:hover:text-stone-300 transition-colors font-medium uppercase tracking-wider"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};

export default StoreClosedModal;
