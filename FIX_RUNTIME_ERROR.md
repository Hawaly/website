# Fix: Erreur Runtime "Cannot find module './586.js'"

## 🐛 Problème

```
Error: Cannot find module './586.js'
Runtime Error lors du démarrage du serveur de développement
```

## 🔍 Cause

L'erreur était causée par l'utilisation de `React.lazy()` dans un **Server Component** de Next.js 15. 

### Pourquoi ça ne fonctionnait pas ?

1. **`React.lazy()` est pour les Client Components** uniquement
2. Next.js 15 utilise Server Components par défaut
3. Le système de code splitting de Next.js utilise `next/dynamic` et non `React.lazy()`
4. Le cache webpack (dossier `.next`) contenait des références incorrectes

## ✅ Solution Appliquée

### 1. Nettoyage du Cache
```bash
Remove-Item -Recurse -Force .next
```

### 2. Remplacement de `React.lazy()` par `next/dynamic`

**Avant** ❌:
```typescript
import { Suspense, lazy } from 'react';

const HeroSection = lazy(() => import('./sections/HeroSection'));

// Dans le JSX
<Suspense fallback={<SectionFallback />}>
  <HeroSection />
</Suspense>
```

**Après** ✅:
```typescript
import dynamic from 'next/dynamic';

const HeroSection = dynamic(() => import('./sections/HeroSection'), {
  loading: () => <SectionFallback />
});

// Dans le JSX (plus besoin de Suspense)
<HeroSection />
```

### 3. Modifications Détaillées

#### Page.tsx
```typescript
// Imports mis à jour
import dynamic from 'next/dynamic'; // Au lieu de lazy
// Supprimé: import { Suspense, lazy } from 'react';

// Composant de loading défini AVANT les imports dynamiques
function SectionFallback() {
  return (
    <div className="relative overflow-hidden px-4 py-16 md:px-6 section">
      <div className="mx-auto max-w-6xl flex items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-orange-400 rounded-full animate-bounce" 
               style={{ animationDelay: '0ms' }}></div>
          <div className="h-3 w-3 bg-orange-400 rounded-full animate-bounce" 
               style={{ animationDelay: '150ms' }}></div>
          <div className="h-3 w-3 bg-orange-400 rounded-full animate-bounce" 
               style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

// Tous les imports dynamiques avec loading state
const HeroSection = dynamic(() => import('./sections/HeroSection'), {
  loading: () => <SectionFallback />
});
const VideoSection = dynamic(() => import('./sections/VideoSection'), {
  loading: () => <SectionFallback />
});
// ... etc pour toutes les sections
```

## 📊 Résultats

### Build Réussi ✅
```
Route (app)                                 Size  First Load JS
┌ ○ /                                    8.41 kB         119 kB
├ ○ /_not-found                            994 B         103 kB
└ ○ /login                                 173 B         111 kB
```

### Avantages de `next/dynamic`

1. ✅ **Compatible avec Server Components**
2. ✅ **Code splitting automatique**
3. ✅ **Loading states intégrés**
4. ✅ **Optimisations webpack built-in**
5. ✅ **Pas besoin de Suspense manuel**

## 🔑 Points Clés à Retenir

### React.lazy() vs next/dynamic

| Feature | React.lazy() | next/dynamic |
|---------|-------------|--------------|
| Server Components | ❌ Non | ✅ Oui |
| Client Components | ✅ Oui | ✅ Oui |
| Next.js optimisations | ❌ Non | ✅ Oui |
| SSR Support | ⚠️ Limité | ✅ Complet |
| Loading UI | Suspense requis | Intégré |

### Quand Utiliser Quoi ?

**Utilisez `next/dynamic` quand** :
- ✅ Vous êtes dans Next.js (toujours recommandé)
- ✅ Vous avez des Server Components
- ✅ Vous voulez le SSR
- ✅ Vous voulez les optimisations Next.js

**Utilisez `React.lazy()` quand** :
- ⚠️ Vous êtes dans une app React pure (pas Next.js)
- ⚠️ Vous êtes dans un Client Component explicite
- ⚠️ Vous n'utilisez pas le SSR

## 🛠️ Commandes pour Résoudre l'Erreur

Si vous rencontrez cette erreur à nouveau :

```bash
# 1. Nettoyer le cache
Remove-Item -Recurse -Force .next

# 2. Nettoyer node_modules (si nécessaire)
Remove-Item -Recurse -Force node_modules
npm install

# 3. Rebuild
npm run build

# 4. Démarrer le dev server
npm run dev
```

## 📚 Documentation

- [Next.js Dynamic Imports](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [React.lazy() Limitations](https://react.dev/reference/react/lazy)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

## ✅ Checklist de Vérification

Après avoir appliqué le fix :

- [x] Cache `.next` supprimé
- [x] `React.lazy()` remplacé par `next/dynamic`
- [x] `Suspense` supprimé (géré par dynamic)
- [x] Build réussi sans erreurs
- [x] Pas d'erreurs de linting
- [x] Taille du bundle optimale (8.41 kB)

---

**Status** : ✅ **RÉSOLU**  
**Date** : 25 Novembre 2025  
**Version Next.js** : 15.5.3

