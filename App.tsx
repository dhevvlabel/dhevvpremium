import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import LiquidBackground from './components/LiquidBackground';
import ProductCard from './components/ProductCard';
import CartModal from './components/CartModal';
import Toast from './components/Toast';
import TermsModal from './components/TermsModal';
import AuthModal from './components/AuthModal';
import AnnouncementModal from './components/AnnouncementModal';
import DashboardModal from './components/DashboardModal';
import QnASection from './components/QnASection';
import AIChatWidget from './components/AIChatWidget';
import StoreClosedModal from './components/StoreClosedModal';
import { Product, CartItem, Order, Category, ToastMessage, User } from './types';
import { Sparkles, UserPlus, ShoppingBag, QrCode, Upload, MessageCircle, Gift, Box, ChevronDown, Send, Search } from 'lucide-react';

const CATEGORIES: Category[] = ['All', 'Streaming', 'Music', 'Design', 'Productivity', 'Other'];

const TUTORIAL_STEPS = [
  { num: '01', title: 'Daftar & Login', desc: 'Buat akun gratis untuk mulai berbelanja dengan aman.', icon: UserPlus },
  { num: '02', title: 'Pilih Produk', desc: 'Pilih aplikasi premium sesuai kebutuhan Anda.', icon: ShoppingBag },
  { num: '03', title: 'Pembayaran', desc: 'Pilih metode pembayaran yang di inginkan.', icon: QrCode },
  { num: '04', title: 'Terima Akun', desc: 'Admin Dhevv Label akan mengirim akun yang dibeli melalui WhatsApp.', icon: Gift },
];

import Footer from './components/Footer';

const App: React.FC = () => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  // Store Operational Hours State
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // Dynamic Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStoreStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('Store Status')
          .select('is_open')
          .eq('id', 1)
          .single();
        
        if (error) throw error;
        if (data) {
          setIsStoreOpen(data.is_open);
        }
      } catch (err) {
        console.error("Failed to fetch store status:", err);
      }
    };

    const fetchProducts = async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('sort_order', { ascending: true });
        if (error) {
          console.error("Failed to fetch products:", error);
          return;
        }
        console.log("Fetched products data:", data);
        if (data) {
          console.log("📦 RAW DATA FROM SUPABASE:", data); // DEBUG LOG
          const mappedProducts: Product[] = data.map((item: any) => {
            console.log(`🔍 Mapping ${item.app_name}: icon_url is`, item.icon_url); // DEBUG PER PRODUK
            return {
              id: item.id,
              appName: item.app_name,
              category: item.category,
              variants: item.variants,
              tags: item.tags,
              icon_url: item.icon_url || item.iconUrl || "" // Fallback kalau ada typo nama kolom
            };
          });
          setProducts(mappedProducts);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    };

    fetchStoreStatus();
    fetchProducts();

    // --- REALTIME SUBSCRIPTIONS ---
    const storeStatusSub = supabase
      .channel('public:Store Status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Store Status' },
        (payload) => {
          console.log('Realtime update: Store Status changed', payload);
          fetchStoreStatus();
        }
      )
      .subscribe();

    const productsSub = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Realtime update: Products changed', payload);
          fetchProducts(false); // Fetch without showing loading spinner
        }
      )
      .subscribe();

    const vouchersSub = supabase
      .channel('public:Voucher Dhevv Premium')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Voucher Dhevv Premium' },
        (payload) => {
          console.log('Realtime update: Vouchers changed', payload);
          // Vouchers are fetched on-demand in CartModal, but we listen here
          // to ensure the connection is active or if we add global state later.
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(storeStatusSub);
      supabase.removeChannel(productsSub);
      supabase.removeChannel(vouchersSub);
    };
  }, []);

  // User Auth State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // NEW: Direct Checkout State (Isolates "Buy Now" data from "Cart" data)
  const [directCheckoutItem, setDirectCheckoutItem] = useState<CartItem | null>(null);

  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isStoreClosedOpen, setIsStoreClosedOpen] = useState(false);
  
  // NEW: State to track if announcement is for login or register
  const [announcementType, setAnnouncementType] = useState<'login' | 'register'>('login');
  
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  
  // Accordion State
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  // Data States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [orderHistory, setOrderHistory] = useState<Order[]>(() => {
    const saved = localStorage.getItem('history');
    return saved ? JSON.parse(saved) : [];
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // --- VISITOR TRACKER (Telegram) ---
useEffect(() => {
  const trackVisitor = async () => {
    // ... isi kodenya ...
  };

  // trackVisitor(); <--- KASIH GARIS MIRING DUA ( // ) DI DEPANNYA ATAU HAPUS
}, []);

  // Effects
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  // Toast Logic
  const addToast = (message: string, type: 'success' | 'info') => {
    const id = Date.now();
    setToasts([...toasts, { id, message, type }]);
    setTimeout(() => removeToast(id), 3500);
  };

  const removeToast = (id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  };

  // Auth Logic
  const handleLogin = (newUser: User, isRegister: boolean) => {
    setUser(newUser);
    setIsAuthOpen(false);
    
    // Set announcement type logic
    setAnnouncementType(isRegister ? 'register' : 'login');
    
    setTimeout(() => setIsAnnouncementOpen(true), 300);
    addToast(isRegister ? `Welcome, ${newUser.name}!` : `Welcome back, ${newUser.name}!`, 'success');
  };

  const handleUpdateUser = async (updatedUser: User) => {
    // 1. Update active session state
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // 2. Update master database (for future logins)
    try {
      const { error } = await supabase
        .from('Users Dhevv Premium')
        .update({
          name: updatedUser.name,
          phone: updatedUser.phoneNumber,
          password: updatedUser.password
        })
        .eq('email', updatedUser.email);
        
      if (error) throw error;
    } catch (err) {
      console.error("Failed to update user in Supabase:", err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsDashboardOpen(false);
    addToast('Logged out successfully', 'info');
  };

  // --- CART LOGIC (Persistent Storage) ---
  const addToCart = (product: Product, variantIndex: number) => {
    const existingItem = cart.find(item => item.product.appName === product.appName && item.selectedVariantIndex === variantIndex);
    
    if (existingItem) {
      updateQuantity(existingItem.id, 1);
      addToast(`${product.appName} added to bag`, 'success');
    } else {
      const id = `${product.appName}-${variantIndex}-${Date.now()}`;
      const newItem: CartItem = {
        id,
        product,
        selectedVariantIndex: variantIndex,
        quantity: 1
      };
      setCart([...cart, newItem]);
      addToast(`${product.appName} added to bag`, 'success');
    }
  };

  // --- BUY NOW LOGIC (Direct Checkout, No Storage) ---
  const handleBuyNow = (product: Product, variantIndex: number) => {
    if (!isStoreOpen) {
      setIsStoreClosedOpen(true);
      return;
    }

    // Create a temporary item that exists ONLY for this transaction
    const tempItem: CartItem = {
      id: `DIRECT-${Date.now()}`,
      product,
      selectedVariantIndex: variantIndex,
      quantity: 1
    };
    
    // Set the direct item state and open modal
    setDirectCheckoutItem(tempItem);
    setIsCartOpen(true);
  };

  const openCart = () => {
    // When opening via Navbar icon, we want to view the stored Cart items
    setDirectCheckoutItem(null); 
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = (selectedIds?: string[]) => {
    if (selectedIds) {
      setCart(cart.filter(item => !selectedIds.includes(item.id)));
    } else {
      setCart([]);
    }
  };

  const saveOrder = (order: Order) => {
    setOrderHistory([order, ...orderHistory]);
    addToast('Order confirmed successfully!', 'success');
  };

  // Wishlist Logic
  const toggleWishlist = (appName: string) => {
    // PROTECTED: User must be logged in to manage wishlist
    if (!user) {
      setIsAuthOpen(true);
      addToast('Please login to manage your wishlist', 'info');
      return;
    }

    if (wishlist.includes(appName)) {
      setWishlist(wishlist.filter(id => id !== appName));
      addToast(`${appName} removed from wishlist`, 'info');
    } else {
      setWishlist([...wishlist, appName]);
      addToast(`${appName} added to wishlist`, 'success');
    }
  };

  const removeFromWishlist = (appName: string) => {
    setWishlist(wishlist.filter(id => id !== appName));
    addToast(`${appName} removed from wishlist`, 'info');
  };

  // Filter Logic
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    
    const filtered = products.filter(product => {
      // 1. Category Filter
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      
      if (!query) return matchesCategory;

      // 2. Search Filter (Title, Tags, Variant Description)
      const matchesSearch = 
        // Search in Title
        product.appName.toLowerCase().includes(query) ||
        // Search in Tags
        product.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        // Search in Variants (types or notes) - implies description
        product.variants.some(v => 
          v.type.toLowerCase().includes(query) || 
          v.note?.toLowerCase().includes(query)
        );

      return matchesCategory && matchesSearch;
    });
    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  return (
    <div className="relative min-h-screen font-sans selection:bg-gold-500/30 bg-stone-50 dark:bg-[#0f0505] transition-colors duration-500">
      <LiquidBackground />
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <Navbar 
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        isDarkMode={isDarkMode}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        openCart={openCart}
        openAuth={() => setIsAuthOpen(true)}
        openDashboard={() => setIsDashboardOpen(true)}
        user={user}
      />

      {/* NEW HERO SECTION: Clean Burgundy Mode */}
      <section className="relative pt-16 pb-12 md:pt-28 md:pb-8 overflow-hidden">
        {/* Clean Ivory/Soft Gradient Background Overlay for Hero */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-stone-50 via-stone-50/90 to-transparent dark:from-[#0f0505] dark:via-[#0f0505]/90 dark:to-transparent"></div>
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-burgundy-100/40 via-transparent to-transparent dark:from-burgundy-900/20 pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white dark:bg-white/5 border border-burgundy-900/10 dark:border-white/10 shadow-[0_2px_10px_-3px_rgba(128,0,32,0.1)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[8px] font-bold tracking-[0.2em] text-burgundy-800 dark:text-gold-400 uppercase">
              250++ ACCOUNT HAS BEEN SOLD
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-burgundy-950 dark:text-stone-100 tracking-tight mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-backwards">
            Elevate Your <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-burgundy-800 to-burgundy-500 dark:from-stone-100 dark:to-gold-300">
              Digital Lifestyle
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-lg text-stone-600 dark:text-stone-400 mb-10 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-backwards">
            Curated selection of premium subscriptions. Secure, warrantied, and instantly delivered to you.
          </p>

          {/* --- NEW HERO SEARCH BAR --- */}
          <div className="w-full max-w-xl mx-auto mb-16 relative z-20 px-4 sm:px-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-backwards">
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                   <Search className="text-burgundy-900/50 dark:text-stone-400 group-focus-within:text-gold-500 transition-colors" size={24} />
                </div>
                <input
                   type="text"
                   placeholder="Cari produk premium..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="block w-full pl-14 pr-6 py-4 rounded-2xl bg-white/60 dark:bg-burgundy-950/40 backdrop-blur-xl border border-burgundy-900/10 dark:border-white/10 text-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all shadow-xl hover:shadow-2xl text-burgundy-950 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-500"
                />
             </div>
          </div>

          {/* PURCHASE PROCESS / TUTORIAL SECTION (ACCORDION) */}
          <div className="w-full max-w-4xl mx-auto mb-6 relative z-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 fill-mode-backwards">
            {/* Trigger Bar */}
            <button 
                onClick={() => setIsTutorialOpen(!isTutorialOpen)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-burgundy-950/40 backdrop-blur-xl border border-burgundy-900/10 dark:border-white/10 shadow-lg hover:shadow-xl hover:bg-white/50 dark:hover:bg-burgundy-900/50 transition-all group"
            >
                <div className="flex items-center gap-4 text-left">
                     <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-burgundy-950 shadow-inner group-hover:scale-105 transition-transform">
                        <Box size={24} strokeWidth={1.5} />
                     </div>
                     <div>
                        <h3 className="font-bold text-burgundy-950 dark:text-stone-100 text-lg group-hover:text-burgundy-700 dark:group-hover:text-gold-300 transition-colors">Proses Pembelian</h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400">4 langkah mudah untuk membeli produk</p>
                     </div>
                </div>
                <div className={`p-2 rounded-full bg-white/50 dark:bg-white/10 transition-transform duration-500 ${isTutorialOpen ? 'rotate-180 bg-gold-100 dark:bg-gold-900/20 text-gold-700 dark:text-gold-400' : 'text-burgundy-900 dark:text-stone-300'}`}>
                    <ChevronDown size={20} />
                </div>
            </button>

            {/* Collapsible Content */}
            <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isTutorialOpen ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="rounded-3xl border border-burgundy-900/10 dark:border-white/10 bg-white/30 dark:bg-burgundy-950/30 backdrop-blur-xl shadow-2xl overflow-hidden p-6 md:p-8">
                    {/* Horizontal Scroll Container */}
                    <div className="flex flex-nowrap overflow-x-auto gap-6 md:gap-0 md:grid md:grid-cols-6 custom-scrollbar pb-4 md:pb-0 snap-x snap-mandatory">
                        {TUTORIAL_STEPS.map((step, idx) => (
                            <div key={idx} className="flex-none w-48 md:w-auto relative group text-left md:text-center px-4 md:px-2 snap-center first:pl-0">
                                {/* Connector Line (Desktop Only) */}
                                {idx !== TUTORIAL_STEPS.length - 1 && (
                                  <div className="hidden md:block absolute top-10 left-[60%] w-full h-[1px] bg-gradient-to-r from-gold-500/30 to-transparent z-0"></div>
                                )}
                                
                                <div className="relative z-10 flex flex-col md:items-center h-full">
                                  {/* Number Badge */}
                                  <span className="text-xs font-bold text-gold-600 dark:text-gold-500 mb-3 font-mono tracking-widest bg-gold-50 dark:bg-gold-900/20 px-2 py-0.5 rounded-md inline-block">
                                    {step.num}
                                  </span>
                                  
                                  {/* Icon */}
                                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-white to-stone-100 dark:from-burgundy-900 dark:to-black border border-burgundy-900/5 dark:border-white/10 flex items-center justify-center text-burgundy-700 dark:text-gold-400 shadow-md mb-4 group-hover:scale-110 group-hover:shadow-gold-500/20 transition-all duration-300">
                                      <step.icon size={24} strokeWidth={1.5} />
                                  </div>
                                  
                                  {/* Content */}
                                  <h3 className="font-bold text-sm text-burgundy-950 dark:text-stone-100 leading-tight mb-2">
                                    {step.title}
                                  </h3>
                                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                    {step.desc}
                                  </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>

        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 pb-24" id="products-grid">
        
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 relative z-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border backdrop-blur-md ${
                selectedCategory === cat
                  ? 'bg-burgundy-950 dark:bg-stone-100 text-stone-100 dark:text-burgundy-950 border-burgundy-950 dark:border-stone-100 shadow-lg shadow-burgundy-900/20'
                  : 'bg-white/30 dark:bg-black/20 text-burgundy-900/70 dark:text-stone-400 border-burgundy-900/5 dark:border-white/5 hover:bg-white/50 dark:hover:bg-white/10 hover:border-gold-500/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="text-center py-20 relative z-10">
            <p className="text-burgundy-900/50 dark:text-stone-500 text-lg">Memuat Produk...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div 
            key={selectedCategory} // Force re-render for smooth animation when category changes
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10 animate-in fade-in zoom-in-95 duration-500"
          >
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.appName}
                product={product}
                addToCart={addToCart}
                onBuyNow={handleBuyNow}
                toggleWishlist={toggleWishlist}
                isWishlisted={wishlist.includes(product.appName)}
                isStoreOpen={isStoreOpen}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 relative z-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-burgundy-100/50 dark:bg-white/5 mb-4 text-burgundy-300 dark:text-stone-600">
               <Sparkles size={32} />
            </div>
            <p className="text-burgundy-900/50 dark:text-stone-500 text-lg">Maaf, produk tidak ditemukan. Coba kata kunci lain ya!</p>
            <button 
              onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
              className="mt-4 text-burgundy-700 dark:text-gold-500 hover:underline font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      {/* Information & QnA Section */}
      <QnASection />

      {/* Dhevv AI Chat Widget */}
      <AIChatWidget products={products} />

      {/* Modals */}
      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        saveOrder={saveOrder}
        directCheckoutItem={directCheckoutItem}
        user={user} // Pass user to allow auto-fill
        onOpenAuth={() => setIsAuthOpen(true)} // Pass the callback
        onStoreClosed={() => setIsStoreClosedOpen(true)}
        isStoreOpen={isStoreOpen}
      />

      <TermsModal 
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
      />

      <AnnouncementModal 
        isOpen={isAnnouncementOpen}
        onClose={() => setIsAnnouncementOpen(false)}
        type={announcementType}
        userName={user?.name || ''}
      />

      <StoreClosedModal 
        isOpen={isStoreClosedOpen}
        onClose={() => setIsStoreClosedOpen(false)}
      />

      {user && (
        <DashboardModal 
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          user={user}
          orders={orderHistory}
          wishlist={wishlist}
          allProducts={products}
          onLogout={handleLogout}
          removeFromWishlist={removeFromWishlist}
          onBuyNow={handleBuyNow}
          onUpdateUser={handleUpdateUser}
          addToast={addToast}
          isStoreOpen={isStoreOpen}
        />
      )}

      <Footer />
    </div>
  );
};

export default App;