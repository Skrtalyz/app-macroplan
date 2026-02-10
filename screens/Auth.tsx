
import React, { useState } from 'react';
import { ChevronLeft, Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { UserAccount } from '../types';
import { translations } from '../localization';

interface AuthProps {
  language: 'pt-BR' | 'en-US';
  onBack: () => void;
  onAuthSuccess: (user: UserAccount) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER';

const Auth: React.FC<AuthProps> = ({ language, onBack, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const t = translations[language];

  // Hashing consistente com salt fixo para simulação profissional
  const hashPassword = (pass: string) => btoa(`macro_v2_salt_${pass.trim()}`);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Normalização RIGOROSA: e-mail sempre minúsculo e sem espaços
    const normalizedEmail = formData.email.toLowerCase().trim();
    const hashedPassword = hashPassword(formData.password);

    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
      const accounts: UserAccount[] = JSON.parse(localStorage.getItem('macroplan_accounts') || '[]');

      if (mode === 'REGISTER') {
        if (formData.password !== formData.confirmPassword) throw new Error(t.passwords_not_match);
        if (formData.password.length < 6) throw new Error(language === 'pt-BR' ? 'A senha deve ter pelo menos 6 caracteres.' : 'Password must be at least 6 characters.');
        
        // Verifica existência prévia (normalizada)
        if (accounts.some(acc => acc.email.toLowerCase().trim() === normalizedEmail)) {
          throw new Error(t.email_in_use);
        }

        const newUser: UserAccount = {
          id: `u_${Math.random().toString(36).substr(2, 12)}`,
          name: formData.name.trim() || 'Usuário',
          email: normalizedEmail,
          password: hashedPassword,
          createdAt: Date.now()
        };

        const updatedAccounts = [...accounts, newUser];
        localStorage.setItem('macroplan_accounts', JSON.stringify(updatedAccounts));
        onAuthSuccess(newUser);
      } 
      else {
        // LOGIN: Busca rigorosa por e-mail normalizado e hash
        const user = accounts.find(acc => 
          acc.email.toLowerCase().trim() === normalizedEmail && 
          acc.password === hashedPassword
        );

        if (!user) {
          throw new Error(t.invalid_credentials);
        }

        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message);
      if (mode === 'LOGIN') setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg transition-colors duration-300 pb-safe">
      <header className="p-6 pt-[calc(1.5rem + env(safe-area-inset-top))] flex items-center">
        <button onClick={onBack} className="p-4 bg-gray-50 dark:bg-dark-elevated rounded-2xl text-gray-500 hover:text-brand-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shadow-sm">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
      </header>

      <div className="px-8 pt-4 pb-12 max-w-md mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-4 leading-tight">
            {mode === 'LOGIN' ? t.auth_title : t.register}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-lg leading-tight opacity-80">
            {mode === 'LOGIN' ? t.auth_subtitle : t.welcome_to_macroplan}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {mode === 'REGISTER' && (
            <div className="relative group">
              <User size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder={t.name}
                className="w-full bg-gray-50 dark:bg-dark-elevated border border-gray-100 dark:border-white/5 rounded-[28px] pl-16 pr-6 py-5 font-bold focus:outline-none focus:border-brand-primary transition-all text-base"
              />
            </div>
          )}

          <div className="relative group">
            <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder={t.email}
              className="w-full bg-gray-50 dark:bg-dark-elevated border border-gray-100 dark:border-white/5 rounded-[28px] pl-16 pr-6 py-5 font-bold focus:outline-none focus:border-brand-primary transition-all text-base"
            />
          </div>

          <div className="relative group">
            <Lock size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="password"
              required
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              placeholder={t.password}
              className="w-full bg-gray-50 dark:bg-dark-elevated border border-gray-100 dark:border-white/5 rounded-[28px] pl-16 pr-6 py-5 font-bold focus:outline-none focus:border-brand-primary transition-all text-base"
            />
          </div>

          {mode === 'REGISTER' && (
            <div className="relative group">
              <Lock size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="password"
                required
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder={t.confirm_password}
                className="w-full bg-gray-50 dark:bg-dark-elevated border border-gray-100 dark:border-white/5 rounded-[28px] pl-16 pr-6 py-5 font-bold focus:outline-none focus:border-brand-primary transition-all text-base"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-3 text-red-500 bg-red-50 dark:bg-red-950/20 p-5 rounded-3xl border border-red-100 dark:border-red-900/10 animate-fade-in">
              <AlertCircle size={20} strokeWidth={2.5} />
              <span className="text-sm font-black tracking-tight">{error}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-primary text-white py-6 rounded-[32px] font-black text-xl shadow-2xl shadow-brand-primary/20 flex items-center justify-center space-x-4 active:scale-95 transition-all disabled:opacity-70 min-h-[64px]"
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                <span>{mode === 'LOGIN' ? t.login : t.register}</span>
                <ArrowRight size={22} strokeWidth={3} />
              </>
            )}
          </button>
        </form>

        <div className="mt-16 text-center">
          <p className="text-gray-400 dark:text-gray-500 font-bold mb-5 text-sm uppercase tracking-widest opacity-60">
            {mode === 'LOGIN' ? t.no_account : t.have_account}
          </p>
          <button 
            type="button"
            onClick={() => { setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setError(null); }}
            className="px-10 py-4 bg-gray-100 dark:bg-dark-elevated text-gray-700 dark:text-white rounded-full font-black text-xs uppercase tracking-[0.2em] active:scale-90 transition-all border border-gray-200 dark:border-white/5 min-h-[44px]"
          >
            {mode === 'LOGIN' ? t.register : t.login}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
