import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Header() {
  const t = useTranslations('Header');

  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
              {t('storeName')}
            </Link>
          </div>

          <div className="hidden md:flex space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              {t('products')}
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              {t('categories')}
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              {t('about')}
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              {t('contact')}
            </Link>
          </div>

          <div className="flex space-x-4">
            <Link href="/cart" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              {t('cart')} (0)
            </Link>
            <Link href="/account" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              {t('account')}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}