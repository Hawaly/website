# Security Headers Configuration

## Problèmes identifiés par Nikto
Le scan Nikto du 6 janvier 2026 a identifié les vulnérabilités suivantes:
- ❌ Missing X-Frame-Options header (clickjacking protection)
- ❌ Missing X-Content-Type-Options header (MIME sniffing protection)
- ⚠️ Permissive CORS policy (Access-Control-Allow-Origin: *)

## Headers de sécurité implémentés

### 1. X-Frame-Options: SAMEORIGIN
**Protection contre:** Clickjacking attacks
**Effet:** Empêche l'application d'être chargée dans une iframe depuis un autre domaine

### 2. X-Content-Type-Options: nosniff
**Protection contre:** MIME type sniffing attacks
**Effet:** Force le navigateur à respecter le Content-Type déclaré

### 3. X-XSS-Protection: 1; mode=block
**Protection contre:** Cross-Site Scripting (XSS)
**Effet:** Active la protection XSS intégrée du navigateur

### 4. Referrer-Policy: strict-origin-when-cross-origin
**Protection contre:** Information leakage via referrer
**Effet:** Limite les informations envoyées dans l'en-tête Referer

### 5. Permissions-Policy
**Protection contre:** Abuse of browser features
**Effet:** Désactive l'accès à la caméra, microphone, géolocalisation et FLoC

### 6. Strict-Transport-Security (HSTS)
**Protection contre:** Man-in-the-middle attacks, protocol downgrade
**Effet:** Force HTTPS pour toutes les requêtes pendant 1 an (incluant les sous-domaines)

### 7. Content-Security-Policy (CSP)
**Protection contre:** XSS, data injection, unauthorized resource loading
**Directives:**
- `default-src 'self'`: Seules les ressources du même domaine par défaut
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'`: Scripts autorisés (note: unsafe-inline/eval pour Next.js)
- `style-src 'self' 'unsafe-inline'`: Styles inline autorisés
- `img-src 'self' data: https:`: Images du domaine, data URIs et HTTPS
- `connect-src 'self' https://*.supabase.co wss://*.supabase.co`: API Supabase autorisée
- `frame-ancestors 'self'`: Protection clickjacking supplémentaire

## Déploiement
1. Les headers sont configurés dans `next.config.ts`
2. Ils s'appliquent automatiquement à toutes les routes (`/:path*`)
3. Redéployer l'application sur Vercel pour activer les headers

## Vérification post-déploiement
```bash
# Tester les headers avec curl
curl -I https://www.urstory.ch

# Re-scanner avec Nikto
nikto -h https://www.urstory.ch -ssl

# Tester avec securityheaders.com
# https://securityheaders.com/?q=https://www.urstory.ch
```

## Notes importantes
- **CSP**: Les directives `'unsafe-inline'` et `'unsafe-eval'` sont nécessaires pour Next.js mais réduisent la sécurité. Envisager une migration vers des nonces pour une meilleure sécurité.
- **CORS**: Les headers Next.js remplacent les headers Vercel. Si vous avez besoin d'un CORS spécifique, configurez-le dans les routes API.
- **HSTS**: Le preload flag signifie que vous pouvez soumettre votre domaine à la liste HSTS preload des navigateurs.

## Résolution des problèmes CORS
Si vous rencontrez des problèmes CORS après ce changement, le header `Access-Control-Allow-Origin: *` de Vercel sera remplacé. Ajoutez la configuration CORS spécifique dans vos routes API si nécessaire.
