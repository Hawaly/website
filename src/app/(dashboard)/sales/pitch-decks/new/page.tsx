"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewPitchDeckPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [prospects, setProspects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    prospect_id: "",
    title: "",
    description: "",
    template_name: "",
  });

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      const response = await fetch("/api/sales/prospects");
      if (!response.ok) throw new Error("Failed to fetch prospects");
      const data = await response.json();
      setProspects(data);
    } catch (error) {
      console.error("Error fetching prospects:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slides = formData.template_name 
        ? getTemplateSlides(formData.template_name)
        : [{ id: 1, title: "Slide 1", content: {}, order: 1 }];

      const response = await fetch("/api/sales/pitch-decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospect_id: formData.prospect_id,
          title: formData.title,
          description: formData.description || null,
          template_name: formData.template_name || null,
          slides: slides,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error("Failed to create pitch deck");
      }

      router.push("/sales/pitch-decks");
    } catch (error) {
      console.error("Error creating pitch deck:", error);
      alert("Erreur lors de la création du pitch deck");
    } finally {
      setLoading(false);
    }
  };

  const getTemplateSlides = (templateId: string) => {
    const templates: Record<string, string[]> = {
      standard: ["Introduction", "About Us", "Services", "Case Studies", "Pricing", "Contact"],
      "social-media": ["Current Situation", "Strategy Overview", "Content Pillars", "KPIs", "Timeline", "Investment"],
      branding: ["Brand Analysis", "Vision", "Identity Elements", "Applications", "Guidelines", "Next Steps"],
      "digital-marketing": ["Market Analysis", "Campaign Strategy", "Channels", "Budget", "Timeline", "ROI"],
      custom: ["Slide 1", "Slide 2", "Slide 3"],
    };
    
    const slideNames = templates[templateId] || ["Slide 1"];
    return slideNames.map((name, index) => ({
      id: index + 1,
      title: name,
      content: {},
      order: index + 1,
    }));
  };

  const templates = [
    { id: "standard", name: "Standard Agency Pitch" },
    { id: "social-media", name: "Social Media Strategy" },
    { id: "branding", name: "Branding & Identity" },
    { id: "digital-marketing", name: "Digital Marketing" },
    { id: "custom", name: "Custom Pitch" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/sales/pitch-decks"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux pitch decks
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nouveau Pitch Deck</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations de base
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prospect *
                </label>
                <select
                  required
                  value={formData.prospect_id}
                  onChange={(e) =>
                    setFormData({ ...formData, prospect_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un prospect</option>
                  {prospects.map((prospect) => (
                    <option key={prospect.id} value={prospect.id}>
                      {prospect.company_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du pitch deck *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ex: Proposition Stratégie Social Media 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  placeholder="Brève description du pitch deck..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template
                </label>
                <select
                  value={formData.template_name}
                  onChange={(e) =>
                    setFormData({ ...formData, template_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Le pitch deck sera créé avec des slides vides que vous pourrez éditer ensuite.
              Les templates incluent une structure de slides prédéfinie.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link
            href="/sales/pitch-decks"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Créer le pitch deck
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
