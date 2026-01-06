# 🛡️ GUIDE DE REMÉDIATION - ATTAQUE JANVIER 2026

## 📊 RÉSUMÉ EXÉCUTIF

**Type d'attaque:** Endpoint API non protégé (pas d'injection SQL)  
**Vecteur:** `/api/users` POST sans authentification  
**Impact:** Création de comptes admin non autorisés  
**Criticité:** 🔴 MAXIMALE  
**Status:** ✅ Vulnérabilité patchée

---

## 🔍 CE QUI S'EST PASSÉ

Le hacker **n'a PAS utilisé d'injection SQL**. Votre application utilise Supabase qui est protégé contre ça.

### L'exploit réel:

```typescript
// AVANT (VULNÉRABLE):
export async function POST(request: NextRequest) {
  // ❌ AUCUNE vérification d'authentification
  const { email, password, role_id } = body;
  
  // L'attaquant contrôle role_id = 1 (admin)
  await supabaseAdmin.auth.admin.createUser({ email, password });
  await supabaseAdmin.from('app_user').insert({
    role_id: parseInt(role_id), // ← 1 = ADMIN
  });
}
```

### Commande utilisée par le hacker:

```bash
curl -X POST https://votre-domaine.com/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hacker@evil.com",
    "password": "Password123!",
    "role_id": 1
  }'

# Résultat: Compte admin créé en 1 seconde
```

---

## ✅ CORRECTIFS APPLIQUÉS

### 1. Protection des endpoints `/api/users`

**Fichiers modifiés:**
- ✅ `src/app/api/users/route.ts` (GET + POST)
- ✅ `src/app/api/users/[id]/route.ts` (PUT + DELETE)

**Code ajouté:**
```typescript
export async function POST(request: NextRequest) {
  // 🔒 SÉCURITÉ: Vérifier que l'utilisateur est admin
  const session = await requireRole(request, [1]);
  if (session instanceof NextResponse) return session;
  
  // Suite du code...
}
```

### 2. Scripts de détection créés

- ✅ `scripts/find-malicious-users.sql` - Détection des comptes suspects
- ✅ `ATTACK_ANALYSIS.md` - Analyse complète de l'attaque

---

## 🚨 ACTIONS IMMÉDIATES À FAIRE

### Étape 1: Identifier les comptes malveillants

```bash
# Dans Supabase SQL Editor ou psql
psql -U postgres -d yourstory -f scripts/find-malicious-users.sql
```

Vérifier particulièrement:
- Tous les admins récents
- Emails suspects (hack, evil, test, temp, etc.)
- Comptes créés puis connectés dans les 5 minutes

### Étape 2: Supprimer les comptes malveillants

**Pour chaque compte suspect:**

```sql
-- 1. Vérifier le compte
SELECT id, email, role_id, created_at, auth_user_id 
FROM app_user 
WHERE email = 'hacker@evil.com';

-- 2. Noter l'auth_user_id (exemple: '123e4567-e89b-12d3-a456-426614174000')

-- 3. Supprimer de app_user
DELETE FROM app_user WHERE email = 'hacker@evil.com';
```

**Ensuite dans Supabase Dashboard:**
1. Aller dans `Authentication > Users`
2. Chercher l'utilisateur par email
3. Cliquer sur "..." > Delete User

**Ou via API:**
```typescript
await supabaseAdmin.auth.admin.deleteUser('auth_user_id');
```

### Étape 3: Déployer les correctifs

```bash
# 1. Vérifier les changements
git diff src/app/api/users/

# 2. Commit et deploy
git add src/app/api/users/
git commit -m "🔒 SECURITY: Fix unauthorized user creation vulnerability"
git push origin main

# 3. Déployer immédiatement en production
```

### Étape 4: Forcer le reset des mots de passe (recommandé)

```bash
# Appliquer le script de sécurité Supabase
psql -U postgres -d yourstory -f migrations/20260106_emergency_security_patch_supabase.sql
```

### Étape 5: Changer les clés API Supabase

**Dans Supabase Dashboard:**
1. `Settings > API`
2. Regénérer `anon` key
3. Regénérer `service_role` key
4. Mettre à jour `.env.local` et `.env.production`
5. Redéployer

---

## 🔐 ENDPOINTS VÉRIFIÉS

### ✅ Correctement protégés (après patch):

- `/api/users` (GET, POST) → `requireRole([1])`
- `/api/users/[id]` (PUT, DELETE) → `requireRole([1])`
- `/api/packages` → `requireRole([1])`
- `/api/invoices/generate-pdf` → `requireSession()`
- `/api/company-settings` → `requireRole([1])`

### ⚠️ À vérifier manuellement:

- `/api/users/[id]/reset-password` - Vérifier les permissions
- `/api/sales/*` - Vérifier qui peut créer/modifier
- `/api/hash-password` - **DANGEREUX** si exposé publiquement

---

## 📝 LOGS À ANALYSER

### 1. Logs de création d'utilisateurs

```sql
SELECT 
  sl.*,
  u.email,
  u.role_id
FROM security_logs sl
LEFT JOIN app_user u ON sl.user_id = u.id
WHERE sl.event_type = 'login'
  AND sl.created_at > '2026-01-01'
ORDER BY sl.created_at DESC;
```

### 2. Vérifier les modifications suspectes

```sql
-- Si vous avez activé l'audit trail
SELECT *
FROM auth_users_audit
WHERE created_at > '2026-01-01'
ORDER BY created_at DESC;
```

---

## 🛡️ PRÉVENTION FUTURE

### Checklist pour chaque nouvel endpoint API:

```typescript
// ✅ BON EXEMPLE
export async function POST(request: NextRequest) {
  // 1. Toujours vérifier l'authentification
  const session = await requireSession(request);
  if (session instanceof NextResponse) return session;
  
  // 2. Vérifier les permissions si nécessaire
  if (session.roleId !== 1) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // 3. Valider TOUTES les entrées
  const validated = schema.parse(body);
  
  // 4. Logger les actions sensibles
  await logSecurityEvent({ ... });
  
  // Suite du code...
}
```

### Tests de sécurité à ajouter:

```typescript
// tests/security/unauthorized-access.test.ts
describe('Security: Unauthorized Access', () => {
  it('should block unauthenticated user creation', async () => {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', role_id: 1 })
    });
    expect(response.status).toBe(401);
  });
});
```

---

## 📋 CHECKLIST DE REMÉDIATION

- [ ] Script `find-malicious-users.sql` exécuté
- [ ] Comptes malveillants identifiés
- [ ] Comptes malveillants supprimés (app_user + auth.users)
- [ ] Correctifs déployés en production
- [ ] Clés API Supabase changées
- [ ] Variables d'environnement mises à jour
- [ ] Script de reset des mots de passe exécuté
- [ ] Logs de sécurité analysés
- [ ] Rate limiting vérifié/activé
- [ ] Email confirmations activées
- [ ] Tests de sécurité ajoutés
- [ ] Documentation mise à jour
- [ ] Équipe informée
- [ ] Clients notifiés (si données compromises)

---

## 🔍 AUTRES VULNÉRABILITÉS POTENTIELLES À VÉRIFIER

### Endpoints à auditer en priorité:

1. **`/api/hash-password`** - Pourquoi est-ce exposé publiquement?
2. **`/api/users/[id]/reset-password`** - Qui peut reset?
3. **`/api/sales/*`** - Vérifier les permissions
4. **Tout endpoint qui modifie des données** - Doit avoir `requireSession` minimum

### Comment vérifier:

```bash
# Lister tous les endpoints
find src/app/api -name "route.ts" -exec grep -L "requireRole\|requireSession" {} \;

# Ceux qui n'ont ni requireRole ni requireSession sont suspects
```

---

## 📞 SUPPORT

### Si vous trouvez d'autres comptes suspects:

1. **NE PAS supprimer immédiatement**
2. Exporter les données pour analyse
3. Vérifier les logs d'activité
4. Documenter ce qui a été fait par le compte
5. Notifier les personnes concernées si nécessaire

### Ressources:

- Documentation Supabase Auth: https://supabase.com/docs/guides/auth
- OWASP API Security: https://owasp.org/www-project-api-security/
- Supabase Support: support@supabase.io

---

**Dernière mise à jour:** 2026-01-06  
**Fichiers créés:**
- `ATTACK_ANALYSIS.md` - Analyse détaillée
- `REMEDIATION_GUIDE.md` - Ce guide
- `scripts/find-malicious-users.sql` - Détection
- Patchs appliqués sur `/api/users/*`
