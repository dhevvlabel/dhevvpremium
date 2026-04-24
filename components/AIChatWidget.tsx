import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, ArrowLeft } from 'lucide-react';
import { formatRupiah } from '../constants';
import { Product } from '../types';
import Groq from "groq-sdk";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const AIChatWidget: React.FC<{ products: Product[] }> = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Halo Kak! Aku Dhevv AI nih. Bingung mau pilih aplikasi streaming atau desain yang mana? Tanya aku apa aja ya, siap bantu Kakak pilih yang paling oke! ✨",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getSystemInstruction = () => {
    const productContext = products.map(p => {
      const variants = p.variants.map(v => 
        `- ${v.type} (${v.duration}): ${formatRupiah(v.price)}`
      ).join('\n');
      return `**${p.appName}**\n${variants}`;
    }).join('\n\n');

    return `Kamu adalah Dhevv AI, asisten paling chill dan asik dari Dhevv Premium. Tugas kamu bantu Kakak-kakak pelanggan buat milih aplikasi streaming atau desain yang paling cocok buat mereka.

Karakter Kamu:
- Gaya bahasa: Gen Z banget, santai, tapi tetep sopan (Professional Luxury).
- Panggilan: Gunakan 'Kakak' atau 'Kak'.
- DILARANG: Pakai bahasa robot, bahasa puitis lebay, atau ngasih jawaban kepanjangan.

Informasi Produk (Data Real-time):
Kamu punya akses ke data produk berikut yang diambil langsung dari sistem:
${productContext}

Aturan Menjawab (WAJIB):
- Format Typing: Gunakan Bold (双星号) untuk **NAMA PRODUK** dan **HARGA**.
- Anti Dinding Teks: Kalau Kakak tanya soal rekomendasi umum, kasih 3-5 produk aja yang paling best-seller. Jangan dikeluarin semua biar nggak pusing bacanya.
- Spasi itu Penting: Kasih jarak antar poin (double enter) supaya tampilannya lega di layar HP.
- Human Touch: Pake kata-kata kayak 'nih', 'siap Kak', 'oke banget', 'murah parah', 'asli'.
- Sharing vs Private: Jelasin tipis-tipis bedanya kalau ada yang nanya. Sharing = hemat barengan, Private = eksklusif punya sendiri.

Contoh Cara Ngomong:
'Halo Kak! Siap, ini ada beberapa produk yang lagi laku banget nih di Dhevv Premium:

✨ **NETFLIX**
Harganya mulai **Rp 4.500** aja buat yang harian. Cocok banget buat nemenin me-time Kakak malem ini!

🍿 **VIU PREMIUM**
Murah parah Kak, mulai **Rp 2.000** aja udah bisa drakoran sepuasnya tanpa iklan.

Kakak lagi cari aplikasi buat nonton atau buat kerja/desain nih? Biar aku pilihin yang paling oke!'`;
  };

  // Inisialisasi Groq client
  const groq = React.useMemo(() => {
    return new Groq({
      apiKey: import.meta.env.VITE_GROQ_API_KEY || "",
      dangerouslyAllowBrowser: true // Diperlukan untuk client-side usage di Vite
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue;
    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // 2. Prepare Messages for Groq (OpenAI Style)
      const groqMessages: any[] = [
        {
          role: "system",
          content: getSystemInstruction()
        },
        ...messages.filter(m => m.id !== 'welcome').map(m => ({
          role: m.sender === 'user' ? "user" : "assistant",
          content: m.text,
        })),
        {
          role: "user",
          content: userText
        }
      ];

      const completion = await groq.chat.completions.create({
        messages: groqMessages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
      });

      const botText = completion.choices[0]?.message?.content || "Maaf Kak, saya tidak bisa menjawab saat ini.";

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date()
      }]);

    } catch (error: any) {
      console.error("Chat Error:", error);
      let errorMsg = error.message || "Koneksi error";
      
      if (errorMsg.includes("API key") || errorMsg.includes("401") || errorMsg.includes("403")) {
        errorMsg = "Masalah API Key Groq. Silakan cek konfigurasi VITE_GROQ_API_KEY.";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: `Maaf Kak, ada kendala teknis: ${errorMsg}. Coba lagi nanti ya!`,
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="fixed bottom-5 right-5 z-[50] h-14 w-14 rounded-full bg-gradient-to-br from-burgundy-800 to-burgundy-950 shadow-lg flex items-center justify-center border border-white/20"
        >
          <MessageCircle className="text-white" size={28} />
          {isHovered && (
            <div className="absolute right-16 bg-white text-burgundy-900 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap shadow-md">
              Chat Dhevv AI 👋
            </div>
          )}
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 font-sans">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          <div className="relative w-full h-full sm:max-w-md sm:h-[80vh] bg-white dark:bg-[#1a0505] shadow-2xl flex flex-col sm:rounded-3xl overflow-hidden">
            <div className="p-4 bg-burgundy-900 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Bot className="text-gold-400" />
                <div>
                  <h3 className="font-bold text-sm">Dhevv AI Assistant</h3>
                  <p className="text-[10px] text-emerald-400 opacity-80">● Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 dark:bg-stone-900/20">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-burgundy-900 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 dark:text-stone-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-xs text-stone-400">Dhevv AI sedang mengetik...</div>}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t bg-white dark:bg-stone-900">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Tanya harga..."
                  className="flex-1 p-3 bg-stone-100 dark:bg-white/5 rounded-xl text-sm outline-none"
                />
                <button type="submit" className="p-3 bg-burgundy-900 text-white rounded-xl">
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;