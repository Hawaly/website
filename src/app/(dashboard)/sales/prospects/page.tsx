"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreVertical, Mail, Phone, Building2, MapPin, TrendingUp, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface Prospect {
  id: number;
  company_name: string;
  website: string | null;
  industry: string | null;
  company_size: string | null;
  location: string | null;
  country: string | null;
  status: string;
  estimated_value: number | null;
  probability: number;
  source: string | null;
  priority: string;
  owner_id: number | null;
  first_contact_date: string | null;
  last_contact_date: string | null;
  created_at: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: "Nouveau", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  qualified: { label: "Qualifié", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  discovery: { label: "Discovery", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  proposal: { label: "Proposition", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  negotiation: { label: "Négociation", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  won: { label: "Gagné", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  lost: { label: "Perdu", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const priorityLabels: Record<string, { label: string; color: string }> = {
  low: { label: "Basse", color: "text-gray-400" },
  medium: { label: "Moyenne", color: "text-blue-400" },
  high: { label: "Haute", color: "text-orange-400" },
  urgent: { label: "Urgente", color: "text-red-400" },
};

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      const response = await fetch("/api/sales/prospects");
      if (response.ok) {
        const data = await response.json();
        setProspects(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des prospects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProspects = prospects.filter((prospect) => {
    const matchesSearch = prospect.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || prospect.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Prospects</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">Gérez vos prospects et opportunités commerciales</p>
          </div>
          <Link href="/sales/prospects/new" className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base w-full sm:w-auto justify-center">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            Nouveau prospect
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-800 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou secteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm sm:text-base text-white focus:outline-none focus:border-brand-orange transition-colors"
              >
                <option value="all">Tous les statuts</option>
                <option value="new">Nouveau</option>
                <option value="qualified">Qualifié</option>
                <option value="discovery">Discovery</option>
                <option value="proposal">Proposition</option>
                <option value="negotiation">Négociation</option>
                <option value="won">Gagné</option>
                <option value="lost">Perdu</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-500/30">
            <div className="text-xs sm:text-sm text-blue-300 mb-0.5 sm:mb-1">Total Prospects</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">{prospects.length}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-500/30">
            <div className="text-xs sm:text-sm text-green-300 mb-0.5 sm:mb-1">Qualifiés</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              {prospects.filter(p => ['qualified', 'discovery', 'proposal', 'negotiation'].includes(p.status)).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-orange-500/30">
            <div className="text-xs sm:text-sm text-orange-300 mb-0.5 sm:mb-1 truncate">En négociation</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              {prospects.filter(p => p.status === 'negotiation').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-500/30">
            <div className="text-xs sm:text-sm text-purple-300 mb-0.5 sm:mb-1 truncate">Valeur pipeline</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
              {prospects.reduce((sum, p) => sum + (p.estimated_value || 0), 0).toLocaleString('fr-CH')} CHF
            </div>
          </div>
        </div>

        {/* Prospects List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Chargement...</div>
          ) : filteredProspects.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">Aucun prospect trouvé</p>
            </div>
          ) : (
            filteredProspects.map((prospect) => (
              <div
                key={prospect.id}
                className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-5 hover:border-brand-orange/50 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-white group-hover:text-brand-orange transition-colors">
                        {prospect.company_name}
                      </h3>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusLabels[prospect.status]?.color || ""}`}>
                        {statusLabels[prospect.status]?.label || prospect.status}
                      </span>
                      <span className={`text-xs font-medium ${priorityLabels[prospect.priority]?.color || ""}`}>
                        {priorityLabels[prospect.priority]?.label || prospect.priority}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      {prospect.industry && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Building2 className="w-4 h-4" />
                          <span>{prospect.industry}</span>
                        </div>
                      )}
                      {prospect.location && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <MapPin className="w-4 h-4" />
                          <span>{prospect.location}</span>
                        </div>
                      )}
                      {prospect.estimated_value && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <TrendingUp className="w-4 h-4" />
                          <span>{prospect.estimated_value.toLocaleString('fr-CH')} CHF ({prospect.probability}%)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/sales/prospects/${prospect.id}`}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/sales/prospects/${prospect.id}/edit`}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
