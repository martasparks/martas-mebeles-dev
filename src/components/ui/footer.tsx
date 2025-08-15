import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-bold mb-4">{t('storeName')}</h3>
            <p className="text-gray-400 text-sm">{t('description')}</p>
          </div>

          <div className="col-span-1">
            <h4 className="text-md font-semibold mb-4">{t('quickLinks')}</h4>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-gray-400 hover:text-white text-sm">{t('products')}</Link></li>
              <li><Link href="/categories" className="text-gray-400 hover:text-white text-sm">{t('categories')}</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white text-sm">{t('about')}</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm">{t('contact')}</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-md font-semibold mb-4">{t('customerService')}</h4>
            <ul className="space-y-2">
              <li><Link href="/shipping" className="text-gray-400 hover:text-white text-sm">{t('shipping')}</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-white text-sm">{t('returns')}</Link></li>
              <li><Link href="/warranty" className="text-gray-400 hover:text-white text-sm">{t('warranty')}</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white text-sm">{t('faq')}</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-md font-semibold mb-4">{t('contact')}</h4>
            <p className="text-gray-400 text-sm mb-2">{t('phone')}: +371 12345678</p>
            <p className="text-gray-400 text-sm mb-2">{t('email')}: info@martasmebeles.lv</p>
            <p className="text-gray-400 text-sm">{t('address')}: Rīga, Latvija</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-400 text-sm">
            © 2024 {t('storeName')}. {t('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}