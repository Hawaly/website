# 🚨 AUDIT DE SÉCURITÉ COMPLET - TOUS LES EXPLOITS

**Date:** 2026-01-06  
**Status:** 🔴 CRITIQUE - 10 endpoints vulnérables trouvés

---

## 🔴 VULNÉRABILITÉS CRITIQUES (Action immédiate)

### 1. `/api/hash-password` - EXTRÊMEMENT DANGEREUX
**Criticité:** 🔴🔴🔴 MAXIMALE  
**Exploit:** Endpoint public qui hashe n'importe quel mot de passe

```typescript
// ❌ AUCUNE authentification
export async function POST(request: NextRequest) {
  const { password } = body;
  const hash = await bcrypt.hash(password, 10);
  return NextResponse.json({ hash });
}
```

**Impact:**
- Permet aux attaquants de tester des hashs bcrypt
- Peut être utilisé pour des attaques par dictionnaire
- Abuse de vos ressources serveur
- **Devrait être SUPPRIMÉ ou protégé admin uniquement**

---

### 2. `/api/users/[id]/reset-password` - CRITIQUE
**Criticité:** 🔴🔴🔴 MAXIMALE  
**Exploit:** Change le mot de passe de N'IMPORTE QUEL utilisateur

```typescript
// ❌ AUCUNE authentification
export async function POST(request: NextRequest, { params }) {
  const { id } = await params;
  const { password } = body;
  
  // N'importe qui peut changer le mot de passe de n'importe quel utilisateur!
  await supabaseAdmin.auth.admin.updateUserById(user.auth_user_id, { password });
}
```

**Impact:**
- Takeover de n'importe quel compte (admin, client, staff)
- Porte dérobée pour l'attaquant
- Vol de sessions actives

**Exploit en une ligne:**
```bash
curl -X POST https://votre-app.com/api/users/1/reset-password \
  -d '{"password":"hacked123"}'
# Admin account compromis en 1 seconde
```

---

### 3. `/api/security` - Exposition des logs
**Criticité:** 🔴🔴 HAUTE  
**Exploit:** Accès à tous les logs de sécurité sans authentification

```typescript
// ❌ AUCUNE authentification
export async function GET(request: NextRequest) {
  const { data } = await supabaseAdmin
    .from('security_dashboard_view')
    .select('*');
  return NextResponse.json({ logs: data });
}
```

**Impact:**
- L'attaquant voit TOUS les logs (IPs, emails, tentatives de login)
- Facilite la reconnaissance pour d'autres attaques
- Expose les patterns de sécurité

---

### 4. `/api/roles` - Exposition des rôles
**Criticité:** 🟠 MOYENNE  
**Exploit:** Liste tous les rôles et leurs IDs

```typescript
// ❌ AUCUNE authentification
export async function GET(request: NextRequest) {
  const { data: roles } = await supabaseAdmin
    .from('role')
    .select('id, code, name');
  return NextResponse.json({ roles });
}
```

**Impact:**
- L'attaquant sait que role_id=1 = admin
- Facilite l'exploitation de `/api/users` (déjà patché)
- Information disclosure

---

### 5. `/api/clients` - Exposition des clients
**Criticité:** 🔴🔴 HAUTE  
**Exploit:** Liste TOUS les clients sans authentification

```typescript
// ❌ AUCUNE authentification
export async function GET(request: NextRequest) {
  const { data: clients } = await supabaseAdmin
    .from('client')
    .select('id, name, company_name, status');
  return NextResponse.json({ clients });
}
```

**Impact:**
- Exposition de toute votre base clients
- Noms d'entreprises, statuts
- Informations commerciales sensibles
- Violation RGPD potentielle

---

## 🟠 VULNÉRABILITÉS SALES MODULE (Toutes non protégées)

### 6. `/api/sales/prospects` (GET + POST)
**Criticité:** 🔴 HAUTE  
**Impact:** N'importe qui peut:
- Voir tous vos prospects
- Créer de faux prospects
- Polluer votre pipeline commercial

### 7. `/api/sales/meetings` (GET + POST)
**Criticité:** 🔴 HAUTE  
**Impact:** N'importe qui peut:
- Voir toutes vos réunions
- Créer de fausses réunions
- Savoir quand vous êtes occupé

### 8. `/api/sales/activities` (GET + POST)
**Criticité:** 🔴 HAUTE  
**Impact:** N'importe qui peut:
- Voir toutes vos activités commerciales
- Créer de fausses tâches
- Saboter votre workflow

### 9. `/api/sales/pitch-decks` (GET + POST)
**Criticité:** 🔴 HAUTE  
**Impact:** N'importe qui peut:
- Voir tous vos pitch decks
- Accéder à votre stratégie commerciale
- Créer de faux pitch decks

### 10. `/api/sales/meeting-minutes` (GET + POST)
**Criticité:** 🔴 HAUTE (probable)
**Impact:** Comptes-rendus de réunions exposés

---

## ✅ ENDPOINTS CORRECTEMENT PROTÉGÉS (exemples)

- `/api/packages` → `requireRole([1])`
- `/api/invoices/generate-pdf` → `requireSession()`
- `/api/company-settings` → `requireRole([1])`
- `/api/contracts/generate` → `requireRole([1])`
- `/api/users` → `requireRole([1])` (patché aujourd'hui)

---

## 🛠️ CORRECTIONS À APPLIQUER

### Pattern de correction pour tous les endpoints:

```typescript
import { requireSession, requireRole } from '@/lib/authz';

// Pour les endpoints sensibles (admin uniquement)
export async function POST(request: NextRequest) {
  const session = await requireRole(request, [1]);
  if (session instanceof NextResponse) return session;
  // Suite du code...
}

// Pour les endpoints utilisateurs authentifiés
export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (session instanceof NextResponse) return session;
  // Suite du code...
}
```

---

## 📋 PLAN DE CORRECTION PRIORISÉ

### Phase 1 - URGENT (aujourd'hui):
1. ✅ `/api/users` (POST, GET) - FAIT
2. ✅ `/api/users/[id]` (PUT, DELETE) - FAIT
3. 🔴 `/api/users/[id]/reset-password` - À FAIRE
4. 🔴 `/api/hash-password` - À SUPPRIMER ou protéger
5. 🔴 `/api/security` - Protéger avec requireRole([1])

### Phase 2 - HAUTE PRIORITÉ (aujourd'hui):
6. 🔴 `/api/clients` - Protéger avec requireSession
7. 🔴 `/api/roles` - Protéger avec requireSession
8. 🔴 Tous les `/api/sales/*` - Protéger avec requireSession

### Phase 3 - VÉRIFICATION:
9. Audit de tous les endpoints DELETE
10. Audit de tous les endpoints PUT
11. Tests de sécurité automatisés

---

## 🎯 MÉTHODOLOGIE D'ATTAQUE RÉELLE

### Comment un attaquant exploiterait votre app:

```bash
# 1. Créer un compte admin (déjà patché)
curl -X POST /api/users -d '{"email":"hack@evil.com","role_id":1,...}'

# 2. Prendre le contrôle d'un compte existant (ENCORE POSSIBLE)
curl -X POST /api/users/1/reset-password -d '{"password":"hacked"}'

# 3. Voler toutes les données clients (ENCORE POSSIBLE)
curl https://votre-app.com/api/clients
curl https://votre-app.com/api/sales/prospects
curl https://votre-app.com/api/sales/meetings

# 4. Analyser les logs pour trouver d'autres vecteurs (ENCORE POSSIBLE)
curl https://votre-app.com/api/security?limit=1000

# 5. Polluer votre CRM (ENCORE POSSIBLE)
curl -X POST /api/sales/prospects -d '{"company_name":"Fake Corp",...}'
```

---

## 🔍 COMMENT J'AI TROUVÉ CES VULNÉRABILITÉS

### Critères de recherche:
1. Endpoints sans `requireSession` ou `requireRole`
2. Méthodes POST, PUT, DELETE sans authentification
3. Utilisation de `supabaseAdmin` (bypass RLS)
4. Endpoints qui retournent des données sensibles

### Commande d'audit:
```bash
# Chercher les routes sans protection
grep -r "export async function POST\|PUT\|DELETE" src/app/api/ | \
  grep -v "requireSession\|requireRole"
```

---

## ⚠️ AUTRES POINTS À VÉRIFIER

### Endpoints à auditer manuellement:
- `/api/sales/prospects/[id]` (PUT, DELETE)
- `/api/sales/meetings/[id]` (PUT, DELETE)
- `/api/sales/activities/[id]` (PUT, DELETE)
- `/api/sales/pitch-decks/[id]` (PUT, DELETE)
- `/api/sales/meeting-minutes/[id]` (PUT, DELETE)
- `/api/expenses/[id]/receipt` - Upload sans vérification?
- `/api/invoices/[id]/download` - Download sans vérification?

---

## 📊 STATISTIQUES DE L'AUDIT

**Total endpoints scannés:** 45  
**Endpoints vulnérables:** 10+  
**Criticité maximale:** 3  
**Criticité haute:** 7+  
**Endpoints déjà protégés:** ~25  
**Taux de vulnérabilité:** ~22%

---

## 🚀 ACTIONS IMMÉDIATES

```bash
# 1. Appliquer les correctifs que je vais créer
git pull

# 2. Identifier les utilisateurs suspects
psql -f scripts/find-malicious-users.sql

# 3. Vérifier les données compromises
psql -c "SELECT * FROM prospects WHERE created_at > '2026-01-01'"
psql -c "SELECT * FROM meetings WHERE created_at > '2026-01-01'"

# 4. Deploy
git push && deploy
```

---

**JE VAIS MAINTENANT CORRIGER TOUS CES ENDPOINTS**
