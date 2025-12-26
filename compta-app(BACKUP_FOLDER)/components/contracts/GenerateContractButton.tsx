"use client";

import { useState, useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Mandat } from "@/types/database";

interface GenerateContractButtonProps {
  clientId: number;
  onGenerated?: () => void;
}

export function GenerateContractButton({ clientId, onGenerated }: GenerateContractButtonProps) {
  const [mandats, setMandats] = useState<Mandat[]>([]);
  const [selectedMandatId, setSelectedMandatId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadMandats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function loadMandats() {
    const { data } = await supabase
      .from("mandat")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    setMandats(data || []);
  }

  async function handleGenerate() {
    try {
      setIsGenerating(true);

      const response = await fetch("/api/contracts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          mandat_id: selectedMandatId ? parseInt(selectedMandatId) : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la génération");
      }

      alert(`Contrat ${result.contrat.contractNumber} généré avec succès !`);
      setShowModal(false);
      setSelectedMandatId("");
      
      if (onGenerated) {
        onGenerated();
      }
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Erreur lors de la génération du contrat");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-bold"
      >
        <FileText className="w-4 h-4" />
        <span>Générer contrat</span>
      </button>

      {/* Modal de sélection du mandat */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Générer un contrat
            </h3>

            <div className="mb-6">
              <label htmlFor="mandat_select" className="block text-sm font-bold text-gray-900 mb-2">
                Sélectionner un mandat (optionnel)
              </label>
              <select
                id="mandat_select"
                value={selectedMandatId}
                onChange={(e) => setSelectedMandatId(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold"
                disabled={isGenerating}
              >
                <option value="">Sans mandat spécifique</option>
                {mandats.map((mandat) => (
                  <option key={mandat.id} value={mandat.id}>
                    {mandat.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-700 mt-2 font-medium">
                Si vous sélectionnez un mandat, ses informations seront incluses dans le contrat.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isGenerating}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Génération...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Générer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

