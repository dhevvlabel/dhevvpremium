import React, { useState, useEffect } from 'react';
import { User as UserType, Order, Product } from '../types';
import { X, User, Package, Heart, LogOut, Sparkles, ShoppingBag, FileCheck, Hourglass, Settings, Save, Lock, Phone, Zap, Moon } from 'lucide-react';
import { formatRupiah } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  orders: Order[];
  wishlist: string[];
  allProducts: Product[];
  onLogout: () => void;
  removeFromWishlist: (appName: string) => void;
  onBuyNow: (product: Product, variantIndex: number) => void;
  onUpdateUser: (user: UserType) => void;
  addToast: (message: string, type: 'success' | 'info') => void;
  isStoreOpen: boolean;
}

type Tab = 'overview' | 'orders' | 'wishlist' | 'settings';

const DashboardModal: React.FC<DashboardModalProps> = ({ 
  isOpen, 
  onClose, 
  user,
  orders,
  wishlist,
  allProducts,
  onLogout,
  removeFromWishlist,
  onBuyNow,
  onUpdateUser,
  addToast,
  isStoreOpen
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // Settings State
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phoneNumber || '');
  const [newPassword, setNewPassword] = useState('');
  
  // Sync state when user prop changes
  useEffect(() => {
    if (user) {
        setEditName(user.name);
        setEditPhone(user.phoneNumber || '');
    }
  }, [user]);

  const wishlistProducts = allProducts.filter(p => wishlist.includes(p.appName));

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserType = {
        ...user,
        name: editName,
        phoneNumber: editPhone,
        ...(newPassword ? { password: newPassword } : {})
    };
    onUpdateUser(updatedUser);
    addToast('Profile updated successfully!', 'success');
    setNewPassword(''); // clear password field for security
  };

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/5 dark:bg-black/20 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-5xl h-[85vh] bg-white/40 dark:bg-black/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[40px] shadow-2xl flex overflow-hidden"
          >
            
            {/* Sidebar */}
        <div className="w-20 md:w-64 bg-white/30 dark:bg-black/40 border-r border-white/10 flex flex-col backdrop-blur-md">
          <div className="p-6 flex items-center gap-3 border-b border-white/10">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-burgundy-950 font-bold shadow-lg shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block overflow-hidden">
              <p className="font-bold text-burgundy-950 dark:text-stone-100 truncate">{user.name}</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Premium Member</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: 'overview', icon: <User size={20} />, label: 'Overview' },
              { id: 'orders', icon: <Package size={20} />, label: 'My Orders' },
              { id: 'wishlist', icon: <Heart size={20} />, label: 'Wishlist' },
              { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-burgundy-900 dark:bg-stone-100 text-white dark:text-burgundy-950 shadow-lg scale-105' : 'text-stone-600 dark:text-stone-400 hover:bg-white/20 dark:hover:bg-white/5'}`}
              >
                {tab.icon}
                <span className="hidden md:block font-medium text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button 
              onClick={() => { onLogout(); onClose(); }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={20} />
              <span className="hidden md:block font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
           {/* Background Decoration inside content area for aesthetic */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Content Header */}
          <div className="h-16 flex items-center justify-between px-8 border-b border-white/10 relative z-10">
            <h2 className="text-xl font-bold font-serif text-burgundy-950 dark:text-stone-100 capitalize tracking-tight">
              {activeTab}
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-stone-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Scrolling Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stat Card 1 */}
                  <div className="p-6 rounded-[30px] bg-white/40 dark:bg-white/5 border border-white/20 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gold-100 dark:bg-gold-500/20 rounded-full text-gold-600 dark:text-gold-400"><ShoppingBag size={18} /></div>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-widest">Total Orders</p>
                    </div>
                    <p className="text-3xl font-black text-burgundy-900 dark:text-stone-100">{orders.length}</p>
                  </div>
                   {/* Stat Card 2 */}
                  <div className="p-6 rounded-[30px] bg-white/40 dark:bg-white/5 border border-white/20 shadow-sm backdrop-blur-sm">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400"><Sparkles size={18} /></div>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-widest">Total Spent</p>
                     </div>
                    <p className="text-3xl font-black text-burgundy-900 dark:text-stone-100">{formatRupiah(totalSpent)}</p>
                  </div>
                   {/* Stat Card 3 */}
                  <div className="p-6 rounded-[30px] bg-white/40 dark:bg-white/5 border border-white/20 shadow-sm backdrop-blur-sm">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-burgundy-100 dark:bg-burgundy-500/20 rounded-full text-burgundy-600 dark:text-burgundy-400"><Heart size={18} /></div>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-widest">Wishlist</p>
                     </div>
                    <p className="text-3xl font-black text-burgundy-900 dark:text-stone-100">{wishlist.length}</p>
                  </div>
                </div>
                
                <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-[35px] border border-white/20 p-8 shadow-sm">
                   <h3 className="font-bold text-lg text-burgundy-950 dark:text-stone-100 mb-4 font-serif">Member Status</h3>
                   <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-gradient-to-br from-gold-300 to-gold-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gold-500/30">
                            <Sparkles size={32} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-burgundy-900 dark:text-gold-400">Gold Tier Member</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Member since {user.memberSince}</p>
                        </div>
                   </div>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {orders.length === 0 ? (
                         <div className="text-center py-20 text-stone-400">
                            <Package size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No orders yet.</p>
                         </div>
                    ) : (
                        orders.map(order => {
                            let displayStatus = order.status;
                            if (displayStatus === 'Processing') {
                                if (order.timestamp) {
                                    const oneHour = 60 * 60 * 1000;
                                    if (Date.now() - order.timestamp > oneHour) {
                                        displayStatus = 'Completed';
                                    }
                                } else {
                                    const today = new Date().toLocaleDateString('id-ID');
                                    if (order.date !== today) {
                                        displayStatus = 'Completed';
                                    }
                                }
                            }
                            
                            return (
                            <div key={order.id} className="p-5 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/20 hover:border-gold-500/30 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-mono text-[10px] text-stone-500 uppercase tracking-widest">#{order.id}</p>
                                        <p className="text-xs font-bold text-stone-400">{order.date}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                        displayStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                        displayStatus === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {displayStatus === 'Completed' ? <FileCheck size={12}/> : <Hourglass size={12}/>}
                                        {displayStatus}
                                    </div>
                                </div>
                                <div className="space-y-2 mb-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-burgundy-900 dark:text-stone-200">{item.product.appName} <span className="text-xs opacity-60">({item.product.variants[item.selectedVariantIndex].type})</span></span>
                                            <span className="font-bold text-stone-600 dark:text-stone-400">{formatRupiah(item.product.variants[item.selectedVariantIndex].price)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-3 border-t border-burgundy-900/5 dark:border-white/10 flex justify-between items-center">
                                    <span className="text-xs font-bold text-stone-500">Total</span>
                                    <span className="text-lg font-bold text-burgundy-950 dark:text-gold-400">{formatRupiah(order.total)}</span>
                                </div>
                            </div>
                        )})
                    )}
                </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {wishlistProducts.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-stone-400">
                             <Heart size={48} className="mx-auto mb-4 opacity-50" />
                             <p>Your wishlist is empty.</p>
                        </div>
                    ) : (
                        wishlistProducts.map(product => (
                            <div key={product.appName} className="p-5 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/20 flex flex-col justify-between group hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {product.icon_url ? (
                                            <img 
                                                src={product.icon_url} 
                                                alt={product.appName} 
                                                className="h-12 w-12 rounded-xl object-cover border border-white/20 dark:border-white/5"
                                                referrerPolicy="no-referrer"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div 
                                            className="h-12 w-12 rounded-xl bg-stone-200 dark:bg-black/40 flex items-center justify-center font-bold text-xl text-burgundy-900 dark:text-gold-500 font-serif"
                                            style={{ display: product.icon_url ? 'none' : 'flex' }}
                                        >
                                            {product.appName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-burgundy-950 dark:text-stone-100">{product.appName}</h4>
                                            <p className="text-xs text-stone-500 dark:text-stone-400">Start from {formatRupiah(product.variants[0].price)}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFromWishlist(product.appName)} className="text-stone-400 hover:text-red-500 transition-colors">
                                        <Heart size={20} fill="currentColor" className="text-red-500" />
                                    </button>
                                </div>
                                <button 
                                    onClick={() => onBuyNow(product, 0)}
                                    className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                        isStoreOpen
                                            ? 'bg-burgundy-950 dark:bg-stone-100 text-stone-100 dark:text-burgundy-950 hover:shadow-lg'
                                            : 'bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-300 dark:hover:bg-stone-700'
                                    }`}
                                >
                                    {isStoreOpen ? (
                                        <>
                                            <Zap size={14} className="text-gold-400 dark:text-burgundy-900 animate-pulse" fill="currentColor" />
                                            Buy Now
                                        </>
                                    ) : (
                                        <>
                                            <Moon size={14} className="text-stone-400" fill="currentColor" />
                                            Closed
                                        </>
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-stone-400" size={18} />
                            <input 
                                type="text" 
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/20 focus:ring-2 focus:ring-gold-500/50 outline-none dark:text-stone-100"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase ml-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-3.5 text-stone-400" size={18} />
                            <input 
                                type="text" 
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/20 focus:ring-2 focus:ring-gold-500/50 outline-none dark:text-stone-100"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase ml-1">New Password (Optional)</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-stone-400" size={18} />
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Leave blank to keep current"
                                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/20 focus:ring-2 focus:ring-gold-500/50 outline-none dark:text-stone-100"
                            />
                        </div>
                    </div>
                    <button 
                        type="submit"
                        className="w-full py-3.5 rounded-2xl bg-gold-500 text-burgundy-950 font-bold uppercase tracking-widest hover:bg-gold-400 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Save Changes
                    </button>
                </form>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};

export default DashboardModal;