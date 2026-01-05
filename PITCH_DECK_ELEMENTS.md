# 🎨 Guide Complet des Éléments de Pitch Deck

Documentation complète de tous les éléments disponibles dans l'éditeur de pitch deck Urstory.

---

## 📝 Texte & Contenu

### 1. **Titre (Heading)**
- Niveaux : H1, H2, H3, H4
- Alignement : Gauche, Centre, Droite
- Couleurs personnalisables
- Tailles responsives (5xl-6xl pour H1)

### 2. **Texte (Text)**
- Tailles : Petit, Normal, Grand, Très grand
- Alignement configurable
- Gras optionnel
- Line-height optimisé

### 3. **Liste (List)**
- À puces ou numérotée
- Items éditables dynamiquement
- Ajout/suppression d'items
- Espacement généreux

### 4. **Image**
- Upload direct de fichiers
- URL externe
- Largeur : 25%, 50%, 75%, 100%
- Bordures : Aucune, Normale, Grande, Cercle
- Aperçu en temps réel

---

## 📊 Graphiques (Recharts)

### 5. **Graphique en Barres**
- Données éditables (nom, valeur)
- Couleur personnalisable
- Titre optionnel
- Hauteur : 400px
- Coins arrondis
- Tooltips stylisés orange

### 6. **Graphique Linéaire**
- Courbes avec points de données
- Stroke width : 4px
- Points avec bordure blanche
- Animations au survol
- Grille subtile

### 7. **Graphique Circulaire (Camembert)**
- Labels avec pourcentages
- Palette de couleurs orange
- Rayon : 140px
- Légende automatique
- Tooltips interactifs

---

## 🔄 Schémas & Diagrammes

### 8. **Timeline**
- **Orientations** : Horizontal ou Vertical
- **Éléments** :
  - Date
  - Titre
  - Description
- Points de connexion orange
- Cartes avec bordures
- Idéal pour : Roadmap, Historique, Planning

### 9. **Process (Étapes)**
- **Affichage** : Numéros dans cercles orange
- **Éléments** :
  - Numéro d'étape
  - Titre
  - Description
- Flèches de connexion
- Responsive (vertical sur mobile)
- Idéal pour : Méthodologie, Workflow, Processus

### 10. **Comparison (Comparaison)**
- **Structure** : 2 colonnes
- **Éléments** :
  - Label/Titre
  - Liste de features avec checkmarks
- Bordures au survol
- Idéal pour : Avant/Après, Options A/B, Plans tarifaires

### 11. **Feature Grid (Grille de Fonctionnalités)**
- **Disposition** : 1-4 colonnes (responsive)
- **Éléments par feature** :
  - Icône (Target, TrendingUp, Workflow)
  - Titre
  - Description
- Cercles d'icônes avec effet hover
- Idéal pour : Avantages, Services, Caractéristiques

### 12. **Metric Card (Carte Métrique)**
- **Composants** :
  - Valeur (grande, 6xl)
  - Label
  - Tendance (hausse/baisse/neutre)
- Icône de tendance colorée
- Gradient de fond
- Idéal pour : KPIs, Statistiques, Résultats

---

## 🎯 Formes & Éléments

### 13. **Arrow (Flèche)**
- **Directions** : Droite, Bas, Haut
- **Propriétés** :
  - Label optionnel
  - Couleur
- Taille : 12x12 (3rem)
- Idéal pour : Connexions, Flux, Transitions

### 14. **Shape (Forme Géométrique)**
- **Types** :
  - Rectangle
  - Cercle
  - Pilule (pill)
- **Personnalisation** :
  - Texte
  - Couleur de fond
  - Couleur de texte
- Ombres portées
- Bordures subtiles
- Idéal pour : Encadrés, Call-to-action, Labels

---

## 🎨 Mise en Page

### 15. **Separator (Séparateur)**
- **Styles** : Solide, Tirets, Points
- **Couleurs** : Orange Urstory, Gris, Blanc
- **Épaisseur** : border-2 par défaut
- Opacité 50%
- Marges généreuses (my-8)

### 16. **Badge**
- Texte personnalisable
- 5 couleurs : Orange, Bleu, Vert, Violet, Rouge
- Uppercase avec tracking
- Ombres portées
- Tailles : base à lg

### 17. **Callout (Encadré)**
- **Types** :
  - Info (bleu) - AlertCircle
  - Succès (vert) - CheckCircle
  - Attention (jaune) - AlertTriangle
  - Erreur (rouge) - XCircle
- Icônes automatiques
- Bordure gauche colorée
- Fond semi-transparent avec blur

### 18. **Columns (Colonnes)**
- **Configurations** : 2, 3 ou 4 colonnes
- Responsive (1 colonne sur mobile)
- Cartes avec hover orange
- Contenu multiligne

---

## 🎨 Palette de Couleurs Urstory

### Couleurs Principales
```css
Orange Primary:   #f97316
Orange Light:     #fb923c
Orange Lighter:   #fdba74
Bleu:            #3b82f6
Vert:            #10b981
Violet:          #8b5cf6
```

### Backgrounds
```css
Slate 950:       #0f172a
Slate 900:       #1e293b
Slate 800:       #334155
Slate 700:       #475569
```

---

## 💡 Cas d'Usage par Type de Présentation

### **Présentation Entreprise**
- Heading (titre)
- Feature Grid (services)
- Metric Cards (résultats)
- Timeline (historique)

### **Proposition Commerciale**
- Process (méthodologie)
- Comparison (options)
- Bar Chart (pricing)
- Callout (garanties)

### **Roadmap Produit**
- Timeline (planning)
- Feature Grid (fonctionnalités)
- Line Chart (évolution)
- Badges (statuts)

### **Rapport de Performance**
- Metric Cards (KPIs)
- Line Chart (croissance)
- Pie Chart (répartition)
- Callout (insights)

---

## ⚡ Optimisations Appliquées

### Performance
- ✅ Composants React mémorisés
- ✅ Rendu conditionnel optimisé
- ✅ Lazy loading des graphiques
- ✅ Debouncing des éditions

### UX/UI
- ✅ Transitions fluides (300ms)
- ✅ Hover states partout
- ✅ Focus states accessibles
- ✅ Responsive à tous niveaux
- ✅ Preview mode aspect ratio 16:9

### Accessibilité
- ✅ Contrast ratios WCAG AA
- ✅ Focus visible
- ✅ Alt texts pour images
- ✅ ARIA labels où nécessaire

### Code Quality
- ✅ TypeScript strict
- ✅ Props validation
- ✅ Error boundaries
- ✅ Safe optional chaining

---

## 🚀 Raccourcis Clavier (Future)

- `Ctrl + S` : Sauvegarder
- `Ctrl + Z` : Annuler
- `Ctrl + Y` : Refaire
- `Ctrl + D` : Dupliquer élément
- `Delete` : Supprimer élément sélectionné
- `↑↓` : Naviguer entre slides
- `Tab` : Sélectionner élément suivant

---

## 📱 Responsive Breakpoints

```css
Mobile:   < 768px  (sm)
Tablet:   768px+   (md)
Desktop:  1024px+  (lg)
Large:    1280px+  (xl)
```

Tous les éléments s'adaptent automatiquement :
- Grilles passent en 1 colonne sur mobile
- Textes réduisent de taille
- Process devient vertical
- Charts maintiennent proportions

---

## 🎯 Best Practices

1. **Limitez à 3-5 éléments par slide** pour la clarté
2. **Utilisez la hiérarchie** : H1 → H2 → Texte
3. **Couleurs cohérentes** : Restez sur la palette Urstory
4. **Espacement** : Laissez respirer le contenu
5. **Contrastes** : Assurez la lisibilité
6. **Graphiques** : Max 5-7 points de données
7. **Timeline** : Max 5 événements
8. **Process** : Max 4-5 étapes

---

## 🔧 Troubleshooting

### Les graphiques ne s'affichent pas
➜ Vérifiez que Recharts est installé : `npm list recharts`

### Éléments qui débordent
➜ Utilisez les colonnes responsive et limitez le contenu

### Performances lentes
➜ Réduisez le nombre de graphiques par slide (max 2)

### Images qui ne chargent pas
➜ Vérifiez les URLs ou utilisez base64 pour petites images

---

## 📊 Statistiques de l'Éditeur

- **Total éléments** : 18 types
- **Graphiques** : 3 types (Recharts)
- **Schémas** : 5 types
- **Formes** : 2 types
- **Mise en page** : 4 types
- **Texte** : 4 types

**Possibilités combinées** : Illimitées ! 🎨

---

Créé avec ❤️ pour **Urstory.ch**
