import React, { useState, useEffect, useRef } from 'react';
import { CartItem, Order, User, Voucher } from '../types';
import { formatRupiah } from '../constants';
import { X, MessageCircle, ShieldCheck, User as UserIcon, Receipt, Clock, Hash, Upload, Image as ImageIcon, Trash2, ArrowLeft, CheckSquare, Square, ShoppingBag, Minus, Plus, AlertCircle, Timer, Phone, Send, CheckCircle, Sparkles, Lock, Mail, Moon, Tag, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from './AnimatedButton';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: (selectedIds?: string[]) => void;
  saveOrder: (order: Order) => void;
  directCheckoutItem?: CartItem | null;
  user: User | null;
  onOpenAuth: () => void;
  onStoreClosed: () => void;
  isStoreOpen: boolean;
}

type Step = 'cart' | 'invoice' | 'payment' | 'success';

const CartModal: React.FC<CartModalProps> = ({ 
  isOpen, 
  onClose, 
  cart, 
  updateQuantity,
  removeFromCart,
  clearCart,
  saveOrder,
  directCheckoutItem,
  user,
  onOpenAuth,
  onStoreClosed,
  isStoreOpen
}) => {
  const [step, setStep] = useState<Step>('cart');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60);
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage('Nomor berhasil disalin');
  };

  useEffect(() => {
    if (isOpen) {
      if (directCheckoutItem) {
        setStep('invoice');
      } else {
        setStep('cart');
        setSelectedIds(new Set());
      }
      
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
      setInvoiceNumber(`DP/${dateStr}/${randomStr}`);
      
      if (user) {
        setCustomerName(user.name);
        setCustomerPhone(user.phoneNumber || '');
      } else {
        setCustomerName('');
        setCustomerPhone('');
      }
      
      setError('');
      setIsSending(false);
      setTimeLeft(5 * 60);
      setPromoCode('');
      setAppliedVoucher(null);
      setVoucherError('');
      setIsTermsAccepted(false);
      setSelectedPaymentMethod(null);
      setPaymentProof(null);
      setIsPaymentConfirmed(false);
      setOpenDropdown(null);
    }
  }, [isOpen, directCheckoutItem, user]);

  useEffect(() => {
    if (!isOpen || step !== 'invoice') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, step]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === cart.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cart.map(item => item.id)));
    }
  };

  const itemsToCheckout = directCheckoutItem 
    ? [directCheckoutItem] 
    : cart.filter(item => selectedIds.has(item.id));

  const subtotal = itemsToCheckout.reduce((acc, item) => acc + (item.product.variants[item.selectedVariantIndex].price * item.quantity), 0);
  
  let discount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === 'fixed') {
      discount = appliedVoucher.value;
    } else if (appliedVoucher.type === 'percentage') {
      discount = (subtotal * appliedVoucher.value) / 100;
    }
  }

  const total = Math.max(0, subtotal - discount);
  
  const currentDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const handleApplyVoucher = async () => {
    setVoucherError('');
    setAppliedVoucher(null);

    if (!promoCode.trim()) {
      setVoucherError('Masukkan kode promo.');
      return;
    }

    setIsApplyingVoucher(true);
    try {
      // Use ilike for case-insensitive exact match
      const { data, error } = await supabase
        .from('Voucher Dhevv Premium')
        .select('*')
        .ilike('code', promoCode.trim())
        .single();

      // Create Combined Product Strings for validation
      const combinedStrings = itemsToCheckout.map(item => {
        const variant = item.product.variants[item.selectedVariantIndex];
        return `${item.product.appName} ${variant.type} ${variant.duration}`;
      });
      
      // Real-time Debugging
      console.log("Combined Product Strings in Cart:", combinedStrings);
      console.log("Supabase Voucher Data:", data);

      if (error || !data || data.is_active === false) {
        setVoucherError('Voucher tidak valid');
        return;
      }

      if (data.product_target && data.product_target.trim() !== '') {
        const target = data.product_target.trim();
        const hasApplicableProduct = combinedStrings.some(str => str === target);
        if (!hasApplicableProduct) {
          setVoucherError(`Voucher ini hanya berlaku untuk ${target}`);
          return;
        }
      }

      const voucher: Voucher = {
        code: data.code,
        type: data.is_percentage ? 'percentage' : 'fixed',
        value: data.discount || data.value || 0,
        applicableProduct: data.product_target || 'all',
        isActive: data.is_active
      };

      setAppliedVoucher(voucher);
    } catch (err) {
      console.error('Error applying voucher:', err);
      setVoucherError('Terjadi kesalahan saat mengecek voucher.');
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleConfirmOrder = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      setError('Silakan Login/Daftar terlebih dahulu untuk melakukan pemesanan.');
      setTimeout(() => { onOpenAuth(); }, 1500);
      return;
    }
    if (itemsToCheckout.length === 0) return;
    if (!customerName.trim()) {
      setError('Nama wajib diisi.');
      return;
    }
    if (!paymentProof) {
      setError('Bukti pembayaran wajib diupload.');
      return;
    }
    if (!isPaymentConfirmed) {
      setError('Harap centang konfirmasi pembayaran.');
      return;
    }

    setIsSending(true);
    
    try {
      // 1. Save to Supabase
      const newOrder: Order = {
        id: invoiceNumber,
        date: new Date().toLocaleDateString('id-ID'),
        timestamp: Date.now(),
        items: [...itemsToCheckout],
        total: total,
        status: 'Processing',
        paymentProof: 'Manual Payment'
      };
      
      await supabase.from('orders').insert([{
        invoice_number: invoiceNumber,
        customer_name: customerName,
        email: user.email,
        total_amount: total,
        status: 'Processing',
        items: itemsToCheckout.map(i => ({
          product: i.product.appName,
          variant: i.product.variants[i.selectedVariantIndex].type,
          duration: i.product.variants[i.selectedVariantIndex].duration,
          price: i.product.variants[i.selectedVariantIndex].price,
          quantity: i.quantity
        })),
        voucher_code: appliedVoucher ? appliedVoucher.code : null,
        discount_amount: discount,
        created_at: new Date().toISOString()
      }]);

      // 2. Send Email via Resend API
      const formattedProducts = itemsToCheckout.map(i => {
        const variant = i.product.variants[i.selectedVariantIndex];
        return {
          name: `${i.product.appName} - ${variant.type} (${variant.duration}) x${i.quantity}`,
          price: formatRupiah(variant.price * i.quantity)
        };
      });

      // 2. Send Email Receipt (Via Vercel Serverless Function)
      const sendEmailReceipt = async () => {
        try {
          const response = await fetch('/api/send-receipt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: invoiceNumber,
              email: user.email,
              customerName: customerName,
              phoneNumber: customerPhone || '-',
              accountDetails: "Akan dikirimkan oleh admin melalui WhatsApp",
              products: formattedProducts,
              voucher: appliedVoucher ? {
                code: appliedVoucher.code,
                discount: formatRupiah(discount)
              } : null,
              total: formatRupiah(total)
            })
          });
          
          const result = await response.json();
          if (!response.ok) {
            console.error('Email receipt failed:', result);
          } else {
            console.log('Email receipt sent successfully:', result.data);
          }
        } catch (error) {
          console.error('Error sending email receipt:', error);
        }
      };

      await sendEmailReceipt();

      // 3. Send Telegram Notification
      const sendToTelegram = async () => {
        try {
          const productDetails = itemsToCheckout.map(i => 
            `• ${i.product.appName} (${i.product.variants[i.selectedVariantIndex].type} - ${i.product.variants[i.selectedVariantIndex].duration}) x${i.quantity}`
          ).join('\n');

          const text = `*PESANAN BARU MASUK!*
----------------------------------
*Nama:* ${customerName}
*Email:* ${user.email}
*WhatsApp:* ${customerPhone || '-'}
----------------------------------
*Produk:*
${productDetails}
*Metode Pembayaran:* ${selectedPaymentMethod || '-'}
*Voucher:* ${appliedVoucher ? appliedVoucher.code : 'Tidak Ada'}
*Total Bayar:* ${formatRupiah(total)}
----------------------------------`;

          const botToken = import.meta.env?.VITE_TELEGRAM_BOT_TOKEN;
          const chatId = String(import.meta.env?.VITE_TELEGRAM_CHAT_ID || '');

          console.log('Telegram Validation:', {
            hasBotToken: !!botToken,
            hasChatId: !!chatId,
            chatIdValue: chatId
          });

          if (!botToken || !chatId) {
            const msg = `Konfigurasi Telegram tidak lengkap! Token: ${!!botToken}, ChatID: ${!!chatId}`;
            console.error(msg);
            alert(msg);
            return;
          }

          if (paymentProof) {
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('photo', paymentProof);
            formData.append('caption', text);
            formData.append('parse_mode', 'Markdown');

            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
              method: 'POST',
              body: formData
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              const errorMsg = `Telegram sendPhoto Error: ${JSON.stringify(errorData)}`;
              console.error(errorMsg);
              alert(errorMsg);
            }
          } else {
            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
              })
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              const errorMsg = `Telegram sendMessage Error: ${JSON.stringify(errorData)}`;
              console.error(errorMsg);
              alert(errorMsg);
            }
          }
        } catch (err: any) {
          const errorMsg = `Failed to send Telegram notification: ${err.message}`;
          console.error(errorMsg);
          alert(errorMsg);
        }
      };

      await sendToTelegram();

      saveOrder(newOrder);
      if (!directCheckoutItem) {
        const idsToRemove = Array.from(selectedIds);
        clearCart(idsToRemove);
      }
      setStep('success');
      setIsSending(false);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || 'Terjadi kesalahan saat memproses pesanan.');
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
          {/* Overlay Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/10 dark:bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          ></motion.div>

          {step === 'success' ? (
            <motion.div 
              key="success-step"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="relative w-full max-w-sm bg-white dark:bg-[#1a0505] rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center overflow-hidden"
            >
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-[-20%] left-[-20%] w-40 h-40 bg-gold-500/40 rounded-full blur-[60px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-40 h-40 bg-burgundy-500/40 rounded-full blur-[60px] animate-pulse"></div>
            </div>
            <div className="relative z-10">
                <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle size={40} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-burgundy-950 dark:text-stone-100 mb-2 font-serif">Pesanan Berhasil!</h2>
                <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">Terima kasih <b>{customerName}</b>. <br/>Bukti pembayaran telah kami terima. Admin akan segera memproses pesananmu.</p>
                <div className="bg-stone-50 dark:bg-white/5 rounded-xl p-4 mb-6 border border-burgundy-900/5 dark:border-white/5">
                    <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Order ID</p>
                    <p className="font-mono font-bold text-burgundy-900 dark:text-gold-400 text-lg">{invoiceNumber}</p>
                </div>
                {user?.email && (
                  <div className="flex items-center gap-2 justify-center text-xs text-emerald-600 dark:text-emerald-400 mb-6 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30 text-left">
                    <Mail size={16} className="shrink-0" />
                    <span>Struk pembelian telah dikirim ke email <b>{user.email}</b> (Periksa folder spam!)</span>
                  </div>
                )}
                <AnimatedButton onClick={onClose} className="w-full py-3.5 rounded-xl bg-burgundy-950 dark:bg-stone-100 text-stone-100 dark:text-burgundy-950 font-bold uppercase tracking-wide hover:shadow-lg hover:-translate-y-0.5 transition-all">Tutup</AnimatedButton>
            </div>
          </motion.div>
          ) : step === 'cart' ? (
          <motion.div 
            key="cart-step"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-lg max-h-[90vh] bg-stone-50/95 dark:bg-[#1a0505]/95 backdrop-blur-2xl border border-burgundy-900/30 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
          <div className="flex items-center justify-between p-5 border-b border-burgundy-900/5 dark:border-white/5 bg-white/40 dark:bg-white/5">
             <h2 className="text-xl font-bold text-burgundy-950 dark:text-stone-100 flex items-center gap-2 font-serif"><ShoppingBag className="text-burgundy-700 dark:text-gold-500" />Shopping Cart</h2>
            <AnimatedButton onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-stone-500"><X size={20} /></AnimatedButton>
          </div>
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-stone-400 gap-4">
                <div className="p-6 rounded-full bg-stone-100 dark:bg-white/5"><ShoppingBag size={48} className="opacity-50" /></div>
                <p>Your cart is empty.</p>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="flex items-center gap-3 pb-2 border-b border-burgundy-900/5 dark:border-white/5">
                    <button onClick={toggleSelectAll} className="flex items-center gap-2 text-xs font-bold text-burgundy-900 dark:text-gold-500 uppercase tracking-wide">
                       {selectedIds.size === cart.length ? <CheckSquare size={18} /> : <Square size={18} />}Select All
                    </button>
                 </div>
                 {cart.map(item => {
                   const variant = item.product.variants[item.selectedVariantIndex];
                   const isSelected = selectedIds.has(item.id);
                   return (
                     <div key={item.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all border ${isSelected ? 'bg-burgundy-50 dark:bg-burgundy-900/20 border-burgundy-900/20 dark:border-gold-500/30' : 'bg-white/50 dark:bg-white/5 border-transparent'}`}>
                       <AnimatedButton onClick={() => toggleSelection(item.id)} className="mt-1 text-burgundy-800 dark:text-gold-500 hover:scale-110 transition-transform">
                          {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-stone-300 dark:text-stone-600" />}
                       </AnimatedButton>
                       <div className="h-16 w-16 rounded-lg bg-stone-200 dark:bg-black/40 flex-shrink-0 flex items-center justify-center font-serif font-bold text-burgundy-900 dark:text-stone-400 text-xl">{item.product.appName.charAt(0)}</div>
                       <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-burgundy-950 dark:text-stone-100 truncate">{item.product.appName}</h4>
                          <p className="text-xs text-stone-500 truncate">{variant.type} • {variant.duration}</p>
                          <p className="text-sm font-bold text-burgundy-900 dark:text-gold-500 mt-1">{formatRupiah(variant.price)}</p>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                          <button onClick={() => removeFromCart(item.id)} className="text-stone-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                          <div className="flex items-center gap-2 bg-white dark:bg-black/30 rounded-lg p-1 border border-stone-200 dark:border-white/10">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-stone-100 dark:hover:bg-white/10 rounded disabled:opacity-30" disabled={item.quantity <= 1}><Minus size={12} /></button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-stone-100 dark:hover:bg-white/10 rounded"><Plus size={12} /></button>
                          </div>
                       </div>
                     </div>
                   );
                 })}
              </div>
            )}
          </div>
          <div className="p-5 border-t border-burgundy-900/5 dark:border-white/5 bg-stone-100/50 dark:bg-black/30 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-stone-500 uppercase">Selected Total</span>
              <span className="text-xl font-bold text-burgundy-950 dark:text-gold-400">{formatRupiah(subtotal)}</span>
            </div>
            <AnimatedButton 
              onClick={() => {
                if (!isStoreOpen) {
                  onClose();
                  onStoreClosed();
                } else {
                  setStep('invoice');
                }
              }} 
              disabled={isStoreOpen && selectedIds.size === 0} 
              className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
                isStoreOpen
                  ? 'bg-burgundy-950 dark:bg-stone-100 text-stone-100 dark:text-burgundy-950 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-300 dark:hover:bg-stone-700'
              }`}
            >
              {isStoreOpen ? `Checkout (${selectedIds.size})` : <><Moon size={18} /> Store Closed</>}
            </AnimatedButton>
          </div>
        </motion.div>
          ) : (
          <motion.div 
            key="invoice-payment-step"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-md max-h-[90vh] bg-stone-50/95 dark:bg-[#1a0505]/95 backdrop-blur-2xl border border-burgundy-900/30 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
          <div className="flex items-center justify-between p-5 border-b border-burgundy-900/10 dark:border-white/10 bg-gradient-to-r from-burgundy-100/50 to-stone-100/50 dark:from-burgundy-950/50 dark:to-black/50">
            <div className="flex items-center gap-3">
              {step === 'payment' && (
                <AnimatedButton onClick={() => setStep('invoice')} className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"><ArrowLeft size={18} className="text-burgundy-900 dark:text-stone-300" /></AnimatedButton>
              )}
              <div><h2 className="text-lg font-bold text-burgundy-900 dark:text-stone-100 flex items-center gap-2 font-serif tracking-wide"><Receipt size={18} className="text-burgundy-700 dark:text-gold-500" />{step === 'invoice' ? 'ORDER DETAILS' : 'PAYMENT'}</h2></div>
            </div>
            <AnimatedButton onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-stone-500"><X size={20} /></AnimatedButton>
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {step === 'invoice' ? (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1 text-xs text-stone-500 dark:text-stone-400 font-mono">
                    <div className="flex items-center gap-2"><Hash size={12} /><span className="font-bold text-burgundy-900 dark:text-stone-200">{invoiceNumber}</span></div>
                    <div className="flex items-center gap-2"><Clock size={12} /><span>{currentDate}, {currentTime}</span></div>
                  </div>
                </div>
                
                <div className="bg-white/60 dark:bg-white/5 rounded-2xl border border-burgundy-900/5 dark:border-white/5 p-4 mb-6">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-dashed border-stone-200 dark:border-white/10">
                      <h3 className="text-xs font-bold text-burgundy-950 dark:text-stone-100 uppercase tracking-widest">Order Summary</h3>
                      <span className="text-[10px] text-stone-400">{itemsToCheckout.length} Items</span>
                  </div>
                  <div className="space-y-4">
                      {itemsToCheckout.map((item) => {
                      const variant = item.product.variants[item.selectedVariantIndex];
                      const itemSubtotal = variant.price * item.quantity;
                      return (
                          <div key={item.id} className="flex justify-between items-start">
                              <div className="flex gap-3">
                                  {item.product.icon_url ? (
                                      <img 
                                          src={item.product.icon_url} 
                                          alt={item.product.appName} 
                                          className="h-10 w-10 rounded-lg object-cover border border-stone-200 dark:border-white/5"
                                          referrerPolicy="no-referrer"
                                          onError={(e) => {
                                              (e.target as HTMLImageElement).style.display = 'none';
                                              const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                                              if (fallback) fallback.style.display = 'flex';
                                          }}
                                      />
                                  ) : null}
                                  <div 
                                      className="h-10 w-10 rounded-lg bg-stone-100 dark:bg-black/30 flex items-center justify-center font-bold text-burgundy-800 dark:text-stone-400 border border-stone-200 dark:border-white/5"
                                      style={{ display: item.product.icon_url ? 'none' : 'flex' }}
                                  >
                                      {item.product.appName.charAt(0)}
                                  </div>
                                  <div>
                                      <p className="font-bold text-sm text-burgundy-900 dark:text-stone-200 leading-tight">{item.product.appName}</p>
                                      <p className="text-xs text-stone-500 mt-0.5">{variant.type}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[10px] bg-stone-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-stone-600 dark:text-stone-400 font-mono">{variant.duration}</span>
                                          <span className="text-xs text-stone-400">x{item.quantity}</span>
                                      </div>
                                  </div>
                              </div>
                              <p className="font-bold text-sm text-burgundy-950 dark:text-gold-400">{formatRupiah(itemSubtotal)}</p>
                          </div>
                      );
                      })}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-stone-200 dark:border-white/10 space-y-2">
                      {/* VOUCHER SECTION */}
                      <div className="pb-4">
                          <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Promo Code</label>
                          <div className="flex gap-2">
                              <div className="relative flex-1">
                                  <Tag size={16} className="absolute left-3 top-2.5 text-stone-400" />
                                  <input 
                                      type="text" 
                                      value={promoCode}
                                      onChange={(e) => setPromoCode(e.target.value)}
                                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-black/30 border border-stone-200 dark:border-white/10 focus:ring-2 focus:ring-gold-500/50 outline-none text-sm dark:text-stone-200 uppercase"
                                      placeholder="ENTER CODE"
                                  />
                              </div>
                              <button 
                                  onClick={handleApplyVoucher}
                                  disabled={isApplyingVoucher}
                                  className="px-4 py-2 rounded-lg bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 font-bold text-xs uppercase tracking-wide hover:bg-stone-700 dark:hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
                              >
                                  {isApplyingVoucher ? (
                                      <>
                                          <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></div>
                                          Applying...
                                      </>
                                  ) : (
                                      'Apply'
                                  )}
                              </button>
                          </div>
                          {voucherError && <p className="text-red-500 text-xs mt-1.5">{voucherError}</p>}
                          {appliedVoucher && (
                              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-2 mt-2">
                                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                      <CheckCircle size={14} />
                                      <span className="text-xs font-bold">Voucher Applied!</span>
                                  </div>
                                  <button onClick={() => { setAppliedVoucher(null); setPromoCode(''); }} className="text-stone-400 hover:text-red-500"><X size={14} /></button>
                              </div>
                          )}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-stone-100 dark:border-white/5">
                          <span className="text-xs text-stone-500">Subtotal</span>
                          <span className="text-sm font-bold text-burgundy-900 dark:text-stone-300">{formatRupiah(subtotal)}</span>
                      </div>
                      {appliedVoucher && (
                          <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                              <span className="text-xs font-bold">
                                  {appliedVoucher.type === 'percentage' 
                                      ? `Diskon ${appliedVoucher.value}%` 
                                      : 'Diskon'}
                              </span>
                              <span className="text-sm font-bold">- {formatRupiah(discount)}</span>
                          </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-stone-100 dark:border-white/5">
                          <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Total Amount</span>
                          <span className="text-2xl font-bold text-burgundy-900 dark:text-gold-400">{formatRupiah(total)}</span>
                      </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase ml-1 mb-2">Customer Name</label>
                      <div className="relative">
                        <UserIcon size={18} className="absolute left-4 top-3.5 text-stone-400" />
                        <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 focus:ring-2 focus:ring-gold-500/50 outline-none text-sm dark:text-stone-200" placeholder="Your Name" readOnly={!!user} />
                      </div>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase ml-1 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-3.5 text-stone-400" />
                        <input type="email" value={user?.email || ''} readOnly className="w-full pl-12 pr-4 py-3 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 outline-none text-sm text-stone-500 dark:text-stone-400 cursor-not-allowed" placeholder="Email will be filled automatically" />
                      </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 mb-4 px-1">
                  <input type="checkbox" id="terms" checked={isTermsAccepted} onChange={(e) => setIsTermsAccepted(e.target.checked)} className="w-4 h-4 rounded border-stone-300 text-burgundy-900 focus:ring-burgundy-900 dark:border-white/20 dark:bg-white/5 dark:checked:bg-gold-500 cursor-pointer" />
                  <label htmlFor="terms" className="text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
                    Saya menyetujui <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-burgundy-900 dark:text-gold-400 font-bold hover:underline">Syarat & Ketentuan</a> Dhevv Premium
                  </label>
                </div>
                
                <AnimatedButton onClick={() => setStep('payment')} disabled={!isTermsAccepted} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-burgundy-950 to-burgundy-800 text-white font-bold uppercase tracking-wide hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-burgundy-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  Lanjut Pembayaran
                </AnimatedButton>
              </>
            ) : (
              <>
                {/* PAYMENT METHOD SELECTION */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-xs font-bold text-stone-500 uppercase ml-1">Metode Pembayaran</h3>
                  <div className="space-y-2">
                    {/* QRIS */}
                    <div className="border border-stone-200 dark:border-white/10 rounded-xl overflow-hidden">
                      <AnimatedButton onClick={() => { setOpenDropdown(openDropdown === 'QRIS' ? null : 'QRIS'); setSelectedPaymentMethod('QRIS'); }} className="w-full p-4 flex justify-between items-center bg-white dark:bg-white/5">
                        <span className="font-bold text-sm text-burgundy-900 dark:text-stone-200">QRIS</span>
                        {openDropdown === 'QRIS' ? <Minus size={16} /> : <Plus size={16} />}
                      </AnimatedButton>
                      <AnimatePresence>
                        {openDropdown === 'QRIS' && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden bg-stone-50 dark:bg-black/20"
                          >
                            <div className="p-4 flex flex-col items-center">
                              <img 
                                src="https://user5703.na.imgto.link/public/20260403/img-4515-2.avif" 
                                alt="QRIS" 
                                className="w-full max-w-[280px] rounded-lg shadow-xl" 
                                loading="lazy"
                              />
                              <p className="text-[10px] text-stone-500 mt-2 text-center italic">Tip: Screenshot dan scan menggunakan aplikasi e-wallet pilihan Anda</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {/* BANK */}
                    <div className="border border-stone-200 dark:border-white/10 rounded-xl overflow-hidden">
                      <AnimatedButton onClick={() => { setOpenDropdown(openDropdown === 'BANK' ? null : 'BANK'); setSelectedPaymentMethod('BANK'); }} className="w-full p-4 flex justify-between items-center bg-white dark:bg-white/5">
                        <span className="font-bold text-sm text-burgundy-900 dark:text-stone-200">BANK (Atas Nama: DAFFA RAMDHANI)</span>
                        {openDropdown === 'BANK' ? <Minus size={16} /> : <Plus size={16} />}
                      </AnimatedButton>
                      <AnimatePresence>
                        {openDropdown === 'BANK' && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden bg-stone-50 dark:bg-black/20"
                          >
                            <div className="p-4 space-y-2">
                              {[
                                { name: 'SeaBank', number: '901015694859' },
                                { name: 'Jago', number: '100933124734' },
                                { name: 'BNI', number: '2044771467' }
                              ].map(bank => (
                                <div key={bank.name} className="flex justify-between items-center text-sm">
                                  <span className="text-stone-600 dark:text-stone-400">{bank.name}: {bank.number}</span>
                                  <AnimatedButton onClick={() => copyToClipboard(bank.number)} className="p-1.5 hover:bg-stone-200 dark:hover:bg-white/10 rounded"><Copy size={14} /></AnimatedButton>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {/* E-WALLET */}
                    <div className="border border-stone-200 dark:border-white/10 rounded-xl overflow-hidden">
                      <AnimatedButton onClick={() => { setOpenDropdown(openDropdown === 'E-WALLET' ? null : 'E-WALLET'); setSelectedPaymentMethod('E-WALLET'); }} className="w-full p-4 flex justify-between items-center bg-white dark:bg-white/5">
                        <span className="font-bold text-sm text-burgundy-900 dark:text-stone-200">E-WALLET (Atas Nama: DAFFA RAMDHANI)</span>
                        {openDropdown === 'E-WALLET' ? <Minus size={16} /> : <Plus size={16} />}
                      </AnimatedButton>
                      <AnimatePresence>
                        {openDropdown === 'E-WALLET' && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden bg-stone-50 dark:bg-black/20"
                          >
                            <div className="p-4 space-y-2">
                              {[
                                { name: 'Dana', number: '082116505311' },
                                { name: 'Gopay', number: '082116505311' }
                              ].map(ewallet => (
                                <div key={ewallet.name} className="flex justify-between items-center text-sm">
                                  <span className="text-stone-600 dark:text-stone-400">{ewallet.name}: {ewallet.number}</span>
                                  <AnimatedButton onClick={() => copyToClipboard(ewallet.number)} className="p-1.5 hover:bg-stone-200 dark:hover:bg-white/10 rounded"><Copy size={14} /></AnimatedButton>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* UPLOAD PROOF */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-stone-500 uppercase ml-1 mb-2">Upload Bukti Pembayaran (Wajib)</label>
                  <input type="file" accept="image/*" onChange={(e) => setPaymentProof(e.target.files?.[0] || null)} className="w-full p-3 rounded-xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 text-sm" />
                </div>

                {/* CONFIRMATION CHECKBOX */}
                <div className="flex items-center gap-3 mb-6 px-1">
                  <input type="checkbox" id="paymentConfirmed" checked={isPaymentConfirmed} onChange={(e) => setIsPaymentConfirmed(e.target.checked)} className="w-4 h-4 rounded border-stone-300 text-burgundy-900 focus:ring-burgundy-900 dark:border-white/20 dark:bg-white/5 dark:checked:bg-gold-500 cursor-pointer" />
                  <label htmlFor="paymentConfirmed" className="text-xs text-stone-600 dark:text-stone-400 cursor-pointer">Saya telah melakukan pembayaran</label>
                </div>

                <AnimatedButton onClick={handleConfirmOrder} disabled={isSending || !paymentProof || !isPaymentConfirmed} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-burgundy-950 to-burgundy-800 text-white font-bold uppercase tracking-wide hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-burgundy-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Send size={18} /> Konfirmasi Pesanan
                    </>
                  )}
                </AnimatedButton>
              </>
            )}
          </div>
        </motion.div>
          )}

          {/* TOAST notification inside the same fixed container */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 50, x: '-50%' }}
                className="fixed bottom-20 left-1/2 bg-burgundy-950 text-white px-4 py-2 rounded-full text-[10px] font-bold z-[60] shadow-xl border border-gold-500/20"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartModal;