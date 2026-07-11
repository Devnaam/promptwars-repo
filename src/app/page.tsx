import { I18nProvider } from '@/contexts/I18nContext';
import { DashboardView } from '@/components/dashboard/DashboardView';

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(249,237,105,0.55),transparent_34%),linear-gradient(135deg,#fffdf0_0%,#fff7df_48%,#f7e6ed_100%)]">
      <I18nProvider>
        <DashboardView />
      </I18nProvider>
    </main>
  );
}
