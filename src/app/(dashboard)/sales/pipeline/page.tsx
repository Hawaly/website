"use client";

import { useState, useEffect } from "react";
import { Plus, TrendingUp, DollarSign, Calendar, MoreVertical, Eye } from "lucide-react";
import Link from "next/link";

interface Prospect {
  id: number;
  company_name: string;
  status: string;
  estimated_value: number | null;
  probability: number;
  priority: string;
  last_contact_date: string | null;
  expected_close_date: string | null;
}

const stages = [
  { id: "new", label: "Nouveau", color: "from-blue-500 to-blue-600" },
  { id: "qualified", label: "Qualifié", color: "from-purple-500 to-purple-600" },
  { id: "discovery", label: "Discovery", color: "from-cyan-500 to-cyan-600" },
  { id: "proposal", label: "Proposition", color: "from-yellow-500 to-yellow-600" },
  { id: "negotiation", label: "Négociation", color: "from-orange-500 to-orange-600" },
  { id: "won", label: "Gagné ✓", color: "from-green-500 to-green-600" },
];

export default function PipelinePage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedProspect, setDraggedProspect] = useState<number | null>(null);

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      const response = await fetch("/api/sales/prospects");
      if (response.ok) {
        const data = await response.json();
        setProspects(data.filter((p: Prospect) => p.status !== "lost"));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des prospects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (prospectId: number) => {
    setDraggedProspect(prospectId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedProspect) return;

    try {
      const response = await fetch(`/api/sales/prospects/${draggedProspect}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setProspects(prospects.map(p => 
          p.id === draggedProspect ? { ...p, status: newStatus } : p
        ));
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }

    setDraggedProspect(null);
  };

  const getStageProspects = (stageId: string) => {
    return prospects.filter(p => p.status === stageId);
  };

  const getStageValue = (stageId: string) => {
    return getStageProspects(stageId).reduce((sum, p) => sum + (p.estimated_value || 0), 0);
  };

  const getWeightedValue = (stageId: string) => {
    return getStageProspects(stageId).reduce((sum, p) => 
      sum + ((p.estimated_value || 0) * p.probability / 100), 0
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Pipeline Commercial</h1>
            <p className="text-slate-400">Vue Kanban de vos opportunités</p>
          </div>
          <Link
            href="/sales/prospects/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-orange to-brand-orange-light text-white rounded-xl hover:shadow-brand-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Nouveau prospect
          </Link>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
            <div className="text-sm text-blue-300 mb-1">Total Pipeline</div>
            <div className="text-2xl font-bold text-white">
              {prospects.reduce((sum, p) => sum + (p.estimated_value || 0), 0).toLocaleString('fr-CH')} CHF
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
            <div className="text-sm text-purple-300 mb-1">Valeur Pondérée</div>
            <div className="text-2xl font-bold text-white">
              {prospects.reduce((sum, p) => sum + ((p.estimated_value || 0) * p.probability / 100), 0).toLocaleString('fr-CH')} CHF
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
            <div className="text-sm text-green-300 mb-1">Opportunités Actives</div>
            <div className="text-2xl font-bold text-white">{prospects.length}</div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {stages.map((stage) => {
            const stageProspects = getStageProspects(stage.id);
            const stageValue = getStageValue(stage.id);
            const weightedValue = getWeightedValue(stage.id);

            return (
              <div
                key={stage.id}
                className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-4"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Stage Header */}
                <div className={`bg-gradient-to-r ${stage.color} rounded-lg p-3 mb-4`}>
                  <h3 className="text-white font-semibold text-sm mb-1">{stage.label}</h3>
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span>{stageProspects.length} deals</span>
                    <span>{weightedValue.toLocaleString('fr-CH', { maximumFractionDigits: 0 })} CHF</span>
                  </div>
                </div>

                {/* Prospects Cards */}
                <div className="space-y-2 min-h-[200px]">
                  {stageProspects.map((prospect) => (
                    <div
                      key={prospect.id}
                      draggable
                      onDragStart={() => handleDragStart(prospect.id)}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 cursor-move hover:border-brand-orange/50 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white text-sm font-medium flex-1 pr-2">{prospect.company_name}</h4>
                        <Link
                          href={`/sales/prospects/${prospect.id}`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="w-4 h-4 text-slate-400 hover:text-white" />
                        </Link>
                      </div>

                      {prospect.estimated_value && (
                        <div className="flex items-center gap-1 text-xs text-slate-300 mb-1">
                          <DollarSign className="w-3 h-3" />
                          <span>{prospect.estimated_value.toLocaleString('fr-CH')} CHF</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{prospect.probability}% prob.</span>
                        {prospect.expected_close_date && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(prospect.expected_close_date).toLocaleDateString('fr-CH')}</span>
                          </div>
                        )}
                      </div>

                      {prospect.priority === "high" || prospect.priority === "urgent" && (
                        <div className="mt-2 pt-2 border-t border-slate-700">
                          <span className={`text-xs font-medium ${
                            prospect.priority === "urgent" ? "text-red-400" : "text-orange-400"
                          }`}>
                            {prospect.priority === "urgent" ? "🔥 Urgent" : "⚠️ Priorité haute"}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {stageProspects.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      Aucune opportunité
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
