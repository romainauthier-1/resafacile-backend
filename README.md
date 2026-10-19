# 🍽️ RésaFacile — Backend

API REST de RésaFacile, un outil de réservation en ligne pour restaurants : inscription des établissements, contrôle des créneaux de réservation et confirmations par SMS.

**Frontend :** [resafacile-frontend](https://github.com/romainauthier-1/resafacile-frontend) · **Démo :** [resafacile.vercel.app](https://resafacile.vercel.app)

![Node.js](https://img.shields.io/badge/Node.js-Express_4-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)
![Twilio](https://img.shields.io/badge/Twilio-SMS-F22F46?logo=twilio&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

---

## Fonctionnalités

- **Inscription d'un restaurant** : validation des champs (SIRET à 14 chiffres, code postal, email), mot de passe haché avec bcrypt, slug unique pour la page de réservation publique.
- **Intégration API SIRENE (INSEE)** : récupération de la raison sociale et de l'adresse d'un établissement à partir de son SIRET.
- **Contrôle des créneaux** : une réservation est acceptée seulement si le jour est ouvert, si l'heure tombe dans un service actif, si le service n'est pas fermé à cette date et si la date n'est pas passée. Sinon, l'API renvoie les horaires possibles.
- **Détection des doublons** : même client, même restaurant, même horaire.
- **SMS via Twilio** (optionnel à chaque réservation) : confirmation au client et notification au restaurant, à la création comme à la modification.
- **Fermetures ponctuelles** : fermeture ou réouverture d'un service pour une date donnée.
- **Validation et normalisation des entrées** avec express-validator (numéros de mobile convertis au format international, par exemple).
- **Rate limiting** sur la création de réservation (10 requêtes par IP toutes les 10 minutes) et **CORS** restreint aux origines connues.

> Les routes de l'espace restaurant ne sont pas encore protégées par un jeton d'authentification : la connexion vérifie le mot de passe et renvoie le profil du restaurant, que le client réutilise ensuite. L'ajout d'un jeton (JWT) et d'un middleware sur les routes du tableau de bord est la prochaine évolution prévue.

## Stack technique

Node.js, Express 4, MongoDB (Atlas) avec Mongoose 9, bcrypt, express-validator, express-rate-limit, Twilio, déploiement serverless sur Vercel.

## Routes

| Méthode | Route                                     | Description                                    |
| ------- | ----------------------------------------- | ---------------------------------------------- |
| POST    | `/restaurants/new`                        | inscription d'un restaurant                    |
| POST    | `/restaurants/login`                      | connexion                                      |
| GET     | `/restaurants/all`                        | liste des restaurants                          |
| GET     | `/restaurants/reserver/:slug`             | restaurant pour la page de réservation publique |
| GET     | `/restaurants/:siret`                     | informations INSEE d'un établissement          |
| PATCH   | `/restaurants/service/close-date/:id`     | fermer un service à une date                   |
| PATCH   | `/restaurants/service/open-date/:id`      | rouvrir un service à une date                  |
| DELETE  | `/restaurants/delete/:id`                 | supprimer un restaurant                        |
| GET     | `/bookings/all/:restaurantId`             | réservations d'un restaurant                   |
| POST    | `/bookings/new/:restaurantId`             | nouvelle réservation (rate-limitée)            |
| PUT     | `/bookings/update/:bookingId`             | modification d'une réservation                 |
| DELETE  | `/bookings/cancel/:bookingId`             | annulation                                     |
| GET     | `/health`                                 | état du serveur et de la base                  |

## Installation

Prérequis : Node.js 18+, [corepack](https://nodejs.org/api/corepack.html) (active la bonne version de Yarn), une base MongoDB (Atlas ou locale).

```bash
git clone https://github.com/romainauthier-1/resafacile-backend.git
cd resafacile-backend
corepack enable
yarn install
cp .env.example .env    # renseigner les variables ci-dessous
yarn dev                # http://localhost:4000
```

| Variable             | Rôle                                                      |
| -------------------- | --------------------------------------------------------- |
| `CONNECTION_STRING`  | chaîne de connexion MongoDB                               |
| `FRONTEND_URL`       | origine du frontend autorisée par CORS (en production)    |
| `SIRENE_API_KEY`     | clé de l'API SIRENE de l'INSEE                            |
| `TWILIO_ACCOUNT_SID` · `TWILIO_AUTH_TOKEN` · `TWILIO_NUMBER` | identifiants Twilio pour l'envoi des SMS |

Sans identifiants Twilio, l'API démarre normalement : il suffit de décocher l'envoi de SMS dans le formulaire de réservation.

## Structure

```
index.js          démarrage du serveur
app.js            configuration Express : CORS, rate limiting, routes, gestion d'erreurs
models/           connexion MongoDB, schémas Restaurant et Booking
routes/           restaurants, bookings, sms (client Twilio)
modules/          utilitaires
```

---

Romain Authier — [GitHub](https://github.com/romainauthier-1)
