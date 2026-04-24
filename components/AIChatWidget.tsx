import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, ArrowLeft } from 'lucide-react';
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
      text: "Halo Kak! Aku Dhevv AI nih. Mau cari aplikasi apa hari ini? Spill aja, nanti aku kasih harga yang paling murah parah! ✨",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fungsi buat bikin teks **Bold** jadi nyata (Render Markdown sederhana)
  const renderMessage = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-gold-500">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const getSystemInstruction = () => {
    const productContext = products.map(p => {
      return p.variants.map(v => 
        `- **${p.appName} ${v.type} (${v.duration})**: **${formatRupiah(v.price)}**`
      ).join('\n');
    }).join('\n');

    return `Kamu adalah Dhevv AI, asisten pribadi dari Dhevv Premium. 
    
    CORE RULES (WAJIB):
    1. JANGAN JADI WIKIPEDIA: Jangan jelasin apa itu Netflix/Spotify kalau gak ditanya. User udah tau!
    2. TETAP DI JALUR: Kalau user bilang 'hah' atau 'apa sih', artinya jawaban kamu sebelumnya nggak jelas atau kebanyakan omong. Minta maaf singkat dan tanya balik mau cari apa.
    3. DATA ADALAH TUHAN: Hanya gunakan harga dari daftar di bawah. Jangan pernah nyuruh cek web lain.
    4. GAYA GEN Z LUXURY: Santai tapi elegan. Pake 'Kak'. Hindari pengulangan kata 'nih' di setiap kalimat.
    
    CARA MERESPON:
    - User minta produk -> Spill variannya sesuai data, tawarin mana yang cocok.
    - User bingung -> Tanya pelan-pelan mau buat nonton di HP atau TV.
    - User nyela/protes -> Langsung sesuaikan gaya bicara, jangan kaku!

    DAFTAR STOK & HARGA KITA:
    ${productContext}

    Contoh gaya bahasa:
    'Eh sorry Kak kalau tadi belibet. Maksud aku, buat Netflix kita ada paket Sharing mulai **Rp 4.500** aja. Mau yang buat sehari atau langsung seminggu nih biar puas?'`;
  };

  const groq = React.useMemo(() => {
    return new Groq({
      apiKey: import.meta.env.VITE_GROQ_API_KEY || "",
      dangerouslyAllowBrowser: true
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
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userText, sender: 'user', timestamp: new Date() }]);
    setInputValue('');
    setIsTyping(true);

    try {
      const completion = await groq.chat.completions.create({
  messages: groqMessages,
  model: "llama-3.3-70b-versatile",
  temperature: 0.6, // Ganti ke 0.6 ya Daf
  max_tokens: 500,  // Dipendekin aja biar gak kepanjangan curhatnya
});

      const botText = completion.choices[0]?.message?.content || "Duh, lagi pusing nih. Coba lagi ya Kak!";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: botText, sender: 'bot', timestamp: new Date() }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { id: 'err', text: "Lagi error nih koneksinya, coba bentar lagi ya Kak!", sender: 'bot', timestamp: new Date() }]);
    } finally { setIsTyping(false); }
  };

  return (
    <>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-5 right-5 z-[50] h-14 w-14 rounded-full bg-burgundy-900 shadow-lg flex items-center justify-center border border-white/20">
          <MessageCircle className="text-white" size={28} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full h-full sm:max-w-md sm:h-[80vh] bg-white dark:bg-[#1a0505] shadow-2xl flex flex-col sm:rounded-3xl overflow-hidden">
            <div className="p-4 bg-burgundy-900 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Bot className="text-gold-400" />
                <h3 className="font-bold text-sm">Dhevv AI Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 dark:bg-stone-900/20">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                    msg.sender === 'user' ? 'bg-burgundy-900 text-white rounded-tr-none' : 'bg-white dark:bg-white/5 dark:text-stone-200 rounded-tl-none'
                  }`}>
                    {renderMessage(msg.text)}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] text-stone-400 animate-pulse">Dhevv AI Mengetik...</div>}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t bg-white dark:bg-stone-900">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Tanya harga apa nih?"
                  className="flex-1 p-3 bg-stone-100 dark:bg-white/5 rounded-xl text-sm outline-none dark:text-white"
                />
                <button type="submit" className="p-3 bg-burgundy-900 text-white rounded-xl"><Send size={18} /></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
