
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available languages
export type Language = 'en' | 'tr';

// Define translation object type
export type Translations = {
  [key: string]: {
    en: string;
    tr: string;
  };
};

// Create translations object
export const translations: Translations = {
  // Navigation
  home: { en: 'Home', tr: 'Ana Sayfa' },
  wallet: { en: 'Wallet', tr: 'Cüzdan' },
  education: { en: 'Education', tr: 'Eğitim' },
  signIn: { en: 'Sign In', tr: 'Giriş Yap' },
  signUp: { en: 'Sign Up', tr: 'Kayıt Ol' },
  
  // Common
  welcomeBack: { en: 'Welcome back', tr: 'Tekrar hoşgeldiniz' },
  welcomeAdmin: { en: 'Welcome Admin', tr: 'Hoşgeldiniz Yönetici' },
  cryptoTracker: { en: 'Cryptocurrency Tracker', tr: 'Kripto Para Takipçisi' },
  trackPortfolio: { en: 'Track your portfolio and favorite cryptocurrencies', tr: 'Portföyünüzü ve favori kripto paralarınızı takip edin' },
  signInToManage: { en: 'Sign in to start managing your crypto portfolio', tr: 'Kripto portföyünüzü yönetmeye başlamak için giriş yapın' },
  goToWallet: { en: 'Go to Wallet', tr: 'Cüzdana Git' },
  backToList: { en: 'Back to List', tr: 'Listeye Dön' },
  loadingChart: { en: 'Loading chart data...', tr: 'Grafik verileri yükleniyor...' },
  
  // Educational Content
  educationalResources: { en: 'Educational Resources', tr: 'Eğitim Kaynakları' },
  learnAboutCrypto: { en: 'Learn about cryptocurrencies and trading strategies', tr: 'Kripto paralar ve ticaret stratejileri hakkında bilgi edinin' },
  cryptoGlossary: { en: 'Crypto Glossary', tr: 'Kripto Sözlüğü' },
  tradingStrategies: { en: 'Trading Strategies', tr: 'Ticaret Stratejileri' },
  newsSources: { en: 'News Sources', tr: 'Haber Kaynakları' },
  visitSite: { en: 'Visit Site', tr: 'Siteyi Ziyaret Et' },
  
  // Glossary Terms
  blockchain: { 
    en: 'A digital ledger of transactions that is duplicated and distributed across the entire network of computer systems.', 
    tr: 'Bilgisayar sistemlerinin tüm ağına kopyalanan ve dağıtılan dijital bir işlem defteri.' 
  },
  cryptocurrency: { 
    en: 'A digital or virtual currency that is secured by cryptography, making it nearly impossible to counterfeit.', 
    tr: 'Taklit edilmesini neredeyse imkansız hale getiren kriptografi ile güvence altına alınmış dijital veya sanal para birimi.' 
  },
  bitcoin: { 
    en: 'The first and most well-known cryptocurrency, created in 2009 by an unknown person using the alias Satoshi Nakamoto.', 
    tr: 'Satoshi Nakamoto takma adını kullanan bilinmeyen bir kişi tarafından 2009 yılında oluşturulan ilk ve en iyi bilinen kripto para birimi.' 
  },
  ethereum: { 
    en: 'A decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform.', 
    tr: 'Akıllı sözleşme işlevselliğine sahip merkezi olmayan, açık kaynaklı bir blok zinciri. Ether, platformun yerel kripto para birimidir.' 
  },
  altcoin: { 
    en: 'Any cryptocurrency other than Bitcoin. Examples include Ethereum, Ripple, and Litecoin.', 
    tr: 'Bitcoin dışındaki herhangi bir kripto para. Örnekler arasında Ethereum, Ripple ve Litecoin bulunur.' 
  },
  mining: { 
    en: 'The process of validating transactions and adding them to the blockchain ledger, typically requiring powerful computers.', 
    tr: 'İşlemleri doğrulama ve blok zinciri defterine ekleme süreci, genellikle güçlü bilgisayarlar gerektirir.' 
  },
  wallet: { 
    en: 'A digital tool that allows users to store and manage their cryptocurrencies.', 
    tr: 'Kullanıcıların kripto paralarını depolamasına ve yönetmesine olanak tanıyan dijital bir araç.' 
  },
  defi: { 
    en: 'Decentralized Finance - financial services using smart contracts on blockchains, operating without centralized authorities.', 
    tr: 'Merkezi Olmayan Finans - blok zincirleri üzerinde akıllı sözleşmeler kullanarak, merkezi otoriteler olmadan çalışan finansal hizmetler.' 
  },
  nft: { 
    en: 'Non-Fungible Token - a unique digital asset that represents ownership of a specific item or piece of content.', 
    tr: 'Değiştirilemez Token - belirli bir öğenin veya içerik parçasının sahipliğini temsil eden benzersiz bir dijital varlık.' 
  },
  hodl: { 
    en: 'A term derived from a misspelling of "hold" that refers to buying and holding cryptocurrency rather than selling it.', 
    tr: 'Kripto parayı satmak yerine satın almak ve tutmak anlamına gelen "hold" (tutmak) kelimesinin yanlış yazımından türetilmiş bir terim.' 
  },
  
  // Trading Strategies
  dollarCostAveraging: { 
    en: 'Investing a fixed amount regularly regardless of market conditions to reduce the impact of volatility.', 
    tr: 'Volatilitenin etkisini azaltmak için piyasa koşullarına bakılmaksızın düzenli olarak sabit bir miktar yatırım yapmak.' 
  },
  hodlStrategy: { 
    en: 'Buying and holding cryptocurrency for the long term, ignoring short-term market fluctuations.', 
    tr: 'Kısa vadeli piyasa dalgalanmalarını görmezden gelerek, uzun vadeli kripto para satın almak ve tutmak.' 
  },
  swingTrading: { 
    en: 'Capitalizing on "swings" in prices by holding assets for a period of days or weeks.', 
    tr: 'Varlıkları günler veya haftalar boyunca tutarak fiyatlardaki "salınımlardan" yararlanmak.' 
  },

  // Steps for strategies
  step1DCA: { 
    en: 'Decide on a fixed amount you\'re comfortable investing regularly', 
    tr: 'Düzenli olarak yatırım yapmaktan memnun olduğunuz sabit bir miktar belirleyin' 
  },
  step2DCA: { 
    en: 'Choose a schedule (weekly, bi-weekly, monthly)', 
    tr: 'Bir program seçin (haftalık, iki haftada bir, aylık)' 
  },
  step3DCA: { 
    en: 'Stick to your schedule regardless of price fluctuations', 
    tr: 'Fiyat dalgalanmalarına bakılmaksızın programınıza bağlı kalın' 
  },
  step4DCA: { 
    en: 'This reduces the impact of market volatility on your overall purchase price', 
    tr: 'Bu, piyasa oynaklığının genel satın alma fiyatınız üzerindeki etkisini azaltır' 
  },
  
  step1HODL: { 
    en: 'Research projects you believe have long-term potential', 
    tr: 'Uzun vadeli potansiyele sahip olduğuna inandığınız projeleri araştırın' 
  },
  step2HODL: { 
    en: 'Purchase those cryptocurrencies', 
    tr: 'Bu kripto paraları satın alın' 
  },
  step3HODL: { 
    en: 'Hold them for an extended period (years)', 
    tr: 'Onları uzun bir süre (yıllar) boyunca tutun' 
  },
  step4HODL: { 
    en: 'Ignore day-to-day price fluctuations', 
    tr: 'Günlük fiyat dalgalanmalarını görmezden gelin' 
  },
  
  step1Swing: { 
    en: 'Identify cryptocurrencies with historical price volatility', 
    tr: 'Geçmiş fiyat oynaklığına sahip kripto paraları belirleyin' 
  },
  step2Swing: { 
    en: 'Study technical indicators like RSI, MACD, and moving averages', 
    tr: 'RSI, MACD ve hareketli ortalamalar gibi teknik göstergeleri inceleyin' 
  },
  step3Swing: { 
    en: 'Buy during downtrends when you believe the price is near bottom', 
    tr: 'Fiyatın dibe yakın olduğuna inandığınızda düşüş trendleri sırasında satın alın' 
  },
  step4Swing: { 
    en: 'Sell when the asset reaches what you consider a temporary peak', 
    tr: 'Varlık geçici bir zirveye ulaştığını düşündüğünüzde satın' 
  },
  
  // Language switcher
  language: { en: 'Language', tr: 'Dil' },
  english: { en: 'English', tr: 'İngilizce' },
  turkish: { en: 'Turkish', tr: 'Türkçe' },
};

// Create context type
type LanguageContextType = {
  language: Language;
  t: (key: string) => string;
  changeLanguage: (lang: Language) => void;
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  t: () => '',
  changeLanguage: () => {},
});

// Create provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Try to get language from local storage or default to 'en'
  const [language, setLanguage] = useState<Language>(() => {
    const storedLanguage = localStorage.getItem('language');
    return (storedLanguage === 'tr' ? 'tr' : 'en') as Language;
  });

  // Update local storage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key "${key}" not found!`);
      return key;
    }
    return translations[key][language];
  };

  // Change language function
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using language context
export const useLanguage = () => useContext(LanguageContext);
