import { Header } from '@/components/layout/Header';
import { ClientForm } from '@/components/clients/ClientForm';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewClientPage() {
  return (
    <>
      <Header title="Nouveau client" />
      <main className="p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/clients"
            className="inline-flex items-center text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Retour à la liste des clients
          </Link>
        </div>

        {/* Formulaire */}
        <div className="max-w-4xl">
          <ClientForm mode="create" />
        </div>
      </main>
    </>
  );
}

