import React from 'react';
import Footer from './components/Footer';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#000000] text-stone-200 font-sans flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-burgundy-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gold-900/10 blur-[150px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="flex-grow flex flex-col items-center p-6">
        <div className="relative z-10 w-full max-w-3xl mt-12 mb-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent mb-4">
              Syarat & Ketentuan Layanan
            </h1>
            <p className="text-gold-400 font-medium tracking-widest uppercase text-sm">
              Dhevv Premium
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            <p className="text-stone-300 mb-8 leading-relaxed">
              Demi kenyamanan bersama dan untuk menjaga kualitas akun tetap stabil, setiap pelanggan Dhevv Premium wajib mematuhi ketentuan berikut:
            </p>

            <ul className="space-y-6 text-stone-300">
              <li className="flex gap-4">
                <span className="text-gold-500 font-bold mt-1">1.</span>
                <div>
                  <strong className="text-stone-100 block mb-1">Verifikasi Aktivasi</strong>
                  Pelanggan wajib mengirimkan bukti tangkapan layar (screenshot) setelah berhasil login ke admin maksimal 12 jam setelah akun diberikan. Tanpa bukti aktivasi, garansi dianggap tidak berlaku (No Warranty).
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-gold-500 font-bold mt-1">2.</span>
                <div>
                  <strong className="text-stone-100 block mb-1">Batasan Perangkat</strong>
                  Akun hanya diperbolehkan digunakan pada 1 perangkat saja. Penggunaan secara berpindah-pindah perangkat (multi-device) akan mengakibatkan garansi hangus seketika.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-gold-500 font-bold mt-1">3.</span>
                <div>
                  <strong className="text-stone-100 block mb-1">Kebijakan Screen Limit</strong>
                  Mengingat ini adalah akun sharing, kami tidak menerima komplain terkait adanya screen limit (layar penuh). Harap mencoba kembali secara berkala.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-gold-500 font-bold mt-1">4.</span>
                <div>
                  <strong className="text-stone-100 block mb-1">Integritas Akun</strong>
                  Dilarang keras mengubah PIN, Profil, atau pengaturan akun lainnya. Pelanggaran terhadap poin ini akan dikenakan denda administratif sebesar Rp100.000.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-gold-500 font-bold mt-1">5.</span>
                <div>
                  <strong className="text-stone-100 block mb-1">Masa Aktif</strong>
                  Pelanggan wajib melakukan Log Out dari akun segera setelah durasi langganan berakhir.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-gold-500 font-bold mt-1">6.</span>
                <div>
                  <strong className="text-stone-100 block mb-1">Larangan VPN</strong>
                  Dilarang keras menggunakan VPN saat mengakses layanan Netflix demi menjaga keamanan akun dari banned.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-gold-500 font-bold mt-1">7.</span>
                <div>
                  <strong className="text-stone-100 block mb-1">Pergantian Perangkat</strong>
                  Dilarang mengganti perangkat login tanpa instruksi resmi dari admin. Pelanggaran terhadap hal ini akan mengakibatkan akun dihentikan sepihak tanpa pengecualian.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-gold-500 font-bold mt-1">8.</span>
                <div>
                  <strong className="text-stone-100 block mb-1">Prosedur Komplain</strong>
                  Jika terjadi kendala pada akun, pelanggan wajib melampirkan bukti permasalahan yang jelas (foto/video error).
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-gold-500 font-bold mt-1">9.</span>
                <div>
                  <strong className="text-stone-100 block mb-1">Aktivasi Instan</strong>
                  Durasi langganan dihitung sejak data akun diberikan oleh admin. Pelanggan disarankan untuk segera melakukan login.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-gold-500 font-bold mt-1">10.</span>
                <div>
                  <strong className="text-stone-100 block mb-1">Kebijakan Refund</strong>
                  Setelah data akun dikirimkan oleh admin, pesanan bersifat final dan tidak dapat dibatalkan atau dikembalikan (No Refund).
                </div>
              </li>
            </ul>

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

export default Terms;
