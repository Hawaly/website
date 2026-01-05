# Module Sales / CRM - Documentation

## 📋 Vue d'ensemble

Le module Sales/CRM est un système complet de gestion commerciale et d'acquisition clients intégré à votre dashboard YourStory. Il permet de gérer l'ensemble du cycle de vente, de la prospection à la signature.

## 🎯 Fonctionnalités principales

### 1. **Prospects (Leads Management)**
- Fiche entreprise complète (nom, site, secteur, taille, localisation)
- Contacts multiples par prospect (rôle, coordonnées, LinkedIn)
- Statut et pipeline stage (New → Qualified → Discovery → Proposal → Negotiation → Won/Lost)
- Tags, priorité, owner, dates de contact
- Pain points et objectifs du prospect
- Valeur estimée et probabilité de closing

**Page:** `/sales/prospects`

### 2. **Pipeline (Kanban)**
- Vue Kanban drag & drop pour déplacer les prospects entre les étapes
- 6 étapes configurables : New, Qualified, Discovery, Proposal, Negotiation, Won
- Statistiques par étape : nombre de deals, valeur totale, valeur pondérée
- Indicateurs visuels de priorité
- Calcul automatique du taux de conversion

**Page:** `/sales/pipeline`

### 3. **Activités & Suivi (Follow-ups)**
- 4 types d'activités : Call, Email, Task, Meeting
- Rappels avec notifications
- Statuts : Planned, Completed, Cancelled
- Priorités : Low, Medium, High, Urgent
- "Next action" obligatoire pour éviter les leads qui stagnent
- Vue organisée : En retard / Aujourd'hui / À venir
- Liaison automatique aux prospects

**Page:** `/sales/activities`

### 4. **Rendez-vous (Meetings)**
- Calendrier et vue liste
- Informations complètes : lieu, lien visio, participants
- Export .ics pour Google Calendar, Outlook, etc.
- Agenda et notes de préparation
- Highlight des RDV du jour
- Durée et timezone

**Page:** `/sales/meetings`

### 5. **PV / Compte-rendu (Meeting Minutes)**
- Structure complète de procès-verbal :
  - Participants, date, contexte
  - Agenda
  - Points discutés
  - Décisions prises
  - Action items (qui / quoi / deadline)
  - Prochain RDV
- Export PDF
- Validation et verrouillage
- Pièces jointes
- Liaison meeting ↔ prospect ↔ PV

**Page:** `/sales/meeting-minutes`

### 6. **Pitch Deck Builder**
- Templates prêts à l'emploi :
  - **Présentation Agence** : Intro complète de YourStory
  - **Proposition Commerciale** : Deck de proposal personnalisé
  - **Étude de Cas** : Présentation de cas client
- Auto-remplissage depuis la fiche prospect
- Versioning (v1, v2, v3...)
- Export PDF et PPTX
- Duplication de decks existants
- Tracking des envois

**Page:** `/sales/pitch-decks`

## 📊 Base de données

### Tables créées

```sql
- prospects          # Entreprises prospects
- contacts           # Contacts liés aux prospects
- activities         # Appels, emails, tâches, meetings
- meetings           # Rendez-vous avec calendrier
- meeting_minutes    # Procès-verbaux de réunions
- pitch_decks        # Présentations commerciales
- pipeline_history   # Historique des changements de statut
```

### Migration

Le fichier de migration SQL se trouve dans :
```
migrations/create_sales_crm_tables.sql
```

Pour l'exécuter sur votre base Supabase :
```bash
psql -h [SUPABASE_HOST] -U postgres -d postgres -f migrations/create_sales_crm_tables.sql
```

Ou via le SQL Editor de Supabase Dashboard.

## 🔄 Workflow recommandé

1. **Prospect créé** (manuel ou import CSV)
2. **Qualification** (fit + besoin + budget approx.)
3. **Discovery meeting** planifié → PV + actions
4. **Génération Pitch deck** (template + auto-fill)
5. **Envoi + relances** (tasks)
6. **Close Won/Lost** + raison + archivage

## 🎨 Templates de Pitch Deck

### 1. Présentation Agence (Intro Agency)
- Cover
- À propos
- Services
- Processus
- Portfolio
- Contact

### 2. Proposition Commerciale (Proposal)
- Cover
- Problématique
- Solution
- Approche
- Timeline
- Tarifs
- Next Steps

### 3. Étude de Cas (Case Study)
- Cover
- Client
- Challenge
- Solution
- Résultats
- Testimonial

## 📈 Analytics & KPIs

Le système calcule automatiquement :
- **Taux de conversion par étape**
- **Durée moyenne par étape**
- **Valeur totale du pipeline**
- **Valeur pondérée** (montant × probabilité)
- **Nombre de prospects actifs**
- **Activités en retard**
- **Meetings à venir**

## 🔗 Intégrations

### Export .ics (iCalendar)
Les meetings peuvent être exportés au format standard .ics, compatible avec :
- Google Calendar
- Outlook
- Apple Calendar
- Tous les clients de calendrier modernes

### Export PDF
- Meeting Minutes (PV)
- Pitch Decks

### Export PPTX (à venir)
- Pitch Decks en PowerPoint natif

## 🚀 Roadmap

### Sprint 1 ✅ (Complété)
- [x] Leads + Contacts + Pipeline (Kanban)
- [x] Activities & Follow-ups

### Sprint 2 ✅ (Complété)
- [x] Meetings (calendar + list)
- [x] PV + action items
- [x] Export .ics

### Sprint 3 ✅ (Complété)
- [x] Pitch deck templates
- [x] Génération (structure JSON)
- [x] Versioning

### Sprint 4 (À venir)
- [ ] Export PDF pitch decks
- [ ] Export PPTX pitch decks
- [ ] Analytics pipeline détaillées
- [ ] Notifications email
- [ ] Import CSV prospects
- [ ] Intégration calendrier bidirectionnelle

## 🎯 Bonnes pratiques

### Lead Management
1. **Toujours qualifier** avant de passer en Discovery
2. **"Next action" obligatoire** sur chaque lead
3. **Mettre à jour régulièrement** la probabilité et la valeur estimée
4. **Documenter les raisons** des Won/Lost pour améliorer le process

### Meetings
1. **Créer le PV immédiatement après** la réunion
2. **Assigner des action items clairs** avec deadlines
3. **Planifier le prochain RDV** pendant la réunion

### Pitch Decks
1. **Utiliser les templates** pour garantir la cohérence
2. **Personnaliser** avec les infos du prospect
3. **Versionner** à chaque itération majeure
4. **Tracker les envois** pour le suivi

## 📝 API Endpoints

```
GET    /api/sales/prospects
POST   /api/sales/prospects
GET    /api/sales/prospects/[id]
PATCH  /api/sales/prospects/[id]
DELETE /api/sales/prospects/[id]

GET    /api/sales/activities
POST   /api/sales/activities
PATCH  /api/sales/activities/[id]

GET    /api/sales/meetings
POST   /api/sales/meetings
GET    /api/sales/meetings/[id]/export-ics

GET    /api/sales/meeting-minutes
POST   /api/sales/meeting-minutes
GET    /api/sales/meeting-minutes/[id]/export-pdf

GET    /api/sales/pitch-decks
POST   /api/sales/pitch-decks
POST   /api/sales/pitch-decks/[id]/duplicate
GET    /api/sales/pitch-decks/[id]/export-pdf
GET    /api/sales/pitch-decks/[id]/export-pptx
```

## 🎨 UI/UX

- **Design moderne** avec Tailwind CSS
- **Glassmorphism** et gradients élégants
- **Responsive** : mobile, tablette, desktop
- **Drag & drop** pour le Kanban
- **Filtres intelligents** sur toutes les vues
- **Stats cards** avec indicateurs visuels
- **Icons Lucide React** cohérents

## 💡 Inspiration & Références

- **Pipeline stages** : HubSpot best practices
- **Lead qualification** : Salesforce methodology
- **Meeting minutes structure** : Atlassian/Confluence standards
- **Pitch deck templates** : Sequoia Capital framework
- **iCalendar export** : IETF RFC 5545 standard

## 🔐 Sécurité & Permissions

Les tables incluent des champs `owner_id`, `created_by`, etc. pour :
- Assignation de prospects à des commerciaux
- Tracking de qui a créé/modifié quoi
- Permissions futures (RLS Supabase)

## 📞 Support

Pour toute question ou amélioration, contactez l'équipe YourStory.

---

**Version:** 1.0  
**Date:** 03/01/2025  
**Auteur:** YourStory Tech Team
