# 📊 Rapport Détaillé des Fonctionnalités - Application YourStory Agency

## 🎯 Vue d'Ensemble

Cette application est une **plateforme complète de gestion d'agence de production vidéo** développée avec **Next.js 15**, **React 19**, **TypeScript**, et **Supabase** comme backend. Elle comprend deux interfaces principales : une **landing page marketing** et un **dashboard d'administration** complet pour gérer les clients, projets, factures, et stratégies social media.

---

## 🏗️ Architecture Technique

### Stack Technologique
- **Framework** : Next.js 15 (App Router)
- **Frontend** : React 19, TypeScript
- **Styling** : Tailwind CSS avec système de design personnalisé (glassmorphism)
- **Backend** : Supabase (PostgreSQL, authentification, storage)
- **Authentification** : Système custom avec rôles (Admin/Client)
- **PDF Generation** : PDFKit, SwissQRBill pour factures suisses
- **Animations** : Framer Motion, animations CSS personnalisées
- **Charts** : Chart.js avec react-chartjs-2

---

## 📱 PARTIE 1 : LANDING PAGE MARKETING

### 🎨 Design & UX
- **Design moderne** avec effets glassmorphism
- **Responsive design** optimisé pour mobile, tablette et desktop
- **Scrollbar masquée** pour une expérience épurée
- **Animations on-scroll** pour révéler le contenu
- **Performance optimisée** avec lazy loading des sections

### 🏠 Sections de la Landing Page

#### 1. **Hero Section**
- Badge d'identification : "CH Agence suisse experte en vidéos verticales"
- Titre principal avec gradient orange
- Call-to-action principal
- Badges de garantie (Sans engagement, Modifications incluses, Publicité & organique)

#### 2. **Video Section**
- Présentation du showreel de l'agence
- Intégration Vimeo pour lecture vidéo

#### 3. **Logos Section (Section Client)**
- Carrousel horizontal des logos clients
- Tous les clients ayant fait confiance à l'agence
- Animation au survol

#### 4. **Formats Section**
- Carrousel de vidéos réalisées pour les clients
- Intégration Vimeo avec contrôle de lecture
- Navigation entre vidéos (boutons précédent/suivant)
- Pagination pour mobile
- Bouton "Voir les études de cas" → redirige vers `/portfolio` (à créer)

#### 5. **Results Section**
- 3 cartes KPI principales :
  - "3x plus de ventes"
  - "10x plus d'engagement"
  - "Retour sur investissement garanti"

#### 6. **Method Section**
- Présentation en timeline de la méthode de travail (9 étapes)
- Animation séquentielle des étapes
- Design alterné gauche/droite

#### 7. **Offers Section**
- Présentation de 2 packs :
  - **Pack de 10 posts** : 2000 CHF
  - **Business Booster** : 1400 CHF
- Liste détaillée des inclusions pour chaque pack

#### 8. **Testimonials Section**
- Carrousel de témoignages clients
- Citations avec noms et entreprises
- Navigation automatique et manuelle

#### 9. **FAQ Section**
- 8 questions/réponses fréquentes
- Accordéon interactif pour les réponses
- Couvre : délais, inclusions, modifications, droits, acteurs, optimisation, suivi, publicité

#### 10. **Client Login Section**
- Zone de connexion pour les clients existants
- Lien vers `/client-login`

#### 11. **Final CTA Section**
- Dernier appel à l'action
- Bouton Calendly pour prise de rendez-vous

### 🧭 Navigation

#### Header (Navigation)
- **Logo** YourStory avec effet hover
- **Menu desktop** : Accueil, Portfolio, Résultats, Offres, Avis, FAQ
- **Boutons** :
  - Login (pour clients)
  - Prendre un rendez-vous (Calendly)
- **Menu mobile** : Hamburger menu avec navigation complète
- **Glassmorphism** : Effet de verre dépoli sur la barre de navigation

#### Footer
- **Links** : Navigation, liens légaux, réseaux sociaux
- **Réseaux sociaux** : Instagram, TikTok
- **Copyright** et informations légales

### 🔗 Intégrations Externes
- **Calendly** : Prise de rendez-vous directement intégrée
- **Vimeo** : Player vidéo pour showreel et vidéos client
- **Social Media** : Liens vers Instagram (@urstory.ch) et TikTok (@urstory.ch)

---

## 🔐 PARTIE 2 : SYSTÈME D'AUTHENTIFICATION

### Structure des Utilisateurs
- **2 types de rôles** :
  1. **Admin** (`role_id = 1`) : Accès complet au dashboard
  2. **Client** (`role_id = 2`) : Accès au portail client uniquement

### Pages d'Authentification
- **`/client-login`** : Connexion pour les clients
- **`/login`** (dans `(auth)`) : Connexion pour les administrateurs

### Fonctionnalités d'Auth
- **Sessions** : Gestion avec tokens sécurisés
- **Sécurité** : Mots de passe hashés avec bcrypt
- **Sessions persistantes** : Expiration configurable (7 jours par défaut)
- **Protection des routes** : Vérification automatique des permissions
- **Context API** : `SimpleAuthContext` pour gérer l'état global de l'authentification

---

## 👨‍💼 PARTIE 3 : DASHBOARD ADMINISTRATEUR

### 🎛️ Interface Principale

#### Layout du Dashboard
- **Sidebar** : Navigation permanente avec toutes les sections
- **Header** : Titre de la page avec breadcrumbs
- **Responsive** : Sidebar collapsible sur mobile
- **Design** : Gradient moderne, cartes avec glassmorphism

### 📊 1. Dashboard (Vue d'Ensemble)

#### KPIs Mensuels
- **CA (Payé)** : Chiffre d'affaires factures payées du mois
- **Dépenses** : Total des dépenses du mois
- **Bénéfice** : Calcul automatique (CA - Dépenses)
- **Marge** : Pourcentage de rentabilité

#### Bilan Annuel
- Vue consolidée de l'année sélectionnée
- CA Total, Dépenses Total, Bénéfice Annuel
- Sélecteurs de mois et année

#### Top Clients
- Liste des 5 meilleurs clients par CA
- Barres de progression visuelles
- Couleurs dégradées par client

#### Dépenses par Catégorie
- Répartition des dépenses par catégorie
- Visualisation avec barres de progression
- Accès rapide à la page dépenses

#### Actions Rapides
- **Nouvelle facture** → `/factures/new`
- **Nouvelle dépense** → `/depenses/new`
- **Voir clients** → `/clients`
- **Toutes factures** → `/factures`

### 👥 2. Gestion des Clients (`/clients`)

#### Liste des Clients
- **Filtres** :
  - Recherche par nom
  - Filtre par statut (actif, pause, terminé, potentiel)
  - Filtre par type (oneshot, mensuel)
- **Affichage** : Cartes clients avec informations clés

#### Détails Client (`/clients/[id]`)
- **Informations générales** : Nom, email, téléphone, entreprise
- **Statut et type** : Statut actuel, type de client
- **Notes** : Notes internes sur le client
- **Actions** :
  - Éditer le client
  - Voir le dashboard client
  - Voir les stratégies associées

#### Dashboard Client (`/clients/[id]/dashboard`)
- Vue consolidée des informations du client
- Factures, mandats, dépenses liés

#### Stratégies Client (`/clients/[id]/strategies`)
- Liste des stratégies social media du client
- Navigation vers les stratégies

### 💼 3. Gestion des Mandats (`/mandats`)

#### Liste des Mandats
- **Filtres** :
  - Recherche par titre ou client
  - Filtre par statut (en_cours, terminé, annulé)
  - Filtre par type de mandat
- **Affichage** : Cartes mandats avec informations clés

#### Détails Mandat (`/mandats/[id]`)
- **Informations** : Titre, description, dates, statut
- **Client associé** : Lien vers le client
- **Stratégies** : Lien vers les stratégies du mandat
- **Actions** : Édition, suppression

#### Stratégies Mandat (`/mandats/[id]/strategies`)
- Liste des stratégies associées au mandat
- Navigation vers les stratégies

### 📄 4. Gestion des Factures (`/factures`)

#### Liste des Factures
- **Filtres** :
  - Recherche par numéro de facture ou client
  - Filtre par statut (brouillon, envoyée, payée, annulée)
  - Filtre par mois
- **Statistiques** :
  - Total factures
  - Factures brouillon
  - Factures envoyées
  - Factures payées
  - Total à recevoir
- **Affichage** : Tableau avec toutes les informations

#### Détails Facture (`/factures/[id]`)
- **Informations** :
  - Numéro de facture
  - Client associé
  - Dates (émission, échéance)
  - Statut
  - Totaux (HT, TVA, TTC)
- **Lignes de facture** : Liste des items facturés
- **Actions** :
  - Télécharger PDF
  - Générer QR-bill (Suisse)
  - Marquer comme payée
  - Éditer

#### Création/Édition Facture (`/factures/new`, `/factures/[id]/edit`)
- **Formulaire complet** :
  - Sélection du client
  - Date d'émission et échéance
  - Lignes de facture (description, quantité, prix HT, TVA)
  - Calculs automatiques (HT, TVA, TTC)
  - Notes additionnelles
- **Génération PDF** : Création automatique du PDF
- **QR-Bill** : Génération du QR-bill suisse pour paiement

#### Factures Récurrentes (`/factures-recurrentes`)
- Liste des factures récurrentes configurées
- Génération automatique des factures mensuelles
- Planification des prochaines générations

### 💰 5. Gestion des Dépenses (`/depenses`)

#### Liste des Dépenses
- **Filtres** :
  - Recherche par label
  - Filtre par catégorie
  - Filtre par type (client_mandat, yourstory)
  - Filtre par date
- **Catégories** : Classification des dépenses
- **Affichage** : Liste avec montants, dates, catégories

#### Création/Édition Dépense (`/depenses/new`)
- **Formulaire** :
  - Label de la dépense
  - Montant
  - Date
  - Catégorie
  - Type (client ou YourStory)
  - Justificatif (upload de fichier)
  - Notes

### ✅ 6. Gestion des Tâches (`/taches`)

#### Vue d'Ensemble
- **Statistiques** :
  - Total tâches
  - Tâches à faire
  - Tâches en cours
  - Tâches terminées
  - Taux de complétion

#### Liste des Tâches
- **Filtres** :
  - Recherche
  - Filtre par statut (à faire, en cours, terminée)
  - Filtre par type (contenu, vidéo, réunion, reporting, autre)
  - Filtre par mandat
  - Filtre par client
- **Vues** :
  - Vue liste
  - Vue calendrier (calendrier éditorial)
  - Vue grille
- **Actions** :
  - Créer une nouvelle tâche
  - Créer un nouveau mandat
  - Marquer comme terminée

#### Calendrier Éditorial
- Vue calendrier mensuel des tâches
- Navigation entre mois
- Affichage des tâches par jour
- Codes couleur par type de tâche

### 📝 7. Gestion des Scripts (`/scripts`)

#### Liste des Scripts
- **Filtres** :
  - Recherche par titre
  - Filtre par client
  - Filtre par mandat
  - Filtre par post éditorial
- **Affichage** : Liste des scripts avec informations associées

#### Éditeur de Script
- **Éditeur riche** (RichTextEditor)
- **Titre** : Titre du script
- **Association** :
  - Client (optionnel)
  - Mandat (optionnel)
  - Post éditorial (optionnel)
- **Contenu** : Édition WYSIWYG du script
- **Sauvegarde** : Sauvegarde automatique

### 📈 8. Stratégies Social Media (`/clients/[id]/strategies`)

#### Vue d'Ensemble
- Liste des stratégies par client
- Statut des stratégies (brouillon, actif, archive)

#### Création/Édition Stratégie
- **Formulaire complet** en 10 sections :

##### Section 1 : Contexte & Objectifs Business
- Contexte général
- Objectifs business
- Objectifs réseaux sociaux

##### Section 2 : Audience & Personas
- Cibles principales
- Personas (profils types avec besoins, problèmes, attentes)
- Plateformes sociales sélectionnées

##### Section 3 : Positionnement & Identité
- Ton / Voix de la marque
- Guidelines visuelles
- Valeurs & messages clés

##### Section 4 : Piliers de Contenu
- 3 à 6 thèmes principaux de contenu
- Chaque pilier : titre, description, exemples

##### Section 5 : Formats & Rythme
- Formats envisagés (photos, carrousels, vidéos, Reels, etc.)
- Fréquence de publication
- Workflow & rôles

##### Section 6 : Audit & Concurrence
- Audit des profils existants
- Benchmark concurrents

##### Section 7 : KPIs & Suivi
- KPIs définis (nom, objectif, périodicité)
- Cadre de suivi

##### Section 8 : Canaux & Mix Média (PESO)
- Owned Media
- Shared Media
- Paid Media
- Earned Media

##### Section 9 : Budget & Ressources
- Temps humain
- Outils
- Budget publicitaire

##### Section 10 : Planning & Optimisation
- Planning global
- Processus d'itération
- Mise à jour

#### Calendrier Éditorial
- **Vue calendrier mensuel** interactive
- **Gestion des posts** :
  - Ajouter un post (date, plateforme, type, titre, description)
  - Éditer un post existant
  - Supprimer un post
- **Codes couleur** par plateforme (Instagram, Facebook, LinkedIn, TikTok, etc.)
- **Statuts** : Brouillon, Programmé, Publié, Annulé
- **Navigation** : Mois précédent/suivant

### 📋 9. Rapports Mensuels (`/rapports-mensuels`)

#### Génération de Rapports
- Vue d'ensemble mensuelle
- Consolidation des données
- Export PDF possible (à implémenter)

### ⚙️ 10. Paramètres (`/settings`)

#### Configuration de l'Agence
- **Informations société** :
  - Nom de l'entreprise
  - Adresse complète
  - Numéro TVA
  - IBAN
  - Logo
- **Paramètres facturation** :
  - Taux de TVA par défaut
  - Conditions de paiement
  - Notes de bas de page
- **Paramètres généraux** :
  - Configuration de l'application
  - Préférences utilisateur

---

## 👤 PARTIE 4 : PORTAL CLIENT

### 🏠 Page d'Accueil (`/client-portal`)

#### Dashboard Client
- **Message de bienvenue** personnalisé
- **Statistiques** :
  - Nombre de stratégies (total, actives)
  - Nombre de mandats (total, en cours)
  - Nombre de factures (total, payées, en attente)
  - Total dépensé

#### Onglets de Navigation

##### 1. Vue d'Ensemble (Overview)
- Résumé de l'activité
- Dernières activités
- Prochains échéances

##### 2. Stratégies
- Liste des stratégies social media
- Accès en lecture seule
- Visualisation du calendrier éditorial
- Voir les posts planifiés

##### 3. Factures
- Liste des factures du client
- Statut de chaque facture
- **Actions** :
  - Télécharger PDF
  - Voir QR-bill (si applicable)
- Filtres par statut

##### 4. Mandats
- Liste des mandats associés
- Statut de chaque mandat
- Détails des projets

##### 5. Profil
- Informations du compte client
- Coordonnées
- Historique des interactions

---

## 🔧 PARTIE 5 : API & BACKEND

### 🔌 Routes API

#### Authentification
- **`/api/login`** : Connexion utilisateur
- **`/api/logout`** : Déconnexion
- **`/api/auth/session`** : Vérification de session

#### Factures
- **`/api/invoices/generate-pdf`** : Génération PDF facture
- **`/api/invoices/[id]/download`** : Téléchargement PDF
- **`/api/invoices/[id]/qr-bill`** : Génération QR-bill suisse
- **`/api/invoices/[id]/mark-paid`** : Marquer facture comme payée
- **`/api/invoices/recurring/generate`** : Générer facture récurrente
- **`/api/invoices/recurring/batch-generate`** : Génération batch factures récurrentes

#### Contrats
- **`/api/contracts/generate`** : Génération de contrat
- **`/api/contracts/[id]/download`** : Téléchargement contrat PDF

#### Dépenses
- **`/api/expenses/[id]/receipt`** : Téléchargement justificatif dépense

#### Utilitaires
- **`/api/hash-password`** : Hashage de mot de passe (dev uniquement)

### 🗄️ Base de Données (Supabase/PostgreSQL)

#### Tables Principales

##### Utilisateurs & Auth
- **`app_user`** : Utilisateurs (admin, clients)
- **`user_session`** : Sessions utilisateurs
- **`user_role`** : Rôles (admin, client)

##### Clients & Projets
- **`client`** : Informations clients
- **`mandat`** : Mandats/projets clients
- **`mandat_task`** : Tâches associées aux mandats

##### Facturation
- **`invoice`** : Factures
- **`invoice_item`** : Lignes de facture
- **`invoice_recurring`** : Configuration factures récurrentes

##### Finances
- **`expense`** : Dépenses
- **`expense_category`** : Catégories de dépenses

##### Stratégies Social Media
- **`social_media_strategy`** : Stratégies social media par client
- **`editorial_calendar`** : Calendriers éditoriaux (1 par stratégie)
- **`editorial_post`** : Posts planifiés dans le calendrier
- **`script`** : Scripts de contenu (liés aux posts ou mandats)

##### Autres
- **`company_settings`** : Paramètres de l'agence
- **`contract`** : Contrats clients

### 📦 Storage Supabase
- **Factures PDF** : Stockage des PDFs de factures
- **QR-Bills** : Stockage des QR-bills
- **Justificatifs** : Upload des justificatifs de dépenses
- **Contrats** : Stockage des contrats PDF

---

## 🎨 PARTIE 6 : DESIGN SYSTEM

### 🎨 Couleurs & Thème
- **Couleur principale** : Orange (#FD5904)
- **Palette** : Gradients orange/rouge pour les éléments principaux
- **Glassmorphism** : Effets de verre dépoli avec backdrop-filter
- **Dark mode** : Support (préparé dans les variables CSS)

### 📐 Composants UI Réutilisables

#### Layout
- **`Header`** : En-tête de page avec titre et sous-titre
- **`Sidebar`** : Navigation latérale du dashboard
- **`PremiumFooter`** : Footer de la landing page

#### Formulaires
- **Inputs** : Champs de formulaire stylisés
- **Select** : Menus déroulants
- **RichTextEditor** : Éditeur de texte riche

#### Cards
- **`stat-card`** : Cartes statistiques avec gradients
- **`card`** : Cartes génériques avec glassmorphism

#### Modales
- **`QuickTaskModal`** : Création rapide de tâche
- **`QuickMandatModal`** : Création rapide de mandat

#### Carrousels
- **`ClientLogosCarousel`** : Carrousel logos clients
- **`TestimonialsCarousel`** : Carrousel témoignages

#### Calendrier
- **`AgencyEditorialCalendar`** : Calendrier éditorial interactif

### 🎭 Animations
- **Fade-in** : Apparition progressive
- **Fade-up** : Apparition depuis le bas
- **Hover effects** : Effets au survol
- **Scroll reveal** : Révélation au scroll
- **Loading states** : États de chargement animés

---

## 📱 PARTIE 7 : OPTIMISATIONS & PERFORMANCE

### ⚡ Performance
- **Dynamic Imports** : Lazy loading des sections de la landing page
- **Image Optimization** : Next.js Image avec priority pour les images critiques
- **Code Splitting** : Séparation automatique du code par route
- **Mobile Optimizations** : Réduction des animations, simplification des effets sur mobile

### 📱 Responsive Design
- **Breakpoints** : sm (640px), md (768px), lg (1024px), xl (1280px)
- **Mobile First** : Design pensé mobile d'abord
- **Touch Targets** : Tailles minimales 48x48px sur mobile
- **Typography** : Tailles de police fluides (clamp)

### 🔍 SEO
- **Metadata** : Titre et description configurés
- **Semantic HTML** : Structure sémantique
- **Alt Text** : Textes alternatifs pour les images

---

## 🔐 PARTIE 8 : SÉCURITÉ

### Authentification
- **Hashage** : Mots de passe hashés avec bcrypt
- **Sessions** : Tokens sécurisés avec expiration
- **Protection Routes** : Vérification des rôles avant accès

### Autorisations
- **Rôles** : Système de rôles (admin, client)
- **Vérifications** : Middleware de vérification des permissions
- **Isolation** : Les clients ne voient que leurs propres données

---

## 📊 PARTIE 9 : STATISTIQUES & ANALYTICS

### Dashboard Admin
- **KPIs financiers** : CA, dépenses, bénéfice, marge
- **Top clients** : Classement par chiffre d'affaires
- **Dépenses par catégorie** : Répartition visuelle
- **Tendances** : Comparaison mois/année

### Client Portal
- **Statistiques personnelles** : Vue d'ensemble de leur activité
- **Historique** : Liste des factures, mandats, stratégies

---

## 🚀 PARTIE 10 : FONCTIONNALITÉS AVANCÉES

### Génération PDF
- **Factures** : Génération automatique avec PDFKit
- **QR-Bill Suisse** : Conformité suisse avec SwissQRBill
- **Contrats** : Génération de contrats PDF

### Factures Récurrentes
- **Configuration** : Définition de factures récurrentes
- **Génération automatique** : Création mensuelle automatique
- **Batch processing** : Génération en lot

### Calendrier Éditorial
- **Planification** : Planification des posts sur plusieurs mois
- **Multi-plateformes** : Gestion de plusieurs réseaux sociaux
- **Statuts** : Workflow de publication (brouillon → programmé → publié)
- **Métriques** : Tracking des performances (likes, vues, engagement)

### Scripts
- **Éditeur riche** : Création de scripts avec formatage
- **Association** : Liaison avec clients, mandats, posts éditoriaux
- **Versioning** : Historique des modifications

---

## 📝 PARTIE 11 : WORKFLOWS

### Workflow Facturation
1. Création de la facture (brouillon)
2. Ajout des lignes de facturation
3. Génération du PDF
4. Envoi au client (statut : envoyée)
5. Paiement reçu (statut : payée)
6. Archivage

### Workflow Mandat
1. Création du client
2. Création du mandat
3. Création de la stratégie social media (optionnel)
4. Planification des tâches
5. Création des scripts
6. Suivi des livrables
7. Facturation

### Workflow Stratégie Social Media
1. Création de la stratégie (brouillon)
2. Remplissage des 10 sections
3. Activation de la stratégie
4. Création du calendrier éditorial (automatique)
5. Planification des posts
6. Création des scripts associés
7. Publication et suivi des métriques

---

## 🔮 PARTIE 12 : FONCTIONNALITÉS FUTURES (À CRÉER)

### Landing Page
- **`/portfolio`** : Page portfolio avec études de cas détaillées

### Dashboard
- **Reporting avancé** : Graphiques et exports PDF
- **Notifications** : Système de notifications en temps réel
- **Email** : Envoi automatique de factures par email
- **Intégrations** : APIs externes (comptabilité, CRM)

### Client Portal
- **Chat** : Communication directe avec l'agence
- **Upload** : Téléversement de fichiers par les clients
- **Validation** : Validation des livrables par les clients

---

## 📦 Structure des Fichiers

```
src/app/
├── page.tsx                    # Landing page
├── layout.tsx                  # Layout principal
├── globals.css                 # Styles globaux
├── (dashboard)/                # Dashboard admin (route group)
│   ├── layout.tsx
│   ├── dashboard/
│   ├── clients/
│   ├── mandats/
│   ├── factures/
│   ├── depenses/
│   ├── taches/
│   ├── scripts/
│   ├── rapports-mensuels/
│   └── settings/
├── (auth)/                     # Authentification (route group)
│   └── login/
├── client-login/               # Login client
├── client-portal/              # Portail client
├── sections/                   # Sections landing page
├── components/                 # Composants réutilisables
├── api/                        # Routes API
└── data/                       # Données statiques
```

---

## 🎯 Conclusion

Cette application est une **plateforme complète et professionnelle** pour gérer une agence de production vidéo. Elle combine :

✅ **Marketing** : Landing page moderne et performante
✅ **Administration** : Dashboard complet pour gérer tous les aspects de l'agence
✅ **Client** : Portail dédié pour la collaboration
✅ **Finances** : Gestion complète de la facturation et des dépenses
✅ **Stratégie** : Outil avancé pour les stratégies social media
✅ **Productivité** : Gestion des tâches, scripts, calendrier éditorial

L'application est **prête pour la production** avec une architecture solide, des fonctionnalités complètes, et une expérience utilisateur optimale.


