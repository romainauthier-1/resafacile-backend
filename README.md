# 🍽️ ResaFacile — Backend

> **Une API de réservation pour restaurants** — Un backend Node.js/Express avec MongoDB pour gérer les réservations, les restaurants et l'envoi de notifications SMS.

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.16.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.3.3-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-9.3.3-880000?style=for-the-badge&logo=mongoose&logoColor=white)](https://mongoosejs.com/)
[![Twilio](https://img.shields.io/badge/Twilio-6.0.0-F22F46?style=for-the-badge&logo=twilio&logoColor=white)](https://www.twilio.com/)
[![Web Push](https://img.shields.io/badge/Web_Push-3.6.7-0055A4?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 📜 À propos du projet

**ResaFacile Backend** est une **API RESTful** spécialement conçue pour la gestion de réservations dans les restaurants. Elle permet de :

- Gérer les restaurants avec leurs informations, horaires et services
- Créer et gérer les réservations des clients
- Envoyer des notifications SMS via Twilio
- Limiter les tentatives de réservation pour éviter les abus

---

## 🔧 Stack Technique

| Catégorie            | Technologie                                                            | Version | Rôle                                  |
| -------------------- | ---------------------------------------------------------------------- | ------- | ------------------------------------- |
| **Runtime**          | [Node.js](https://nodejs.org/)                                         | 16+     | Environnement d'exécution             |
| **Framework**        | [Express.js](https://expressjs.com/)                                   | 4.16.1  | Framework web                         |
| **Base de données**  | [MongoDB](https://www.mongodb.com/)                                    | Atlas   | Base de données NoSQL                 |
| **ODM**              | [Mongoose](https://mongoosejs.com/)                                    | 9.3.3   | Modélisation MongoDB                  |
| **Authentification** | [bcrypt](https://www.npmjs.com/package/bcrypt)                         | 6.0.0   | Hashage des mots de passe             |
| **Tokens**           | [uid2](https://www.npmjs.com/package/uid2)                             | 1.0.0   | Génération de tokens                  |
| **SMS**              | [Twilio](https://www.twilio.com/)                                      | 6.0.0   | Envoi de SMS                          |
| **Rate Limiting**    | [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) | 8.4.1   | Limitation des requêtes               |
| **Validation**       | [express-validator](https://express-validator.github.io/docs/)         | 7.3.2   | Validation des requêtes               |
| **CORS**             | [cors](https://www.npmjs.com/package/cors)                             | 2.8.6   | Middleware CORS                       |
| **Cookies**          | [cookie-parser](https://www.npmjs.com/package/cookie-parser)           | 1.4.4   | Gestion des cookies                   |
| **Logging**          | [morgan](https://www.npmjs.com/package/morgan)                         | 1.9.1   | Logger HTTP                           |
| **Environnement**    | [dotenv](https://www.npmjs.com/package/dotenv)                         | 17.4.0  | Gestion des variables d'environnement |
| **Déploiement**      | [Vercel](https://vercel.com/)                                          | -       | Hébergement serverless                |

---

## ✨ Fonctionnalités

### 🏪 Gestion des Restaurants

- Création, lecture, mise à jour et suppression de restaurants
- Gestion des informations : nom, slug, SIRET, adresse, téléphone, email
- Gestion des horaires d'ouverture (par jour de la semaine)
- Gestion des services proposés avec créneaux horaires
- Gestion des dates de fermeture exceptionnelles
- Écart (gap) entre deux réservations

### 📅 Gestion des Réservations

- Création de nouvelles réservations
- Informations client : prénom, nom, email, téléphone
- Date et heure de la réservation
- Nombre de couvrets (nbPax)
- Occasion spéciale (optionnelle)
- Association à un restaurant

### 📱 Notifications

- Envoi de SMS via Twilio pour confirmation de réservation

### 🛡️ Sécurité

- **Rate Limiting** : 10 tentatives max par IP sur 10 minutes pour les nouvelles réservations
- Protection CORS configurée pour plusieurs origines
- Middleware de gestion d'erreurs
- Validation des données avec express-validator

### 📊 Health Check

- Endpoint `/health` pour vérifier l'état du serveur
- Vérification de la connexion à MongoDB
- Status détaillé de la base de données

---

## 🚀 Installation

### Prérequis

- [Node.js](https://nodejs.org/) (version 16 ou supérieure)
- [Yarn](https://yarnpkg.com/) ou [npm](https://www.npmjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas) (ou instance locale)
- Compte [Twilio](https://www.twilio.com/) (optionnel pour les SMS)
- Clés VAPID pour Web Push (optionnel)

### Étapes

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/dankysten/resaFacile-backend.git
   cd resaFacile-backend
   ```

2. **Installer les dépendances**

   ```bash
   yarn install
   # ou
   npm install
   ```

3. **Configurer l'environnement**
   Créer un fichier `.env` à la racine avec les variables suivantes :

   ```env
   CONNECTION_STRING=mongodb+srv://<user>:<password>@cluster0.XXXXXXX.mongodb.net/resaFacile
   PORT=4000
   FRONTEND_URL=http://localhost:3000

   # Twilio (optionnel)
   TWILIO_ACCOUNT_SID=<account_sid>
   TWILIO_AUTH_TOKEN=<auth_token>
   TWILIO_NUMBER=<phone_number>

   # SIRENE API (optionnel)
   SIRENE_API_KEY=<api_key>
   ```

4. **Lancer le serveur**

   ```bash
   # Mode développement
   yarn dev
   # ou
   npm run dev

   # Mode production
   yarn start
   # ou
   npm start
   ```

5. **Accéder à l'API**
   ```
   🚀 Serveur lancé sur le port 4000
   ```
   L'API sera disponible à l'URL : `http://localhost:4000`

---

## 📡 Endpoints API

### 🔹 Base URL

```
http://localhost:4000
```

### 🔹 Restaurants

| Méthode | Endpoint           | Description                       |
| ------- | ------------------ | --------------------------------- |
| GET     | `/restaurants`     | Récupère tous les restaurants     |
| GET     | `/restaurants/:id` | Récupère un restaurant spécifique |
| POST    | `/restaurants`     | Crée un nouveau restaurant        |
| PUT     | `/restaurants/:id` | Met à jour un restaurant          |
| DELETE  | `/restaurants/:id` | Supprime un restaurant            |

### 🔹 Réservations

| Méthode | Endpoint        | Description                                        |
| ------- | --------------- | -------------------------------------------------- |
| GET     | `/bookings`     | Récupère toutes les réservations                   |
| GET     | `/bookings/:id` | Récupère une réservation spécifique                |
| POST    | `/bookings/new` | Crée une nouvelle réservation (avec rate limiting) |
| PUT     | `/bookings/:id` | Met à jour une réservation                         |
| DELETE  | `/bookings/:id` | Supprime une réservation                           |

### 🔹 SMS

| Méthode | Endpoint | Description              |
| ------- | -------- | ------------------------ |
| POST    | `/sms`   | Envoie un SMS via Twilio |

### 🔹 Health Check

| Méthode | Endpoint  | Description                           |
| ------- | --------- | ------------------------------------- |
| GET     | `/health` | Vérifie l'état du serveur et de la DB |

---

## 📁 Structure du Projet

```
resaFacile-backend/
├── index.js                  # Point d'entrée
├── app.js                    # Configuration Express et middlewares
├── package.json             # Dépendances et scripts
├── vercel.json              # Configuration Vercel
├── .env                     # Variables d'environnement
├── .gitignore               # Fichiers ignorés par Git
│
├── models/
│   ├── connection.js        # Connexion à MongoDB
│   ├── bookings.js          # Modèle Booking
│   └── restaurants.js       # Modèle Restaurant
│
├── modules/
│   └── utils.js             # Fonctions utilitaires
│
├── routes/
│   ├── bookings.js          # Routes réservations
│   ├── restaurants.js       # Routes restaurants
│   └── sms.js               # Routes SMS
│
├── public/                  # Fichiers statiques
│
└── node_modules/            # Dépendances installées
```

---

## 🛡️ Configuration de Déploiement (Vercel)

Le projet est configuré pour être déployé sur **Vercel** avec :

- Runtime : Node.js
- Serverless Functions : Activées
- Configuration automatique via `vercel.json`

**Pour déployer :**

1. Pousser le code sur un dépôt GitHub
2. Importer le projet sur Vercel
3. Configurer les **Environment Variables** :
   - `CONNECTION_STRING`
   - `FRONTEND_URL`
   - `TWILIO_ACCOUNT_SID` (optionnel)
   - `TWILIO_AUTH_TOKEN` (optionnel)
   - `TWILIO_NUMBER` (optionnel)
   - `SIRENE_API_KEY` (optionnel)
4. Déployer !

---

## 📝 Exemples de Requêtes

### Créer un restaurant

```bash
curl -X POST http://localhost:4000/restaurants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Le Bistrot Gourmand",
    "slug": "le-bistrot-gourmand",
    "siret": "12345678901234",
    "address": "123 Rue de Paris",
    "city": "Paris",
    "zipCode": "75001",
    "phoneNumber": "+33123456789",
    "email": "contact@bistrot.com",
    "password": "securePassword123",
    "openingDays": ["lundi", "mardi", "mercredi", "jeudi", "vendredi"],
    "gap": 30,
    "services": [
      {
        "name": "Déjeuner",
        "startTime": 540,
        "endTime": 900,
        "dayOfWeek": ["lundi", "mardi", "mercredi", "jeudi", "vendredi"]
      }
    ]
  }'
```

### Créer une réservation

```bash
curl -X POST http://localhost:4000/bookings/new \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean@dupont.com",
      "phoneNumber": "+33612345678"
    },
    "restaurant": "60d5ec9f8b3a8b0015f1b2a1",
    "dateTime": "2024-08-15T20:00:00Z",
    "nbPax": 4,
    "occasion": "Anniversaire"
  }'
```

### Envoyer un SMS

```bash
curl -X POST http://localhost:4000/sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+33612345678",
    "message": "Votre réservation est confirmée !"
  }'
```

---

## 🗄️ Modèles de Données

### Restaurant

```javascript
{
  name: String,           // Nom du restaurant
  slug: String,           // URL unique
  siret: String,          // Numéro SIRET
  address: String,        // Adresse
  city: String,           // Ville
  zipCode: String,        // Code postal
  phoneNumber: String,    // Téléphone
  email: String,          // Email
  password: String,       // Mot de passe haché
  openingDays: [String],  // Jours d'ouverture
  gap: Number,            // Écart entre réservations (minutes)
  services: [             // Services proposés
    {
      name: String,
      startTime: Number,   // Heure de début (minutes depuis minuit)
      endTime: Number,     // Heure de fin
      dayOfWeek: [String], // Jours de la semaine
      isOpen: Boolean,
      closedDates: [Date] // Dates de fermeture exceptionnelles
    }
  ]
}
```

### Booking

```javascript
{
  customer: {              // Informations client
    firstName: String,
    lastName: String,
    email: String,
    phoneNumber: String
  },
  restaurant: ObjectId,    // Référence au restaurant
  dateTime: Date,          // Date et heure de la réservation
  nbPax: Number,           // Nombre de personnes
  occasion: String         // Occasion (optionnelle)
}
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

- Ouvrir une issue pour signaler un bug ou proposer une amélioration
- Forker le projet et soumettre une Pull Request

---

## 📜 Licence

Ce projet est sous licence **[MIT](https://opensource.org/licenses/MIT)**.

---

## 👤 Auteur

📌 **Romain Authier**  
📧 [dankysten](https://github.com/dankysten)  
💼 Développeur Fullstack junior (ancien restaurateur)

---

> _"Une bonne réservation commence par une bonne organisation."_ 🍽️✨
