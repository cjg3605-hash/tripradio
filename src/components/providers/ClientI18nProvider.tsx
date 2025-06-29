'use client';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import nextI18NextConfig from '../../../next-i18next.config.js';

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      ...nextI18NextConfig.i18n,
      fallbackLng: nextI18NextConfig.i18n.defaultLocale,
      interpolation: { escapeValue: false },
      resources: {},
    });
}

export default function ClientI18nProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
} 