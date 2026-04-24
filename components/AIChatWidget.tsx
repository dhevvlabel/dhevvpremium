import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
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

  // Fungsi Render Bold (Biar bintang ** hilang dan jadi teks tebal)
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

    return `Kamu Dhevv AI, asisten chill Dhevv Premium. 
    ATURAN:
    1. Gaya bahasa: Gen Z, santai, tapi tetep sopan.
    2. Panggilan: 'Kak' atau 'Kakak' (Maksimal 2x dalam satu jawaban, jangan tiap kalimat).
    3. JANGAN JADI WIKIPEDIA: Jangan jelasin definisi Netflix/Spotify kalau gak ditanya.
    4. DATA HARGA: Gunakan data di bawah ini. Jangan nyuruh cek web resmi aplikasi lain.
    5. Jika user tanya varian, spill semua opsinya dari data ini:
    
    ${productContext}`;
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
      // Menyiapkan history chat untuk dikirim ke Groq
      const groqMessages = [
        { role: "system", content: getSystemInstruction() },
        ...messages.filter(m => m.id !== 'welcome').map(m => ({
          role: m.sender === 'user' ? "user" : "assistant",
          content: m.text,
        })),
        { role: "user", content: userText }
      ];

      const completion = await groq.chat.completions.create({
        messages: groqMessages as any,
        model: "llama-3.3-70b-versatile",
        temperature: 0.6,
        max_tokens: 500,
      });

      const botText = completion.choices[0]?.message?.content || "Duh, lagi pusing nih. Coba lagi ya Kak!";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: botText, sender: 'bot', timestamp: new Date() }]);

    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        id: 'err-' + Date.now(), 
        text: "Lagi error nih koneksinya, coba bentar lagi ya Kak!", 
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
          className="fixed bottom-5 right-5 z-[50] h-14 w-14 rounded-full bg-burgundy-900 shadow-lg flex items-center justify-center border border-white/20"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
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
                      : 'bg-white dark:bg-white/5 dark:text-stone-200 rounded-tl-none border border-stone-200 dark:border-white/10'
                  }`}>
                    {renderMessage(msg.text)}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-[10px] text-stone-400 animate-pulse">
                  <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
                  Dhevv AI lagi mikir nih...
                </div>
              )}
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
                <button type="submit" className="p-3 bg-burgundy-900 text-white rounded-xl hover:bg-burgundy-800 transition-colors">
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
