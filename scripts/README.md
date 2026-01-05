# 🛠️ Scripts d'Automatisation - Migration Supabase Auth

Ce dossier contient les scripts d'automatisation pour faciliter la migration vers Supabase Auth et l'activation de RLS.

## 📋 Scripts Disponibles

### 1. `migrate-users-to-supabase-auth.ts`

**Usage :** Phase 3 - Migration des users existants vers Supabase Auth

```bash
npx tsx scripts/migrate-users-to-supabase-auth.ts
```

**Ce qu'il fait :**
- Récupère tous les `app_user` sans `auth_user_id`
- Crée un compte Supabase Auth pour chacun
- Lie `auth_user_id` dans `app_user`
- Génère des mots de passe temporaires
- Sauvegarde les passwords dans `migration-passwords.json`

**Quand l'utiliser :**
- Avant Phase 4 (Auth UI)
- Quand tu es prêt à migrer l'authentification

**Output :**
- Rapport de migration dans la console
- Fichier `migration-passwords.json` avec les passwords temporaires

---

### 2. `verify-migration-status.ts`

**Usage :** Vérifier l'état de la migration à tout moment

```bash
npx tsx scripts/verify-migration-status.ts
```

**Ce qu'il fait :**
- Compte les users migrés vs non migrés
- Vérifie que les fonctions `public.*` existent
- Vérifie l'état RLS des tables
- Donne des recommandations

**Quand l'utiliser :**
- À tout moment pour voir où tu en es
- Avant de passer à la phase suivante
- Pour debugger un problème

**Output :**
- Rapport détaillé dans la console
- Recommandations sur les prochaines actions

---

### 3. `test-rls-policies.ts`

**Usage :** Tester que les policies RLS fonctionnent correctement

```bash
npx tsx scripts/test-rls-policies.ts
```

**Ce qu'il fait :**
- Teste l'accès anonyme (doit être bloqué)
- Teste JWT invalide (doit être bloqué)
- Vérifie que RLS est actif sur les tables critiques
- Valide que les fonctions `public.*` sont accessibles

**Quand l'utiliser :**
- **Après Phase 5** (activation RLS)
- Pour valider que la sécurité fonctionne
- Pour debugger un problème d'accès

**Prérequis :**
- RLS doit être activé (Phase 5 complétée)

**Output :**
- Rapport de tests dans la console
- Score de réussite / échec

---

### 4. `rollback-rls.ts`

**Usage :** Désactiver RLS en cas d'urgence

```bash
npx tsx scripts/rollback-rls.ts
```

**Ce qu'il fait :**
- Demande confirmation (sécurité)
- Désactive RLS sur toutes les tables
- Supprime toutes les policies
- Retourne à l'état avant Phase 5

**Quand l'utiliser :**
- ⚠️ **URGENCE SEULEMENT**
- Si l'app est cassée après activation RLS
- Si les users ne peuvent plus se connecter
- Si les API routes ne fonctionnent plus

**Prérequis :**
- Consulter l'équipe avant d'exécuter
- Avoir un backup de la DB

**Output :**
- Rapport de rollback
- Recommandations pour corriger le problème

---

## 🚀 Ordre d'Exécution Recommandé

### Pendant la Migration

```bash
# 1. Vérifier l'état actuel
npx tsx scripts/verify-migration-status.ts

# 2. Migrer les users (Phase 3)
npx tsx scripts/migrate-users-to-supabase-auth.ts

# 3. Vérifier que la migration a réussi
npx tsx scripts/verify-migration-status.ts

# 4. Après Auth UI + Activation RLS (Phase 5)
npx tsx scripts/test-rls-policies.ts

# 5. Si problème critique
npx tsx scripts/rollback-rls.ts
```

---

## ⚙️ Configuration Requise

### Variables d'Environnement

Tous les scripts nécessitent les variables suivantes dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
```

### Dépendances

Les scripts utilisent :
- `@supabase/supabase-js` (déjà installé)
- `tsx` pour exécution TypeScript

Installer tsx si nécessaire :
```bash
npm install -D tsx
```

---

## 📊 Fichiers Générés

### `migration-passwords.json`

Créé par `migrate-users-to-supabase-auth.ts`

```json
[
  {
    "email": "user@example.com",
    "password": "TempPass123!@#"
  }
]
```

**⚠️ IMPORTANT :**
- Ne PAS commit ce fichier
- Envoyer les passwords aux users
- Supprimer après envoi
- Déjà ajouté dans `.gitignore`

---

## 🆘 Troubleshooting

### Erreur: "Cannot find module '../lib/supabaseAdmin'"

**Solution :**
```bash
# Vérifier que le fichier existe
ls lib/supabaseAdmin.ts

# Rebuild le projet
npm run build
```

### Erreur: "Missing SUPABASE_SERVICE_ROLE_KEY"

**Solution :**
Ajouter la clé dans `.env.local` (voir README principal)

### Erreur: "Permission denied for table X"

**Cause :** RLS est activé mais tu utilises la mauvaise clé

**Solution :**
- Scripts utilisent `supabaseAdmin` (SERVICE_ROLE_KEY)
- Vérifier que `SERVICE_ROLE_KEY` est correcte
- Ne PAS utiliser ANON_KEY pour ces scripts

### Script bloqué / ne répond plus

**Solution :**
```bash
# Ctrl+C pour arrêter
# Vérifier les logs Supabase Dashboard
# Réexécuter avec plus de logging
```

---

## 📝 Logs et Debugging

### Activer les logs détaillés

Les scripts loggent déjà dans la console, mais tu peux :

1. **Logs Supabase Dashboard**
   - Dashboard → Logs → Postgres Logs
   - Voir les erreurs SQL en temps réel

2. **Logs API Supabase**
   - Dashboard → Logs → API Logs
   - Voir les requêtes qui échouent

3. **Ajouter logs custom**
   ```typescript
   console.log('Debug:', { variable1, variable2 });
   ```

---

## 🔒 Sécurité

### Bonnes Pratiques

1. **Ne JAMAIS commit les passwords**
   - `migration-passwords.json` est dans `.gitignore`
   - Supprimer après envoi aux users

2. **SERVICE_ROLE_KEY**
   - Ne JAMAIS exposer côté client
   - Seulement dans scripts backend et API routes
   - Ne JAMAIS commit dans git

3. **Backup avant actions critiques**
   ```bash
   pg_dump -d database > backup.sql
   ```

4. **Tester en staging d'abord**
   - Si possible, tester sur DB de dev
   - Valider avant production

---

## 📞 Support

**Documentation complète :**
- `SUPABASE_AUTH_MIGRATION_GUIDE.md` - Guide pas à pas
- `SUPABASE_AUTH_ROADMAP.md` - Roadmap et timeline

**En cas de problème :**
1. Vérifier les logs Supabase Dashboard
2. Exécuter `verify-migration-status.ts`
3. Consulter la documentation Supabase
4. Utiliser `rollback-rls.ts` en dernier recours

---

**Dernière mise à jour :** 2026-01-04  
**Version :** 1.0
