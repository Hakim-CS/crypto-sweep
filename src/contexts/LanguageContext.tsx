
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'tr';

type Translations = {
  [key: string]: {
    en: string;
    tr: string;
  };
};

// Add all translations here
const translations: Translations = {
  cryptoTracker: {
    en: 'Crypto Tracker',
    tr: 'Kripto Takipçisi'
  },
  welcomeBack: {
    en: 'Welcome back',
    tr: 'Tekrar hoş geldiniz'
  },
  welcomeAdmin: {
    en: 'Welcome admin',
    tr: 'Hoş geldiniz yönetici'
  },
  trackPortfolio: {
    en: 'Track and manage your crypto portfolio',
    tr: 'Kripto portföyünüzü takip edin ve yönetin'
  },
  signInToManage: {
    en: 'Sign in to manage your portfolio',
    tr: 'Portföyünüzü yönetmek için giriş yapın'
  },
  goToWallet: {
    en: 'Go to Wallet',
    tr: 'Cüzdana Git'
  },
  education: {
    en: 'Education',
    tr: 'Eğitim'
  },
  wallet: {
    en: 'Wallet',
    tr: 'Cüzdan'
  },
  info: {
    en: 'Info',
    tr: 'Bilgi'
  },
  backToList: {
    en: 'Back to list',
    tr: 'Listeye dön'
  },
  loadingChart: {
    en: 'Loading chart...',
    tr: 'Grafik yükleniyor...'
  },
  home: {
    en: 'Home',
    tr: 'Ana Sayfa'
  },
  authRequired: {
    en: 'Authentication Required',
    tr: 'Kimlik Doğrulama Gerekli'
  },
  signInForWatchlist: {
    en: 'Please sign in to add cryptocurrencies to your watchlist',
    tr: 'İzleme listenize kripto para eklemek için lütfen giriş yapın'
  },
  removedFromWatchlist: {
    en: 'Removed from Watchlist',
    tr: 'İzleme Listesinden Kaldırıldı'
  },
  addedToWatchlist: {
    en: 'Added to Watchlist',
    tr: 'İzleme Listesine Eklendi'
  },
  hasBeenRemoved: {
    en: 'has been removed from your watchlist',
    tr: 'izleme listenizden kaldırıldı'
  },
  hasBeenAdded: {
    en: 'has been added to your watchlist',
    tr: 'izleme listenize eklendi'
  },
  error: {
    en: 'Error',
    tr: 'Hata'
  },
  unexpectedError: {
    en: 'An unexpected error occurred',
    tr: 'Beklenmeyen bir hata oluştu'
  },
  removeFromWatchlist: {
    en: 'Remove from watchlist',
    tr: 'İzleme listesinden kaldır'
  },
  addToWatchlist: {
    en: 'Add to watchlist',
    tr: 'İzleme listesine ekle'
  },
  watchlist: {
    en: 'Watchlist',
    tr: 'İzleme Listesi'
  },
  add: {
    en: 'Add',
    tr: 'Ekle'
  },
  emptyWatchlist: {
    en: 'Your watchlist is empty. Add coins from the market to track them here!',
    tr: 'İzleme listeniz boş. Burada takip etmek için piyasadan coin ekleyin!'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'en' || savedLanguage === 'tr') {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
