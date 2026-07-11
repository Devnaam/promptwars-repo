import React from 'react';

interface InsightListProps {
  title: string;
  items: string[];
  tone?: 'light' | 'warm';
}

export const InsightList: React.FC<InsightListProps> = ({ title, items, tone = 'light' }) => {
  if (items.length === 0) return null;

  const containerClass =
    tone === 'warm'
      ? 'border-monsoon-orange/30 bg-monsoon-yellow/45 shadow-monsoon-orange/10'
      : 'border-monsoon-plum/15 bg-white/95 shadow-monsoon-plum/10';

  return (
    <section className={`rounded-2xl border p-5 shadow-lg sm:p-6 ${containerClass}`}>
      <h3 className="text-xl font-black text-monsoon-plum">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 rounded-xl bg-white/55 p-3 text-monsoon-plum/85">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-monsoon-rose" aria-hidden="true" />
            <span className="leading-7">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
