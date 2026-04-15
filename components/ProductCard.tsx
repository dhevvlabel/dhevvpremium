import React, { useState } from 'react';
import { formatRupiah } from '../constants';
import { Product } from '../types';
import { Heart, ShoppingCart, Zap, Moon } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  addToCart: (product: Product, variantIndex: number) => void;
  onBuyNow: (product: Product, variantIndex: number) => void;
  toggleWishlist: (appName: string) => void;
  isWishlisted: boolean;
  isStoreOpen: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  addToCart, 
  onBuyNow,
  toggleWishlist, 
  isWishlisted,
  isStoreOpen
}) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [imageError, setImageError] = useState(false);

  // DEBUG LOG
  if (product.icon_url) {
    console.log(`🖼️ ProductCard [${product.appName}]: Rendering image from`, product.icon_url);
  }
  
  const currentVariant = product.variants?.[selectedVariantIdx] || product.variants?.[0];

  if (!currentVariant) {
    return null;
  }

  const handleAddToCart = () => {
    addToCart(product, selectedVariantIdx);
  };

  const handleBuyNow = () => {
    onBuyNow(product, selectedVariantIdx);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-burgundy-900/10 dark:border-white/5 bg-white/30 dark:bg-burgundy-950/30 backdrop-blur-md shadow-lg transition-all duration-500 hover:shadow-2xl hover:border-gold-500/30 hover:-translate-y-1">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold-500/20 transition-all duration-500"></div>

      {/* Header */}
      <div className="relative p-6 pb-4 z-10">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {product.icon_url && !imageError ? (
              <img 
                src={product.icon_url} 
                alt={product.appName} 
                className="h-14 w-14 rounded-2xl object-cover border border-white/20 dark:border-white/5 shadow-inner" 
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 dark:from-burgundy-900 dark:to-black border border-white/20 dark:border-white/5 flex items-center justify-center text-burgundy-900 dark:text-gold-400 font-serif font-bold text-2xl shadow-inner">
                {product.appName.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-burgundy-950 dark:text-stone-100 leading-tight group-hover:text-burgundy-700 dark:group-hover:text-gold-300 transition-colors">
                {product.appName}
              </h3>
              <p className="text-xs text-burgundy-800/60 dark:text-stone-400 font-medium tracking-wide uppercase">Premium Access</p>
            </div>
          </div>
          <button 
            onClick={() => toggleWishlist(product.appName)}
            className={`rounded-full p-2.5 transition-all duration-300 ${
              isWishlisted 
                ? 'bg-burgundy-50 dark:bg-burgundy-900/50 text-burgundy-600 dark:text-burgundy-400' 
                : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 hover:text-burgundy-600 dark:hover:text-gold-400'
            }`}
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        </div>
        
        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {product.tags && product.tags.length > 0 && (
             <span className="px-2.5 py-1 rounded-md bg-[#2a0a10] text-white text-[10px] font-bold tracking-wider border border-[#2a0a10]">
               {product.tags[0]}
             </span>
          )}
          {product.tags?.slice(1).map(tag => (
             <span key={tag} className="px-2.5 py-1 rounded-md bg-white text-black text-[10px] font-bold tracking-wider border border-stone-200 dark:border-white/10">
               {tag}
             </span>
          ))}
        </div>
      </div>

      {/* Variant Selection */}
      <div className="flex-1 px-6 py-2 relative z-10">
        <label className="text-[10px] font-bold text-burgundy-900/50 dark:text-stone-400 mb-3 block uppercase tracking-widest">
          Select Package
        </label>
        
        <div className="custom-scrollbar max-h-[140px] overflow-y-auto pr-1 space-y-2 mb-2">
          {product.variants.map((variant, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedVariantIdx(idx)}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-300 relative overflow-hidden group/item ${
                selectedVariantIdx === idx
                  ? 'border-gold-500/50 bg-gold-50/50 dark:bg-gold-500/10 dark:border-gold-400'
                  : 'border-burgundy-900/5 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <p className={`text-xs font-semibold ${selectedVariantIdx === idx ? 'text-burgundy-900 dark:text-white' : 'text-stone-600 dark:text-stone-200'}`}>
                    {variant.type}
                  </p>
                  <p className="text-[10px] text-stone-400 dark:text-stone-400">
                    {variant.duration}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${selectedVariantIdx === idx ? 'text-burgundy-900 dark:text-gold-400' : 'text-stone-800 dark:text-stone-200'}`}>
                    {formatRupiah(variant.price)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {currentVariant.note && (
          <div className="mb-4 p-2.5 rounded-lg bg-stone-100/50 dark:bg-white/5 border border-stone-200 dark:border-white/5 text-[10px] text-stone-600 dark:text-stone-400 italic">
            <span className="font-semibold text-burgundy-800 dark:text-gold-500">Note:</span> {currentVariant.note}
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-6 pt-2 mt-auto relative z-10">
        <div className="flex items-end justify-between mb-4">
           <div>
             <span className="text-[10px] font-bold text-burgundy-900/40 dark:text-stone-500 uppercase tracking-widest">Price</span>
             <p className="text-xl font-bold text-burgundy-950 dark:text-stone-100 font-sans">
               {formatRupiah(currentVariant.price)}
             </p>
           </div>
        </div>

        <div className="flex gap-3">
          {/* Add to Cart - Outline Style */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-3 rounded-xl border border-burgundy-900/30 dark:border-white/20 text-burgundy-900 dark:text-stone-200 font-bold text-xs uppercase tracking-wide hover:bg-burgundy-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2 group/add"
            title="Add to Cart"
          >
            <ShoppingCart size={18} className="group-hover/add:scale-110 transition-transform" />
            <span className="hidden sm:inline">Add</span>
          </button>

          {/* Buy Now - Solid Deep Burgundy */}
          <button
            onClick={handleBuyNow}
            className={`flex-[2] py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 group/btn relative overflow-hidden ${
              isStoreOpen 
                ? 'bg-burgundy-950 dark:bg-gradient-to-r dark:from-burgundy-900 dark:to-burgundy-800 text-white dark:text-gold-100 shadow-burgundy-900/20 hover:shadow-burgundy-900/40 hover:-translate-y-0.5' 
                : 'bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 shadow-none hover:bg-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              {isStoreOpen ? (
                <>
                  <Zap size={16} fill="currentColor" className="text-gold-400 animate-pulse" />
                  Buy Now
                </>
              ) : (
                <>
                  <Moon size={16} fill="currentColor" className="text-stone-400" />
                  Closed
                </>
              )}
            </span>
            {/* Shimmer Effect */}
            {isStoreOpen && (
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out"></div>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;