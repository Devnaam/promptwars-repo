'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useI18n } from '@/contexts/I18nContext';
import { WeatherAdvisory } from '@/components/weather/WeatherAdvisory';
import { PersonalizedPlanForm, PlanData } from '@/components/forms/PersonalizedPlanForm';
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary';

// Lazy load the Checklist component to improve initial load time and performance
const EmergencyChecklist = dynamic(() => import('@/components/checklists/EmergencyChecklist').then(mod => mod.EmergencyChecklist), {
  loading: () => <div className="p-8 text-center text-slate-500 animate-pulse">Loading checklists...</div>,
  ssr: false
});

export const DashboardView: React.FC = () => {
  const { t } = useI18n();
  const [planData, setPlanData] = useState<PlanData | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
          {t('dashboardTitle')}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl">
          {t('dashboardSubtitle')}
        </p>
      </header>

      <ErrorBoundary>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Form and Weather */}
        <div className="lg:col-span-5 space-y-8">
          <WeatherAdvisory />
          <PersonalizedPlanForm onPlanGenerated={setPlanData} />
        </div>

        {/* Right Column: Generated Plan Results */}
        <div className="lg:col-span-7">
          {planData ? (
            <div className="space-y-8 transition-opacity duration-700 ease-in-out opacity-100">
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/30 rounded-3xl p-6 sm:p-8 shadow-sm border border-blue-100 dark:border-indigo-900/50">
                <h2 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-100 flex items-center gap-3">
                  <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  {t('planResultsTitle')}
                </h2>
                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                  <p className="whitespace-pre-line leading-relaxed">{planData.preparednessPlan}</p>
                </div>
              </div>

              <EmergencyChecklist checklists={planData.emergencyChecklists} />

              {planData.safetyRecommendations && planData.safetyRecommendations.length > 0 && (
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
                  <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t('safetyRecommendationsTitle')}
                  </h3>
                  <ul className="space-y-3">
                    {planData.safetyRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <span className="text-emerald-500 mt-1">•</span>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 min-h-[400px]">
              <svg className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">Fill out the form to generate your personalized action plan.</p>
            </div>
          )}
        </div>
      </div>
      </ErrorBoundary>
    </div>
  );
};
