'use client';

import React, { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';

interface EmergencyChecklistProps {
  checklists: string[];
}

export const EmergencyChecklist: React.FC<EmergencyChecklistProps> = ({ checklists }) => {
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

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-800/50 p-6 sm:p-8 hover:shadow-xl transition-all">
      <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        </div>
        {t('emergencyChecklistsTitle')}
      </h3>
      
      <ul className="space-y-4">
        {checklists.map((item, index) => {
          const isTicked = ticked.has(index);
          return (
            <li 
              key={index} 
              className={`flex items-start gap-4 p-3 rounded-xl transition-all duration-200 ${isTicked ? 'bg-slate-50 dark:bg-slate-800/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  id={`checklist-item-${index}`}
                  checked={isTicked}
                  onChange={() => toggleItem(index)}
                  className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-colors shadow-sm"
                  aria-label={item}
                />
              </div>
              <label 
                htmlFor={`checklist-item-${index}`}
                className={`cursor-pointer leading-relaxed transition-all duration-200 select-none ${isTicked ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-800 dark:text-slate-200 font-medium'}`}
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
