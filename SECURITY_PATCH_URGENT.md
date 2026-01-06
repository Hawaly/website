# 🚨 PATCH DE SÉCURITÉ URGENT - INJECTION SQL

## ACTIONS IMMÉDIATES (À FAIRE MAINTENANT)

### 1. DÉSACTIVER L'ANCIEN SYSTÈME D'AUTH
```bash
# Renommer temporairement pour désactiver
mv compta/lib/authApi.ts compta/lib/authApi.ts.VULNERABLE
```

### 2. VALIDER TOUTES LES ENTRÉES

#### Créer un validateur centralisé
```typescript
// lib/validators/authValidator.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim().max(255),
  password: z.string().min(8).max(100)
});

export const sanitizeInput = (input: string): string => {
  // Enlever tous les caractères SQL dangereux
  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .trim();
};
```

### 3. PATCHER LE LOGIN IMMÉDIATEMENT

```typescript
// src/app/api/auth/login/route.ts
import { loginSchema, sanitizeInput } from '@/lib/validators/authValidator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // VALIDATION STRICTE
    const validatedData = loginSchema.parse(body);
    const email = sanitizeInput(validatedData.email);
    const password = validatedData.password; // Ne pas sanitizer les mots de passe
    
    // Utiliser UNIQUEMENT Supabase Auth (jamais de requêtes SQL directes)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Suite du code...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      );
    }
    // ...
  }
}
```

### 4. ACTIVER LES PREPARED STATEMENTS

```typescript
// Pour TOUTES les requêtes Supabase
const { data, error } = await supabase
  .from('app_user')
  .select('*')
  .eq('email', email) // Supabase utilise des prepared statements par défaut
  .single();
```

### 5. RÉINITIALISER TOUS LES MOTS DE PASSE

```sql
-- Script d'urgence pour forcer le reset
UPDATE app_user 
SET 
  password_hash = NULL,
  must_reset_password = true,
  updated_at = NOW()
WHERE 1=1; -- Tous les utilisateurs

-- Créer la colonne si elle n'existe pas
ALTER TABLE app_user 
ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN DEFAULT false;
```

### 6. ACTIVER LE RATE LIMITING

```typescript
// lib/rateLimiter.ts
import { RateLimiter } from 'limiter';

const loginLimiter = new RateLimiter({
  tokensPerInterval: 5,
  interval: 'minute',
  fireImmediately: true
});

export async function checkRateLimit(identifier: string): Promise<boolean> {
  const key = `login_${identifier}`;
  const remainingRequests = await loginLimiter.removeTokens(1);
  return remainingRequests >= 0;
}
```

### 7. IMPLÉMENTER UN WAF (Web Application Firewall)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/gi,
  /(--|\||;|\/\*|\*\/|xp_|sp_|0x)/gi,
  /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
  /(\bAND\b\s*\d+\s*=\s*\d+)/gi,
];

export function middleware(request: NextRequest) {
  const url = request.url;
  const body = request.body;
  
  // Vérifier les patterns d'injection SQL
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(url) || (body && pattern.test(JSON.stringify(body)))) {
      // Logger l'attaque
      console.error(`🚨 SQL Injection attempt blocked: ${request.ip}`);
      
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

## ACTIONS À COURT TERME (24-48H)

### 1. MIGRATION COMPLÈTE VERS SUPABASE AUTH
- Finaliser la migration de TOUS les utilisateurs
- Supprimer complètement l'ancien système

### 2. AUDIT DE SÉCURITÉ COMPLET
```bash
# Installer des outils d'audit
npm install --save-dev @security/audit sqlmap

# Scanner les vulnérabilités
npm audit fix --force
```

### 3. IMPLÉMENTER 2FA
- Activer l'authentification à deux facteurs pour tous les admins
- Proposer en option pour les clients

### 4. MONITORING EN TEMPS RÉEL
```typescript
// lib/securityMonitor.ts
export async function monitorSuspiciousActivity() {
  // Alerter si:
  // - Plus de 5 échecs de connexion en 1 minute
  // - Connexion depuis IP blacklistée
  // - Patterns SQL dans les requêtes
}
```

## CONFIGURATION SUPABASE RLS

```sql
-- Activer RLS sur TOUTES les tables
ALTER TABLE app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE client ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice ENABLE ROW LEVEL SECURITY;

-- Politique stricte pour app_user
CREATE POLICY "Users can only view their own data"
ON app_user FOR SELECT
USING (auth.uid() = auth_user_id);

-- Jamais d'accès direct à app_user pour les updates
CREATE POLICY "No direct updates to app_user"
ON app_user FOR UPDATE
USING (false);
```

## CHECKLIST DE VÉRIFICATION

- [ ] Ancien système authApi.ts désactivé
- [ ] Validation des entrées implémentée
- [ ] Rate limiting actif
- [ ] WAF configuré
- [ ] Tous les mots de passe réinitialisés
- [ ] RLS activé sur toutes les tables
- [ ] Logs de sécurité surveillés
- [ ] Backup de la base de données effectué
- [ ] Notification aux utilisateurs envoyée

## CONTACTS D'URGENCE

- Supabase Support: support@supabase.io
- CERT Suisse: reports@govcert.ch
- Police cybercriminalité: cybercrime@fedpol.admin.ch

## IMPORTANT

⚠️ **NE PAS COMMIT LES CLÉS SENSIBLES**
⚠️ **CHANGER TOUTES LES CLÉS API IMMÉDIATEMENT**
⚠️ **ACTIVER L'AUDIT LOG SUR SUPABASE**

---
Généré le: ${new Date().toISOString()}
