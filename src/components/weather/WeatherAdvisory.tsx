'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import type { Dictionary } from '@/i18n/dictionaries';
import { calculateSeverity, generateTravelAdvisory, type WeatherSeverity } from '@/utils/weather-engine';

export interface WeatherData {
  status: 'Clear' | 'Warning' | 'Critical';
  temperature: number;
  rainfallMm: number;
  windSpeedKmh: number;
  visibilityKm: number;
  floodRiskPercent: number;
  recommendation?: string;
  source?: string;
  updatedAt?: string;
  messageKey: keyof Dictionary;
  detailKey: keyof Dictionary;
}

interface WeatherApiResponse {
  location: string;
  temperatureC: number;
  rainfallMm: number;
  windSpeedKmh: number;
  visibilityKm: number;
  floodRiskPercent: number;
  severity: WeatherSeverity;
  recommendation: string;
  source: string;
  updatedAt: string;
}

const fallbackWeather: WeatherData = {
  status: 'Warning',
  temperature: 28,
  rainfallMm: 86,
  windSpeedKmh: 42,
  visibilityKm: 3.2,
  floodRiskPercent: 38,
  messageKey: 'weatherWarning',
  detailKey: 'weatherDetail',
};

function severityToStatus(severity: WeatherSeverity): WeatherData['status'] {
  if (severity === 'critical' || severity === 'high') return 'Critical';
  if (severity === 'moderate') return 'Warning';
  return 'Clear';
}

interface WeatherAdvisoryProps {
  location: string;
}

export const WeatherAdvisory: React.FC<WeatherAdvisoryProps> = ({ location }) => {
  const { t } = useI18n();
  const [weather, setWeather] = useState<WeatherData>(fallbackWeather);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadWeather() {
      try {
        const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;

        const data = (await response.json()) as WeatherApiResponse;
        setWeather({
          status: severityToStatus(data.severity),
          temperature: data.temperatureC,
          rainfallMm: data.rainfallMm,
          windSpeedKmh: data.windSpeedKmh,
          visibilityKm: data.visibilityKm,
          floodRiskPercent: data.floodRiskPercent,
          recommendation: data.recommendation,
          source: data.source,
          updatedAt: data.updatedAt,
          messageKey: 'weatherWarning',
          detailKey: 'weatherDetail',
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.warn('Weather advisory fallback is being used:', error);
        }
      } finally {
        setLoading(false);
      }
    }

    loadWeather();

    return () => controller.abort();
  }, [location]);

  const severity = useMemo(
    () =>
      calculateSeverity({
        rainfallMm: weather.rainfallMm,
        windSpeedKmh: weather.windSpeedKmh,
        visibilityKm: weather.visibilityKm,
        floodRiskPercent: weather.floodRiskPercent,
      }),
    [weather]
  );

  const advisory = useMemo(() => generateTravelAdvisory(severity, 'before'), [severity]);

  const getStatusColor = (status: WeatherData['status']) => {
    switch (status) {
      case 'Clear':
        return 'border-monsoon-plum/15 bg-white text-monsoon-plum';
      case 'Warning':
        return 'border-monsoon-orange/40 bg-monsoon-yellow/55 text-monsoon-plum';
      case 'Critical':
        return 'border-monsoon-rose/50 bg-monsoon-rose/10 text-monsoon-plum';
      default:
        return 'border-monsoon-plum/15 bg-white text-monsoon-plum';
    }
  };

  const updatedLabel = weather.updatedAt
    ? new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
      }).format(new Date(weather.updatedAt))
    : 'mock baseline';

  return (
    <section
      className={`rounded-2xl border p-5 shadow-lg shadow-monsoon-plum/10 transition-all duration-300 sm:p-6 ${getStatusColor(weather.status)}`}
      aria-labelledby="weather-heading"
      aria-busy={loading}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="weather-heading" className="flex min-w-0 items-center gap-2 text-lg font-black sm:text-xl">
          {weather.status !== 'Clear' && (
            <svg className="h-6 w-6 shrink-0 animate-pulse text-monsoon-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span className="break-words">{t('weatherAdvisoryTitle')}</span>
        </h2>
        <span className="w-fit rounded-xl bg-white/70 px-3 py-1 text-2xl font-black tracking-tight sm:text-3xl">
          {weather.temperature}&deg;C
        </span>
      </div>

      <div className="rounded-xl bg-white/75 p-4 backdrop-blur-sm">
        <h3 className="mb-1 text-lg font-semibold">{t(weather.messageKey)}</h3>
        <p className="text-sm leading-relaxed opacity-90 md:text-base">{t(weather.detailKey)}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-xl bg-white/65 p-3">
          <p className="font-bold">{weather.rainfallMm} mm</p>
          <p className="text-monsoon-plum/65">Rainfall</p>
        </div>
        <div className="rounded-xl bg-white/65 p-3">
          <p className="font-bold">{weather.windSpeedKmh} km/h</p>
          <p className="text-monsoon-plum/65">Wind</p>
        </div>
        <div className="rounded-xl bg-white/65 p-3">
          <p className="font-bold">{weather.visibilityKm} km</p>
          <p className="text-monsoon-plum/65">Visibility</p>
        </div>
        <div className="rounded-xl bg-white/65 p-3">
          <p className="font-bold capitalize">{severity}</p>
          <p className="text-monsoon-plum/65">Risk</p>
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-monsoon-plum px-4 py-3 text-sm font-semibold leading-6 text-white">
        {weather.recommendation ?? advisory.recommendation}
      </p>

      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-monsoon-plum/55">
        {location} | {weather.source ?? 'mock-weather-engine'} | {updatedLabel}
      </p>
    </section>
  );
};
