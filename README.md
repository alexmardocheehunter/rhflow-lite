# RH Flow Lite — NestJS Backend

Version modernisée et allégée de l'application RH Flow, conçue avec **NestJS (TypeScript)**, **Prisma ORM**, et hébergée sur **Supabase**.

---

## 🛠️ Stack Technique

* **Framework API** : NestJS
* **ORM** : Prisma (avec adaptateur PostgreSQL)
* **Base de données** : Supabase PostgreSQL (avec Row Level Security)
* **Authentification** : Supabase Auth (JWT validation)
* **Stockage de fichiers** : Supabase Storage (Buckets `logos` et `qr-codes`)

---

## 📂 Structure du projet

```
rhflow-lite/
├── prisma/
│   ├── schema.prisma       # Schéma de base de données Prisma
│   └── rls.sql             # Scripts PostgreSQL Row Level Security (RLS)
├── src/
│   ├── auth/               # Passport strategy & Guards pour Supabase
│   ├── prisma/             # Module et service globaux Prisma
│   ├── supabase/           # Module global de stockage/SDK Supabase
│   ├── modules/            # Modules métier allégés (RH Flow Lite)
│   │   ├── companies/      # Gestion des entreprises
│   │   ├── sites/          # Sites et coordonnées GPS pour géofencing
│   │   ├── positions/      # Postes / fonctions des employés
│   │   ├── employees/      # Fiches employés & matricules auto
│   │   ├── attendance/     # Pointage & vérification anti-fraude
│   │   ├── leave-types/    # Types de congés (pré-générés ou personnalisés)
│   │   ├── leave-requests/ # Workflow de demandes de congés (Manager -> Admin)
│   │   └── calendar/       # Calendriers de présence hebdo et événements
│   ├── app.module.ts
│   └── main.ts
├── .env.example
└── package.json
```

---

## 🚀 Démarrage Local

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration d'environnement
Copiez le fichier `.env.example` en `.env` et complétez les variables d'environnement de votre instance Supabase :
```bash
cp .env.example .env
```

### 3. Exécution des migrations Prisma
Pour appliquer le schéma de base de données sur votre base Supabase :
```bash
npx prisma migrate dev --name init
```

### 4. Application des règles de sécurité RLS
Copiez le contenu de `prisma/rls.sql` et exécutez-le dans l'éditeur SQL (SQL Editor) de votre console Supabase afin d'activer l'isolation multi-tenant stricte par entreprise.

### 5. Démarrer l'application
```bash
# Mode développement
npm run start:dev

# Mode production
npm run start:prod
```

---

## 🔒 Sécurité et Isolation (Multi-tenant)

Toutes les routes de l'API sont protégées par le `SupabaseAuthGuard` qui valide les signatures des jetons JWT de Supabase.
* L'utilisateur authentifié voit son profil lié à un rôle (`ADMIN`, `MANAGER`, `EMPLOYEE`) et un `companyId` d'entreprise.
* Les requêtes vers la base de données filtrent automatiquement les données selon le `companyId` de l'utilisateur pour garantir une séparation stricte des informations.
* La base de données PostgreSQL applique des politiques RLS (Row Level Security) comme sécurité de second niveau en base de données.
