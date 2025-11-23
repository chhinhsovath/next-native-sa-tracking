import React, { createContext, useContext, ReactNode } from 'react';
import i18n from '../i18n';

interface I18nContextType {
  language: string;
  changeLanguage: (lng: string) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const value: I18nContextType = {
    language: i18n.language,
    changeLanguage,
    t: (key: string) => i18n.t(key) as string,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};