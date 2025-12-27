"use client";

import { useState } from "react";
import { Calendar, RefreshCw, Clock, Send, Info } from "lucide-react";
import { InvoiceRecurrence, INVOICE_RECURRENCE_LABELS } from "@/types/database";

interface RecurringConfig {
  is_recurring: InvoiceRecurrence;
  recurrence_day: number | null;
  auto_send: boolean;
  max_occurrences: number | null;
  end_date: string | null;
  next_generation_date: string | null;
}

interface RecurringInvoiceConfigProps {
  value: RecurringConfig;
  onChange: (config: RecurringConfig) => void;
  totalAmount?: number;
}

export default function RecurringInvoiceConfig({ value, onChange, totalAmount = 0 }: RecurringInvoiceConfigProps) {
  const [durationType, setDurationType] = useState<'unlimited' | 'months' | 'date'>('unlimited');

  const handleRecurrenceChange = (recurrence: InvoiceRecurrence) => {
    onChange({
      ...value,
      is_recurring: recurrence,
      // Réinitialiser si oneshot
      ...(recurrence === 'oneshot' ? {
        recurrence_day: null,
        auto_send: false,
        max_occurrences: null,
        end_date: null,
        next_generation_date: null,
      } : {}),
    });
  };

  const handleDayChange = (day: number) => {
    onChange({
      ...value,
      recurrence_day: day,
    });
  };

  const handleAutoSendChange = (autoSend: boolean) => {
    onChange({
      ...value,
      auto_send: autoSend,
    });
  };

  const handleDurationTypeChange = (type: 'unlimited' | 'months' | 'date') => {
    setDurationType(type);
    
    if (type === 'unlimited') {
      onChange({ ...value, max_occurrences: null, end_date: null });
    } else if (type === 'months') {
      onChange({ ...value, max_occurrences: 12, end_date: null });
    } else if (type === 'date') {
      onChange({ ...value, max_occurrences: null, end_date: '' });
    }
  };

  const handleMaxOccurrencesChange = (max: number) => {
    onChange({
      ...value,
      max_occurrences: max > 0 ? max : null,
    });
  };

  const handleEndDateChange = (date: string) => {
    onChange({
      ...value,
      end_date: date || null,
    });
  };

  const handleStartDateChange = (date: string) => {
    onChange({
      ...value,
      next_generation_date: date || null,
    });
  };

  const isRecurring = value.is_recurring !== 'oneshot';
  
  // Calculer le montant total prévu
  const totalPrevu = value.max_occurrences ? totalAmount * value.max_occurrences : null;

  return (
    <div className="space-y-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl p-6 border-2 border-indigo-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
          <RefreshCw className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Facturation Récurrente</h3>
          <p className="text-sm text-slate-600">Automatisez vos factures mensuelles, trimestrielles ou annuelles</p>
        </div>
      </div>

      {/* Type de récurrence */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          Type de récurrence
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(INVOICE_RECURRENCE_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleRecurrenceChange(key as InvoiceRecurrence)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                value.is_recurring === key
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
              }`}
            >
              <div className="text-center">
                <div className={`text-sm font-bold ${
                  value.is_recurring === key ? 'text-indigo-600' : 'text-slate-700'
                }`}>
                  {label}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {isRecurring && (
        <>
          {/* Jour de génération */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              <Calendar className="w-4 h-4 inline mr-2" />
              Jour de génération du mois
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="31"
                value={value.recurrence_day || 1}
                onChange={(e) => handleDayChange(parseInt(e.target.value))}
                className="w-24 px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <span className="text-sm text-slate-600">
                Les factures seront générées le {value.recurrence_day || 1} de chaque {value.is_recurring === 'mensuel' ? 'mois' : value.is_recurring === 'trimestriel' ? 'trimestre' : 'année'}
              </span>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Si le jour n'existe pas dans le mois (ex: 31 février), le dernier jour du mois sera utilisé.
              </p>
            </div>
          </div>

          {/* Date de première génération */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              <Clock className="w-4 h-4 inline mr-2" />
              Date de première génération
            </label>
            <input
              type="date"
              value={value.next_generation_date || ''}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            <p className="text-xs text-slate-500">
              La première facture sera générée à cette date
            </p>
          </div>

          {/* Durée de la récurrence */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Durée de la récurrence
            </label>
            
            <div className="space-y-2">
              {/* Option Illimité */}
              <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer transition-all hover:bg-slate-50">
                <input
                  type="radio"
                  name="durationType"
                  checked={durationType === 'unlimited'}
                  onChange={() => handleDurationTypeChange('unlimited')}
                  className="w-4 h-4 text-indigo-600"
                />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Illimité ∞</div>
                  <div className="text-xs text-slate-500">Les factures seront générées indéfiniment</div>
                </div>
              </label>

              {/* Option Nombre de mois */}
              <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer transition-all hover:bg-slate-50">
                <input
                  type="radio"
                  name="durationType"
                  checked={durationType === 'months'}
                  onChange={() => handleDurationTypeChange('months')}
                  className="w-4 h-4 text-indigo-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-slate-900">Nombre de factures</div>
                    {durationType === 'months' && (
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={value.max_occurrences || 12}
                        onChange={(e) => handleMaxOccurrencesChange(parseInt(e.target.value))}
                        onClick={(e) => e.stopPropagation()}
                        className="w-20 px-3 py-1.5 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {durationType === 'months' && value.max_occurrences
                      ? `${value.max_occurrences} facture${value.max_occurrences > 1 ? 's' : ''} sera générée${value.max_occurrences > 1 ? 's' : ''}`
                      : 'Définir un nombre maximum de factures à générer'}
                  </div>
                </div>
              </label>

              {/* Option Date de fin */}
              <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer transition-all hover:bg-slate-50">
                <input
                  type="radio"
                  name="durationType"
                  checked={durationType === 'date'}
                  onChange={() => handleDurationTypeChange('date')}
                  className="w-4 h-4 text-indigo-600"
                />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Date de fin</div>
                  {durationType === 'date' && (
                    <input
                      type="date"
                      value={value.end_date || ''}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 w-full px-3 py-1.5 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  )}
                  <div className="text-xs text-slate-500 mt-1">
                    Les factures seront générées jusqu'à cette date
                  </div>
                </div>
              </label>
            </div>

            {/* Affichage du total prévu */}
            {totalPrevu && durationType === 'months' && (
              <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Revenu total prévu</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {value.max_occurrences} × {totalAmount.toLocaleString('fr-CH', { style: 'currency', currency: 'CHF' })}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {totalPrevu.toLocaleString('fr-CH', { style: 'currency', currency: 'CHF' })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Envoi automatique */}
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-xl cursor-pointer transition-all hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="font-semibold text-slate-900">Envoi automatique</div>
                  <div className="text-xs text-slate-500">
                    Les factures seront automatiquement envoyées (statut "Envoyée")
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={value.auto_send}
                onChange={(e) => handleAutoSendChange(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
            </label>
            {!value.auto_send && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Les factures générées resteront en brouillon. Vous devrez les valider manuellement avant de les envoyer.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {!isRecurring && (
        <div className="text-center py-8 text-slate-500">
          <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Cette facture est unique (non récurrente)</p>
          <p className="text-sm mt-1">Sélectionnez un type de récurrence pour activer les options</p>
        </div>
      )}
    </div>
  );
}
