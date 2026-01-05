import { Header } from '@/components/layout/Header';
import { CompanySettingsForm } from '@/components/settings/CompanySettingsForm';

export default function SettingsPage() {
  return (
    <>
      <Header 
        title="Paramètres" 
        subtitle="Configuration de l'agence et informations de facturation" 
      />
      <main className="p-3 sm:p-4 md:p-6 lg:p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <CompanySettingsForm />
        </div>
      </main>
    </>
  );
}

