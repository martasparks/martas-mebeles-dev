import { cache } from 'react';
import { revalidateTag } from 'next/cache';
import prisma from './prisma';

export type TranslationKey = string;
export type Locale = 'lv' | 'en' | 'ru';
export type TranslationMessages = Record<string, unknown>;

class TranslationSystemClass{
  private getTranslationsFromDb = async (locale: Locale) => {
    try {
      console.log(`🔍 Fetching translations from DB for locale: ${locale}`);
      const translations = await prisma.translation.findMany({
        where: { locale },
        select: { key: true, value: true }
      });
      
      console.log(`📊 Found ${translations.length} translations for ${locale}`);
      if (translations.length > 0) {
        console.log(`🔤 Sample translations for ${locale}:`, translations.slice(0, 3).map(t => `${t.key}: ${t.value}`));
      }
      
      return translations.reduce((acc: TranslationMessages, { key, value }) => {
        const keys = key.split('.');
        let current = acc;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]] as TranslationMessages;
        }
        
        current[keys[keys.length - 1]] = value;
        return acc;
      }, {} as TranslationMessages);
    } catch (error) {
      console.error(`Failed to load translations for ${locale}:`, error);
      return {};
    }
  };

  async getTranslations(locale: Locale): Promise<TranslationMessages> {
    return this.getTranslationsFromDb(locale);
  }

  async upsertTranslation(
    key: string,
    locale: Locale,
    value: string,
    namespace?: string
  ) {
    const result = await prisma.translation.upsert({
      where: { key_locale: { key, locale } },
      update: { value, namespace, updatedAt: new Date() },
      create: { key, locale, value, namespace }
    });
    
    // Invalidate cache so next-intl picks up new translations
    try {
      revalidateTag(`translations-${locale}`);
    } catch (error) {
      console.warn('Could not revalidate cache:', error);
    }
    
    return result;
  }

  async upsertMultipleTranslations(
    translations: Array<{
      key: string;
      locale: Locale;
      value: string;
      namespace?: string;
    }>
  ) {
    const operations = translations.map(({ key, locale, value, namespace }) =>
      prisma.translation.upsert({
        where: { key_locale: { key, locale } },
        update: { value, namespace, updatedAt: new Date() },
        create: { key, locale, value, namespace }
      })
    );

    return prisma.$transaction(operations);
  }

  async getAllTranslations() {
    return prisma.translation.findMany({
      orderBy: [{ namespace: 'asc' }, { key: 'asc' }, { locale: 'asc' }]
    });
  }
}

export const TranslationSystem = new TranslationSystemClass();