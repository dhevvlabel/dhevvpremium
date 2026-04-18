import React, { useEffect, useState } from 'react';
import { ShoppingCart, Moon, Sun, User } from 'lucide-react';
import { User as UserType } from '../types';
import AnimatedButton from './AnimatedButton';

interface NavbarProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
  cartCount: number;
  openCart: () => void;
  openAuth: () => void;
  openDashboard: () => void;
  user: UserType | null;
}

const Navbar: React.FC<NavbarProps> = ({ 
  toggleTheme, 
  isDarkMode, 
  cartCount, 
  openCart,
  openAuth,
  openDashboard,
  user
}) => {
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  return (
    <nav className="sticky top-4 z-40 w-full px-4 sm:px-6 lg:px-8 transition-all duration-300 pointer-events-none font-sans">
      <div className="mx-auto max-w-7xl pointer-events-auto">
        <div className="rounded-[30px] border border-white/20 bg-white/60 dark:bg-[#2a0a10]/60 backdrop-blur-2xl shadow-xl shadow-black/5 dark:shadow-black/20">
            <div className="flex h-16 items-center justify-between px-6 gap-4">
                
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center gap-3 group cursor-pointer">
                  <img 
                    src="https://user2158.na.imgto.link/public/20260210/img-8897-jpg.avif" 
                    alt="Dhevv Logo"
                    className="h-10 w-10 rounded-full shadow-md object-cover border border-white/20 dark:border-white/10 group-hover:shadow-lg transition-all duration-300 group-hover:scale-105" 
                  />
                  <span className="hidden md:block text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-burgundy-900 to-burgundy-700 dark:from-stone-100 dark:to-gold-200">
                    Dhevv<span className="font-light italic">Premium</span>
                  </span>
                </div>

                <div className="flex-1"></div>

                {/* --- Group Aksi --- */}
                <div className="flex items-center gap-2 sm:gap-3">
                  
                  {/* 1. Theme Toggle */}
                  <AnimatedButton
                    onClick={toggleTheme}
                    className="p-3 rounded-full text-burgundy-900 dark:text-stone-300 hover:bg-burgundy-100/50 dark:hover:bg-white/5 transition-all hover:text-burgundy-700 dark:hover:text-gold-300"
                    aria-label="Toggle Theme"
                  >
                    {isDarkMode ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
                  </AnimatedButton>

                  {/* 2. Cart / Keranjang */}
                  <AnimatedButton
                    onClick={openCart}
                    className={`group relative p-3 rounded-full bg-gradient-to-b from-burgundy-800 to-burgundy-950 dark:from-burgundy-900 dark:to-black text-gold-100 shadow-lg shadow-burgundy-900/20 hover:shadow-burgundy-900/40 transition-all duration-300 border border-white/10 ${isBouncing ? 'scale-110 ring-2 ring-gold-500/50' : 'hover:scale-105'}`}
                  >
                    <ShoppingCart size={20} strokeWidth={2} className={isBouncing ? 'animate-bounce' : ''} />
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-gold-600 text-[10px] font-bold text-black ring-2 ring-stone-100 dark:ring-burgundy-950 animate-pulse">
                        {cartCount}
                      </span>
                    )}
                  </AnimatedButton>

                  {/* 3. Login / Profile (Sekarang Bulat & Senada dengan Keranjang) */}
                  {user ? (
                     <AnimatedButton 
                      onClick={openDashboard}
                      className="group relative p-0.5 rounded-full bg-gradient-to-b from-burgundy-800 to-burgundy-950 dark:from-burgundy-900 dark:to-black shadow-lg shadow-burgundy-900/20 hover:shadow-burgundy-900/40 transition-all duration-300 border border-white/10 hover:scale-105"
                    >
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-xs font-bold text-burgundy-950 shadow-inner border border-white/20 overflow-hidden">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </AnimatedButton>
                  ) : (
                    <AnimatedButton 
                      onClick={openAuth}
                      className="group p-3 rounded-full bg-gradient-to-b from-burgundy-800 to-burgundy-950 dark:from-burgundy-900 dark:to-black text-gold-100 shadow-lg shadow-burgundy-900/20 hover:shadow-burgundy-900/40 transition-all duration-300 border border-white/10 hover:scale-105"
                    >
                      <User size={20} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
                    </AnimatedButton>
                  )}

                </div>
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;