# Guide d'Intégration - YourStory + Application de Gestion

## 🎯 Vue d'ensemble

L'application de gestion (anciennement dans `/compta`) a été intégrée avec succès dans le site vitrine YourStory. Cette intégration permet aux clients de se connecter via la page `/login` du site vitrine et d'accéder à leur espace client personnalisé.

## 📁 Structure du Projet

```
YourStory/Agency/Agency/
├── src/                      # Code source du site vitrine
│   ├── app/
│   │   ├── api/             # Routes API (copiées depuis compta)
│   │   ├── client-portal/   # Espace client (copié depuis compta)
│   │   ├── login/           # Page de login (modifiée)
│   │   └── providers.tsx    # Providers React (nouveau)
│   └── ...
├── compta-app/              # Application de gestion intégrée
│   ├── components/          # Composants réutilisables
│   ├── contexts/            # Contextes React (Auth, etc.)
│   ├── app/                 # Pages et routes de l'app
│   └── ...
├── lib/                     # Librairies partagées
├── types/                   # Types TypeScript
└── middleware.ts            # Middleware d'authentification
```

## 🔧 Configuration

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase

# JWT Secret (générez avec: openssl rand -base64 32)
JWT_SECRET=votre_clé_secrète_jwt_minimum_32_caractères
```

### 2. Base de données

L'application utilise Supabase. Assurez-vous que votre base de données contient les tables nécessaires :
- `users` : Utilisateurs (admin et clients)
- `clients` : Informations des clients
- `factures` : Factures
- `mandats` : Mandats/Projets
- etc.

## 🚀 Démarrage

1. **Installer les dépendances** :
```bash
npm install
```

2. **Configurer les variables d'environnement** :
- Copiez `.env.example` vers `.env.local`
- Remplissez les valeurs Supabase et JWT

3. **Lancer le serveur de développement** :
```bash
npm run dev
```

4. **Accéder à l'application** :
- Site vitrine : http://localhost:3000
- Login client : http://localhost:3000/login
- Espace client : http://localhost:3000/client-portal (après connexion)

## 🔐 Authentification

### Flux de connexion

1. Le client accède à `/login`
2. Il entre ses identifiants (email/mot de passe)
3. L'API `/api/login` vérifie les credentials
4. Si valides, un JWT est créé et stocké dans un cookie HTTP-only
5. Le client est redirigé vers `/client-portal`
6. Le middleware vérifie le JWT à chaque requête protégée

### Routes protégées

- `/client-portal/*` : Accessible uniquement aux clients connectés
- `/dashboard/*` : Accessible uniquement aux admins (si implémenté)

## 📝 Routes principales

### Pages publiques
- `/` : Page d'accueil du site vitrine
- `/login` : Page de connexion administrateur
- `/client-login` : Page de connexion client

### Pages protégées (Clients)
- `/client-portal` : Dashboard client
- `/client-portal/factures` : Liste des factures
- `/client-portal/projets` : Liste des projets

### Pages protégées (Admins)
- `/dashboard` : Dashboard administrateur (si configuré)

### API
- `/api/login` : Authentification
- `/api/logout` : Déconnexion
- `/api/auth/session` : Vérification de session
- `/api/clients/*` : CRUD clients
- `/api/factures/*` : CRUD factures

## 🎨 Personnalisation

### Couleurs
Les couleurs de la marque sont définies dans `tailwind.config.js` :
- `brand-orange` : #FD5904
- `brand-orange-light` : #FF7A3D

### Logo et images
Placez vos assets dans `/public` :
- `/public/logo.svg` : Logo du site
- `/public/images/` : Autres images

## 🐛 Dépannage

### Erreur de connexion
- Vérifiez les variables d'environnement
- Vérifiez la connexion à Supabase
- Vérifiez que l'utilisateur existe dans la base de données

### Page blanche après connexion
- Vérifiez le middleware.ts
- Vérifiez les permissions de l'utilisateur
- Consultez la console du navigateur

### Erreur 500
- Vérifiez les logs du serveur
- Vérifiez que toutes les dépendances sont installées
- Vérifiez la configuration TypeScript

## 📚 Documentation supplémentaire

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Support

Pour toute question ou problème :
- Email : contact@urstory.ch
- Documentation interne : `/compta-app/markdown/`

---

*Dernière mise à jour : Décembre 2024*
