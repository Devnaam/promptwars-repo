'use client';

import React, { useState, useCallback } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { dictionaries, ValidLocale } from '@/i18n/dictionaries';
import type { WeatherPhase } from '@/schemas/genai-response';

type PhaseText = Record<WeatherPhase, string>;
type PhaseChecklist = Record<WeatherPhase, string[]>;

export interface PlanData {
  preparednessPlan: PhaseText;
  travelAdvisory: string;
  emergencyChecklists: PhaseChecklist;
  safetyRecommendations: string[];
}

interface PersonalizedPlanFormProps {
  onPlanGenerated: (plan: PlanData) => void;
}

export const PersonalizedPlanForm: React.FC<PersonalizedPlanFormProps> = ({ onPlanGenerated }) => {
  const { t, locale, setLocale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const location = formData.get('location') as string;
    const familySizeStr = formData.get('familySize') as string;
    const vulnerabilitiesStr = formData.get('vulnerabilities') as string;

    const vulnerabilities = vulnerabilitiesStr 
      ? vulnerabilitiesStr.split(',').map(v => v.trim()).filter(v => v) 
      : [];

    const payload = {
      location,
      familySize: parseInt(familySizeStr, 10),
      vulnerabilities,
      language: locale // Send the current language context to GenAI backend
    };

    try {
      const response = await fetch('/api/preparedness-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        setError(t('errorMessage'));
        return;
      }

      const data: PlanData = await response.json();
      onPlanGenerated(data);
    } catch {
      // Set local component error state instead of triggering ErrorBoundary
      setError(t('errorMessage'));
    } finally {
      setLoading(false);
    }
  }, [t, locale, onPlanGenerated]);

  return (
    <form 
      onSubmit={handleSubmit} 
      className="rounded-2xl border border-monsoon-plum/15 bg-white/90 p-5 shadow-xl shadow-monsoon-plum/10 transition-all sm:p-6 lg:p-8"
      aria-label={t('formTitle')}
    >
      <h2 className="mb-6 text-2xl font-bold text-monsoon-plum">{t('formTitle')}</h2>
      
      {error && (
        <div className="mb-6 rounded-xl border border-monsoon-rose/30 bg-monsoon-yellow/30 p-4 text-sm font-medium text-monsoon-plum" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label htmlFor="location" className="mb-1.5 block text-sm font-semibold text-monsoon-plum">
            {t('locationLabel')}
          </label>
          <input 
            type="text" 
            id="location" 
            name="location" 
            required 
            minLength={2}
            className="w-full rounded-xl border border-monsoon-plum/20 bg-white px-4 py-3.5 text-monsoon-plum outline-none transition-all placeholder:text-monsoon-plum/45 focus:border-monsoon-rose focus:ring-4 focus:ring-monsoon-yellow/60"
            placeholder={t('locationPlaceholder')}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="familySize" className="mb-1.5 block text-sm font-semibold text-monsoon-plum">
            {t('familySizeLabel')}
          </label>
          <input 
            type="number" 
            id="familySize" 
            name="familySize" 
            required 
            min={1} 
            max={20}
            defaultValue={1}
            className="w-full rounded-xl border border-monsoon-plum/20 bg-white px-4 py-3.5 text-monsoon-plum outline-none transition-all focus:border-monsoon-rose focus:ring-4 focus:ring-monsoon-yellow/60"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="vulnerabilities" className="mb-1.5 block text-sm font-semibold text-monsoon-plum">
            {t('vulnerabilitiesLabel')}
          </label>
          <input 
            type="text" 
            id="vulnerabilities" 
            name="vulnerabilities" 
            className="w-full rounded-xl border border-monsoon-plum/20 bg-white px-4 py-3.5 text-monsoon-plum outline-none transition-all placeholder:text-monsoon-plum/45 focus:border-monsoon-rose focus:ring-4 focus:ring-monsoon-yellow/60"
            placeholder={t('vulnerabilitiesPlaceholder')}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="language" className="mb-1.5 block text-sm font-semibold text-monsoon-plum">
            {t('languageLabel')}
          </label>
          <select
            id="language"
            name="language"
            value={locale}
            onChange={(event) => setLocale(event.target.value as ValidLocale)}
            className="w-full rounded-xl border border-monsoon-plum/20 bg-white px-4 py-3.5 text-monsoon-plum outline-none transition-all focus:border-monsoon-rose focus:ring-4 focus:ring-monsoon-yellow/60"
            disabled={loading}
          >
            {(Object.keys(dictionaries) as ValidLocale[]).map((language) => (
              <option key={language} value={language}>
                {language.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-monsoon-plum px-6 py-4 font-bold text-white shadow-lg shadow-monsoon-plum/20 transition-all hover:-translate-y-0.5 hover:bg-monsoon-rose hover:shadow-monsoon-rose/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none"
          aria-busy={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {t('submittingButton')}
            </>
          ) : t('submitButton')}
        </button>
      </div>
    </form>
  );
};
