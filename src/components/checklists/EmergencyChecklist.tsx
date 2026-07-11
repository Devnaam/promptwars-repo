'use client';

import React, { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';

interface EmergencyChecklistProps {
  checklists: string[];
  phaseLabel?: string;
}

export const EmergencyChecklist: React.FC<EmergencyChecklistProps> = ({ checklists, phaseLabel }) => {
  const { t } = useI18n();
  // Local state to store ticked items
  const [ticked, setTicked] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newTicked = new Set(ticked);
    if (newTicked.has(index)) {
      newTicked.delete(index);
    } else {
      newTicked.add(index);
    }
    setTicked(newTicked);
  };

  if (!checklists || checklists.length === 0) return null;

  const progress = Math.round((ticked.size / checklists.length) * 100);

  return (
    <div className="rounded-2xl border border-monsoon-plum/15 bg-white/95 p-5 shadow-lg shadow-monsoon-plum/10 transition-all sm:p-6">
      <div className="mb-6 border-b border-monsoon-plum/10 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-3 text-xl font-black text-monsoon-plum">
            <div className="rounded-lg bg-monsoon-yellow p-2 text-monsoon-plum">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            {t('emergencyChecklistsTitle')}
          </h3>
          {phaseLabel && (
            <span className="w-fit rounded-full bg-monsoon-orange/15 px-3 py-1 text-sm font-bold text-monsoon-rose">
              {phaseLabel}
            </span>
          )}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm font-semibold text-monsoon-plum/70">
            <span>
              {ticked.size}/{checklists.length} {t('checklistProgress')}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-monsoon-yellow/40">
            <div
              className="h-full rounded-full bg-monsoon-rose transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      
      <ul className="space-y-4">
        {checklists.map((item, index) => {
          const isTicked = ticked.has(index);
          return (
            <li 
              key={index} 
              className={`flex items-start gap-4 rounded-xl p-3 transition-all duration-200 ${isTicked ? 'bg-monsoon-yellow/25' : 'hover:bg-monsoon-yellow/15'}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  id={`checklist-item-${index}`}
                  checked={isTicked}
                  onChange={() => toggleItem(index)}
                  className="h-6 w-6 cursor-pointer rounded border-monsoon-plum/30 text-monsoon-rose shadow-sm focus:ring-monsoon-yellow"
                  aria-label={item}
                />
              </div>
              <label 
                htmlFor={`checklist-item-${index}`}
                className={`cursor-pointer select-none leading-relaxed transition-all duration-200 ${isTicked ? 'text-monsoon-plum/35 line-through' : 'font-medium text-monsoon-plum/85'}`}
              >
                {item}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
