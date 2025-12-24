"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Loader2, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Contrat, Mandat } from "@/types/database";

type ContratWithMandat = Contrat & {
  mandat: Mandat | null;
};

interface ContractsListProps {
  clientId: number;
  onGenerate?: () => void;
}

export function ContractsList({ clientId, onGenerate }: ContractsListProps) {
  const [contracts, setContracts] = useState<ContratWithMandat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function loadContracts() {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("contrat")
        .select(`
          *,
          mandat:mandat_id (
            title
          )
        `)
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setContracts(data || []);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Erreur lors du chargement des contrats");
    } finally {
      setIsLoading(false);
    }
  }

  // Rafraîchir la liste quand on demande de générer un nouveau contrat
  useEffect(() => {
    if (onGenerate) {
      const interval = setInterval(() => {
        loadContracts();
      }, 2000); // Recharger toutes les 2 secondes pendant la génération

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onGenerate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
        <p className="text-red-900 font-semibold text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Contrats ({contracts.length})
      </h3>

      {contracts.length === 0 ? (
        <p className="text-gray-900 text-center py-8 font-semibold">
          Aucun contrat généré pour ce client
        </p>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-blue-400 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-5 h-5 text-gray-700" />
                    <h4 className="font-black text-gray-900">{contract.contrat_number}</h4>
                  </div>

                  {contract.mandat && (
                    <p className="text-sm text-gray-800 mb-1 font-bold">
                      Mandat : {contract.mandat.title}
                    </p>
                  )}

                  <div className="flex items-center text-sm text-gray-700 space-x-4 font-medium">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Généré le {new Date(contract.created_at).toLocaleDateString("fr-FR")}
                    </div>
                    {contract.signed_date && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Signé le {new Date(contract.signed_date).toLocaleDateString("fr-FR")}
                      </div>
                    )}
                  </div>
                </div>

                <a
                  href={`/api/contracts/${contract.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

