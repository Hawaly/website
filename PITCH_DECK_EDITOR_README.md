# 🎨 Éditeur de Pitch Deck avec Graphiques

Un éditeur complet de pitch deck intégré avec support pour des graphiques interactifs magnifiques.

## ✨ Fonctionnalités

### 📊 Types de contenu supportés

1. **Texte et Titres**
   - Titres H1-H4 personnalisables
   - Texte avec contrôle de taille, alignement et couleur
   - Formatage riche

2. **Listes**
   - Listes à puces
   - Listes numérotées
   - Items éditables en temps réel

3. **Graphiques Interactifs**
   - **Graphiques en Barres** : Parfait pour les comparaisons
   - **Graphiques Linéaires** : Idéal pour les tendances
   - **Graphiques Circulaires (Camembert)** : Excellent pour les proportions
   - Données entièrement éditables
   - Couleurs personnalisables
   - Titres et légendes

4. **Images** (à venir)
   - Upload d'images
   - Redimensionnement
   - Positionnement

## 🚀 Installation

### Dépendances requises

Pour que les graphiques fonctionnent, vous devez installer **Recharts** :

```bash
npm install recharts
# ou
yarn add recharts
# ou
pnpm add recharts
```

## 📖 Utilisation

### Créer un nouveau pitch deck

1. Allez sur `/sales/pitch-decks`
2. Cliquez sur **"Nouveau pitch deck"**
3. Sélectionnez un prospect
4. Choisissez un template (optionnel)
5. Le pitch deck est créé avec des slides de base

### Éditer un pitch deck

1. Depuis la liste, cliquez sur un pitch deck
2. Vous arrivez sur l'éditeur visuel
3. **Sidebar gauche** : Liste des slides
4. **Zone centrale** : Canvas d'édition
5. **Panneau droit** : Propriétés de l'élément sélectionné

### Ajouter du contenu

#### Titre
- Cliquez sur "Titre" dans la barre d'outils
- Modifiez le texte dans le panneau de propriétés
- Ajustez l'alignement

#### Graphique en Barres
1. Cliquez sur "Barres"
2. Dans le panneau de propriétés :
   - Modifiez le titre
   - Ajoutez/modifiez les données (nom, valeur)
   - Ajustez les couleurs

#### Graphique Linéaire
1. Cliquez sur "Courbe"
2. Configurez les données et le style
3. Parfait pour montrer l'évolution dans le temps

#### Graphique Circulaire
1. Cliquez sur "Camembert"
2. Ajoutez vos segments (nom, valeur)
3. Les couleurs sont automatiquement appliquées

### Navigation

- **Précédent/Suivant** : Naviguez entre les slides
- **Mode Édition/Prévisualisation** : Basculez entre les modes
- **Enregistrer** : Sauvegarde automatique du contenu

## 🎯 Exemples de Templates

### Standard Agency Pitch
- Introduction
- About Us
- Services
- Case Studies
- Pricing
- Contact

### Social Media Strategy
- Current Situation
- Strategy Overview
- Content Pillars
- KPIs
- Timeline
- Investment

### Branding & Identity
- Brand Analysis
- Vision
- Identity Elements
- Applications
- Guidelines
- Next Steps

### Digital Marketing
- Market Analysis
- Campaign Strategy
- Channels
- Budget
- Timeline
- ROI

## 🎨 Personnalisation

### Couleurs des graphiques

Les couleurs par défaut sont :
- Orange : `#f97316`
- Bleu : `#3b82f6`
- Vert : `#10b981`
- Violet : `#8b5cf6`
- Rose : `#ec4899`
- Jaune : `#f59e0b`

Vous pouvez les modifier dans le panneau de propriétés.

## 📁 Structure des fichiers

```
src/
├── app/(dashboard)/sales/pitch-decks/
│   ├── [id]/
│   │   ├── page.tsx          # Page d'édition
│   │   └── edit/page.tsx     # Page de modification métadonnées
│   ├── new/page.tsx           # Création nouveau pitch deck
│   └── page.tsx               # Liste des pitch decks
│
├── components/sales/
│   ├── PitchDeckEditor.tsx    # Éditeur principal
│   └── SlideRenderer.tsx      # Rendu des slides
│
└── api/sales/pitch-decks/
    ├── route.ts               # GET, POST
    └── [id]/route.ts          # GET, PATCH, DELETE
```

## 💾 Structure de données

### Slide
```typescript
{
  id: number,
  title: string,
  content: {
    type: string,
    elements: Element[]
  },
  order: number
}
```

### Element
```typescript
{
  id: number,
  type: "text" | "heading" | "list" | "barChart" | "lineChart" | "pieChart" | "image",
  // Propriétés spécifiques au type...
}
```

### Exemple : Graphique en Barres
```typescript
{
  id: 1234567890,
  type: "barChart",
  data: [
    { name: "Jan", value: 400 },
    { name: "Fév", value: 300 },
    { name: "Mar", value: 600 }
  ],
  dataKey: "value",
  color: "#f97316",
  title: "Évolution mensuelle"
}
```

## 🚀 Prochaines améliorations

- [ ] Export PDF haute qualité
- [ ] Export PowerPoint (.pptx)
- [ ] Upload et gestion d'images
- [ ] Templates personnalisés
- [ ] Collaboration en temps réel
- [ ] Bibliothèque d'icônes
- [ ] Animations de transition
- [ ] Thèmes de couleurs prédéfinis
- [ ] Import de données depuis CSV/Excel
- [ ] Duplication de slides
- [ ] Drag & drop pour réordonner les slides

## 🎯 Bonnes pratiques

1. **Limitez le nombre d'éléments par slide** : Maximum 3-4 éléments pour garder la clarté
2. **Utilisez des couleurs cohérentes** : Restez sur une palette de 3-4 couleurs
3. **Titres courts et percutants** : Maximum 8-10 mots
4. **Données simplifiées** : 5-7 points de données maximum par graphique
5. **Hiérarchie visuelle** : Utilisez les tailles de texte pour guider l'attention

## 🔧 Dépannage

### Les graphiques ne s'affichent pas
- Vérifiez que Recharts est installé : `npm list recharts`
- Redémarrez le serveur de développement

### Erreur lors de l'enregistrement
- Vérifiez la connexion à la base de données
- Assurez-vous que le champ `slides` est un JSONB valide

### Performance lente
- Limitez le nombre de points de données dans les graphiques (< 50)
- Optimisez les images (compression, format WebP)

## 📞 Support

Pour toute question ou problème, consultez la documentation ou créez une issue.
