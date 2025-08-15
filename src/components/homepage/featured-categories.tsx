import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface Category {
  id: string;
  name: string;
  description: string;
  href: string;
  imageUrl?: string;
}

export function FeaturedCategories() {
  const t = useTranslations('HomePage.Categories');

  // Temporary static data - būs aizstājama ar datubāzes datiem
  const categories: Category[] = [
    {
      id: '1',
      name: t('livingRoom'),
      description: t('livingRoomDesc'),
      href: '/categories/living-room'
    },
    {
      id: '2', 
      name: t('bedroom'),
      description: t('bedroomDesc'),
      href: '/categories/bedroom'
    },
    {
      id: '3',
      name: t('kitchen'),
      description: t('kitchenDesc'), 
      href: '/categories/kitchen'
    },
    {
      id: '4',
      name: t('office'),
      description: t('officeDesc'),
      href: '/categories/office'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <div key={category.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                {/* Placeholder for image */}
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-blue-600 text-2xl font-bold">{category.name[0]}</span>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <Link href={category.href} className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                  {t('viewCategory')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}