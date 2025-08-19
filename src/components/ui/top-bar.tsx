'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';

export function TopBar() {
  const t = useTranslations('TopBar');
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [message, setMessage] = useState<string>('');
  const [locale, setLocale] = useState('lv');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const currentLocale = window.location.pathname.split('/')[1] || 'lv';
        if (['lv', 'en', 'ru'].includes(currentLocale)) {
          setLocale(currentLocale);
        }
        
        const response = await fetch('/api/topbar');
        const messages = await response.json();
        setMessage(messages[currentLocale] || messages.lv || t('message'));
      } catch (error) {
        console.error('Error fetching top bar message:', error);
        setMessage(t('message'));
      }
    };
    
    fetchMessages();
  }, [t]);

  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      if (!isPaused && scrollRef.current) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const duration = 20;
        const progress = (elapsed % duration) / duration;
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
    const duration = 20;
    const progress = (100 - currentPosition) / 200;
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
        <span className="text-md font-medium">
          {message}
        </span>
      </div>
    </div>
  );
}