import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

import en from './en.json';
import tr from './tr.json';
import { useSettings } from '@/stores/settings';

// i18n kurulumu. Dil: ayarlardan; 'system' cihaz dilini izler (TR dışı → EN).

export type AppLocale = 'tr' | 'en';

export function deviceLocale(): AppLocale {
  const code = getLocales()[0]?.languageCode;
  return code === 'tr' ? 'tr' : 'en';
}

export function resolveLocale(setting: 'system' | 'tr' | 'en'): AppLocale {
  return setting === 'system' ? deviceLocale() : setting;
}

// eslint-disable-next-line import/no-named-as-default-member -- i18next varsayılan API'si
i18n.use(initReactI18next).init({
  resources: { tr: { translation: tr }, en: { translation: en } },
  lng: resolveLocale(useSettings.getState().language),
  fallbackLng: 'tr',
  interpolation: { escapeValue: false },
});

// Ayar değişince dili canlı güncelle
useSettings.subscribe((state, prev) => {
  if (state.language !== prev.language) {
    // eslint-disable-next-line import/no-named-as-default-member -- i18next varsayılan API'si
    i18n.changeLanguage(resolveLocale(state.language));
  }
});

/** Katalog metinleri için aktif dil: session.title[locale] */
export function useLocale(): AppLocale {
  const { i18n: instance } = useTranslation();
  return instance.language === 'en' ? 'en' : 'tr';
}

export default i18n;
