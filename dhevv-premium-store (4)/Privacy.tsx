import React from 'react';
import Footer from './components/Footer';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#000000] text-stone-200 font-sans flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-burgundy-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gold-900/10 blur-[150px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="relative z-10 w-full max-w-3xl mt-12 mb-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent mb-4">
              Kebijakan Privasi
            </h1>
            <p className="text-gold-400 font-medium tracking-widest uppercase text-sm">
              Dhevv Premium
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl text-center">
            <p className="text-stone-300 leading-relaxed text-lg md:text-xl font-light">
              Kami di Dhevv Premium sangat menjaga kerahasiaan data pribadi Anda. Nama, Email, dan Nomor WhatsApp yang Anda masukkan hanya digunakan untuk keperluan proses transaksi dan pengiriman akun. Kami tidak akan pernah membagikan atau menjual data Anda kepada pihak ketiga mana pun. Semua data transaksi diproses secara aman melalui gateway pembayaran resmi.
            </p>

            <div className="mt-12 pt-8 border-t border-white/10 flex justify-center">
              <button 
                onClick={() => window.location.href = '/'}
                className="px-8 py-4 bg-gradient-to-r from-burgundy-950 to-burgundy-800 text-white font-bold uppercase tracking-wide rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-burgundy-900/20"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
