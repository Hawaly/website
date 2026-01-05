/**
 * Types pour le système de packs/forfaits de services
 */

// =========================================================
// ENUMS & TYPES
// =========================================================

export type BillingFrequency = 'one_time' | 'monthly' | 'yearly' | 'quarterly';
export type PaymentSchedule = 'upfront' | 'milestone' | 'monthly' | 'quarterly' | 'on_delivery';
export type PackageStatus = 'active' | 'completed' | 'cancelled' | 'expired' | 'paused';
export type PackageTaskType = 'production' | 'admin' | 'revision' | 'meeting' | 'delivery' | 'creative' | 'technical' | 'other';
export type PackageTaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked' | 'cancelled';

// =========================================================
// INTERFACES
// =========================================================

/**
 * Service Package - Définition d'un pack/forfait
 */
export interface ServicePackage {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  tagline: string | null;
  
  // Pricing
  price: number;
  currency: string;
  billing_frequency: BillingFrequency;
  
  // Visual/Marketing
  color: string | null;
  icon: string | null;
  badge: string | null;
  is_featured: boolean;
  display_order: number;
  
  // Status
  is_active: boolean;
  is_visible: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: number | null;
}

/**
 * Package Feature - Feature/Inclusion d'un pack
 */
export interface PackageFeature {
  id: number;
  package_id: number;
  title: string;
  description: string | null;
  icon: string | null;
  is_highlighted: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Package Task Template - Template de tâche automatique
 */
export interface PackageTaskTemplate {
  id: number;
  package_id: number;
  title: string;
  description: string | null;
  type: PackageTaskType;
  status: PackageTaskStatus;
  
  // Timing
  days_after_start: number;
  estimated_hours: number | null;
  due_date_offset: number | null;
  
  // Assignment
  assigned_to_role: string | null;
  priority: number;
  
  // Display
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Package Mandat Template - Template de contenu pour mandats
 */
export interface PackageMandatTemplate {
  id: number;
  package_id: number;
  
  // Default mandat content
  title_template: string | null;
  description_template: string | null;
  objectives: string | null;
  deliverables: string | null;
  timeline_description: string | null;
  
  // Default values
  default_duration_days: number | null;
  default_status: string | null;
  
  // Contract clauses
  contract_clauses: any | null;
  terms_and_conditions: string | null;
  
  created_at: string;
  updated_at: string;
}

/**
 * Package Invoice Template - Template de facturation
 */
export interface PackageInvoiceTemplate {
  id: number;
  package_id: number;
  
  // Invoice details
  line_item_description: string | null;
  unit_price: number | null;
  quantity: number;
  
  // Payment terms
  payment_terms_days: number;
  payment_schedule: PaymentSchedule;
  deposit_percentage: number | null;
  
  // Notes
  invoice_notes: string | null;
  payment_instructions: string | null;
  
  // Tax
  is_taxable: boolean;
  tax_rate: number | null;
  
  created_at: string;
  updated_at: string;
}

/**
 * Client Package - Lien entre client et pack souscrit
 */
export interface ClientPackage {
  id: number;
  client_id: number;
  package_id: number;
  
  // Purchase details
  purchased_at: string;
  purchased_price: number;
  
  // Subscription info
  start_date: string | null;
  end_date: string | null;
  renewal_date: string | null;
  is_recurring: boolean;
  auto_renew: boolean;
  
  // Status
  status: PackageStatus;
  
  // Related mandat
  mandat_id: number | null;
  
  // Metadata
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
}

// =========================================================
// EXTENDED TYPES (avec relations)
// =========================================================

/**
 * Package complet avec features
 */
export interface ServicePackageWithFeatures extends ServicePackage {
  features: PackageFeature[];
}

/**
 * Package complet avec tous les templates
 */
export interface ServicePackageComplete extends ServicePackage {
  features: PackageFeature[];
  task_templates: PackageTaskTemplate[];
  mandat_template: PackageMandatTemplate | null;
  invoice_template: PackageInvoiceTemplate | null;
}

/**
 * Client Package avec détails du package
 */
export interface ClientPackageWithDetails extends ClientPackage {
  package: ServicePackage;
}

// =========================================================
// INSERT & UPDATE TYPES
// =========================================================

export type ServicePackageInsert = Omit<ServicePackage, 'id' | 'created_at' | 'updated_at'>;
export type ServicePackageUpdate = Partial<Omit<ServicePackage, 'id' | 'created_at' | 'updated_at'>>;

export type PackageFeatureInsert = Omit<PackageFeature, 'id' | 'created_at' | 'updated_at'>;
export type PackageFeatureUpdate = Partial<Omit<PackageFeature, 'id' | 'package_id' | 'created_at' | 'updated_at'>>;

export type PackageTaskTemplateInsert = Omit<PackageTaskTemplate, 'id' | 'created_at' | 'updated_at'>;
export type PackageTaskTemplateUpdate = Partial<Omit<PackageTaskTemplate, 'id' | 'package_id' | 'created_at' | 'updated_at'>>;

export type PackageMandatTemplateInsert = Omit<PackageMandatTemplate, 'id' | 'created_at' | 'updated_at'>;
export type PackageMandatTemplateUpdate = Partial<Omit<PackageMandatTemplate, 'id' | 'package_id' | 'created_at' | 'updated_at'>>;

export type PackageInvoiceTemplateInsert = Omit<PackageInvoiceTemplate, 'id' | 'created_at' | 'updated_at'>;
export type PackageInvoiceTemplateUpdate = Partial<Omit<PackageInvoiceTemplate, 'id' | 'package_id' | 'created_at' | 'updated_at'>>;

export type ClientPackageInsert = Omit<ClientPackage, 'id' | 'created_at' | 'updated_at'>;
export type ClientPackageUpdate = Partial<Omit<ClientPackage, 'id' | 'client_id' | 'package_id' | 'created_at' | 'updated_at'>>;

// =========================================================
// LABELS & COLORS
// =========================================================

export const BILLING_FREQUENCY_LABELS: Record<BillingFrequency, string> = {
  one_time: 'Paiement unique',
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  yearly: 'Annuel',
};

export const PAYMENT_SCHEDULE_LABELS: Record<PaymentSchedule, string> = {
  upfront: 'Paiement d\'avance',
  milestone: 'Par jalons',
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  on_delivery: 'À la livraison',
};

export const PACKAGE_STATUS_LABELS: Record<PackageStatus, string> = {
  active: 'Actif',
  completed: 'Terminé',
  cancelled: 'Annulé',
  expired: 'Expiré',
  paused: 'En pause',
};

export const PACKAGE_STATUS_COLORS: Record<PackageStatus, string> = {
  active: 'bg-white text-black font-black border-[3px] border-green-600 shadow-sm',
  completed: 'bg-white text-black font-black border-[3px] border-blue-600 shadow-sm',
  cancelled: 'bg-white text-black font-black border-[3px] border-red-600 shadow-sm',
  expired: 'bg-white text-black font-black border-[3px] border-gray-600 shadow-sm',
  paused: 'bg-white text-black font-black border-[3px] border-orange-600 shadow-sm',
};

export const PACKAGE_TASK_TYPE_LABELS: Record<PackageTaskType, string> = {
  production: 'Production',
  admin: 'Administratif',
  revision: 'Révision',
  meeting: 'Réunion',
  delivery: 'Livraison',
  creative: 'Créatif',
  technical: 'Technique',
  other: 'Autre',
};

export const PACKAGE_TASK_STATUS_LABELS: Record<PackageTaskStatus, string> = {
  todo: 'À faire',
  in_progress: 'En cours',
  done: 'Terminé',
  blocked: 'Bloqué',
  cancelled: 'Annulé',
};
