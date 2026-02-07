# Cloud Chat - Application de Messagerie en Temps Réel

<div align="center">

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Frontend](https://img.shields.io/badge/Frontend-React%20+%20TypeScript-61DAFB)
![Backend](https://img.shields.io/badge/Backend-NestJS-E0234E)
![Database](https://img.shields.io/badge/Database-MySQL-4479A1)
![Cloud](https://img.shields.io/badge/Cloud-AWS-FF9900)
![IaC](https://img.shields.io/badge/IaC-Terraform-7B42BC)

**Une application de chat moderne avec architecture microservices, déployable localement avec Docker ou sur AWS avec Terraform.**

</div>

---

## Table des Matières

- [Aperçu](#aperçu)
- [Architecture](#architecture)
- [Technologies Utilisées](#technologies-utilisées)
- [Structure du Projet](#structure-du-projet)
- [Lancement Local](#lancement-local)
- [Déploiement AWS](#déploiement-aws)
- [Configuration](#configuration)
- [Endpoints API](#endpoints-api)
- [Fonctionnalités](#fonctionnalités)

---

## Aperçu

Cloud Chat est une application de messagerie en temps réel permettant aux utilisateurs de :

- Créer un compte et s'authentifier
- Rejoindre un salon de discussion général
- Créer des salons privés et inviter des membres
- Échanger des messages instantanément via WebSocket
- Gérer les membres de leurs salons

---

## Architecture

### Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              UTILISATEURS                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LOAD BALANCER                            │
│                            (Frontend Public)                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
              ┌──────────┐    ┌──────────────┐  ┌──────────────┐
              │ Frontend │    │ API Gateway  │  │  WebSocket   │
              │  (React) │    │    (HTTP)    │  │ API Gateway  │
              └──────────┘    └──────────────┘  └──────────────┘
                                     │                │
                         ┌───────────┴───────────┐    │
                         ▼                       ▼    ▼
                  ┌─────────────┐        ┌─────────────────┐
                  │Auth Service │        │  Chat Service   │
                  │  (NestJS)   │        │    (NestJS)     │
                  └─────────────┘        └─────────────────┘
                         │                       │
                         ▼                       ▼
                  ┌─────────────┐        ┌─────────────┐
                  │   auth_db   │        │   chat_db   │
                  │   (MySQL)   │        │   (MySQL)   │
                  └─────────────┘        └─────────────┘
```

### Architecture AWS Détaillée

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   VPC                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        Public Subnets (2 AZ)                          │  │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │  │
│  │   │  Frontend   │    │   Internet  │    │     NAT     │               │  │
│  │   │     ALB     │    │   Gateway   │    │   Gateway   │               │  │
│  │   └─────────────┘    └─────────────┘    └─────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       Private Subnets (2 AZ)                          │  │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │  │
│  │   │ Auth Service│    │Chat Service │    │   Lambda    │               │  │
│  │   │  (ECS/EC2)  │    │  (ECS/EC2)  │    │ (WebSocket) │               │  │
│  │   └─────────────┘    └─────────────┘    └─────────────┘               │  │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │  │
│  │   │  Auth ALB   │    │  Chat ALB   │    │  DynamoDB   │               │  │
│  │   │ (Internal)  │    │ (Internal)  │    │(Connections)│               │  │
│  │   └─────────────┘    └─────────────┘    └─────────────┘               │  │
│  │   ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │   │                    RDS MySQL (Multi-AZ)                         │ │  │
│  │   │              auth_db           │           chat_db              │ │  │
│  │   └─────────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Microservices

| Service | Port | Description |
|---------|------|-------------|
| **Frontend** | 80 | Application React/TypeScript avec Vite |
| **Auth Service** | 5000 | Authentification, JWT, gestion des utilisateurs |
| **Chat Service** | 5000 | Gestion des rooms, messages, membres |
| **WS Lambda** | - | Gestion des connexions WebSocket (AWS) |
| **WS Local Service** | 4001 | Serveur WebSocket pour le développement local |

---

## Technologies Utilisées

### Frontend
- **React 19** + **TypeScript**
- **Vite 7** - Build tool
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icônes

### Backend
- **NestJS** - Framework Node.js
- **TypeORM** - ORM
- **MySQL** - Base de données
- **JWT** - Authentification
- **bcrypt** - Hachage des mots de passe

### Infrastructure AWS
- **ECS** (EC2 Launch Type) - Orchestration des conteneurs
- **ECR** - Registry Docker
- **RDS MySQL** - Base de données managée
- **API Gateway** - HTTP & WebSocket APIs
- **Lambda** - Gestion WebSocket serverless
- **DynamoDB** - Stockage des connexions WebSocket
- **ALB** - Load Balancing
- **VPC** - Réseau isolé

### DevOps
- **Docker** & **Docker Compose** - Conteneurisation
- **Terraform** - Infrastructure as Code
- **AWS CLI** - Déploiement

---

## Structure du Projet

```
Projet-Chat/
├── auth-service/               # Service d'authentification
│   ├── src/
│   │   ├── auth/              # Module d'authentification
│   │   ├── users/             # Module utilisateurs
│   │   ├── health/            # Health checks
│   │   └── database/          # Configuration BDD
│   ├── Dockerfile
│   └── package.json
│
├── chat-service/               # Service de chat
│   ├── src/
│   │   ├── rooms/             # Gestion des rooms
│   │   ├── messages/          # Gestion des messages
│   │   ├── room_members/      # Membres des rooms
│   │   ├── ws-internal/       # Endpoints WebSocket internes
│   │   └── auth-client/       # Client pour auth-service
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # Application React
│   ├── src/
│   │   ├── components/        # Composants réutilisables
│   │   ├── pages/             # Pages de l'application
│   │   ├── services/          # Services API
│   │   ├── context/           # React Context (Auth)
│   │   └── types/             # Types TypeScript
│   ├── Dockerfile
│   └── package.json
│
├── ws-local-service/           # WebSocket pour dev local
│   ├── src/
│   └── Dockerfile
│
├── tf-chat-ecs/                # Infrastructure Terraform
│   ├── 00-data.tf             # Data sources
│   ├── 01-logs.tf             # CloudWatch Logs
│   ├── 02-vpc.tf              # VPC, Subnets, NAT
│   ├── 03-ecs.tf              # ECS Cluster
│   ├── 04-ecr.tf              # ECR Repositories
│   ├── 05-chat-backend.tf     # Chat Service ECS
│   ├── 06-chat-frontend.tf    # Frontend ECS
│   ├── 07-rds.tf              # RDS MySQL
│   ├── 08-websocketAPI.tf     # WebSocket API Gateway
│   ├── 09-lambda.tf           # Lambda Function
│   ├── 10-dynamodb.tf         # DynamoDB Tables
│   ├── 11-service-discovery.tf
│   ├── 12-auth-service.tf     # Auth Service ECS
│   ├── 13-api-gateway-http.tf # HTTP API Gateway
│   ├── 14-db-init.tf          # Lambda init BDD
│   ├── variables.tf           # Variables Terraform
│   ├── outputs.tf             # Outputs Terraform
│   └── lambda/                # Code Lambda WebSocket
│
├── db/                         # Scripts d'initialisation BDD
│   └── init/
│
├── docker-compose.yml          # Composition locale
├── deploy-aws.sh              # Script de déploiement AWS
├── .env                       # Variables d'environnement
└── README.md
```

---

## Lancement Local

### Prérequis

- **Docker** >= 20.x
- **Docker Compose** >= 2.x
- **Node.js** >= 20.x (pour le développement)

### Étapes

#### 1. Cloner le repository

```bash
git clone <repository-url>
cd Projet-Chat
```

#### 2. Créer le fichier `.env`

```bash
cat > .env << 'EOF'
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# MySQL Root
MYSQL_ROOT_PASSWORD=RootStrongPassword123!

# Auth Database
AUTH_DB_NAME=auth_db
AUTH_DB_USER=auth_user
AUTH_DB_PASSWORD=AuthStrongPassword123!

# Chat Database
CHAT_DB_NAME=chat_db
CHAT_DB_USER=chat_user
CHAT_DB_PASSWORD=ChatStrongPassword123!

# Service URLs (Docker Compose)
AUTH_SERVICE_URL=http://auth-service:5000

# Internal API Key (pour communication inter-services)
INTERNAL_API_KEY=your-internal-api-key-change-this
EOF
```

#### 3. Lancer l'application

```bash
docker compose up --build
```

#### 4. Accéder à l'application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5000 |
| Auth API | http://localhost:5002 |
| Chat API | http://localhost:5001 |
| WebSocket | ws://localhost:4001 |

---

## Déploiement AWS

### Prérequis

- **AWS CLI** configuré avec les credentials
- **Terraform** >= 1.0
- **Docker** pour builder les images

### Configuration Obligatoire

#### 1. Créer `tf-chat-ecs/terraform.tfvars`

⚠️ **IMPORTANT** : Toutes les variables sensibles sont **sans valeur par défaut** et doivent être fournies dans `terraform.tfvars` avant le déploiement !

```hcl
# Compte AWS (OBLIGATOIRE)
aws_account_id       = "YOUR_ACCOUNT_ID"
lab_role             = "arn:aws:iam::YOUR_ACCOUNT_ID:role/YourRoleName"
lab_instance_profile = "arn:aws:iam::YOUR_ACCOUNT_ID:instance-profile/YourInstanceProfile"

# Credentials base de données (OBLIGATOIRE)
db_username = "admin"
db_password = "VotreMotDePasseSecurise123!"

# Secrets (OBLIGATOIRE - générer des valeurs sécurisées)
jwt_secret       = "votre-secret-jwt-256-bits-minimum"
internal_api_key = "votre-cle-api-interne-securisee"
```

> **Conseil** : Pour générer des secrets sécurisés :
> ```bash
> openssl rand -hex 64  # Pour jwt_secret
> openssl rand -hex 32  # Pour internal_api_key
> ```

### Étapes de Déploiement

#### 1. Initialiser Terraform

```bash
cd tf-chat-ecs
cd lambda
npm run build
zip -r lambda.zip dist node_modules package.json
cd ../db-init-lambda
npm install
zip -r db-init.zip .
cd ..
terraform init
```

#### 2. Prévisualiser les changements

```bash
terraform plan
```

#### 3. Créer l'infrastructure

```bash
terraform apply
```

> **Note** : La première exécution prend environ 10-15 minutes (création RDS, VPC, etc.)

> ⚠️ **IMPORTANT** : Les étapes 1, 2 et 3 (terraform init, plan, apply) sont **OBLIGATOIRES** avant de lancer le script de déploiement. L'infrastructure AWS (ECR, ECS, RDS, etc.) doit exister avant de pouvoir pousser les images Docker.

#### 4. Builder et déployer les services

**Prérequis** : Avoir exécuté `terraform apply` avec succès (étape 3).

Depuis la racine du projet :

```bash
chmod +x deploy-aws.sh
./deploy-aws.sh
```

Ce script va :
1. Se connecter à ECR
2. Builder les 3 images Docker (auth, chat, frontend)
3. Pousser les images vers ECR
4. Forcer le redéploiement des services ECS
5. Attendre que les services soient healthy

#### 5. Récupérer les URLs

```bash
cd tf-chat-ecs
terraform output
```

**Outputs attendus :**
```
frontend_url         = "http://chat-frontend-alb-xxx.us-east-1.elb.amazonaws.com"
api_gateway_url      = "https://xxx.execute-api.us-east-1.amazonaws.com"
ws_endpoint          = "wss://xxx.execute-api.us-east-1.amazonaws.com/prod"
chat_db_endpoint     = "chat-db.xxx.us-east-1.rds.amazonaws.com"
```

### Mise à Jour du Code

Après modification du code, relancez simplement :

```bash
./deploy-aws.sh
```

### Destruction de l'Infrastructure

⚠️ **Attention** : Cette commande supprime TOUTES les ressources AWS créées !

```bash
cd tf-chat-ecs
terraform destroy
```

---

## Configuration

### Variables d'Environnement

#### Services Backend

| Variable | Description | Requis |
|----------|-------------|--------|
| `JWT_SECRET` | Clé secrète pour signer les tokens JWT | Oui |
| `JWT_EXPIRES_IN` | Durée de validité du token (ex: "15m") | Non (défaut: 15m) |
| `DB_HOST` | Hôte de la base de données | Oui |
| `DB_PORT` | Port de la base de données | Oui |
| `DB_NAME` | Nom de la base de données | Oui |
| `DB_USER` | Utilisateur de la base de données | Oui |
| `DB_PASSWORD` | Mot de passe de la base de données | Oui |
| `DB_SYNC` | Synchronisation automatique du schéma | Non (défaut: false) |
| `INTERNAL_API_KEY` | Clé pour communication inter-services | Oui |
| `AUTH_SERVICE_URL` | URL du service d'authentification | Chat uniquement |
| `FRONTEND_URL` | URL du frontend (pour liens email) | Oui |

#### Frontend

| Variable | Description |
|----------|-------------|
| `API_BASE_URL` | URL de l'API Gateway (vide = même origine) |
| `WS_ENDPOINT` | URL du WebSocket endpoint |

### Variables Terraform

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `cluster_name` | Nom du cluster ECS | `chat-cluster` |
| `lab_role` | ARN du rôle IAM | ⚠️ À modifier |
| `lab_instance_profile` | ARN de l'instance profile | ⚠️ À modifier |
| `aws_account_id` | ID du compte AWS | ⚠️ À modifier |
| `db_username` | Utilisateur admin RDS | `admin` |
| `db_password` | Mot de passe RDS | ⚠️ À définir |
| `auth_db_name` | Nom BDD auth | `auth_db` |
| `chat_db_name` | Nom BDD chat | `chat_db` |
| `jwt_secret` | Secret JWT | ⚠️ À définir |
| `internal_api_key` | Clé API interne | ⚠️ À définir |

---

## Endpoints API

### Auth Service (`/auth/*`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/auth/signup` | Créer un compte | Non |
| POST | `/auth/login` | Se connecter | Non |
| POST | `/auth/refresh` | Rafraîchir le token | Non |
| POST | `/auth/logout` | Se déconnecter | Non |
| POST | `/auth/forgot-password` | Demander reset password | Non |
| POST | `/auth/reset-password` | Réinitialiser le mot de passe | Non |
| GET | `/auth/health` | Health check | Non |
| GET | `/users` | Liste des utilisateurs | Oui |
| GET | `/users/by-username/:username` | Trouver par username | Oui |

### Chat Service (`/rooms/*`, `/messages/*`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/rooms/general` | Obtenir la room générale | Oui |
| GET | `/rooms/my-rooms` | Obtenir mes rooms | Oui |
| POST | `/rooms/create` | Créer une room | Oui |
| GET | `/rooms/:id` | Détails d'une room | Oui |
| DELETE | `/rooms/:id` | Supprimer une room | Oui (owner) |
| POST | `/rooms/:id/add-member` | Ajouter un membre | Oui (owner) |
| DELETE | `/rooms/:id/members/:userId` | Retirer un membre | Oui (owner) |
| GET | `/messages/:roomId` | Messages d'une room | Oui |
| POST | `/messages/:roomId` | Envoyer un message | Oui |
| GET | `/health` | Health check | Non |

### WebSocket API

**Connexion :**
```
wss://endpoint/prod?token=JWT_TOKEN&roomId=ROOM_ID
```

**Envoyer un message :**
```json
{
  "action": "sendMessage",
  "roomId": "1",
  "content": "Hello World!"
}
```

**Événement reçu (nouveau message) :**
```json
{
  "type": "message",
  "roomId": 1,
  "message": {
    "id": 123,
    "roomId": 1,
    "userId": "uuid",
    "username": "user1",
    "content": "Hello World!",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## Fonctionnalités

### Utilisateur
- [x] Inscription avec validation email/username unique
- [x] Connexion / Déconnexion
- [x] Refresh Token automatique
- [x] Mot de passe oublié / Réinitialisation (lien affiché en console en mode DEV)

### Chat
- [x] Room de chat générale (tous les utilisateurs)
- [x] Création de rooms privées
- [x] Ajout / Suppression de membres
- [x] Messagerie en temps réel (WebSocket)
- [x] Persistance des messages
- [x] Historique des messages

### UX/UI
- [x] Interface responsive
- [x] Soumission formulaires avec touche Entrée
- [x] Affichage instantané des messages
- [x] Gestion des erreurs

### Architecture
- [x] Architecture microservices
- [x] Bases de données séparées (auth_db, chat_db)
- [x] Communication inter-services sécurisée (API Key)
- [x] JWT Authentication
- [x] Health checks sur tous les services

### Déploiement
- [x] Docker Compose (développement local)
- [x] AWS ECS (production)
- [x] Infrastructure as Code (Terraform)
- [x] CI/CD ready (script de déploiement)
- [x] WebSocket serverless (API Gateway + Lambda + DynamoDB)

---

## Troubleshooting

### Problèmes courants

#### Les services ne démarrent pas sur AWS
```bash
# Vérifier les logs ECS
aws logs tail /aws/ecs/chat-cluster/auth-service --follow
aws logs tail /aws/ecs/chat-cluster/chat-service --follow
```

#### Erreur "insufficient memory" sur ECS
L'instance t2.nano a seulement 512MB. Les services sont configurés pour utiliser 64MB chacun.

#### WebSocket ne fonctionne pas
Vérifier que le frontend utilise bien l'endpoint `wss://` (pas `ws://`) sur AWS.

#### Base de données inaccessible
Vérifier les security groups et que RDS est bien dans le même VPC que les services.

---

## Auteurs

Projet réalisé dans le cadre du cours **Cloud Computing** - Polytech S9 INFO

