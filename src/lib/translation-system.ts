import { cache } from 'react';
import prisma from './prisma';

export type TranslationKey = string;
export type Locale = 'lv' | 'en' | 'ru';
export type TranslationMessages = Record<string, unknown>;

class TranslationSystemClass{
  private getTranslationsFromDb = cache(async (locale: Locale) => {
    try {
      const translations = await prisma.translation.findMany({
        where: { locale },
        select: { key: true, value: true }
      });
      
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
  });

  async getTranslations(locale: Locale): Promise<TranslationMessages> {
    return this.getTranslationsFromDb(locale);
  }

  async upsertTranslation(
    key: string,
    locale: Locale,
    value: string,
    namespace?: string
  ) {
    return prisma.translation.upsert({
      where: { key_locale: { key, locale } },
      update: { value, namespace, updatedAt: new Date() },
      create: { key, locale, value, namespace }
    });
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