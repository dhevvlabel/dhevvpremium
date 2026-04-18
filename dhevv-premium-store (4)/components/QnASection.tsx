import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const QNA_CONTENT = [
  {
    question: "Apa itu Sharing?",
    answer: "Sharing berarti 1 akun dipakai bersama dengan pengguna lain. Harga lebih murah namun ada batasan seperti tidak boleh mengganti password, tidak login bersamaan, dan tidak mengubah profil orang lain. Cocok untuk penggunaan santai."
  },
  {
    question: "Apa itu Private?",
    answer: "Private berarti akun khusus untuk Anda sendiri. Anda bebas mengganti password, mengatur profil, dan koneksi lebih stabil tanpa gangguan pengguna lain."
  },
  {
    question: "Apa maksud 1U1P / 2U1P / 5U1P?",
    answer: "Ini adalah singkatan jumlah pengguna dan profil. 1U1P berarti 1 User 1 Profile. 2U1P berarti 2 User 1 Profile (digunakan bergantian). 5U5P berarti 5 User 5 Profile (Family Plan)."
  },
  {
    question: "Apa arti 1 Day / 7 Days / 1 Month?",
    answer: "Ini menunjukkan durasi aktif akun. 1 Day adalah 24 jam, 7 Days adalah 7x24 jam, dan 1 Month adalah durasi satu bulan kalender."
  },
  {
    question: "Apa itu Mobile Only / All Device?",
    answer: "Mobile Only berarti akun hanya bisa digunakan di ponsel. All Device berarti bisa digunakan di ponsel, tablet, TV, atau laptop. Penggunaan di perangkat yang salah dapat menyebabkan limit akun."
  },
  {
    question: "Apa itu Garansi?",
    answer: "Kami membantu jika akun bermasalah seperti login error atau logout tiba-tiba. Garansi tidak berlaku jika pengguna mengganti password secara mandiri atau melanggar aturan sharing."
  },
  {
    question: "Apa itu Limit atau Suspend?",
    answer: "Akun terkunci sementara karena pelanggaran sistem seperti login bersamaan atau ganti password. Akun tetap aman selama mengikuti aturan."
  },
  {
    question: "Apa itu Anti Limit?",
    answer: "Pengaturan akun agar lebih stabil dan minim risiko logout untuk pemakaian normal. Bukan berarti kebal jika disalahgunakan."
  },
  {
    question: "Apa itu Invite / Head / Owner?",
    answer: "Invite adalah bergabung ke akun orang lain melalui link. Head/Owner adalah pemilik akun yang bisa mengundang orang lain (biasanya untuk Canva atau Spotify)."
  },
  {
    question: "Istilah Tambahan",
    answer: "Backfree (akun tidak ditarik sebelum masa aktif habis), Replace (ganti akun jika bermasalah), No Refund (dana tidak dapat dikembalikan setelah akun dikirim), Ready/Kosong (status stok), Fast Process (proses cepat setelah pembayaran)."
  }
];

const QnASection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-burgundy-950/5 dark:bg-white/5 text-burgundy-900 dark:text-gold-500 border border-burgundy-900/10 dark:border-white/10 backdrop-blur-md">
            <HelpCircle size={24} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-burgundy-950 dark:text-stone-100 tracking-tight">
            Pusat Informasi & QnA
          </h2>
          <p className="mt-3 text-stone-600 dark:text-stone-400 max-w-lg mx-auto text-sm leading-relaxed">
            Temukan jawaban atas pertanyaan umum seputar layanan dan produk premium kami.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {QNA_CONTENT.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className={`group rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-md ${
                  isOpen 
                    ? 'bg-white/80 dark:bg-burgundy-950/40 border-burgundy-900/20 dark:border-gold-500/30 shadow-lg' 
                    : 'bg-white/40 dark:bg-white/5 border-burgundy-900/10 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                >
                  <span className={`text-sm sm:text-base font-bold transition-colors ${
                    isOpen 
                      ? 'text-burgundy-900 dark:text-gold-400' 
                      : 'text-burgundy-950 dark:text-stone-200'
                  }`}>
                    {item.question}
                  </span>
                  <ChevronDown 
                    size={18} 
                    className={`text-stone-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-burgundy-800 dark:text-gold-500' : ''}`} 
                  />
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300 border-t border-burgundy-900/5 dark:border-white/5 pt-4">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default QnASection;