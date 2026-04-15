import React from 'react';

const LiquidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden pointer-events-none">
      {/* Base Gradient - Luxurious Dark */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200 dark:from-[#1a0505] dark:via-[#0f0505] dark:to-[#050505] transition-colors duration-500"></div>
      
      {/* Animated Blobs - Deep Burgundy & Gold */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-burgundy-800/20 dark:bg-burgundy-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-60 animate-blob"></div>
      
      <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-gold-600/20 dark:bg-gold-700/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-50 animate-blob animation-delay-2000"></div>
      
      <div className="absolute bottom-[-10%] left-[20%] w-[45rem] h-[45rem] bg-burgundy-950/30 dark:bg-burgundy-700/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-60 animate-blob animation-delay-4000"></div>
      
      <div className="absolute bottom-[30%] right-[30%] w-[25rem] h-[25rem] bg-stone-400/20 dark:bg-gray-800/40 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[60px] opacity-40 animate-blob animation-delay-3000"></div>
    </div>
  );
};

export default LiquidBackground;