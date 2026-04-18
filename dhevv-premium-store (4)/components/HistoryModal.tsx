import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order } from '../types';
import { formatRupiah } from '../constants';
import { X, Clock, CheckCircle, Hourglass, FileCheck } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: Order[];
}

const HistoryModal: React.FC<HistoryModalProps> = ({ 
  isOpen, 
  onClose, 
  history 
}) => {
  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'Processing':
        return {
          label: 'Sedang Diverifikasi',
          className: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
          icon: <FileCheck size={12} className="mr-1" />
        };
      case 'Completed':
        return {
          label: 'Berhasil',
          className: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
          icon: <CheckCircle size={12} className="mr-1" />
        };
      case 'Pending':
      default:
        return {
          label: 'Menunggu Pembayaran',
          className: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
          icon: <Hourglass size={12} className="mr-1" />
        };
    }
  };

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
            className="relative w-full max-w-2xl max-h-[80vh] bg-stone-50/90 dark:bg-[#1a0505]/95 backdrop-blur-2xl border border-burgundy-900/10 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            
            <div className="flex items-center justify-between p-6 border-b border-burgundy-900/5 dark:border-white/5 bg-white/40 dark:bg-white/5">
          <h2 className="text-xl font-bold text-burgundy-950 dark:text-stone-100 flex items-center gap-2 font-serif">
            <Clock className="text-burgundy-700 dark:text-gold-500" />
            Order Archive
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-stone-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center py-10 text-stone-400 dark:text-stone-600">
              <p>No past orders found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {history.map(order => {
                let displayStatus = order.status;
                
                // UI-only logic: if Processing and older than 1 hour, show as Completed
                if (displayStatus === 'Processing') {
                  if (order.timestamp) {
                    const oneHour = 60 * 60 * 1000;
                    if (Date.now() - order.timestamp > oneHour) {
                      displayStatus = 'Completed';
                    }
                  } else {
                    // Fallback for older orders without timestamp: if not today, it's > 1 hour
                    const today = new Date().toLocaleDateString('id-ID');
                    if (order.date !== today) {
                      displayStatus = 'Completed';
                    }
                  }
                }

                const statusConfig = getStatusConfig(displayStatus);
                return (
                  <div key={order.id} className="rounded-xl border border-burgundy-900/5 dark:border-white/5 bg-white/60 dark:bg-white/5 p-5 relative overflow-hidden group hover:border-gold-500/20 transition-all">
                    {/* Decorative side bar matching status color */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${displayStatus === 'Pending' ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>
                    
                    <div className="flex justify-between items-start mb-4 border-b border-burgundy-900/5 dark:border-white/5 pb-3">
                      <div>
                        <p className="font-mono text-[10px] text-stone-400 uppercase tracking-widest">Order ID: {order.id}</p>
                        <p className="text-sm font-bold text-burgundy-950 dark:text-stone-100 mt-1">{order.date}</p>
                      </div>
                      <span className={`flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusConfig.className}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <div className="flex flex-col">
                            <span className="text-burgundy-900 dark:text-stone-200 font-medium">
                              {item.product.appName}
                            </span>
                            <span className="text-xs text-stone-500 dark:text-stone-500">{item.product.variants[item.selectedVariantIndex].type}</span>
                          </div>
                          <span className="text-burgundy-950 dark:text-stone-300 font-bold">
                            {formatRupiah(item.product.variants[item.selectedVariantIndex].price)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-end pt-3 border-t border-burgundy-900/5 dark:border-white/5">
                      {order.paymentProof && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <FileCheck size={12} /> Proof Uploaded
                        </span>
                      )}
                      <p className="text-lg font-bold text-burgundy-800 dark:text-gold-400 font-serif ml-auto">Total: {formatRupiah(order.total)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};

export default HistoryModal;