'use client';

import React, { useMemo, useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import type { PlanData } from '@/components/forms/PersonalizedPlanForm';

interface PlanActionsProps {
  plan: PlanData;
}

function formatPlan(plan: PlanData): string {
  return [
    `Monsoon Preparedness Plan - ${plan.context.location}`,
    '',
    'Before:',
    plan.preparednessPlan.before,
    '',
    'During:',
    plan.preparednessPlan.during,
    '',
    'After:',
    plan.preparednessPlan.after,
    '',
    'Travel Advisory:',
    plan.travelAdvisory,
    '',
    'Safety Recommendations:',
    ...plan.safetyRecommendations.map((item) => `- ${item}`),
    '',
    'Community Actions:',
    ...plan.communityActions.map((item) => `- ${item}`),
    '',
    'Medical & Accessibility:',
    ...plan.medicalAndAccessibility.map((item) => `- ${item}`),
    '',
    'Recovery Steps:',
    ...plan.recoverySteps.map((item) => `- ${item}`),
  ].join('\n');
}

export const PlanActions: React.FC<PlanActionsProps> = ({ plan }) => {
  const { t } = useI18n();
  const [status, setStatus] = useState('');
  const formattedPlan = useMemo(() => formatPlan(plan), [plan]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedPlan);
      setStatus(t('planCopiedMessage'));
    } catch {
      setStatus(t('planActionFallbackMessage'));
    }
  };

  const handleDownload = () => {
    const blob = new Blob([formattedPlan], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monsoon-plan-${plan.context.location.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus(t('planDownloadedMessage'));
  };

  return (
    <section className="rounded-2xl border border-monsoon-plum/15 bg-white/95 p-4 shadow-lg shadow-monsoon-plum/10 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-black text-monsoon-plum">{t('planActionsTitle')}</h3>
          <p className="mt-1 text-sm text-monsoon-plum/65" aria-live="polite">
            {status || t('planActionsSubtitle')}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg bg-monsoon-yellow px-3 py-2 text-sm font-black text-monsoon-plum transition-colors hover:bg-monsoon-orange/40"
          >
            {t('copyPlanButton')}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg bg-monsoon-plum px-3 py-2 text-sm font-black text-white transition-colors hover:bg-monsoon-rose"
          >
            {t('downloadPlanButton')}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-monsoon-plum/20 px-3 py-2 text-sm font-black text-monsoon-plum transition-colors hover:bg-monsoon-yellow/30"
          >
            {t('printPlanButton')}
          </button>
        </div>
      </div>
    </section>
  );
};
