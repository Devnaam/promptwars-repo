'use client';

import React, { useMemo } from 'react';
import { useI18n } from '@/contexts/I18nContext';

export interface WeatherData {
  status: 'Clear' | 'Warning' | 'Critical';
  temperature: number;
  messageKey: string;
  detailKey: string;
}

export const WeatherAdvisory: React.FC = () => {
  const { t } = useI18n();

  // Mocked weather data. useMemo is used to avoid recalculation on every render
  // This structure makes it extremely easy to swap in a real API call later.
  const weather: WeatherData = useMemo(() => ({
    status: 'Warning',
    temperature: 28,
    messageKey: 'weatherWarning',
    detailKey: 'weatherDetail'
  }), []);

  // Accessible color themes based on status
  const getStatusColor = (status: WeatherData['status']) => {
    switch (status) {
      case 'Clear': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800';
      case 'Warning': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800';
      case 'Critical': return 'bg-rose-50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100 border-rose-200 dark:border-rose-800';
      default: return 'bg-slate-50 dark:bg-slate-900/30 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <section 
      className={`p-6 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md ${getStatusColor(weather.status)}`}
      aria-labelledby="weather-heading"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 id="weather-heading" className="text-xl font-bold flex items-center gap-2">
          {weather.status === 'Warning' && (
            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {t('weatherAdvisoryTitle')}
        </h2>
        <span className="text-3xl font-black tracking-tight">{weather.temperature}°C</span>
      </div>
      
      <div className="bg-white/60 dark:bg-black/40 rounded-xl p-4 backdrop-blur-sm">
        <h3 className="font-semibold text-lg mb-1">{t(weather.messageKey as any)}</h3>
        <p className="opacity-90 leading-relaxed text-sm md:text-base">{t(weather.detailKey as any)}</p>
      </div>
    </section>
  );
};
