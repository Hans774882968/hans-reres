import { initReactI18next, useTranslation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en';
import i18n from 'i18next';
import zh from './zh';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    resources: {
      en: {
        translation: en
      },
      zh: {
        translation: zh
      }
    }
  });

export const $gt = (key: string | string[]) => {
  const { t } = useTranslation();
  return t(key);
};

export const langOptions = [
  { label: 'English', value: 'en' },
  { label: '中文', value: 'zh' }
];

export default i18n;
