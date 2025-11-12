import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { ru, TranslationKeys } from '../locales/ru';
import { en } from '../locales/en';

type Language = 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const translations: Record<Language, TranslationKeys> = {
  ru,
  en,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [language, setLanguageState] = useState<Language>('ru'); // Russian by default

  // Load language from user profile or localStorage
  useEffect(() => {
    if (userProfile?.language) {
      setLanguageState(userProfile.language as Language);
    } else {
      const savedLang = localStorage.getItem('language') as Language;
      if (savedLang && (savedLang === 'ru' || savedLang === 'en')) {
        setLanguageState(savedLang);
      }
    }
  }, [userProfile]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);

    // Save to user profile if logged in
    if (user && userProfile) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { language: lang });
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
