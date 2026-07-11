'use client';

import React, { useState, useCallback } from 'react';
import { useI18n } from '@/contexts/I18nContext';

export interface PlanData {
  preparednessPlan: string;
  emergencyChecklists: string[];
  safetyRecommendations: string[];
}

interface PersonalizedPlanFormProps {
  onPlanGenerated: (plan: PlanData) => void;
}

export const PersonalizedPlanForm: React.FC<PersonalizedPlanFormProps> = ({ onPlanGenerated }) => {
  const { t, locale } = useI18n();
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
        setError(t('errorMessage') as string);
        return;
      }

      const data: PlanData = await response.json();
      onPlanGenerated(data);
    } catch (err) {
      // Set local component error state instead of triggering ErrorBoundary
      setError(t('errorMessage') as string);
    } finally {
      setLoading(false);
    }
  }, [t, locale, onPlanGenerated]);

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-800/50 p-6 sm:p-8 transition-all hover:shadow-xl"
      aria-label={t('formTitle') as string}
    >
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t('formTitle')}</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-200 rounded-xl border border-rose-200 dark:border-rose-800/50" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {t('locationLabel')}
          </label>
          <input 
            type="text" 
            id="location" 
            name="location" 
            required 
            minLength={2}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder={t('locationPlaceholder') as string}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="familySize" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
            className="w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="vulnerabilities" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {t('vulnerabilitiesLabel')}
          </label>
          <input 
            type="text" 
            id="vulnerabilities" 
            name="vulnerabilities" 
            className="w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder={t('vulnerabilitiesPlaceholder') as string}
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
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
