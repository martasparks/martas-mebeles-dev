import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  console.log(`🎯 request.ts: Requested locale: ${requested}`);
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  console.log(`✅ request.ts: Final locale to use: ${locale}`);

  try {
    // Load translations from database only
    const { TranslationSystem } = await import('@/lib/translation-system');
    console.log(`🌐 request.ts: Loading translations for locale: ${locale}`);
    const messages = await TranslationSystem.getTranslations(locale as 'lv' | 'en' | 'ru');
    
    console.log(`🗄️ request.ts: Loaded ${Object.keys(messages || {}).length} namespace keys for ${locale}`);
    if (messages && Object.keys(messages).length > 0) {
      console.log(`📋 request.ts: Namespaces for ${locale}:`, Object.keys(messages));
      const header = (messages as any).Header;
      if (header) {
        console.log(`🏠 Header translations for ${locale}:`, header);
      }
    }
    
    return {
      locale,
      messages: messages || {}
    };
  } catch (error) {
    console.error(`Error loading translations from database for locale ${locale}:`, error);
    return {
      locale,
      messages: {}
    };
  }
});