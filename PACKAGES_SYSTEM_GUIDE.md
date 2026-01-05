# 📦 Système de Packs de Services - Guide d'Utilisation

## 🎯 Vue d'ensemble

Le système de packs permet de gérer des forfaits de services avec :
- **Templates de mandat** prédéfinis
- **Templates de facturation** personnalisés  
- **Tâches automatiques** créées lors de la création d'un mandat
- **Features/Inclusions** affichables sur le site

---

## 📊 Structure de la Base de Données

### Tables Créées

1. **`service_package`** - Définition des packs
2. **`package_feature`** - Features/Inclusions d'un pack
3. **`package_task_template`** - Templates de tâches automatiques
4. **`package_mandat_template`** - Template de contenu pour mandats
5. **`package_invoice_template`** - Template de facturation
6. **`client_package`** - Lien entre clients et packs souscrits

---

## 🚀 Installation

### 1. Exécuter la Migration SQL

```bash
# Via Supabase SQL Editor
# Copier-coller le contenu de:
migrations/20260105_service_packages_system.sql
```

**⚠️ Important:** Cette migration crée aussi 3 packs de démo :
- Pack de 10 Posts (2000 CHF) ⭐ MEILLEURE VALEUR
- Business Booster (1400 CHF) 🔥 POPULAIRE
- Pack Starter (800 CHF)

### 2. Activer RLS sur les nouvelles tables

La migration active automatiquement RLS. Pour ajouter les policies :

```sql
-- Admin: accès total
CREATE POLICY admin_all_service_package ON public.service_package
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY admin_all_package_feature ON public.package_feature
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY admin_all_package_task_template ON public.package_task_template
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY admin_all_package_mandat_template ON public.package_mandat_template
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY admin_all_package_invoice_template ON public.package_invoice_template
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY admin_all_client_package ON public.client_package
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Clients: lecture de leurs propres packs
CREATE POLICY client_read_own_packages ON public.client_package
  FOR SELECT USING (
    public.is_client() 
    AND client_id = public.current_user_client_id()
  );

-- Public: lecture des packs visibles (pour site public)
CREATE POLICY public_read_visible_packages ON public.service_package
  FOR SELECT USING (is_visible = true AND is_active = true);

CREATE POLICY public_read_package_features ON public.package_feature
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.service_package sp
      WHERE sp.id = package_feature.package_id
        AND sp.is_visible = true
        AND sp.is_active = true
    )
  );
```

---

## 📡 API Routes Disponibles

### Packages

```typescript
// Lister tous les packs
GET /api/packages
  ?visible_only=true   // Seulement les visibles
  &active_only=true    // Seulement les actifs
  &with_features=true  // Avec features

// Récupérer un pack complet (avec features, templates)
GET /api/packages/[id]

// Créer un pack (Admin)
POST /api/packages
Body: { name, slug, price, ... }

// Mettre à jour un pack (Admin)
PATCH /api/packages/[id]
Body: { name?, price?, is_active?, ... }

// Supprimer un pack (Admin)
DELETE /api/packages/[id]
```

### Features

```typescript
// Lister les features d'un pack
GET /api/packages/[id]/features

// Ajouter une feature (Admin)
POST /api/packages/[id]/features
Body: { title, description?, icon?, display_order? }

// Mettre à jour une feature (Admin)
PATCH /api/packages/[id]/features/[featureId]

// Supprimer une feature (Admin)
DELETE /api/packages/[id]/features/[featureId]

// Réordonner les features (Admin)
PATCH /api/packages/[id]/features
Body: { features: [{ id, display_order }] }
```

### Task Templates

```typescript
// Lister les templates de tâches
GET /api/packages/[id]/task-templates

// Ajouter un template (Admin)
POST /api/packages/[id]/task-templates
Body: { 
  title, 
  type: 'production' | 'admin' | 'revision' | 'meeting' | 'delivery',
  days_after_start?: 0,
  due_date_offset?: 7,
  priority?: 1
}

// Mettre à jour un template (Admin)
PATCH /api/packages/[id]/task-templates/[templateId]

// Supprimer un template (Admin)
DELETE /api/packages/[id]/task-templates/[templateId]
```

### Templates Mandat/Invoice

```typescript
// Récupérer le template de mandat
GET /api/packages/[id]/mandat-template

// Créer/Mettre à jour le template de mandat (Admin)
PUT /api/packages/[id]/mandat-template
Body: { 
  title_template?: "Mandat {package_name} - {client_name}",
  description_template?: "...",
  default_duration_days?: 30
}

// Récupérer le template de facture
GET /api/packages/[id]/invoice-template

// Créer/Mettre à jour le template de facture (Admin)
PUT /api/packages/[id]/invoice-template
Body: { 
  line_item_description?: "Pack de 10 Posts",
  payment_terms_days?: 30,
  deposit_percentage?: 50
}
```

---

## 💻 Utilisation dans le Code

### 1. Créer un Mandat depuis un Pack

```typescript
import { 
  generateMandatFromPackageTemplate,
  createTasksFromPackageTemplates,
  assignPackageToClient
} from '@/lib/packageHelpers';

// Dans votre API route ou composant
async function createMandatWithPackage(
  clientId: number,
  clientName: string,
  packageId: number
) {
  // 1. Récupérer les infos du pack
  const { data: packageData } = await supabaseAdmin
    .from('service_package')
    .select('*')
    .eq('id', packageId)
    .single();

  // 2. Générer le contenu du mandat depuis le template
  const mandatData = await generateMandatFromPackageTemplate(
    packageId,
    clientName,
    packageData.name
  );

  // 3. Créer le mandat
  const { data: mandat } = await supabaseAdmin
    .from('mandat')
    .insert({
      client_id: clientId,
      ...mandatData,
      status: 'en_cours',
    })
    .select()
    .single();

  // 4. Créer automatiquement les tâches depuis le pack
  await createTasksFromPackageTemplates(
    mandat.id,
    packageId,
    mandat.start_date
  );

  // 5. Associer le pack au client
  await assignPackageToClient(
    clientId,
    packageId,
    mandat.id,
    packageData.price
  );

  return mandat;
}
```

### 2. Générer une Facture depuis un Pack

```typescript
import { generateInvoiceItemsFromPackageTemplate } from '@/lib/packageHelpers';

async function createInvoiceFromPackage(
  clientId: number,
  packageId: number,
  mandatId?: number
) {
  // Générer les items de facture
  const items = await generateInvoiceItemsFromPackageTemplate(packageId);

  // Créer la facture
  const total_ht = items.reduce((sum, item) => sum + item.total, 0);
  const total_tva = total_ht * 0.077; // TVA 7.7%
  const total_ttc = total_ht + total_tva;

  const { data: invoice } = await supabaseAdmin
    .from('invoice')
    .insert({
      client_id: clientId,
      mandat_id: mandatId || null,
      invoice_number: `INV-${Date.now()}`,
      issue_date: new Date().toISOString().split('T')[0],
      total_ht,
      total_tva,
      total_ttc,
      status: 'brouillon',
      is_recurring: 'oneshot',
    })
    .select()
    .single();

  // Créer les items
  await supabaseAdmin
    .from('invoice_item')
    .insert(
      items.map(item => ({
        invoice_id: invoice.id,
        ...item,
      }))
    );

  return invoice;
}
```

### 3. Afficher les Packs sur le Site Public

```typescript
// Dans votre composant Next.js
import { supabase } from '@/lib/supabaseClient';

export default function PricingPage() {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    async function loadPackages() {
      const { data } = await supabase
        .from('service_package')
        .select(`
          *,
          features:package_feature(*)
        `)
        .eq('is_visible', true)
        .eq('is_active', true)
        .order('display_order');
      
      setPackages(data || []);
    }
    loadPackages();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {packages.map(pkg => (
        <PackageCard key={pkg.id} package={pkg} />
      ))}
    </div>
  );
}
```

---

## 🎨 Champs Visuels des Packs

### `color`
Classes Tailwind pour les gradients :
```typescript
"from-orange-600 to-orange-500"
"from-blue-600 to-blue-500"
"from-green-600 to-green-500"
```

### `icon`
Noms d'icônes Lucide React :
```typescript
"Zap"          // Éclair
"TrendingUp"   // Tendance
"Rocket"       // Fusée
"Star"         // Étoile
"Target"       // Cible
```

### `badge`
Texte du badge (optionnel) :
```typescript
"MEILLEURE VALEUR"
"POPULAIRE"
"NOUVEAU"
"OFFRE LIMITÉE"
```

---

## 🔧 Variables de Template

Dans `package_mandat_template.title_template` et `description_template`:

- `{client_name}` - Nom du client
- `{package_name}` - Nom du pack
- `{start_date}` - Date de début (YYYY-MM-DD)
- `{end_date}` - Date de fin calculée (YYYY-MM-DD)

**Exemple :**
```
"Mandat {package_name} - {client_name}"
→ "Mandat Pack de 10 Posts - Entreprise SA"
```

---

## 📝 Prochaines Étapes

1. **Exécuter la migration SQL** dans Supabase SQL Editor
2. **Ajouter les policies RLS** pour sécuriser les tables
3. **Créer l'interface admin** pour gérer les packs (`/packages`)
4. **Modifier le formulaire de création de client/mandat** pour sélectionner un pack
5. **Afficher les packs sur votre site public** (page pricing)

---

## 🆘 Support & Debug

### Vérifier les packs existants
```sql
SELECT * FROM service_package ORDER BY display_order;
```

### Vérifier les features d'un pack
```sql
SELECT * FROM package_feature 
WHERE package_id = 1 
ORDER BY display_order;
```

### Vérifier les tâches templates
```sql
SELECT * FROM package_task_template 
WHERE package_id = 1 
ORDER BY display_order;
```

### Voir les packs d'un client
```sql
SELECT 
  cp.*,
  sp.name as package_name,
  c.name as client_name
FROM client_package cp
JOIN service_package sp ON sp.id = cp.package_id
JOIN client c ON c.id = cp.client_id
WHERE cp.client_id = 1;
```

---

## 🎉 C'est tout !

Le système est prêt à l'emploi. Les 3 packs de démo sont déjà créés avec leurs features.

**Questions ou problèmes ?** Vérifie les logs des API routes ou les erreurs dans la console du navigateur.
