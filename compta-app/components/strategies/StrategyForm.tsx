// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { 
  SocialMediaStrategy, 
  SocialMediaStrategyInsert,
  Persona,
  PilierContenu,
  KPI,
  SOCIAL_PLATFORMS,
  CONTENT_FORMATS,
  StrategyStatus,
  STRATEGY_STATUS_LABELS
} from "@/types/database";
import { Loader2, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { EditorialCalendarNew } from "./EditorialCalendarNew";
import { PersonaManager } from "./PersonaManager";
import { PilierManager } from "./PilierManager";
import { KPIManager } from "./KPIManager";
import { Button } from '@/compta-app/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from '@/compta-app/components/ui/Card";
import { Badge } from '@/compta-app/components/ui/Badge";
import { getEditorialCalendar } from "@/lib/editorialCalendarApi";
import type { EditorialCalendar as EditorialCalendarType } from "@/types/database";

interface StrategyFormProps {
  clientId: number;
  strategy?: SocialMediaStrategy | null;
  onSave: (strategy: Partial<SocialMediaStrategyInsert>) => Promise<void>;
  onCancel: () => void;
}

export function StrategyForm({ clientId, strategy, onSave, onCancel }: StrategyFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [calendar, setCalendar] = useState<EditorialCalendarType | null>(null);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    contexte: true,
    audience: false,
    positionnement: false,
    piliers: false,
    formats: false,
    audit: false,
    kpis: false,
    peso: false,
    budget: false,
    planning: false,
  });
  
  // Ã‰tats pour chaque section
  const [formData, setFormData] = useState<Partial<SocialMediaStrategyInsert>>({
    client_id: clientId,
    status: 'brouillon',
    contexte_general: '',
    objectifs_business: '',
    objectifs_reseaux: '',
    cibles: '',
    personas: [],
    plateformes: [],
    ton_voix: '',
    guidelines_visuelles: '',
    valeurs_messages: '',
    piliers_contenu: [],
    formats_envisages: [],
    frequence_calendrier: '',
    workflow_roles: '',
    audit_profils: '',
    benchmark_concurrents: '',
    kpis: [],
    cadre_suivi: '',
    owned_media: '',
    shared_media: '',
    paid_media: '',
    earned_media: '',
    temps_humain: '',
    outils: '',
    budget_pub: '',
    planning_global: '',
    processus_iteration: '',
    mise_a_jour: '',
    notes_internes: '',
  });

  useEffect(() => {
    if (strategy) {
      setFormData({
        client_id: strategy.client_id,
        status: strategy.status,
        contexte_general: strategy.contexte_general || '',
        objectifs_business: strategy.objectifs_business || '',
        objectifs_reseaux: strategy.objectifs_reseaux || '',
        cibles: strategy.cibles || '',
        personas: strategy.personas || [],
        plateformes: strategy.plateformes || [],
        ton_voix: strategy.ton_voix || '',
        guidelines_visuelles: strategy.guidelines_visuelles || '',
        valeurs_messages: strategy.valeurs_messages || '',
        piliers_contenu: strategy.piliers_contenu || [],
        formats_envisages: strategy.formats_envisages || [],
        frequence_calendrier: strategy.frequence_calendrier || '',
        workflow_roles: strategy.workflow_roles || '',
        audit_profils: strategy.audit_profils || '',
        benchmark_concurrents: strategy.benchmark_concurrents || '',
        kpis: strategy.kpis || [],
        cadre_suivi: strategy.cadre_suivi || '',
        owned_media: strategy.owned_media || '',
        shared_media: strategy.shared_media || '',
        paid_media: strategy.paid_media || '',
        earned_media: strategy.earned_media || '',
        temps_humain: strategy.temps_humain || '',
        outils: strategy.outils || '',
        budget_pub: strategy.budget_pub || '',
        planning_global: strategy.planning_global || '',
        processus_iteration: strategy.processus_iteration || '',
        mise_a_jour: strategy.mise_a_jour || '',
        notes_internes: strategy.notes_internes || '',
      });
      
      // Charger le calendrier Ã©ditorial si la stratÃ©gie existe
      if (strategy.id) {
        loadCalendar(strategy.id);
      }
    }
  }, [strategy]);

  async function loadCalendar(strategyId: number) {
    try {
      setIsLoadingCalendar(true);
      const cal = await getEditorialCalendar(strategyId);
      setCalendar(cal);
    } catch (error) {
      console.error('Erreur chargement calendrier:', error);
    } finally {
      setIsLoadingCalendar(false);
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Gestion des personas
  const addPersona = () => {
    const newPersona: Persona = {
      id: 0, // Temporaire, sera dÃ©fini lors de la sauvegarde
      strategy_id: strategy?.id || 0,
      nom: '',
      age_range: null,
      profession: null,
      besoins: null,
      problemes: null,
      attentes: null,
      comportements: null,
      canaux_preferes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const newPersonas = [...(formData.personas || []), newPersona];
    setFormData({ ...formData, personas: newPersonas });
  };

  const updatePersona = (index: number, field: keyof Persona, value: string) => {
    const personas = [...(formData.personas || [])];
    personas[index] = { ...personas[index], [field]: value };
    setFormData({ ...formData, personas });
  };

  const removePersona = (index: number) => {
    const personas = (formData.personas || []).filter((_, i) => i !== index);
    setFormData({ ...formData, personas });
  };

  // Gestion des piliers de contenu
  const addPilier = () => {
    const newPiliers = [...(formData.piliers_contenu || []), { titre: '', description: '', exemples: '' }];
    setFormData({ ...formData, piliers_contenu: newPiliers });
  };

  const updatePilier = (index: number, field: keyof PilierContenu, value: string) => {
    const piliers = [...(formData.piliers_contenu || [])];
    piliers[index] = { ...piliers[index], [field]: value };
    setFormData({ ...formData, piliers_contenu: piliers });
  };

  const removePilier = (index: number) => {
    const piliers = (formData.piliers_contenu || []).filter((_, i) => i !== index);
    setFormData({ ...formData, piliers_contenu: piliers });
  };

  // Gestion des KPIs
  const addKPI = () => {
    const newKPIs = [...(formData.kpis || []), { nom: '', objectif: '', periodicite: '' }];
    setFormData({ ...formData, kpis: newKPIs });
  };

  const updateKPI = (index: number, field: keyof KPI, value: string) => {
    const kpis = [...(formData.kpis || [])];
    kpis[index] = { ...kpis[index], [field]: value };
    setFormData({ ...formData, kpis });
  };

  const removeKPI = (index: number) => {
    const kpis = (formData.kpis || []).filter((_, i) => i !== index);
    setFormData({ ...formData, kpis });
  };

  // Gestion des plateformes
  const togglePlatform = (platform: string) => {
    const platforms = formData.plateformes || [];
    if (platforms.includes(platform)) {
      setFormData({ ...formData, plateformes: platforms.filter(p => p !== platform) });
    } else {
      setFormData({ ...formData, plateformes: [...platforms, platform] });
    }
  };

  // Gestion des formats
  const toggleFormat = (format: string) => {
    const formats = formData.formats_envisages || [];
    if (formats.includes(format)) {
      setFormData({ ...formData, formats_envisages: formats.filter(f => f !== format) });
    } else {
      setFormData({ ...formData, formats_envisages: [...formats, format] });
    }
  };

  const handleSubmit = async (e: React.FormEvent, saveStatus?: StrategyStatus) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      const dataToSave = saveStatus ? { ...formData, status: saveStatus } : formData;
      await onSave(dataToSave);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la stratÃ©gie');
    } finally {
      setIsSaving(false);
    }
  };

  const SectionHeader = ({ title, section }: { title: string; section: string }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full p-3 sm:p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
    >
      <h3 className="text-base sm:text-lg font-bold text-gray-900">{title}</h3>
      {expandedSections[section] ? (
        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 flex-shrink-0" />
      ) : (
        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 flex-shrink-0" />
      )}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Statut */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Statut de la stratÃ©gie
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as StrategyStatus })}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900 font-medium"
        >
          {Object.entries(STRATEGY_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* 1. Contexte & objectifs business */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <SectionHeader title="1. Contexte & Objectifs Business" section="contexte" />
        {expandedSections.contexte && (
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Contexte gÃ©nÃ©ral
                <span className="text-gray-500 font-normal text-xs ml-1 sm:ml-2 block sm:inline">
                  (Description de l'entreprise, positionnement, ressources, marchÃ©)
                </span>
              </label>
              <textarea
                value={formData.contexte_general || ''}
                onChange={(e) => setFormData({ ...formData, contexte_general: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="DÃ©crivez l'entreprise, son positionnement, ses ressources..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Objectifs business
                <span className="text-gray-500 font-normal text-xs ml-1 sm:ml-2 block sm:inline">
                  (Moyen/long terme : CA, notoriÃ©tÃ©, acquisition, fidÃ©lisation...)
                </span>
              </label>
              <textarea
                value={formData.objectifs_business || ''}
                onChange={(e) => setFormData({ ...formData, objectifs_business: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="Quels sont les objectifs business globaux ?"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 sm:mb-3">
                Objectifs rÃ©seaux sociaux (SMART)
                <span className="text-gray-500 font-normal text-xs ml-1 sm:ml-2 block sm:inline">
                  (SpÃ©cifiques, mesurables, atteignables, rÃ©alistes, temporels)
                </span>
              </label>
              <textarea
                value={formData.objectifs_reseaux || ''}
                onChange={(e) => setFormData({ ...formData, objectifs_reseaux: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="DÃ©finissez les objectifs SMART pour les rÃ©seaux sociaux..."
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Audience & Personas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <SectionHeader title="2. Audience & Personas" section="audience" />
        {expandedSections.audience && (
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Cibles principales
                <span className="text-gray-500 font-normal text-xs ml-1 sm:ml-2 block sm:inline">
                  (Ã‚ge, sexe, localisation, centres d'intÃ©rÃªt, comportements)
                </span>
              </label>
              <textarea
                value={formData.cibles || ''}
                onChange={(e) => setFormData({ ...formData, cibles: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="DÃ©crivez les cibles principales..."
              />
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                <label className="block text-sm font-bold text-gray-900">
                  Personas marketing (1 Ã  3 profils types)
                </label>
                <button
                  type="button"
                  onClick={addPersona}
                  className="flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter un persona
                </button>
              </div>

              {(formData.personas || []).map((persona, index) => (
                <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-3 space-y-3 border-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">Persona #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removePersona(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={persona.nom}
                    onChange={(e) => updatePersona(index, 'nom', e.target.value)}
                    placeholder="Nom du persona (ex: Sophie, 35 ans)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />

                  <input
                    type="text"
                    value={persona.age || ''}
                    onChange={(e) => updatePersona(index, 'age', e.target.value)}
                    placeholder="Ã‚ge / Tranche d'Ã¢ge"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />

                  <textarea
                    value={persona.besoins}
                    onChange={(e) => updatePersona(index, 'besoins', e.target.value)}
                    placeholder="Besoins et motivations..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />

                  <textarea
                    value={persona.problemes}
                    onChange={(e) => updatePersona(index, 'problemes', e.target.value)}
                    placeholder="ProblÃ¨mes et points de douleur..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />

                  <textarea
                    value={persona.attentes}
                    onChange={(e) => updatePersona(index, 'attentes', e.target.value)}
                    placeholder="Attentes vis-Ã -vis de la marque..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Plateformes sociales pertinentes
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <label
                    key={platform}
                    className="flex items-center space-x-2 p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={(formData.plateformes || []).includes(platform)}
                      onChange={() => togglePlatform(platform)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-900 font-medium">{platform}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Positionnement & identitÃ© */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <SectionHeader title="3. Positionnement & IdentitÃ© de Communication" section="positionnement" />
        {expandedSections.positionnement && (
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Ton / Voix de la marque
                <span className="text-gray-500 font-normal text-xs ml-1 sm:ml-2 block sm:inline">
                  (Ex : professionnel, bienveillant, fun, sÃ©rieux, inspirant...)
                </span>
              </label>
              <textarea
                value={formData.ton_voix || ''}
                onChange={(e) => setFormData({ ...formData, ton_voix: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="Quel ton adopter dans la communication ?"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Guidelines visuelles
                <span className="text-gray-500 font-normal text-xs ml-1 sm:ml-2 block sm:inline">
                  (Couleurs, typographies, style visuel, type de visuels, cohÃ©rence graphique)
                </span>
              </label>
              <textarea
                value={formData.guidelines_visuelles || ''}
                onChange={(e) => setFormData({ ...formData, guidelines_visuelles: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="DÃ©crivez les guidelines visuelles..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Valeurs & messages clÃ©s
                <span className="text-gray-500 font-normal text-xs ml-1 sm:ml-2 block sm:inline">
                  (Ce que la marque dÃ©fend, promet, son histoire, ce qui la diffÃ©rencie)
                </span>
              </label>
              <textarea
                value={formData.valeurs_messages || ''}
                onChange={(e) => setFormData({ ...formData, valeurs_messages: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="Quelles sont les valeurs et messages clÃ©s ?"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Piliers de contenu */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <SectionHeader title="4. Piliers de Contenu (Content Pillars)" section="piliers" />
        {expandedSections.piliers && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
              <label className="block text-sm font-bold text-gray-900">
                DÃ©finir 3 Ã  6 thÃ¨mes principaux
              </label>
              <button
                type="button"
                onClick={addPilier}
                className="flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter un pilier
              </button>
            </div>

            {(formData.piliers_contenu || []).map((pilier, index) => (
              <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-3 border-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">Pilier #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removePilier(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={pilier.titre}
                  onChange={(e) => updatePilier(index, 'titre', e.target.value)}
                  placeholder="Titre du pilier (ex: Ã‰ducation/Conseils)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 font-semibold"
                />

                <textarea
                  value={pilier.description}
                  onChange={(e) => updatePilier(index, 'description', e.target.value)}
                  placeholder="Description du pilier..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />

                <textarea
                  value={pilier.exemples || ''}
                  onChange={(e) => updatePilier(index, 'exemples', e.target.value)}
                  placeholder="Exemples de contenus pour ce pilier..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Formats & rythme */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <SectionHeader title="5. Formats & Rythme de Publication" section="formats" />
        {expandedSections.formats && (
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Formats envisagÃ©s
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {CONTENT_FORMATS.map((format) => (
                  <label
                    key={format}
                    className="flex items-center space-x-2 p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={(formData.formats_envisages || []).includes(format)}
                      onChange={() => toggleFormat(format)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-900 font-medium">{format}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                FrÃ©quence & calendrier Ã©ditorial
                <span className="text-gray-500 font-normal text-xs ml-1 sm:ml-2 block sm:inline">
                  (Quand publier, Ã  quelle frÃ©quence, sur quels canaux)
                </span>
              </label>
              <textarea
                value={formData.frequence_calendrier || ''}
                onChange={(e) => setFormData({ ...formData, frequence_calendrier: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="Ex: 3 posts/semaine sur Instagram, 2 posts/semaine sur LinkedIn..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Workflow & rÃ´les
                <span className="text-gray-500 font-normal text-xs ml-1 sm:ml-2 block sm:inline">
                  (Qui crÃ©e, valide, publie, modÃ¨re, analyse)
                </span>
              </label>
              <textarea
                value={formData.workflow_roles || ''}
                onChange={(e) => setFormData({ ...formData, workflow_roles: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="DÃ©finissez les rÃ´les et le workflow..."
              />
            </div>
          </div>
        )}
      </div>

      {/* 6. Audit & concurrence */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <SectionHeader title="6. Audit & Analyse Concurrentielle" section="audit" />
        {expandedSections.audit && (
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Audit des profils existants
                <span className="text-gray-500 font-normal text-xs ml-1 sm:ml-2 block sm:inline">
                  (Ce qui fonctionne ou pas, publications, engagement, lacunes)
                </span>
              </label>
              <textarea
                value={formData.audit_profils || ''}
                onChange={(e) => setFormData({ ...formData, audit_profils: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="Analyse des profils existants du client..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Veille / Benchmark concurrents
                <span className="text-gray-500 font-normal text-xs ml-1 sm:ml-2 block sm:inline">
                  (Ce que font les structures similaires, opportunitÃ©s, bonnes pratiques)
                </span>
              </label>
              <textarea
                value={formData.benchmark_concurrents || ''}
                onChange={(e) => setFormData({ ...formData, benchmark_concurrents: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="Analyse de la concurrence..."
              />
            </div>
          </div>
        )}
      </div>

      {/* 7. KPIs & suivi */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <SectionHeader title="7. KPIs & Suivi" section="kpis" />
        {expandedSections.kpis && (
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                <label className="block text-sm font-bold text-gray-900">
                  Indicateurs de performance
                </label>
                <button
                  type="button"
                  onClick={addKPI}
                  className="flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter un KPI
                </button>
              </div>

              {(formData.kpis || []).map((kpi, index) => (
                <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-3 space-y-3 border-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">KPI #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeKPI(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={kpi.nom}
                    onChange={(e) => updateKPI(index, 'nom', e.target.value)}
                    placeholder="Nom du KPI (ex: Taux d'engagement)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 font-semibold"
                  />

                  <input
                    type="text"
                    value={kpi.objectif}
                    onChange={(e) => updateKPI(index, 'objectif', e.target.value)}
                    placeholder="Objectif (ex: +5% par mois)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />

                  <input
                    type="text"
                    value={kpi.periodicite}
                    onChange={(e) => updateKPI(index, 'periodicite', e.target.value)}
                    placeholder="PÃ©riodicitÃ© (ex: Mensuel)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Cadre de suivi
                <span className="text-gray-500 font-normal text-xs ml-1 sm:ml-2 block sm:inline">
                  (PÃ©riodicitÃ©, analyses & ajustements rÃ©guliers)
                </span>
              </label>
              <textarea
                value={formData.cadre_suivi || ''}
                onChange={(e) => setFormData({ ...formData, cadre_suivi: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="Comment et quand mesurer les rÃ©sultats ?"
              />
            </div>
          </div>
        )}
      </div>

      {/* 8. Canaux & mix mÃ©dia (PESO) */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <SectionHeader title="8. Canaux & Mix MÃ©dia (ModÃ¨le PESO)" section="peso" />
        {expandedSections.peso && (
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Owned Media
                <span className="text-gray-500 font-normal text-xs ml-2">
                  (Site web, blog, comptes rÃ©seaux sociaux propres)
                </span>
              </label>
              <textarea
                value={formData.owned_media || ''}
                onChange={(e) => setFormData({ ...formData, owned_media: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="MÃ©dias possÃ©dÃ©s par la marque..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Shared Media
                <span className="text-gray-500 font-normal text-xs ml-2">
                  (CommunautÃ©, partage, contenu gÃ©nÃ©rÃ© par utilisateurs, social media organique)
                </span>
              </label>
              <textarea
                value={formData.shared_media || ''}
                onChange={(e) => setFormData({ ...formData, shared_media: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="StratÃ©gie de partage et d'engagement communautaire..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Paid Media
                <span className="text-gray-500 font-normal text-xs ml-2">
                  (PublicitÃ©, posts sponsorisÃ©s, boost, ads)
                </span>
              </label>
              <textarea
                value={formData.paid_media || ''}
                onChange={(e) => setFormData({ ...formData, paid_media: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="StratÃ©gie de publicitÃ© payante..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Earned Media
                <span className="text-gray-500 font-normal text-xs ml-2">
                  (Relations presse, influenceurs, partenariats, mentions tierces)
                </span>
              </label>
              <textarea
                value={formData.earned_media || ''}
                onChange={(e) => setFormData({ ...formData, earned_media: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="StratÃ©gie de relations publiques et partenariats..."
              />
            </div>
          </div>
        )}
      </div>

      {/* 9. Budget & ressources */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <SectionHeader title="9. Budget & Ressources" section="budget" />
        {expandedSections.budget && (
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Temps humain
                <span className="text-gray-500 font-normal text-xs ml-2">
                  (CrÃ©ation, modÃ©ration, community management, validation)
                </span>
              </label>
              <textarea
                value={formData.temps_humain || ''}
                onChange={(e) => setFormData({ ...formData, temps_humain: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="Ressources humaines nÃ©cessaires..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Outils
                <span className="text-gray-500 font-normal text-xs ml-2">
                  (Logiciels/matÃ©riel pour Ã©dition mÃ©dia, planification, analyse, veille)
                </span>
              </label>
              <textarea
                value={formData.outils || ''}
                onChange={(e) => setFormData({ ...formData, outils: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="Outils et logiciels nÃ©cessaires..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Budget pub Ã©ventuel
                <span className="text-gray-500 font-normal text-xs ml-2">
                  (Montant, dÃ©lais, priorisation)
                </span>
              </label>
              <textarea
                value={formData.budget_pub || ''}
                onChange={(e) => setFormData({ ...formData, budget_pub: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="Budget allouÃ© Ã  la publicitÃ©..."
              />
            </div>
          </div>
        )}
      </div>

      {/* 10. Planning & optimisation */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <SectionHeader title="10. Planning, ItÃ©ration & Optimisation" section="planning" />
        {expandedSections.planning && (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Planning global
                <span className="text-gray-500 font-normal text-xs ml-1 sm:ml-2 block sm:inline">
                  (Contenu, publication, analyse, campagnes, saisons, Ã©vÃ©nements, Ã©chÃ©ances)
                </span>
              </label>
              <textarea
                value={formData.planning_global || ''}
                onChange={(e) => setFormData({ ...formData, planning_global: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900"
                placeholder="Planning global de la stratÃ©gie..."
              />
            </div>

            {/* Calendrier Ã‰ditorial */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Calendrier Ã‰ditorial
                <span className="text-gray-500 font-normal text-xs ml-1 sm:ml-2 block sm:inline">
                  (Planification visuelle des contenus par plateforme)
                </span>
              </label>
              {isLoadingCalendar ? (
                <div className="flex flex-col sm:flex-row items-center justify-center py-8 sm:py-12 bg-gray-50 rounded-lg">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
                  <span className="mt-2 sm:mt-0 sm:ml-3 text-gray-600">Chargement du calendrier...</span>
                </div>
              ) : calendar ? (
                <EditorialCalendarNew
                  calendarId={calendar.id}
                  platforms={formData.plateformes || []}
                />
              ) : strategy?.id ? (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 text-center">
                  <p className="text-yellow-800 font-medium">
                    Calendrier non trouvÃ©. Il sera crÃ©Ã© automatiquement lors de la prochaine sauvegarde.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 text-center">
                  <p className="text-blue-800 font-medium">
                    Le calendrier Ã©ditorial sera disponible aprÃ¨s la crÃ©ation de la stratÃ©gie.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Processus d'itÃ©ration
                <span className="text-gray-500 font-normal text-xs ml-1 sm:ml-2 block sm:inline">
                  (Tester, mesurer, ajuster ce qui marche ou non)
                </span>
              </label>
              <textarea
                value={formData.processus_iteration || ''}
                onChange={(e) => setFormData({ ...formData, processus_iteration: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="Comment mesurer et ajuster la stratÃ©gie..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Mise Ã  jour & rÃ©Ã©valuation
                <span className="text-gray-500 font-normal text-xs ml-1 sm:ml-2 block sm:inline">
                  (Mise Ã  jour rÃ©guliÃ¨re, rÃ©Ã©valuation des piliers, adaptation selon rÃ©sultats)
                </span>
              </label>
              <textarea
                value={formData.mise_a_jour || ''}
                onChange={(e) => setFormData({ ...formData, mise_a_jour: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
                placeholder="FrÃ©quence et processus de mise Ã  jour..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Notes internes */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Notes internes
          <span className="text-gray-500 font-normal text-xs ml-2">
            (Informations complÃ©mentaires, non visibles dans la prÃ©sentation client)
          </span>
        </label>
        <textarea
          value={formData.notes_internes || ''}
          onChange={(e) => setFormData({ ...formData, notes_internes: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-gray-900"
          placeholder="Notes internes..."
        />
      </div>

      {/* Boutons d'action */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end bg-white rounded-lg shadow-md p-4 sm:p-6 sticky bottom-0 z-10">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-3 sm:py-2 border-2 border-gray-300 text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-bold"
          disabled={isSaving}
        >
          Annuler
        </button>

        <button
          type="button"
          onClick={(e) => handleSubmit(e, 'brouillon')}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer en brouillon'
          )}
        </button>

        <button
          type="button"
          onClick={(e) => handleSubmit(e, 'actif')}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer et activer'
          )}
        </button>
      </div>
    </form>
  );
}
