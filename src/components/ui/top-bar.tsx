'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';

export function TopBar() {
  const t = useTranslations('TopBar');
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      if (!isPaused && scrollRef.current) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000; // seconds
        const duration = 20; // 20 seconds for full cycle
        const progress = (elapsed % duration) / duration;
        
        // Move from 100% to -100% (200% total distance)
        const position = 100 - (progress * 200);
        setCurrentPosition(position);
        scrollRef.current.style.transform = `translateX(${position}%)`;
      }
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPaused]);

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    // Adjust start time to continue from current position
    const duration = 20;
    const progress = (100 - currentPosition) / 200; // Current progress in cycle
    startTimeRef.current = Date.now() - (progress * duration * 1000);
    setIsPaused(false);
  };

  return (
    <div className="bg-blue-600 text-white py-2 overflow-hidden">
      <div 
        ref={scrollRef}
        className="whitespace-nowrap"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className="text-sm font-medium">
          {t('message')} • {t('message')} • {t('message')} • {t('message')} • {t('message')} • {t('message')} • {t('message')} • {t('message')} • 
        </span>
      </div>
    </div>
  );
}