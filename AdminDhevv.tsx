import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Trash2, Plus, Percent, DollarSign, Tag, Hash, Check, Search, Users, Ticket, ArrowLeft, ChevronRight, Package } from 'lucide-react';
import { PRODUCTS, formatRupiah } from './constants';
import { Product } from './types';

interface Voucher {
  id: number;
  code: string;
  discount: number;
  is_percentage: boolean;
  product_target: string;
  is_active: boolean;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  password?: string;
  created_at?: string;
}

const AdminDhevv: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'vouchers' | 'users' | 'products' | null>(null);
  
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Product Manager Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const modalContainerRef = React.useRef<HTMLDivElement>(null);

  // Form states
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [productTarget, setProductTarget] = useState('');
  const [isPercentage, setIsPercentage] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product Form states
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState<string>('Streaming');
  const [productIconUrl, setProductIconUrl] = useState('');
  const [productVariants, setProductVariants] = useState<any[]>([{ type: '', duration: '', price: 0 }]);
  const [productTags, setProductTags] = useState('');
  const [productSortOrder, setProductSortOrder] = useState(0);

  useEffect(() => {
    const checkAuth = () => {
      const password = window.prompt('Masukkan Password Admin:');
      if (password === 'Admin') {
        setIsAuthenticated(true);
        fetchData();
      } else {
        window.location.href = '/';
      }
    };

    checkAuth();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [isStoreOpen, setIsStoreOpen] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vouchersRes, usersRes, storeStatusRes, productsRes] = await Promise.all([
        supabase.from('Voucher Dhevv Premium').select('*').order('id', { ascending: false }),
        supabase.from('Users Dhevv Premium').select('*').order('id', { ascending: false }),
        supabase.from('Store Status').select('is_open').eq('id', 1).single(),
        supabase.from('products').select('*')
      ]);

      if (vouchersRes.error) throw vouchersRes.error;
      if (usersRes.error) throw usersRes.error;
      
      if (storeStatusRes.error) {
        console.error('Error fetching store status:', storeStatusRes.error);
      } else if (storeStatusRes.data) {
        setIsStoreOpen(storeStatusRes.data.is_open);
      }

      if (productsRes.error) {
        console.error('Error fetching products:', productsRes.error);
      } else if (productsRes.data) {
        setProducts(productsRes.data.map((item: any) => ({
          ...item,
          appName: item.app_name,
          app_name: item.app_name
        })));
      }

      setVouchers(vouchersRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      showToast('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStoreStatus = async () => {
    const newStatus = !isStoreOpen;
    setIsStoreOpen(newStatus); // Optimistic update
    
    try {
      const { error } = await supabase
        .from('Store Status')
        .update({ is_open: newStatus })
        .eq('id', 1);

      if (error) throw error;
      showToast(newStatus ? 'Toko berhasil DIBUKA' : 'Toko berhasil DITUTUP', 'success');
    } catch (error: any) {
      console.error('Error updating store status:', error);
      setIsStoreOpen(!newStatus); // Revert on error
      showToast('Gagal mengubah status toko', 'error');
    }
  };

  const handleAddVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discount) {
      showToast('Kode dan Diskon wajib diisi', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('Voucher Dhevv Premium')
        .insert([
          {
            code: code.toUpperCase(),
            discount: Number(discount),
            product_target: productTarget || null,
            is_percentage: isPercentage,
            is_active: isActive,
          },
        ]);

      if (error) throw error;

      showToast('Voucher berhasil ditambahkan!', 'success');
      // Reset form
      setCode('');
      setDiscount('');
      setProductTarget('');
      setIsPercentage(false);
      setIsActive(true);
      // Refresh list
      fetchData();
    } catch (error: any) {
      console.error('Error adding voucher:', error);
      showToast('Gagal menambahkan voucher', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVoucher = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus voucher ini?')) return;

    try {
      const { error } = await supabase
        .from('Voucher Dhevv Premium')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('Voucher berhasil dihapus!', 'success');
      setVouchers(vouchers.filter(v => v.id !== id));
    } catch (error: any) {
      console.error('Error deleting voucher:', error);
      showToast('Gagal menghapus voucher', 'error');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus user ini?')) return;

    try {
      const { error } = await supabase
        .from('Users Dhevv Premium')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('User berhasil dihapus!', 'success');
      setUsers(users.filter(u => u.id !== id));
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showToast('Gagal menghapus user', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !productCategory) {
      showToast('Nama dan Kategori wajib diisi', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        app_name: productName,
        category: productCategory,
        icon_url: productIconUrl || null,
        variants: productVariants,
        tags: productTags ? productTags.split(',').map(t => t.trim()) : [],
        sort_order: productSortOrder
      };

      let error;
      if (editingProductId) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProductId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData]);
        error = insertError;
      }

      if (error) throw error;

      showToast(editingProductId ? 'Produk berhasil diupdate!' : 'Produk berhasil ditambahkan!', 'success');
      
      // Reset form
      setEditingProductId(null);
      setProductName('');
      setProductCategory('Streaming');
      setProductIconUrl('');
      setProductVariants([{ type: '', duration: '', price: 0 }]);
      setProductTags('');
      setProductSortOrder(0);
      
      // Refresh list
      fetchData();
    } catch (error: any) {
      console.error('Error saving product:', error);
      showToast('Gagal menyimpan produk', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id || null);
    setProductName(product.appName);
    setProductCategory(product.category);
    setProductIconUrl(product.icon_url || '');
    setProductVariants(product.variants || [{ type: '', duration: '', price: 0 }]);
    setProductTags(product.tags ? product.tags.join(', ') : '');
    setProductSortOrder(product.sort_order || 0);
    setActiveTab('products');
    
    // Auto-scroll to top of the modal container
    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('Produk berhasil dihapus!', 'success');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      showToast('Gagal menghapus produk', 'error');
    }
  };

  const handleAddVariant = () => {
    setProductVariants([...productVariants, { type: '', duration: '', price: 0 }]);
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = [...productVariants];
    newVariants.splice(index, 1);
    setProductVariants(newVariants);
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...productVariants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setProductVariants(newVariants);
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
            Admin Dhevv
          </h1>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors"
          >
            Kembali ke Web
          </button>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 ${
            toast.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <Check size={18} /> : <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white">!</div>}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        )}

        {activeTab === null ? (
          <div className="space-y-6">
            {/* Store Status Control */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900 mb-1">Store Status</h2>
                <p className="text-sm text-stone-500">Atur status buka/tutup toko.</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-bold text-sm ${isStoreOpen ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isStoreOpen ? 'BUKA' : 'TUTUP'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isStoreOpen}
                    onChange={handleToggleStoreStatus}
                  />
                  <div className="w-14 h-7 bg-red-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 border border-stone-200"></div>
                </label>
              </div>
            </div>

            {/* Main Menu Buttons */}
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => setActiveTab('products')} className="w-full bg-white border border-stone-200 shadow-sm hover:shadow-md hover:border-burgundy-500 transition-all rounded-2xl p-6 flex items-center gap-4 group text-left">
                <div className="w-14 h-14 shrink-0 rounded-full bg-burgundy-50 text-burgundy-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-stone-900">Product Manager</h3>
                  <p className="text-sm text-stone-500">Tambah, Edit, Hapus Produk</p>
                </div>
                <ChevronRight className="text-stone-400 group-hover:text-burgundy-500 transition-colors" />
              </button>

              <button onClick={() => setActiveTab('vouchers')} className="w-full bg-white border border-stone-200 shadow-sm hover:shadow-md hover:border-burgundy-500 transition-all rounded-2xl p-6 flex items-center gap-4 group text-left">
                <div className="w-14 h-14 shrink-0 rounded-full bg-burgundy-50 text-burgundy-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Ticket size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-stone-900">Voucher Manager</h3>
                  <p className="text-sm text-stone-500">Kelola kode promo & diskon</p>
                </div>
                <ChevronRight className="text-stone-400 group-hover:text-burgundy-500 transition-colors" />
              </button>

              <button onClick={() => setActiveTab('users')} className="w-full bg-white border border-stone-200 shadow-sm hover:shadow-md hover:border-burgundy-500 transition-all rounded-2xl p-6 flex items-center gap-4 group text-left">
                <div className="w-14 h-14 shrink-0 rounded-full bg-burgundy-50 text-burgundy-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-stone-900">User Manager</h3>
                  <p className="text-sm text-stone-500">Lihat data pengguna terdaftar</p>
                </div>
                <ChevronRight className="text-stone-400 group-hover:text-burgundy-500 transition-colors" />
              </button>
            </div>
          </div>
        ) : (
          <div ref={modalContainerRef} className="fixed inset-0 z-40 bg-stone-50 overflow-y-auto">
            <div className="sticky top-0 z-50 bg-white border-b border-stone-200 px-4 py-4 flex items-center gap-4 shadow-sm">
              <button 
                onClick={() => setActiveTab(null)}
                className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-700 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-bold text-stone-900 uppercase">
                {activeTab === 'vouchers' ? 'Voucher Manager' : 
                 activeTab === 'products' ? 'Product Manager' : 'User Manager'}
              </h2>
            </div>
            
            <div className="p-4 sm:p-6 max-w-4xl mx-auto">
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-stone-900">
                      <Plus size={20} className="text-burgundy-600" />
                      {editingProductId ? 'Edit Produk' : 'Tambah Produk Baru'}
                    </h2>
                    
                    <form onSubmit={handleSaveProduct} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-stone-600 font-medium block mb-1.5">Nama Produk</label>
                          <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-stone-900 focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all font-medium"
                            placeholder="Contoh: NETFLIX"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm text-stone-600 font-medium block mb-1.5">Kategori</label>
                          <select
                            value={productCategory}
                            onChange={(e) => setProductCategory(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-stone-900 focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all font-medium"
                          >
                            <option value="Streaming">Streaming</option>
                            <option value="Music">Music</option>
                            <option value="Design">Design</option>
                            <option value="Productivity">Productivity</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-stone-600 font-medium block mb-1.5">Icon URL (Opsional)</label>
                          <input
                            type="text"
                            value={productIconUrl}
                            onChange={(e) => setProductIconUrl(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-stone-900 focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all font-medium"
                            placeholder="https://example.com/icon.png"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-stone-600 font-medium block mb-1.5">Sort Order</label>
                          <input
                            type="number"
                            value={productSortOrder}
                            onChange={(e) => setProductSortOrder(Number(e.target.value))}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-stone-900 focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-sm text-stone-600 font-medium block mb-1.5">Tags (Pisahkan dengan koma - Tag pertama akan jadi Badge)</label>
                          <input
                            type="text"
                            value={productTags}
                            onChange={(e) => setProductTags(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-stone-900 focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all font-medium"
                            placeholder="Contoh: BEST SELLER, TERLARIS, NEW ITEM!!"
                          />
                        </div>
                      </div>

                      <div className="border-t border-stone-200 pt-4 mt-4">
                        <div className="flex justify-between items-center mb-4">
                          <label className="text-sm text-stone-600 font-bold block">Variants</label>
                          <button
                            type="button"
                            onClick={handleAddVariant}
                            className="text-xs bg-stone-200 hover:bg-stone-300 text-stone-800 px-3 py-1.5 rounded-lg font-bold transition-colors"
                          >
                            + Tambah Varian
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {productVariants.map((variant, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-stone-50 p-3 rounded-xl border border-stone-200">
                              <input
                                type="text"
                                value={variant.type}
                                onChange={(e) => handleVariantChange(index, 'type', e.target.value)}
                                placeholder="Tipe (Sharing 1 User)"
                                className="flex-1 w-full bg-white border border-stone-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500"
                                required
                              />
                              <input
                                type="text"
                                value={variant.duration}
                                onChange={(e) => handleVariantChange(index, 'duration', e.target.value)}
                                placeholder="Durasi (1 Bulan)"
                                className="flex-1 w-full bg-white border border-stone-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500"
                                required
                              />
                              <input
                                type="number"
                                value={variant.price}
                                onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))}
                                placeholder="Harga (15000)"
                                className="flex-1 w-full bg-white border border-stone-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500"
                                required
                              />
                              {productVariants.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariant(index)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        {editingProductId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProductId(null);
                              setProductName('');
                              setProductCategory('Streaming');
                              setProductIconUrl('');
                              setProductVariants([{ type: '', duration: '', price: 0 }]);
                              setProductTags('');
                              setProductSortOrder(0);
                            }}
                            className="flex-1 py-3.5 rounded-xl bg-stone-200 text-stone-800 font-bold uppercase tracking-wide hover:bg-stone-300 transition-all"
                          >
                            Batal
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-[2] py-3.5 rounded-xl bg-burgundy-600 text-white font-bold uppercase tracking-wide hover:bg-burgundy-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Menyimpan...' : (editingProductId ? 'Update Produk' : 'Simpan Produk')}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <h2 className="text-lg font-bold text-stone-900">Daftar Produk</h2>
                      
                      {/* Search & Filter UI */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input 
                            type="text"
                            placeholder="Cari produk..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500 transition-all w-full sm:w-64"
                          />
                        </div>
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500 transition-all"
                        >
                          <option value="All">Semua Kategori</option>
                          <option value="Streaming">Streaming</option>
                          <option value="Music">Music</option>
                          <option value="Design">Design</option>
                          <option value="Productivity">Productivity</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {products
                        .filter(p => {
                          const matchesSearch = p.appName.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
                          return matchesSearch && matchesCategory;
                        })
                        .map((product) => (
                        <div key={product.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-xl gap-4">
                          <div className="flex items-center gap-4">
                            {product.icon_url ? (
                              <img src={product.icon_url} alt={product.appName} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-burgundy-100 text-burgundy-700 flex items-center justify-center font-bold text-xl">
                                {product.appName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-stone-900 flex items-center gap-2">
                                {product.appName}
                                {product.tags && product.tags.length > 0 && (
                                  <span className="px-2 py-0.5 bg-[#2a0a10] text-white text-[10px] rounded-md">{product.tags[0]}</span>
                                )}
                              </h3>
                              <p className="text-xs text-stone-500">{product.category} • {product.variants.length} Varian</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-sm font-bold rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => product.id && handleDeleteProduct(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'vouchers' && (
                <div className="space-y-6">
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-stone-900">
                      <Plus size={20} className="text-burgundy-600" />
                      Tambah Voucher Baru
                    </h2>
                    
                    <form onSubmit={handleAddVoucher} className="space-y-4">
                      <div>
                        <label className="text-sm text-stone-600 font-medium block mb-1.5">Kode Voucher</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Hash size={18} className="text-stone-400" />
                          </div>
                          <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all uppercase font-medium"
                            placeholder="PROMO2026"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-stone-600 font-medium block mb-1.5">Nominal / Persentase</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {isPercentage ? <Percent size={18} className="text-stone-400" /> : <DollarSign size={18} className="text-stone-400" />}
                          </div>
                          <input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all font-medium"
                            placeholder={isPercentage ? "10" : "15000"}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-stone-600 font-medium block mb-1.5">Product Target (Opsional)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Tag size={18} className="text-stone-400" />
                          </div>
                          <input
                            type="text"
                            value={productTarget}
                            onChange={(e) => setProductTarget(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all font-medium"
                            placeholder="Netflix Sharing 2 User 1 Week"
                          />
                        </div>
                        <p className="text-xs text-stone-500 mt-1.5">Kosongkan jika berlaku untuk semua produk.</p>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-xl">
                        <span className="text-sm font-bold text-stone-700">Tipe Persentase (%)</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={isPercentage}
                            onChange={() => setIsPercentage(!isPercentage)}
                          />
                          <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-xl">
                        <span className="text-sm font-bold text-stone-700">Status Aktif</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={isActive}
                            onChange={() => setIsActive(!isActive)}
                          />
                          <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-xl bg-burgundy-600 text-white font-bold uppercase tracking-wide hover:bg-burgundy-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                      >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Voucher'}
                      </button>
                    </form>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-stone-200">
                      <h2 className="text-lg font-bold text-stone-900">Daftar Voucher</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                      {loading ? (
                        <div className="flex items-center justify-center h-40">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-burgundy-600"></div>
                        </div>
                      ) : vouchers.length === 0 ? (
                        <div className="text-center py-12 text-stone-500">
                          Belum ada voucher yang ditambahkan.
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 text-sm">
                              <th className="py-3 px-4 font-bold">Kode</th>
                              <th className="py-3 px-4 font-bold">Diskon</th>
                              <th className="py-3 px-4 font-bold">Target Produk</th>
                              <th className="py-3 px-4 font-bold">Status</th>
                              <th className="py-3 px-4 font-bold text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {vouchers.map((v) => (
                              <tr key={v.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                                <td className="py-4 px-4 font-mono font-bold text-stone-900">{v.code}</td>
                                <td className="py-4 px-4">
                                  {v.is_percentage ? (
                                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-bold border border-blue-200">{v.discount}%</span>
                                  ) : (
                                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold border border-emerald-200">Rp {v.discount.toLocaleString('id-ID')}</span>
                                  )}
                                </td>
                                <td className="py-4 px-4 text-stone-600">
                                  {v.product_target ? (
                                    <span className="truncate max-w-[150px] inline-block font-medium" title={v.product_target}>{v.product_target}</span>
                                  ) : (
                                    <span className="text-stone-400 italic">Semua Produk</span>
                                  )}
                                </td>
                                <td className="py-4 px-4">
                                  {v.is_active ? (
                                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Aktif</span>
                                  ) : (
                                    <span className="flex items-center gap-1.5 text-stone-500 font-bold text-xs"><div className="w-2 h-2 rounded-full bg-stone-400"></div>Nonaktif</span>
                                  )}
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <button 
                                    onClick={() => handleDeleteVoucher(v.id)}
                                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="Hapus Voucher"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'users' && (
                <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-stone-900">User Terdaftar</h2>
                    <div className="relative w-full sm:w-72">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-stone-400" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-stone-900 placeholder-stone-500 focus:outline-none focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 transition-all font-medium"
                        placeholder="Cari email atau nama..."
                      />
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    {loading ? (
                      <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-burgundy-600"></div>
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="text-center py-12 text-stone-500">
                        {searchQuery ? 'Tidak ada user yang cocok dengan pencarian.' : 'Belum ada user yang terdaftar.'}
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 text-sm">
                            <th className="py-3 px-4 font-bold">Nama</th>
                            <th className="py-3 px-4 font-bold">Email</th>
                            <th className="py-3 px-4 font-bold">No. HP</th>
                            <th className="py-3 px-4 font-bold">Password</th>
                            <th className="py-3 px-4 font-bold text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {filteredUsers.map((u) => (
                            <tr key={u.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                              <td className="py-4 px-4 font-bold text-stone-900">{u.name}</td>
                              <td className="py-4 px-4 text-stone-600 font-medium">{u.email}</td>
                              <td className="py-4 px-4 text-stone-600 font-medium">{u.phone}</td>
                              <td className="py-4 px-4 font-mono text-stone-500 text-xs">{u.password}</td>
                              <td className="py-4 px-4 text-right">
                                <button 
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Hapus User"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDhevv;
