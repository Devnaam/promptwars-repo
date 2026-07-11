'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useI18n } from '@/contexts/I18nContext';
import { WeatherAdvisory } from '@/components/weather/WeatherAdvisory';
import { PersonalizedPlanForm } from '@/components/forms/PersonalizedPlanForm';
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary';
import { AlertCenter } from '@/components/alerts/AlertCenter';
import { PlanActions } from '@/components/plan/PlanActions';
import { InsightList } from '@/components/plan/InsightList';
import type { WeatherPhase } from '@/schemas/genai-response';
import type { PlanData } from '@/components/forms/PersonalizedPlanForm';

const EmergencyChecklist = dynamic(
  () => import('@/components/checklists/EmergencyChecklist').then((mod) => mod.EmergencyChecklist),
  {
    loading: () => (
      <div className="rounded-2xl border border-monsoon-plum/10 bg-white/80 p-8 text-center text-monsoon-plum/70">
        Loading checklists...
      </div>
    ),
    ssr: false,
  }
);

const phaseOrder: WeatherPhase[] = ['before', 'during', 'after'];

export const DashboardView: React.FC = () => {
  const { t } = useI18n();
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [activePhase, setActivePhase] = useState<WeatherPhase>('before');
  const activeLocation = planData?.context.location ?? 'Mumbai, Maharashtra';

  const handlePlanGenerated = (plan: PlanData) => {
    setPlanData(plan);
    setActivePhase('before');
  };

  const phaseLabels: Record<WeatherPhase, string> = {
    before: t('beforePhase'),
    during: t('duringPhase'),
    after: t('afterPhase'),
  };

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className="mb-8 max-w-5xl text-center sm:mb-10 md:text-left">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-monsoon-rose">
          GenAI Monsoon Safety
        </p>
        <h1 className="mx-auto max-w-[22rem] break-words text-2xl font-black leading-tight text-monsoon-plum sm:mx-0 sm:max-w-5xl sm:text-4xl lg:text-5xl">
          {t('dashboardTitle')}
        </h1>
        <p className="mx-auto mt-4 max-w-[22rem] text-base leading-7 text-monsoon-plum/75 sm:mx-0 sm:max-w-3xl sm:text-lg">
          {t('dashboardSubtitle')}
        </p>
      </header>

      <ErrorBoundary>
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 space-y-6 lg:col-span-5">
            <WeatherAdvisory location={activeLocation} />
            <AlertCenter location={activeLocation} />
            <PersonalizedPlanForm onPlanGenerated={handlePlanGenerated} />
          </div>

          <div className="min-w-0 lg:col-span-7">
            {planData ? (
              <div className="space-y-6">
                <PlanActions plan={planData} />

                <section className="rounded-2xl border border-monsoon-plum/15 bg-white/95 p-5 shadow-xl shadow-monsoon-plum/10 sm:p-6 lg:p-8">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.16em] text-monsoon-rose">
                        {phaseLabels[activePhase]}
                      </p>
                      <h2 className="mt-1 text-2xl font-black text-monsoon-plum">
                        {t('planResultsTitle')}
                      </h2>
                    </div>
                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-monsoon-yellow/40 p-1">
                      {phaseOrder.map((phase) => (
                        <button
                          key={phase}
                          type="button"
                          onClick={() => setActivePhase(phase)}
                          className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                            activePhase === phase
                              ? 'bg-monsoon-plum text-white shadow-sm'
                              : 'text-monsoon-plum hover:bg-white/80'
                          }`}
                          aria-pressed={activePhase === phase}
                        >
                          {phaseLabels[phase]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="whitespace-pre-line text-base leading-8 text-monsoon-plum/85">
                    {planData.preparednessPlan[activePhase]}
                  </p>
                </section>

                <section className="rounded-2xl border border-monsoon-orange/30 bg-monsoon-yellow/45 p-5 shadow-lg shadow-monsoon-orange/10 sm:p-6">
                  <h3 className="text-xl font-black text-monsoon-plum">{t('travelAdvisoryTitle')}</h3>
                  <p className="mt-3 leading-7 text-monsoon-plum/80">{planData.travelAdvisory}</p>
                </section>

                <EmergencyChecklist
                  checklists={planData.emergencyChecklists[activePhase]}
                  phaseLabel={phaseLabels[activePhase]}
                />

                {planData.safetyRecommendations.length > 0 && (
                  <InsightList title={t('safetyRecommendationsTitle')} items={planData.safetyRecommendations} />
                )}

                <InsightList title={t('communityActionsTitle')} items={planData.communityActions} tone="warm" />
                <InsightList title={t('medicalAccessibilityTitle')} items={planData.medicalAndAccessibility} />
                <InsightList title={t('recoveryStepsTitle')} items={planData.recoverySteps} tone="warm" />
              </div>
            ) : (
              <section className="flex min-h-[420px] flex-col justify-center rounded-2xl border-2 border-dashed border-monsoon-plum/25 bg-white/60 p-6 text-center shadow-inner shadow-monsoon-plum/5 sm:p-10">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-monsoon-yellow text-monsoon-plum">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-monsoon-plum">{t('emptyStateTitle')}</h2>
                <p className="mx-auto mt-3 max-w-md leading-7 text-monsoon-plum/70">{t('emptyStateBody')}</p>
                <div className="mx-auto mt-8 grid w-full max-w-xl gap-3 text-left sm:grid-cols-3">
                  {phaseOrder.map((phase) => (
                    <div key={phase} className="rounded-xl border border-monsoon-plum/10 bg-white/80 p-4">
                      <p className="font-bold text-monsoon-rose">{phaseLabels[phase]}</p>
                      <p className="mt-2 text-sm leading-6 text-monsoon-plum/65">{t('starterKitTitle')}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};
