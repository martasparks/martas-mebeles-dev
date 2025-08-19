'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { PlaceholderSlider } from '@/components/ui/placeholder-slider';

interface Slider {
  id: string;
  title?: string;
  description?: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  linkUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export function HomeSlider() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSliders();
  }, []);

  useEffect(() => {
    if (sliders.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliders.length);
      }, 5000); // Auto-advance every 5 seconds

      return () => clearInterval(interval);
    }
  }, [sliders.length]);

  const fetchSliders = async () => {
    try {
      const response = await fetch('/api/slider');
      const data = await response.json();
      console.log('Slider API response:', data);
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
          <div className="text-gray-500">Ielādē...</div>
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

  const SlideContent = () => (
    <div className="relative h-[400px] md:h-[600px] overflow-hidden">
      {/* Mobile Image */}
      <div className="block md:hidden">
        <img
          src={currentSlider.mobileImageUrl}
          alt={currentSlider.title || `Slide ${currentSlide + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Desktop Image */}
      <div className="hidden md:block">
        <img
          src={currentSlider.desktopImageUrl}
          alt={currentSlider.title || `Slide ${currentSlide + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay Content */}
      {(currentSlider.title || currentSlider.description) && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            {currentSlider.title && (
              <h1 className="text-2xl md:text-5xl font-bold mb-4">
                {currentSlider.title}
              </h1>
            )}
            {currentSlider.description && (
              <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
                {currentSlider.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section className="relative">
      {currentSlider.linkUrl ? (
        <Link href={currentSlider.linkUrl} className="block">
          <SlideContent />
        </Link>
      ) : (
        <SlideContent />
      )}

      {/* Navigation Arrows */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg transition-all z-10"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg transition-all z-10"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {sliders.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {sliders.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}