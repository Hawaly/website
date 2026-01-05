"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  FileText,
  Presentation,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function ProspectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [prospect, setProspect] = useState<any>(null);

  useEffect(() => {
    fetchProspect();
  }, [id]);

  const fetchProspect = async () => {
    try {
      const response = await fetch(`/api/sales/prospects/${id}`);
      if (!response.ok) throw new Error("Failed to fetch prospect");
      const data = await response.json();
      setProspect(data);
    } catch (error) {
      console.error("Error fetching prospect:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Prospect non trouvé</h2>
          <Link href="/sales/prospects" className="text-blue-600 hover:underline mt-4 inline-block">
            Retour aux prospects
          </Link>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    nouveau: "bg-blue-100 text-blue-800",
    qualifie: "bg-purple-100 text-purple-800",
    proposition: "bg-yellow-100 text-yellow-800",
    negociation: "bg-orange-100 text-orange-800",
    gagne: "bg-green-100 text-green-800",
    perdu: "bg-red-100 text-red-800",
    en_attente: "bg-gray-100 text-gray-800",
  };

  const priorityColors: Record<string, string> = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          href="/sales/prospects"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux prospects
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{prospect.company_name}</h1>
            <p className="text-gray-600 mt-1">{prospect.industry}</p>
          </div>
          <Link
            href={`/sales/prospects/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="text-gray-900">{prospect.email || "-"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Téléphone</div>
                  <div className="text-gray-900">{prospect.phone || "-"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Site web</div>
                  <a
                    href={prospect.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {prospect.website || "-"}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Adresse</div>
                  <div className="text-gray-900">
                    {prospect.address && `${prospect.address}, `}
                    {prospect.postal_code} {prospect.city}
                    {prospect.country && `, ${prospect.country}`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {prospect.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{prospect.notes}</p>
            </div>
          )}

          {/* Contacts */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contacts ({prospect.contacts?.length || 0})
              </h2>
            </div>
            {prospect.contacts?.length > 0 ? (
              <div className="space-y-3">
                {prospect.contacts.map((contact: any) => (
                  <div key={contact.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {contact.first_name} {contact.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{contact.position}</div>
                      <div className="text-sm text-gray-600">{contact.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucun contact</p>
            )}
          </div>

          {/* Activities */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Activités ({prospect.activities?.length || 0})
              </h2>
            </div>
            {prospect.activities?.length > 0 ? (
              <div className="space-y-3">
                {prospect.activities.slice(0, 5).map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3 border-b pb-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-600">{activity.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(activity.due_date).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucune activité</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Statut & Priorité</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Statut</div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[prospect.status]}`}>
                  {prospect.status}
                </span>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Priorité</div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[prospect.priority]}`}>
                  {prospect.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Sales Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Informations commerciales</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Valeur estimée</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {prospect.estimated_value
                      ? `${prospect.estimated_value.toLocaleString("fr-CH")} CHF`
                      : "-"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Probabilité</div>
                  <div className="text-lg font-semibold text-gray-900">{prospect.probability}%</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Date de clôture</div>
                  <div className="text-gray-900">
                    {prospect.expected_close_date
                      ? new Date(prospect.expected_close_date).toLocaleDateString("fr-FR")
                      : "-"}
                  </div>
                </div>
              </div>
              {prospect.source && (
                <div>
                  <div className="text-xs text-gray-500">Source</div>
                  <div className="text-gray-900">{prospect.source}</div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Statistiques</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Contacts
                </span>
                <span className="font-semibold text-gray-900">{prospect.contacts?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Activités
                </span>
                <span className="font-semibold text-gray-900">{prospect.activities?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Réunions
                </span>
                <span className="font-semibold text-gray-900">{prospect.meetings?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PV
                </span>
                <span className="font-semibold text-gray-900">{prospect.meeting_minutes?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Presentation className="h-4 w-4" />
                  Pitch Decks
                </span>
                <span className="font-semibold text-gray-900">{prospect.pitch_decks?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
