import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import { formatRupiah } from '../constants';
import { X, Heart, Sparkles } from 'lucide-react';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  allProducts: Product[];
  removeFromWishlist: (appName: string) => void;
}

const WishlistModal: React.FC<WishlistModalProps> = ({ 
  isOpen, 
  onClose, 
  wishlistIds, 
  allProducts,
  removeFromWishlist
}) => {
  const wishlistProducts = allProducts.filter(p => wishlistIds.includes(p.appName));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-burgundy-950/40 dark:bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-md max-h-[80vh] bg-stone-50/90 dark:bg-[#1a0505]/95 backdrop-blur-2xl border border-burgundy-900/10 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            
            <div className="flex items-center justify-between p-6 border-b border-burgundy-900/5 dark:border-white/5">
          <h2 className="text-xl font-bold text-burgundy-950 dark:text-stone-100 flex items-center gap-2 font-serif">
            <Heart className="text-burgundy-700 dark:text-gold-500" fill="currentColor" />
            Curated Favorites
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-stone-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-10 text-stone-400 dark:text-stone-600">
              <Sparkles className="mx-auto mb-3 opacity-50" size={32} />
              <p>Your wishlist is waiting for luxury.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlistProducts.map(product => (
                <div key={product.appName} className="flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-burgundy-900/5 dark:border-white/5 transition-colors hover:border-gold-500/30">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-stone-200 to-stone-300 dark:from-burgundy-900 dark:to-black flex items-center justify-center font-bold text-burgundy-900 dark:text-gold-500 font-serif text-lg border border-white/20 dark:border-white/5">
                      {product.appName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-burgundy-950 dark:text-stone-100 text-sm">{product.appName}</h3>
                      <p className="text-xs text-stone-500">From {formatRupiah(product.variants[0].price)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromWishlist(product.appName)}
                    className="text-xs text-burgundy-800/60 hover:text-red-500 dark:text-stone-500 dark:hover:text-red-400 transition-colors uppercase tracking-wider font-bold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};

export default WishlistModal;