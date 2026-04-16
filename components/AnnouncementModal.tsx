import React from 'react';
import { X, Sparkles, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'register';
  userName: string;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ isOpen, onClose, type, userName }) => {
  const isRegister = type === 'register';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          ></motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-lg bg-white dark:bg-[#1a0505] rounded-3xl shadow-2xl border border-gold-500/30 overflow-hidden"
          >
            {/* Confetti / Decorative BG */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-gold-500 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-burgundy-500 rounded-full blur-[80px]"></div>
        </div>

        <div className="relative p-8 text-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-white/10 text-stone-400 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-gold-300 to-gold-600 rounded-2xl rotate-3 flex items-center justify-center mb-6 shadow-xl shadow-gold-500/30">
            {isRegister ? (
              <Sparkles size={40} className="text-white" />
            ) : (
              <Rocket size={40} className="text-white" />
            )}
          </div>

          <h2 className="text-2xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-burgundy-900 to-burgundy-600 dark:from-stone-100 dark:to-gold-300 mb-4">
            {isRegister ? 'Halo Premium Member!' : 'Welcome Back!'}
          </h2>

          <div className="text-stone-600 dark:text-stone-300 space-y-3 leading-relaxed text-sm sm:text-base">
            {isRegister ? (
              <>
                <p>
                  Selamat datang di toko aplikasi kesayangan kamu. Akun kamu sudah <span className="font-bold text-emerald-600 dark:text-emerald-400">aktif!</span>
                </p>
                <p>
                  Sekarang kamu bisa pantau pesanan dan simpan wishlist aplikasi impianmu dengan lebih mudah.
                </p>
                <p className="font-medium text-burgundy-800 dark:text-gold-400 pt-2">
                  Selamat berbelanja produk premium terbaik, Dhevv siap melayanimu!
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-burgundy-950 dark:text-stone-100">
                  Halo, <span className="font-bold text-gold-600 dark:text-gold-400">{userName}</span>! ✨
                </p>
                <p>
                  Senang melihatmu lagi. Mau langganan apa hari ini?
                </p>
                <p className="font-medium text-burgundy-800 dark:text-gold-400 pt-2">
                  Dhevv siap melayanimu! 🚀
                </p>
              </>
            )}
          </div>

          <button 
            onClick={onClose}
            className="mt-8 px-8 py-3 rounded-full bg-gradient-to-r from-burgundy-900 to-black text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            {isRegister ? 'Mulai Belanja' : 'Lanjut Belanja'}
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};

export default AnnouncementModal;