import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  try {
    // Load translations from database only
    const { TranslationSystem } = await import('@/lib/translation-system');
    
    const messages = await TranslationSystem.getTranslations(locale as 'lv' | 'en' | 'ru');
    
    return {
      locale,
      messages: messages || {},
      timeZone: 'Europe/Riga'
    };
  } catch (error) {
    console.error(`Error loading translations from database for locale ${locale}:`, error);
    return {
      locale,
      messages: {},
      timeZone: 'Europe/Riga'
    };
  }
});