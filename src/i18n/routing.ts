import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  locales: ['en', 'lv', 'ru'],
  defaultLocale: 'lv'
});

export type Locale = typeof routing.locales[number];