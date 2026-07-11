import { I18nProvider } from '@/contexts/I18nContext';
import { DashboardView } from '@/components/dashboard/DashboardView';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <I18nProvider>
        <DashboardView />
      </I18nProvider>
    </main>
  );
}
