
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, User, Mail, Lock, CheckCircle2, AlertCircle, Loader2, X, Eye, EyeOff, Edit2, Check } from 'lucide-react';
import { UserProfile, UserAccount } from '../types';
import { translations } from '../localization';

interface PersonalInfoProps {
  user: UserProfile;
  onBack: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ user, onBack, onUpdateProfile }) => {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [newName, setNewName] = useState('');
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const t = translations[user.language];

  // Simulação de Hashing (Mesmo método do Auth)
  const hashPassword = (pass: string) => btoa(`macro_salt_${pass}`);

  useEffect(() => {
    if (user.accountId) {
      const accounts: UserAccount[] = JSON.parse(localStorage.getItem('macroplan_accounts') || '[]');
      const found = accounts.find(acc => acc.id === user.accountId);
      if (found) {
        setAccount(found);
        setNewName(found.name);
      }
    }
  }, [user.accountId]);

  const handleUpdateName = async () => {
    if (newName.trim().length < 2) {
      setError(t.name_too_short);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Simulação de delay para UX premium
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const accounts: UserAccount[] = JSON.parse(localStorage.getItem('macroplan_accounts') || '[]');
      const idx = accounts.findIndex(acc => acc.id === user.accountId);

      if (idx !== -1) {
        accounts[idx].name = newName.trim();
        localStorage.setItem('macroplan_accounts', JSON.stringify(accounts));
        
        // Atualiza estado global e local
        onUpdateProfile({ name: newName.trim() });
        setAccount({ ...accounts[idx] });
        setIsEditingName(false);
        setSuccess(user.language === 'pt-BR' ? 'Nome atualizado!' : 'Name updated!');
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const accounts: UserAccount[] = JSON.parse(localStorage.getItem('macroplan_accounts') || '[]');
      const idx = accounts.findIndex(acc => acc.id === user.accountId);

      if (idx === -1) throw new Error('Account not found');
      
      const currentAcc = accounts[idx];
      const hashedCurrentInput = hashPassword(passwordData.current);
      
      if (currentAcc.password !== hashedCurrentInput) {
        throw new Error(t.password_error_invalid);
      }
      if (passwordData.new !== passwordData.confirm) {
        throw new Error(t.passwords_not_match);
      }
      if (passwordData.new.length < 6) {
        throw new Error(user.language === 'pt-BR' ? 'A nova senha deve ter pelo menos 6 caracteres.' : 'New password must be at least 6 characters.');
      }

      accounts[idx].password = hashPassword(passwordData.new);
      localStorage.setItem('macroplan_accounts', JSON.stringify(accounts));
      
      setSuccess(t.password_changed_success);
      setPasswordData({ current: '', new: '', confirm: '' });
      setTimeout(() => {
        setIsChangingPassword(false);
        setSuccess(null);
      }, 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  if (!account) return null;

  return (
    <div className="flex flex-col h-full bg-transparent max-w-2xl mx-auto w-full">
      {/* Header Compacto */}
      <header className="px-4 py-4 md:py-6 flex items-center justify-between sticky top-0 bg-transparent z-40 backdrop-blur-sm">
        <button onClick={onBack} className="p-3 bg-white dark:bg-dark-elevated rounded-2xl text-gray-500 shadow-sm border border-gray-100 dark:border-white/5 active:scale-90 transition-all">
          <ChevronLeft size={20} strokeWidth={3} />
        </button>
        <h1 className="font-black text-gray-900 dark:text-dark-text text-base md:text-lg tracking-tight">{t.personal_info}</h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      {/* Conteúdo com scroll suave */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-24 scrollbar-hide">
        <div className="flex flex-col items-center mb-6 md:mb-10">
           <div className="w-20 h-20 md:w-24 md:h-24 bg-brand-primary/10 rounded-[32px] md:rounded-[40px] flex items-center justify-center text-brand-primary mb-4 shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-brand-primary opacity-5 group-hover:opacity-10 transition-opacity"></div>
              <User size={36} md:size={48} strokeWidth={2.5} />
           </div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">{t.profile}</p>
        </div>

        {/* Lista de Campos Otimizada */}
        <div className="space-y-3">
          {/* Campo: Nome (Editável) */}
          <div className="bg-white dark:bg-dark-card rounded-[32px] border border-white/50 dark:border-white/5 premium-shadow overflow-hidden transition-all">
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="p-2.5 bg-gray-50 dark:bg-dark-elevated rounded-xl text-gray-400">
                    <User size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 opacity-60">{t.name_label}</p>
                    {isEditingName ? (
                      <input 
                        ref={nameInputRef}
                        type="text" 
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-lg md:text-xl font-black text-gray-900 dark:text-white focus:ring-0"
                        autoFocus
                      />
                    ) : (
                      <p className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight truncate">{account.name}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isEditingName ? (
                    <>
                      <button 
                        onClick={() => { setIsEditingName(false); setNewName(account.name); setError(null); }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={20} />
                      </button>
                      <button 
                        onClick={handleUpdateName}
                        disabled={isLoading}
                        className="p-2 bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/20"
                      >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setIsEditingName(true)}
                      className="p-3 text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Campo: Email (Leitura) */}
          <div className="bg-white dark:bg-dark-card rounded-[32px] border border-white/50 dark:border-white/5 premium-shadow opacity-90 transition-all">
            <div className="p-5 md:p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2.5 bg-gray-50 dark:bg-dark-elevated rounded-xl text-gray-400">
                  <Mail size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 opacity-60">{t.email_label}</p>
                  <p className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight truncate">{account.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Campo: Senha (Trigger) */}
          <div className="bg-white dark:bg-dark-card rounded-[32px] border border-white/50 dark:border-white/5 premium-shadow transition-all">
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2.5 bg-gray-50 dark:bg-dark-elevated rounded-xl text-gray-400">
                    <Lock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 opacity-60">{t.password_label}</p>
                    <p className="text-lg md:text-xl font-black text-gray-300 dark:text-gray-700 tracking-[0.4em]">••••••••</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 bg-brand-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-brand-primary/20 active:scale-95 transition-all"
                >
                  {t.edit}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        <div className="mt-6 space-y-3">
          {error && (
            <div className="flex items-center space-x-3 text-red-500 bg-red-50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/10 animate-fade-in">
              <AlertCircle size={18} />
              <span className="text-xs font-black tracking-tight">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center space-x-3 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/10 animate-fade-in">
              <CheckCircle2 size={18} />
              <span className="text-xs font-black tracking-tight">{success}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal Alterar Senha Imersivo */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xl flex items-end md:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-t-[48px] md:rounded-[48px] p-8 md:p-10 premium-shadow animate-slide-up border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{t.change_password}</h2>
              <button onClick={() => { setIsChangingPassword(false); setError(null); setSuccess(null); }} className="p-3 bg-gray-100 dark:bg-dark-elevated rounded-2xl text-gray-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="relative group">
                <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={passwordData.current}
                  onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                  placeholder={t.current_password}
                  className="w-full bg-gray-50 dark:bg-dark-elevated border border-gray-100 dark:border-white/5 rounded-2xl pl-12 pr-12 py-4 font-bold focus:outline-none focus:border-brand-primary transition-all text-sm"
                />
                <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
                  {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative group">
                <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={passwordData.new}
                  onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                  placeholder={t.new_password}
                  className="w-full bg-gray-50 dark:bg-dark-elevated border border-gray-100 dark:border-white/5 rounded-2xl pl-12 pr-12 py-4 font-bold focus:outline-none focus:border-brand-primary transition-all text-sm"
                />
                <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative group">
                <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="password"
                  required
                  value={passwordData.confirm}
                  onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                  placeholder={t.confirm_new_password}
                  className="w-full bg-gray-50 dark:bg-dark-elevated border border-gray-100 dark:border-white/5 rounded-2xl pl-12 pr-5 py-4 font-bold focus:outline-none focus:border-brand-primary transition-all text-sm"
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading || !!success}
                className="w-full bg-brand-primary text-white py-5 rounded-3xl font-black text-base shadow-xl shadow-brand-primary/20 flex items-center justify-center space-x-3 active:scale-95 transition-all disabled:opacity-50 mt-4"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span>{t.save}</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;
