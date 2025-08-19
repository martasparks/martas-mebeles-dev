'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { PlaceholderSlider } from '@/components/ui/placeholder-slider';

interface SliderTranslation {
  id: string;
  locale: string;
  title?: string;
  description?: string;
}

interface Slider {
  id: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  linkUrl?: string;
  sortOrder: number;
  isActive: boolean;
  translations: SliderTranslation[];
}

export function HomeSlider() {
  const t = useTranslations('Slider');
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [locale, setLocale] = useState('lv');

  useEffect(() => {
    fetchSliders();
    // Detect current locale from URL or browser
    const currentLocale = window.location.pathname.split('/')[1] || 'lv';
    if (['lv', 'en', 'ru'].includes(currentLocale)) {
      setLocale(currentLocale);
    }
  }, []);

  useEffect(() => {
    if (sliders.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliders.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [sliders.length]);

  const fetchSliders = async () => {
    try {
      const response = await fetch('/api/slider');
      const data = await response.json();
      console.log('Slider API response:', JSON.stringify(data, null, 2));
      setSliders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sliders:', error);
      setSliders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % sliders.length);
  };

  if (isLoading) {
    return (
      <section className="relative h-[400px] md:h-[600px] bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500">{t('loading')}</div>
        </div>
      </section>
    );
  }

  if (sliders.length === 0) {
    return <PlaceholderSlider />;
  }

  const currentSlider = sliders[currentSlide];

  if (!currentSlider) {
    return null;
  }

  const getSafeUrl = (url?: string) => {
    if (!url) return '';
    try {
      if (url.startsWith('//')) {
        return (typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'http:') + url;
      }
      if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
        return url.replace('http://', 'https://');
      }
      return url;
    } catch {
      return url;
    }
  };

  const SlideContent = () => {
    const mobileSrc = getSafeUrl(currentSlider.mobileImageUrl);
    const desktopSrc = getSafeUrl(currentSlider.desktopImageUrl);
    
    // Get translation for current locale
    const translation = currentSlider.translations.find(t => t.locale === locale) ||
                       currentSlider.translations.find(t => t.locale === 'lv') ||
                       currentSlider.translations[0];
    
    return (
      <div className="relative h-[400px] md:h-[600px] overflow-hidden">
        <picture>
          <source media="(min-width: 768px)" srcSet={desktopSrc} />
          <img
            src={mobileSrc || desktopSrc}
            alt={translation?.title || `Slide ${currentSlide + 1}`}
            className="absolute inset-0 w-full h-full object-cover z-0"
            onError={(e) => {
              console.error('Image failed to load:', e.currentTarget.src);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => console.log('Slider image loaded successfully')}
            loading={currentSlide === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </picture>

        {(translation?.title || translation?.description) && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-white px-4 max-w-4xl bg-gray rounded-lg py-8 px-6 backdrop-blur-sm">
              {translation?.title && (
                <h1 className="text-2xl md:text-5xl font-bold mb-4 text-black drop-shadow-lg">
                  {translation.title}
                </h1>
              )}
              {translation?.description && (
                <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto text-black drop-shadow-lg">
                  {translation.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="relative">
      {currentSlider.linkUrl ? (
        <Link href={currentSlider.linkUrl} className="block">
          <SlideContent />
        </Link>
      ) : (
        <SlideContent />
      )}

      {sliders.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all z-10"
            aria-label={t('previousSlide')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all z-10"
            aria-label={t('nextSlide')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {sliders.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {sliders.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={t('goToSlide', { number: index + 1 })}
            />
          ))}
        </div>
      )}
    </section>
  );
}