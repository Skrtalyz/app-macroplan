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
    
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const accounts: UserAccount[] = JSON.parse(localStorage.getItem('macroplan_accounts') || '[]');
      const idx = accounts.findIndex(acc => acc.id === user.accountId);

      if (idx !== -1) {
        accounts[idx].name = newName.trim();
        localStorage.setItem('macroplan_accounts', JSON.stringify(accounts));
        
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
      
      if (currentAcc.password !== hashedCurrentInput) throw new Error(t.password_error_invalid);
      if (passwordData.new !== passwordData.confirm) throw new Error(t.passwords_not_match);
      if (passwordData.new.length < 6) throw new Error('Senha muito curta.');

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
      <header className="px-4 py-4 md:py-6 flex items-center justify-between sticky top-0 bg-transparent z-40 backdrop-blur-sm">
        <button onClick={onBack} className="p-3 bg-white dark:bg-dark-elevated rounded-2xl text-gray-500 shadow-sm border border-gray-100 dark:border-white/5 active:scale-90 transition-all">
          <ChevronLeft size={20} strokeWidth={3} />
        </button>
        <h1 className="font-black text-gray-900 dark:text-dark-text text-base md:text-lg tracking-tight">{t.personal_info}</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-24 scrollbar-hide">
        <div className="flex flex-col items-center mb-6 md:mb-10">
           <div className="w-20 h-20 md:w-24 md:h-24 bg-brand-primary/10 rounded-[32px] md:rounded-[40px] flex items-center justify-center text-brand-primary mb-4 shadow-inner relative overflow-hidden group">
              <User className="w-9 h-9 md:w-12 md:h-12" strokeWidth={2.5} />
           </div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">{t.profile}</p>
        </div>

        <div className="space-y-3">
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
                      <button onClick={() => setIsEditingName(false)} className="p-2 text-gray-400"><X size={20} /></button>
                      <button onClick={handleUpdateName} className="p-2 bg-brand-primary text-white rounded-xl">
                        <Check size={20} />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditingName(true)} className="p-3 text-brand-primary"><Edit2 size={18} /></button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;