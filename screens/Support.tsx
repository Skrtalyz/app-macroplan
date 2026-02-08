
import React from 'react';
import { ChevronLeft, Mail, HelpCircle, MessageCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { translations } from '../localization';

interface SupportProps {
  user: UserProfile;
  onBack: () => void;
}

const Support: React.FC<SupportProps> = ({ user, onBack }) => {
  const t = translations[user.language];

  const faqs = [
    { q: t.faq_1_q, a: t.faq_1_a },
    { q: t.faq_2_q, a: t.faq_2_a },
    { q: t.faq_3_q, a: t.faq_3_a },
    { q: t.faq_4_q, a: t.faq_4_a },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-10 transition-colors duration-300">
      <header className="sticky top-0 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md z-20 px-4 py-4 flex items-center border-b border-gray-100 dark:border-dark-border transition-colors">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-full transition-colors text-gray-600 dark:text-gray-400"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="flex-1 text-center font-bold text-gray-900 dark:text-dark-text mr-8">{t.support}</span>
      </header>

      <div className="p-6">
        <div className="bg-emerald-600 dark:bg-emerald-700 rounded-[32px] p-8 text-white mb-8 relative overflow-hidden premium-shadow transition-colors duration-300">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-black mb-2">{t.support_title}</h1>
            <p className="text-emerald-50 text-sm leading-relaxed opacity-90">
              {t.support_intro}
            </p>
          </div>
        </div>

        <section className="mb-10">
          <div className="flex items-center space-x-2 mb-6 ml-2">
            <HelpCircle size={20} className="text-emerald-600 dark:text-emerald-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text">{t.faq_title}</h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-dark-card p-6 rounded-[24px] premium-shadow border border-gray-50 dark:border-dark-border transition-colors">
                <h3 className="font-bold text-gray-900 dark:text-dark-text mb-2 leading-tight">{faq.q}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-dark-card rounded-[32px] p-8 premium-shadow border border-gray-100 dark:border-dark-border transition-colors duration-300">
          <div className="flex items-center space-x-2 mb-4">
            <MessageCircle size={20} className="text-emerald-600 dark:text-emerald-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text">{t.contact_title}</h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
            {t.contact_subtitle}
          </p>
          
          <div className="bg-gray-50 dark:bg-dark-elevated rounded-2xl p-4 flex items-center space-x-4 border border-gray-100 dark:border-dark-border transition-colors">
            <div className="w-12 h-12 bg-white dark:bg-dark-card rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 premium-shadow">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-widest">Email</p>
              <p className="text-gray-800 dark:text-gray-300 font-bold">suporte@macroplan.app</p>
            </div>
          </div>
        </section>

        <div className="mt-12 text-center">
          <p className="text-xs text-gray-300 dark:text-gray-600">MacroPlan Support v1.2.1</p>
        </div>
      </div>
    </div>
  );
};

export default Support;
