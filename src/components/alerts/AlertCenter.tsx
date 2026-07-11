'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { broadcastAlert, stopBroadcast, type BroadcastLanguage } from '@/utils/audio-broadcast';
import type { WeatherSeverity } from '@/utils/weather-engine';
import type { WeatherPhase } from '@/schemas/genai-response';

interface WeatherApiResponse {
  severity: WeatherSeverity;
  recommendation: string;
  updatedAt: string;
}

interface AlertCenterProps {
  location: string;
}

const phaseOrder: WeatherPhase[] = ['before', 'during', 'after'];

export const AlertCenter: React.FC<AlertCenterProps> = ({ location }) => {
  const { t, locale } = useI18n();
  const [severity, setSeverity] = useState<WeatherSeverity>('moderate');
  const [recommendation, setRecommendation] = useState('Complete essential preparation early and monitor official alerts.');
  const [broadcastStatus, setBroadcastStatus] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadAlert() {
      try {
        const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = (await response.json()) as WeatherApiResponse;
        setSeverity(data.severity);
        setRecommendation(data.recommendation);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.warn('Alert center fallback is being used:', error);
        }
      }
    }

    loadAlert();

    return () => controller.abort();
  }, [location]);

  const phaseMessages = useMemo<Record<WeatherPhase, string>>(
    () => ({
      before: `${location}: ${recommendation}`,
      during: `${location}: Shelter in place during intense rainfall. Avoid flooded roads, open drains, and downed power lines.`,
      after: `${location}: Wait for official clearance, boil drinking water, document damage, and report hazards.`,
    }),
    [location, recommendation]
  );

  const phaseLabels: Record<WeatherPhase, string> = {
    before: t('beforePhase'),
    during: t('duringPhase'),
    after: t('afterPhase'),
  };

  const handleBroadcast = async (phase: WeatherPhase) => {
    const result = await broadcastAlert(phaseMessages[phase], locale as BroadcastLanguage);
    setBroadcastStatus(result.message);
  };

  return (
    <section className="rounded-2xl border border-monsoon-plum/15 bg-white/90 p-5 shadow-lg shadow-monsoon-plum/10 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-monsoon-rose">
            {t('alertCenterTitle')}
          </p>
          <h2 className="mt-1 text-xl font-black text-monsoon-plum">{location}</h2>
        </div>
        <span className="w-fit rounded-full bg-monsoon-yellow px-3 py-1 text-sm font-black capitalize text-monsoon-plum">
          {severity}
        </span>
      </div>

      <p className="mb-4 text-sm leading-6 text-monsoon-plum/75">{t('alertCenterSubtitle')}</p>

      <div className="grid gap-3">
        {phaseOrder.map((phase) => (
          <div key={phase} className="rounded-xl bg-monsoon-yellow/25 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-monsoon-plum">{phaseLabels[phase]}</p>
                <p className="mt-1 text-sm leading-6 text-monsoon-plum/75">{phaseMessages[phase]}</p>
              </div>
              <button
                type="button"
                onClick={() => handleBroadcast(phase)}
                className="w-full rounded-lg bg-monsoon-plum px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-monsoon-rose sm:w-auto"
              >
                {t('readAlertButton')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => {
            stopBroadcast();
            setBroadcastStatus(t('alertReadyMessage'));
          }}
          className="rounded-lg border border-monsoon-plum/20 px-3 py-2 text-sm font-bold text-monsoon-plum transition-colors hover:bg-monsoon-yellow/30"
        >
          {t('stopAlertButton')}
        </button>
        <p className="text-xs font-semibold text-monsoon-plum/60" aria-live="polite">
          {broadcastStatus || t('alertReadyMessage')}
        </p>
      </div>
    </section>
  );
};
