import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  locales: ['en', 'lv', 'de'],
  defaultLocale: 'lv'
});

export type Locale = typeof routing.locales[number];