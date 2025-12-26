"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Mandat, MANDAT_STATUS_LABELS, MANDAT_STATUS_COLORS } from "@/types/database";

interface MandatsListProps {
  clientId: number;
}

export function MandatsList({ clientId }: MandatsListProps) {
  const [mandats, setMandats] = useState<Mandat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMandats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function loadMandats() {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("mandat")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setMandats(data || []);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Erreur lors du chargement des mandats");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 text-sm font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Mandats ({mandats.length})
        </h3>
        <Link
          href={`/mandats/new?client_id=${clientId}`}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau mandat</span>
        </Link>
      </div>

      {mandats.length === 0 ? (
        <p className="text-gray-600 text-center py-8 font-medium">
          Aucun mandat pour ce client
        </p>
      ) : (
        <div className="space-y-3">
          {mandats.map((mandat) => (
            <Link
              key={mandat.id}
              href={`/mandats/${mandat.id}`}
              className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{mandat.title}</h4>
                <span className={`inline-flex px-3 py-1 text-xs rounded-full ${MANDAT_STATUS_COLORS[mandat.status]}`}>
                  {MANDAT_STATUS_LABELS[mandat.status]}
                </span>
              </div>

              {mandat.mandat_type && (
                <p className="text-sm text-gray-700 font-medium mb-2">
                  Type : {mandat.mandat_type}
                </p>
              )}

              {(mandat.start_date || mandat.end_date) && (
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  {mandat.start_date && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>
                        Début : {new Date(mandat.start_date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  )}
                  {mandat.end_date && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>
                        Fin : {new Date(mandat.end_date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

