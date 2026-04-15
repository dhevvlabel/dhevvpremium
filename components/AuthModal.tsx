import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import { User as UserType } from '../types';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserType, isRegister: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const sendTelegramNotification = (name: string, email: string, phone: string) => {
    // GANTI BAGIAN INI: Pakai token Visitor/Database lo
    const token = import.meta.env?.VITE_TELEGRAM_VISITOR_BOT_TOKEN; 
    const chatId = String(import.meta.env?.VITE_TELEGRAM_CHAT_ID || ''); 
    
    if (!token || !chatId) return;

    const date = new Date().toLocaleString('id-ID');

    const message = `*🔔 MEMBER BARU TERDAFTAR*
-------------------------
👤 *Nama:* ${name}
📧 *Email:* ${email}
📱 *WA:* ${phone}
📅 *Waktu:* ${date}`;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    
    // Pakai POST aja biar lebih rapi dan aman datanya
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        })
    }).catch(err => console.error("Telegram notification failed", err));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isRegister && (!name || !phoneNumber))) {
      setError('Please fill in all fields');
      return;
    }

    try {
      if (isRegister) {
        // Check if email already exists in Supabase
        const { data: existingUsers, error: checkError } = await supabase
          .from('Users Dhevv Premium')
          .select('*')
          .ilike('email', email);

        if (checkError) throw checkError;

        if (existingUsers && existingUsers.length > 0) {
          setError('Email ini sudah terdaftar. Silakan login.');
          return;
        }

        const memberSince = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        
        const newUser: UserType = {
          name: name,
          email: email,
          phoneNumber: phoneNumber,
          memberSince: memberSince,
          password: password,
        };

        // Insert to Supabase
        const { error: insertError } = await supabase
          .from('Users Dhevv Premium')
          .insert([
            {
              name: name,
              email: email,
              phone: phoneNumber,
              password: password
            }
          ]);

        if (insertError) {
          console.log('Detail Error Supabase:', insertError);
          throw insertError;
        }

        sendTelegramNotification(name, email, phoneNumber);
        onLogin(newUser, true);
        
      } else {
        // Login: Check Supabase
        const { data: users, error: loginError } = await supabase
          .from('Users Dhevv Premium')
          .select('*')
          .ilike('email', email)
          .eq('password', password);

        if (loginError) throw loginError;

        if (users && users.length > 0) {
          const validUser = users[0];
          const userObj: UserType = {
            name: validUser.name,
            email: validUser.email,
            phoneNumber: validUser.phone,
            memberSince: validUser.created_at ? new Date(validUser.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
            password: validUser.password
          };
          onLogin(userObj, false);
        } else {
          setError('Ups! Email atau Password salah. Silakan cek kembali atau daftar dulu ya!');
          return;
        }
      }

      setName('');
      setEmail('');
      setPassword('');
      setPhoneNumber('');
    } catch (err: any) {
      console.error("Auth error:", err);
      setError('Terjadi kesalahan pada server. Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      {/* CHANGED: Transparan Blur Background (Menyesuaikan CartModal) */}
      <div 
        className="absolute inset-0 bg-white/10 dark:bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-stone-50/95 dark:bg-[#1a0505]/95 backdrop-blur-2xl border border-burgundy-900/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-br from-burgundy-900 to-black flex flex-col items-center justify-center text-white">
           <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-black mb-3 shadow-lg shadow-gold-500/20">
             <ShieldCheck size={24} />
          </div>
          <h2 className="text-xl font-bold font-serif tracking-wide">
            {isRegister ? 'Join Premium' : 'Welcome Back'}
          </h2>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegister && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-stone-400" size={18} />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 outline-none transition-all dark:text-stone-100"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase ml-1">WhatsApp Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 text-stone-400" size={18} />
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 outline-none transition-all dark:text-stone-100"
                      placeholder="0812..."
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-500 uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-stone-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 outline-none transition-all dark:text-stone-100"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-500 uppercase ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-stone-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 outline-none transition-all dark:text-stone-100"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 font-medium ml-1 animate-pulse">{error}</p>}

            <button 
              type="submit"
              className="w-full py-3.5 mt-4 rounded-xl bg-burgundy-950 dark:bg-stone-100 text-stone-100 dark:text-burgundy-950 font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
            >
              {isRegister ? 'Register & Join' : 'Login Securely'}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-stone-500">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
              <button 
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="ml-2 font-bold text-burgundy-800 dark:text-gold-500 hover:underline"
              >
                {isRegister ? 'Login' : 'Register'}
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthModal;