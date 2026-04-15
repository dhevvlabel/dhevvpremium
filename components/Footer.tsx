import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="text-center py-8 border-t border-burgundy-900/5 dark:border-white/5 mt-auto relative z-10 bg-white/30 dark:bg-black/20 backdrop-blur-md">
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-burgundy-900/40 dark:text-stone-500 font-serif italic">
          &copy; {new Date().getFullYear()} Dhevv Premium Digital. Elevating Standards.
        </p>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          <a href="/about" className="text-xs font-bold uppercase tracking-wider text-burgundy-900/60 dark:text-stone-400 hover:text-burgundy-900 dark:hover:text-gold-400 transition-colors">
            Tentang Kami
          </a>
          <a href="/terms" className="text-xs font-bold uppercase tracking-wider text-burgundy-900/60 dark:text-stone-400 hover:text-burgundy-900 dark:hover:text-gold-400 transition-colors">
            Syarat & Ketentuan
          </a>
          <a href="/privacy" className="text-xs font-bold uppercase tracking-wider text-burgundy-900/60 dark:text-stone-400 hover:text-burgundy-900 dark:hover:text-gold-400 transition-colors">
            Kebijakan Privasi
          </a>
          <a href="https://wa.me/6282116505311" target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-wider text-burgundy-900/60 dark:text-stone-400 hover:text-burgundy-900 dark:hover:text-gold-400 transition-colors">
            Hubungi Kami
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
