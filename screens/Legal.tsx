
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { UserProfile } from '../types';
import { translations } from '../localization';

interface LegalProps {
  user: UserProfile;
  type: 'terms' | 'privacy';
  onBack: () => void;
}

const Legal: React.FC<LegalProps> = ({ user, type, onBack }) => {
  const t = translations[user.language];
  const isPT = user.language === 'pt-BR';

  const content = type === 'terms' ? {
    title: t.terms_title,
    update: '2026',
    intro: isPT 
      ? 'Ao utilizar o aplicativo MacroPlan, você concorda com os termos abaixo.'
      : 'By using the MacroPlan application, you agree to the terms below.',
    sections: isPT ? [
      { title: '1. Uso do aplicativo', text: 'O MacroPlan oferece estimativas nutricionais com base em análise de imagens feita por inteligência artificial. Os valores apresentados são aproximados e não substituem orientação médica ou nutricional profissional.' },
      { title: '2. Responsabilidade', text: 'O usuário é o único responsável pelo uso das informações fornecidas pelo app. O MacroPlan não se responsabiliza por decisões alimentares, resultados de saúde ou dietas baseadas exclusivamente no aplicativo.' },
      { title: '3. Acesso', text: '• Pagamento único\n• Acesso vitalício\n• Sem mensalidade\nO acesso é liberado após a confirmação do pagamento.' },
      { title: '4. Propriedade intelectual', text: 'Todo o conteúdo, layout, interface e tecnologia do MacroPlan pertencem aos seus desenvolvedores e não podem ser copiados ou redistribuídos sem autorização.' },
      { title: '5. Cancelamento e reembolso', text: 'O usuário pode solicitar reembolso em até 7 dias após a compra, conforme política exibida no site.' }
    ] : [
      { title: '1. Application Use', text: 'MacroPlan offers nutritional estimates based on AI image analysis. Values are approximate and do not replace professional medical or nutritional advice.' },
      { title: '2. Responsibility', text: 'The user is solely responsible for using information provided by the app. MacroPlan is not responsible for dietary decisions, health outcomes, or diets based exclusively on the app.' },
      { title: '3. Access', text: '• One-time payment\n• Lifetime access\n• No monthly fees\nAccess is granted after payment confirmation.' },
      { title: '4. Intellectual Property', text: 'All content, layout, interface, and technology of MacroPlan belong to its developers and cannot be copied or redistributed without authorization.' },
      { title: '5. Cancellation and Refund', text: 'The user may request a refund within 7 days of purchase, as per the policy on the website.' }
    ]
  } : {
    title: t.privacy_title,
    update: '2026',
    intro: isPT 
      ? 'Sua privacidade é levada a sério.'
      : 'Your privacy is taken seriously.',
    sections: isPT ? [
      { title: '1. Dados coletados', text: 'O MacroPlan não exige cadastro. Podemos coletar:\n• Imagens enviadas para análise\n• Dados nutricionais gerados\n• Preferências do app (idioma, unidade de medida)' },
      { title: '2. Uso das informações', text: 'As informações são usadas exclusivamente para:\n• Processar análises nutricionais\n• Melhorar a experiência no aplicativo' },
      { title: '3. Armazenamento', text: '• As imagens analisadas não são públicas\n• Preferências são salvas localmente no dispositivo\n• Não vendemos nem compartilhamos dados com terceiros' },
      { title: '4. Segurança', text: 'Utilizamos práticas de segurança padrão para proteger as informações processadas no app.' },
      { title: '5. Contato', text: 'Em caso de dúvidas sobre privacidade, o usuário pode entrar em contato pelos canais oficiais do MacroPlan.' }
    ] : [
      { title: '1. Data Collected', text: 'MacroPlan does not require registration. We may collect:\n• Images sent for analysis\n• Generated nutritional data\n• App preferences (language, unit of measure)' },
      { title: '2. Use of Information', text: 'Information is used exclusively for:\n• Processing nutritional analysis\n• Improving app experience' },
      { title: '3. Storage', text: '• Analyzed images are not public\n• Preferences are saved locally on the device\n• We do not sell or share data with third parties' },
      { title: '4. Security', text: 'We use standard security practices to protect information processed in the app.' },
      { title: '5. Contact', text: 'For privacy inquiries, users can contact us through official MacroPlan channels.' }
    ]
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg transition-colors duration-300">
      <header className="sticky top-0 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md z-20 px-4 py-4 flex items-center border-b border-gray-100 dark:border-dark-border">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-full transition-colors text-gray-600 dark:text-gray-400"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="flex-1 text-center font-bold text-gray-900 dark:text-dark-text mr-8">{t.back}</span>
      </header>
      
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-gray-900 dark:text-dark-text mb-2">{content.title}</h1>
        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-8">
          {t.last_update}: {content.update}
        </p>
        
        <p className="text-gray-600 dark:text-gray-400 mb-10 leading-relaxed font-medium">
          {content.intro}
        </p>

        <div className="space-y-10">
          {content.sections.map((section, idx) => (
            <section key={idx}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-3">{section.title}</h2>
              <div className="text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line text-sm">
                {section.text}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 pt-10 border-t border-gray-100 dark:border-dark-border text-center">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 mx-auto mb-4 font-bold transition-colors">
            M
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600">MacroPlan AI Nutrition • 2026</p>
        </div>
      </div>
    </div>
  );
};

export default Legal;
