'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { dictionaries, Dictionary, ValidLocale } from '@/i18n/dictionaries';

interface I18nContextProps {
  locale: ValidLocale;
  setLocale: (locale: ValidLocale) => void;
  t: (key: keyof Dictionary) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<ValidLocale>('en');

  // Translation utility with fallback to English
  const t = (key: keyof Dictionary): string => {
    const currentDict = dictionaries[locale] as any;
    const translation = currentDict[key] || dictionaries['en'][key];
    return translation as string;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
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
