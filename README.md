# 🎰 sim-BYS - Simulateur de Slot Machine Roguelike

Application fullstack de simulation de machine à sous avec système de progression, boutique, bonus, jokers et ascension.

## 🛠️ Stack Technique

- **Frontend/UI** : React 18 + Remix
- **Styling** : Tailwind CSS + shadcn/ui
- **Base de données** : SQLite + Drizzle ORM
- **Graphiques** : Recharts
- **Runtime** : Node.js 20+

## 📋 Prérequis

- Node.js 20+
- npm ou pnpm
- Docker & Docker Compose (pour déploiement)

## 🚀 Installation Locale

### 1. Cloner le repo

```bash
git clone https://github.com/nerasse/sim-BYS.git
cd sim-BYS
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Initialiser la base de données

```bash
# Générer les migrations Drizzle
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Seed les données initiales (symboles, combos, bonus, jokers)
npm run db:seed
```

### 4. Lancer en développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🏗️ Build de production

```bash
npm run build
npm start
```

## 🐳 Déploiement Docker

### Structure des volumes

Les données SQLite sont persistées sur l'hôte :
```
/home/neras/appdata/bys/
├── game.db              # Base de données principale
├── game.db-shm          # Shared memory
└── game.db-wal          # Write-Ahead Log
```

### 1. Créer le dossier de données

```bash
mkdir -p /home/neras/appdata/bys
chmod 755 /home/neras/appdata/bys
```

### 2. Build et lancer avec Docker Compose

```bash
# Build l'image
docker-compose build

# Lancer le conteneur
docker-compose up -d

# Vérifier les logs
docker-compose logs -f bys-app
```

### 3. Initialiser la base de données (première fois)

```bash
# Accéder au conteneur
docker exec -it sim-bys sh

# Initialiser la DB
npm run db:migrate
npm run db:seed

# Sortir du conteneur
exit
```

### 4. Gestion du conteneur

```bash
# Arrêter
docker-compose stop

# Redémarrer
docker-compose restart

# Arrêter et supprimer
docker-compose down

# Voir les logs
docker-compose logs -f bys-app

# Rebuild après modifications
docker-compose up -d --build
```

## 🌐 Configuration Reverse Proxy

L'application est accessible via : **https://bys.kssimi.fr**

### Avec Traefik (recommandé)

Le `docker-compose.yml` inclut déjà les labels Traefik :

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.bys.rule=Host(`bys.kssimi.fr`)"
  - "traefik.http.routers.bys.entrypoints=websecure"
  - "traefik.http.routers.bys.tls.certresolver=letsencrypt"
```

### Avec Nginx

Configuration exemple :

```nginx
server {
    listen 80;
    server_name bys.kssimi.fr;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bys.kssimi.fr;

    ssl_certificate /etc/letsencrypt/live/bys.kssimi.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bys.kssimi.fr/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📦 Scripts disponibles

```bash
# Développement
npm run dev              # Lance le serveur de dev avec hot reload

# Build
npm run build            # Build l'application pour production
npm start                # Lance l'application buildée

# Type checking
npm run typecheck        # Vérifie les types TypeScript

# Linting & Formatting
npm run lint             # Lint le code
npm run format           # Formate le code avec Prettier

# Base de données
npm run db:generate      # Génère les migrations Drizzle
npm run db:migrate       # Applique les migrations
npm run db:studio        # Ouvre Drizzle Studio (interface DB)
npm run db:seed          # Seed les données initiales
npm run db:reset         # Reset la DB (ATTENTION : supprime toutes les données)
```

## 📁 Structure du Projet

```
sim-BYS/
├── app/
│   ├── routes/          # Routes Remix (pages)
│   ├── components/      # Composants React
│   ├── lib/             # Business logic
│   │   ├── simulation/  # Moteur de simulation (indépendant)
│   │   ├── game/        # État de jeu
│   │   └── utils/       # Utilitaires
│   ├── db/              # Base de données
│   │   ├── schema.ts    # Schéma Drizzle
│   │   ├── queries/     # Queries organisées
│   │   └── seed/        # Données initiales
│   └── styles/          # Styles globaux
├── data/                # Données SQLite (local, ignoré par git)
├── public/              # Assets statiques
├── Dockerfile           # Configuration Docker
├── docker-compose.yml   # Orchestration Docker
└── drizzle.config.ts    # Config Drizzle ORM
```

## 🎮 Fonctionnalités

### Système de Simulation
- **Grille 5×3** avec 9 types de symboles
- **11 types de combinaisons** (H3, V3, D3, H4, H5, V, V bis, Tri, Oeil, Jackpot)
- **Algorithme de déduplication** (évite double-comptage)
- **3 modes de simulation** : auto, manuel, batch

### Progression & Méta
- **Système d'ascension** (difficulté 0-20+)
- **Personnages** avec effets passifs
- **Bonus équipables** (max 3) avec level-up
- **Jokers** achetables en boutique
- **XP & Level-up** avec paliers de récompenses

### Gameplay
- **Boutique** entre chaque niveau (jokers + consommables)
- **Raretés** (commun, peu commun, rare, épique, légendaire)
- **Niveaux boss** (X-3) avec choix de bonus
- **Système d'intérêts** (+1$ par 5$ possédés)

### Interface
- **6 onglets** : Dashboard, Config, Simulateur, Résultats, Stats, Presets
- **Graphiques** et visualisations (Recharts)
- **Dark mode** par défaut
- **Composants shadcn/ui** (accessibles, modernes)

## 🔧 Variables d'Environnement

Créer un fichier `.env` à la racine :

```env
# Database
DATABASE_PATH=./data/game.db

# Node
NODE_ENV=development

# Server
PORT=3000
```

Pour production (Docker) :
```env
DATABASE_PATH=/app/data/game.db
NODE_ENV=production
PORT=3000
```

## 🧪 Testing (à venir)

```bash
npm test              # Lance les tests
npm run test:watch    # Mode watch
npm run test:coverage # Couverture de code
```

## 📝 Maintenance

### Backup de la base de données

```bash
# Backup manuel
cp /home/neras/appdata/bys/game.db /home/neras/backups/bys/game-$(date +%Y%m%d-%H%M%S).db

# Script de backup automatique (cron)
# Ajouter dans crontab -e :
# 0 3 * * * cp /home/neras/appdata/bys/game.db /home/neras/backups/bys/game-$(date +\%Y\%m\%d).db
```

### Restauration

```bash
# Arrêter le conteneur
docker-compose stop

# Restaurer la DB
cp /home/neras/backups/bys/game-YYYYMMDD.db /home/neras/appdata/bys/game.db

# Redémarrer
docker-compose start
```

### Monitoring

```bash
# Voir les ressources utilisées
docker stats sim-bys

# Vérifier l'état
docker-compose ps

# Logs en temps réel
docker-compose logs -f --tail=100 bys-app
```

### Mise à jour

```bash
# Pull les dernières modifications
git pull origin main

# Rebuild et redémarrer
docker-compose up -d --build

# Vérifier
docker-compose logs -f bys-app
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

ISC

## 👤 Auteur

**neras**

- GitHub: [@nerasse](https://github.com/nerasse)
- Domaine: https://bys.kssimi.fr

## 🐛 Bugs & Support

Ouvrir une issue sur GitHub : https://github.com/nerasse/sim-BYS/issues

---

**Fait avec ❤️ et beaucoup de ☕**
