/**
 * Helpers pour la gestion des packs de services
 */

import { supabaseAdmin } from './supabaseAdmin';
import type { PackageTaskTemplate } from '@/types/service-packages';

/**
 * Crée automatiquement les tâches d'un mandat basées sur le pack
 * 
 * @param mandatId - ID du mandat
 * @param packageId - ID du pack de services
 * @param startDate - Date de début du mandat (pour calculer les dates des tâches)
 * @returns Array des tâches créées
 */
export async function createTasksFromPackageTemplates(
  mandatId: number,
  packageId: number,
  startDate?: string
): Promise<any[]> {
  try {
    // 1. Récupérer les templates de tâches du pack
    const { data: templates, error: templatesError } = await supabaseAdmin
      .from('package_task_template')
      .select('*')
      .eq('package_id', packageId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (templatesError) {
      throw new Error(`Erreur récupération templates: ${templatesError.message}`);
    }

    if (!templates || templates.length === 0) {
      console.log(`Aucun template de tâche trouvé pour le pack ${packageId}`);
      return [];
    }

    // 2. Date de référence
    const baseDate = startDate ? new Date(startDate) : new Date();

    // 3. Créer les tâches à partir des templates
    const tasksToCreate = templates.map((template: PackageTaskTemplate) => {
      // Calculer la date d'échéance si spécifiée
      let dueDate = null;
      if (template.due_date_offset !== null) {
        const dueDateObj = new Date(baseDate);
        dueDateObj.setDate(dueDateObj.getDate() + template.due_date_offset);
        dueDate = dueDateObj.toISOString().split('T')[0]; // Format YYYY-MM-DD
      }

      return {
        mandat_id: mandatId,
        title: template.title,
        details: template.description,
        type: mapPackageTaskTypeToMandatTaskType(template.type),
        status: mapPackageTaskStatusToMandatTaskStatus(template.status),
        due_date: dueDate,
      };
    });

    // 4. Insérer toutes les tâches en une fois
    const { data: createdTasks, error: createError } = await supabaseAdmin
      .from('mandat_task')
      .insert(tasksToCreate)
      .select();

    if (createError) {
      throw new Error(`Erreur création tâches: ${createError.message}`);
    }

    console.log(`✅ ${createdTasks?.length || 0} tâches créées pour le mandat ${mandatId} depuis le pack ${packageId}`);
    return createdTasks || [];

  } catch (error) {
    console.error('Erreur createTasksFromPackageTemplates:', error);
    throw error;
  }
}

/**
 * Génère le contenu d'un mandat basé sur le template du pack
 * 
 * @param packageId - ID du pack
 * @param clientName - Nom du client (pour remplacement dans templates)
 * @param packageName - Nom du pack (pour remplacement dans templates)
 * @returns Object avec les données du mandat pré-remplies
 */
export async function generateMandatFromPackageTemplate(
  packageId: number,
  clientName: string,
  packageName: string
): Promise<{
  title: string;
  description: string | null;
  mandat_type: string | null;
  start_date: string;
  end_date: string | null;
}> {
  try {
    // Récupérer le template de mandat
    const { data: template, error } = await supabaseAdmin
      .from('package_mandat_template')
      .select('*')
      .eq('package_id', packageId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erreur récupération template mandat: ${error.message}`);
    }

    // Dates par défaut
    const startDate = new Date().toISOString().split('T')[0];
    let endDate = null;
    
    if (template?.default_duration_days) {
      const endDateObj = new Date();
      endDateObj.setDate(endDateObj.getDate() + template.default_duration_days);
      endDate = endDateObj.toISOString().split('T')[0];
    }

    // Remplacer les variables dans les templates
    const replacements: Record<string, string> = {
      '{client_name}': clientName,
      '{package_name}': packageName,
      '{start_date}': startDate,
      '{end_date}': endDate || '',
    };

    const replaceVariables = (text: string | null): string | null => {
      if (!text) return null;
      let result = text;
      Object.entries(replacements).forEach(([key, value]) => {
        result = result.replace(new RegExp(key, 'g'), value);
      });
      return result;
    };

    return {
      title: replaceVariables(template?.title_template || `Mandat ${packageName} - ${clientName}`) || `Mandat ${packageName} - ${clientName}`,
      description: replaceVariables(template?.description_template || template?.objectives),
      mandat_type: packageName,
      start_date: startDate,
      end_date: endDate,
    };

  } catch (error) {
    console.error('Erreur generateMandatFromPackageTemplate:', error);
    throw error;
  }
}

/**
 * Génère les items de facture basés sur le template du pack
 * 
 * @param packageId - ID du pack
 * @param packagePrice - Prix du pack (peut être différent du prix template)
 * @returns Array d'items de facture
 */
export async function generateInvoiceItemsFromPackageTemplate(
  packageId: number,
  packagePrice?: number
): Promise<Array<{
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}>> {
  try {
    // Récupérer le template de facture
    const { data: template, error } = await supabaseAdmin
      .from('package_invoice_template')
      .select('*')
      .eq('package_id', packageId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erreur récupération template facture: ${error.message}`);
    }

    // Si pas de template, utiliser les infos du pack
    if (!template) {
      const { data: packageData } = await supabaseAdmin
        .from('service_package')
        .select('name, price')
        .eq('id', packageId)
        .single();

      const price = packagePrice || packageData?.price || 0;
      return [{
        description: packageData?.name || 'Service',
        quantity: 1,
        unit_price: price,
        total: price,
      }];
    }

    // Utiliser le template
    const unitPrice = packagePrice || template.unit_price || 0;
    const quantity = template.quantity || 1;

    return [{
      description: template.line_item_description || 'Service',
      quantity,
      unit_price: unitPrice,
      total: unitPrice * quantity,
    }];

  } catch (error) {
    console.error('Erreur generateInvoiceItemsFromPackageTemplate:', error);
    throw error;
  }
}

/**
 * 🚀 ORCHESTRATION COMPLÈTE: Associe un pack à un client avec création automatique
 * 
 * Cette fonction fait TOUT automatiquement:
 * 1. Crée le mandat basé sur le template du pack
 * 2. Crée les factures selon la fréquence de billing du pack
 * 3. Crée toutes les tâches du mandat depuis les templates
 * 4. Associe le pack au client dans client_package
 * 
 * @param clientId - ID du client
 * @param packageId - ID du pack
 * @param customPrice - Prix personnalisé (optionnel, utilise le prix du pack par défaut)
 * @param startDate - Date de début personnalisée (optionnel, utilise aujourd'hui par défaut)
 * @returns Object avec mandat, factures, tâches et client_package créés
 */
export async function assignPackageWithAutomation(
  clientId: number,
  packageId: number,
  customPrice?: number,
  startDate?: string
): Promise<{
  mandat: any;
  invoices: any[];
  tasks: any[];
  clientPackage: any;
}> {
  try {
    console.log(`🚀 Début assignation automatique du pack ${packageId} au client ${clientId}`);

    // 1. Récupérer les infos du pack et du client
    const { data: packageData, error: pkgError } = await supabaseAdmin
      .from('service_package')
      .select('*')
      .eq('id', packageId)
      .single();

    if (pkgError || !packageData) {
      throw new Error(`Pack non trouvé: ${pkgError?.message}`);
    }

    const { data: clientData, error: clientError } = await supabaseAdmin
      .from('client')
      .select('name')
      .eq('id', clientId)
      .single();

    if (clientError || !clientData) {
      throw new Error(`Client non trouvé: ${clientError?.message}`);
    }

    const finalPrice = customPrice ?? packageData.price;
    const finalStartDate = startDate || new Date().toISOString().split('T')[0];

    // 2. Générer et créer le mandat
    console.log('📋 Création du mandat...');
    const mandatData = await generateMandatFromPackageTemplate(
      packageId,
      clientData.name,
      packageData.name
    );

    const { data: createdMandat, error: mandatError } = await supabaseAdmin
      .from('mandat')
      .insert({
        client_id: clientId,
        title: mandatData.title,
        description: mandatData.description,
        mandat_type: mandatData.mandat_type,
        status: 'en_cours',
        start_date: finalStartDate,
        end_date: mandatData.end_date,
      })
      .select()
      .single();

    if (mandatError || !createdMandat) {
      throw new Error(`Erreur création mandat: ${mandatError?.message}`);
    }

    console.log(`✅ Mandat créé: ID ${createdMandat.id}`);

    // 3. Créer les tâches du mandat depuis les templates du pack
    console.log('✅ Création des tâches...');
    const createdTasks = await createTasksFromPackageTemplates(
      createdMandat.id,
      packageId,
      finalStartDate
    );

    console.log(`✅ ${createdTasks.length} tâches créées`);

    // 4. Créer les factures selon la fréquence de billing
    console.log('💰 Création des factures...');
    const createdInvoices = await createInvoicesFromPackage(
      clientId,
      packageId,
      createdMandat.id,
      finalPrice,
      packageData.billing_frequency,
      finalStartDate
    );

    console.log(`✅ ${createdInvoices.length} facture(s) créée(s)`);

    // 5. Associer le pack au client
    console.log('🔗 Association pack-client...');
    const { data: clientPackage, error: cpError } = await supabaseAdmin
      .from('client_package')
      .insert({
        client_id: clientId,
        package_id: packageId,
        mandat_id: createdMandat.id,
        purchased_price: finalPrice,
        status: 'active',
        start_date: finalStartDate,
      })
      .select()
      .single();

    if (cpError) {
      throw new Error(`Erreur association pack: ${cpError.message}`);
    }

    console.log('🎉 Assignation automatique terminée avec succès!');

    return {
      mandat: createdMandat,
      invoices: createdInvoices,
      tasks: createdTasks,
      clientPackage,
    };

  } catch (error) {
    console.error('❌ Erreur assignPackageWithAutomation:', error);
    throw error;
  }
}

/**
 * Crée les factures selon la fréquence de billing du pack
 * 
 * @param clientId - ID du client
 * @param packageId - ID du pack
 * @param mandatId - ID du mandat
 * @param price - Prix du pack
 * @param billingFrequency - Fréquence de facturation
 * @param startDate - Date de début
 * @returns Array des factures créées
 */
export async function createInvoicesFromPackage(
  clientId: number,
  packageId: number,
  mandatId: number,
  price: number,
  billingFrequency: 'one_time' | 'monthly' | 'quarterly' | 'yearly',
  startDate: string
): Promise<any[]> {
  try {
    // Récupérer les items de facture depuis le template
    const invoiceItemsTemplate = await generateInvoiceItemsFromPackageTemplate(packageId, price);
    
    // Calculer le total
    const totalAmount = invoiceItemsTemplate.reduce((sum, item) => sum + item.total, 0);
    
    // Déterminer les factures à créer selon la fréquence
    const invoicesData: Array<{
      issueDate: string;
      dueDate: string;
      description: string;
    }> = [];

    const baseDate = new Date(startDate);
    const year = new Date().getFullYear();

    switch (billingFrequency) {
      case 'one_time':
        invoicesData.push({
          issueDate: startDate,
          dueDate: addDays(startDate, 30),
          description: 'Facture pack one-time',
        });
        break;

      case 'monthly':
        for (let i = 0; i < 12; i++) {
          const issueDate = addMonths(baseDate, i);
          invoicesData.push({
            issueDate,
            dueDate: addDays(issueDate, 30),
            description: `Facture mensuelle ${i + 1}/12`,
          });
        }
        break;

      case 'quarterly':
        for (let i = 0; i < 4; i++) {
          const issueDate = addMonths(baseDate, i * 3);
          invoicesData.push({
            issueDate,
            dueDate: addDays(issueDate, 30),
            description: `Facture trimestrielle ${i + 1}/4`,
          });
        }
        break;

      case 'yearly':
        invoicesData.push({
          issueDate: startDate,
          dueDate: addDays(startDate, 30),
          description: 'Facture annuelle',
        });
        break;
    }

    // Créer toutes les factures
    const createdInvoices: any[] = [];

    for (let i = 0; i < invoicesData.length; i++) {
      const invoiceData = invoicesData[i];
      const invoiceNumber = `INV-${year}-${String(Date.now() + i).slice(-6)}`;

      // 1. Créer la facture (en-tête)
      const { data: invoice, error: invoiceError } = await supabaseAdmin
        .from('invoice')
        .insert({
          client_id: clientId,
          mandat_id: mandatId,
          invoice_number: invoiceNumber,
          issue_date: invoiceData.issueDate,
          due_date: invoiceData.dueDate,
          status: 'brouillon',
          total_ht: totalAmount,
          total_tva: 0,
          total_ttc: totalAmount,
        })
        .select()
        .single();

      if (invoiceError) {
        console.error(`Erreur création facture ${i + 1}:`, invoiceError);
        throw new Error(`Erreur création facture: ${invoiceError.message}`);
      }

      // 2. Créer les lignes de facture (invoice_items)
      const itemsToInsert = invoiceItemsTemplate.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('invoice_item')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error(`Erreur création items facture ${invoice.id}:`, itemsError);
        throw new Error(`Erreur création items: ${itemsError.message}`);
      }

      createdInvoices.push(invoice);
    }

    return createdInvoices;

  } catch (error) {
    console.error('Erreur createInvoicesFromPackage:', error);
    throw error;
  }
}

/**
 * Associe un pack à un client (fonction simple sans automation)
 * 
 * @param clientId - ID du client
 * @param packageId - ID du pack
 * @param mandatId - ID du mandat créé (optionnel)
 * @param purchasedPrice - Prix d'achat (optionnel, utilise le prix du pack par défaut)
 * @returns ClientPackage créé
 */
export async function assignPackageToClient(
  clientId: number,
  packageId: number,
  mandatId?: number,
  purchasedPrice?: number
): Promise<any> {
  try {
    // Récupérer le prix du pack si non fourni
    if (purchasedPrice === undefined) {
      const { data: packageData } = await supabaseAdmin
        .from('service_package')
        .select('price')
        .eq('id', packageId)
        .single();
      
      purchasedPrice = packageData?.price || 0;
    }

    // Créer l'association
    const { data: clientPackage, error } = await supabaseAdmin
      .from('client_package')
      .insert({
        client_id: clientId,
        package_id: packageId,
        mandat_id: mandatId || null,
        purchased_price: purchasedPrice,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur association pack: ${error.message}`);
    }

    return clientPackage;

  } catch (error) {
    console.error('Erreur assignPackageToClient:', error);
    throw error;
  }
}

// =========================================================
// MAPPERS: Package types -> Mandat types
// =========================================================

function mapPackageTaskTypeToMandatTaskType(packageType: string): string {
  const mapping: Record<string, string> = {
    'production': 'video',
    'creative': 'contenu',
    'meeting': 'reunion',
    'delivery': 'contenu',
    'admin': 'reporting',
    'revision': 'autre',
    'technical': 'autre',
    'other': 'autre',
  };
  
  return mapping[packageType] || 'autre';
}

function mapPackageTaskStatusToMandatTaskStatus(packageStatus: string): string {
  const mapping: Record<string, string> = {
    'todo': 'a_faire',
    'in_progress': 'en_cours',
    'done': 'terminee',
    'blocked': 'a_faire',
    'cancelled': 'a_faire',
  };
  
  return mapping[packageStatus] || 'a_faire';
}

// =========================================================
// DATE HELPERS
// =========================================================

function addDays(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function addMonths(date: Date, months: number): string {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result.toISOString().split('T')[0];
}
