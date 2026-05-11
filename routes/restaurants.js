var express = require("express");
var router = express.Router();
const bookings = require("../models/bookings");
const restaurants = require("../models/restaurants");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      result: false,
      message: errors.array()[0].msg,
    });
  }
  next();
};

// GET la liste des restaurants
router.get("/all", async (req, res) => {
  try {
    const allRestaurants = await restaurants.find();

    if (allRestaurants.length > 0) {
      res.status(200).json({
        result: true,
        nbOfRestaurants: allRestaurants.length,
        allRestaurants,
      });
    } else {
      res.status(404).json({
        result: false,
        message: "Pas de restaurants en BDD.",
      });
    }
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

// POST Créer un restaurant
router.post(
  "/new",
  [
    body("siret")
      .notEmpty()
      .withMessage("Le SIRET est requis")
      .trim()
      .customSanitizer((value) => value.replace(/\s/g, "")) // supprime les espaces
      .matches(/^\d{14}$/), // N° SIRET français sans espace
    body("name").notEmpty().withMessage("Le nom est requis").trim(),
    body("address").notEmpty().withMessage("L'adresse est requise").trim(),
    body("city").notEmpty().withMessage("La ville est requise").trim(),
    body("zipCode")
      .notEmpty()
      .withMessage("Le code postal est requis")
      .trim()
      .matches(/^\d{5}$/),
    body("email")
      .notEmpty()
      .withMessage("L'email est requis")
      .trim()
      .isEmail()
      .withMessage("Utilisez un format d'email valide : jean@mail.com"),
    body("phoneNumber")
      .notEmpty()
      .withMessage(
        "Nous avons besoin de votre numéro de téléphone pour transmettre les réservations.",
      )
      .trim()
      .replace(/\s+/g, "")
      .customSanitizer((value) => {
        if (value.startsWith("0")) {
          return "+33" + value.slice(1);
        }
        return value;
      })
      .matches(/^\+33[67]\d{8}$/)
      .withMessage(
        "Le numéro de téléphone doit être au format 0612345678 ou +33712345678",
      ),
    body("openingDays")
      .notEmpty()
      .withMessage("Merci d'indiquer les jours d'ouverture"),
    body("services")
      .notEmpty()
      .withMessage("Merci d'indiquer au moins un service"),
  ],
  validate,
  async (req, res) => {
    try {
      const {
        siret,
        name,
        address,
        city,
        zipCode,
        email,
        password,
        phoneNumber,
        openingDays,
        services,
        gap,
      } = req.body;

      const restaurant = await restaurants.findOne({ siret });

      if (restaurant) {
        return res.status(400).json({
          result: false,
          message: "Votre SIRET existe déjà dans notre base de données !",
        });
      }

      const checkEmail = await restaurants.findOne({
        email: email.toLowerCase(),
      });

      if (checkEmail) {
        return res.status(400).json({
          result: false,
          message: "Votre email existe déjà dans notre base de données !",
        });
      }

      const slugify = (str) => {
        return str
          .normalize("NFD") // Décompose les accents (é -> e + ´)
          .replace(/[\u0300-\u036f]/g, "") // Supprime les morceaux d'accents
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9 ]/g, "") // Supprime tout ce qui n'est pas lettre, chiffre ou espace
          .replace(/\s+/g, "-"); // Remplace les espaces par des tirets
      };

      const slug = slugify(name);

      const checkSlug = await restaurants.findOne({ slug });

      if (checkSlug) {
        return res.status(400).json({
          result: false,
          message: "Un restaurant existe déjà avec le même nom.",
        });
      }

      const hash = await bcrypt.hash(password, 10);

      const servicesWithOpeningDays = services.map((service) => ({
        ...service,
        dayOfWeek: openingDays,
      }));

      const newRestaurant = new restaurants({
        siret,
        name,
        address,
        city,
        zipCode,
        password: hash,
        email: email.toLowerCase(),
        phoneNumber,
        openingDays,
        services: servicesWithOpeningDays,
        slug,
        gap,
      });

      const savedRestaurant = await newRestaurant.save();

      const { password: _, ...savedRestaurantWhitoutPassword } =
        savedRestaurant.toObject();
      res.status(201).json({
        result: true,
        restaurant: savedRestaurantWhitoutPassword,
        message: "Restaurant créé !",
      });
    } catch (err) {
      res.status(500).json({ result: false, message: err.message });
    }
  },
);

// POST Se connecter en tant que restaurant
router.post(
  "/login",
  [
    body("email")
      .notEmpty()
      .withMessage("Merci de saisir un email")
      .trim()
      .isEmail()
      .withMessage("Utilisez un format d'email valide : jean@mail.com"),
    body("password").notEmpty().withMessage("Merci de saisir un mot de passe"),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const restaurant = await restaurants.findOne({
        email: email.toLowerCase(),
      });

      if (!restaurant) {
        return res.status(404).json({
          result: false,
          message: "Aucun restaurant trouvé avec cet email.",
        });
      }

      if (restaurant && (await bcrypt.compare(password, restaurant.password))) {
        const { password: _, ...restaurantWhitoutPassword } =
          restaurant.toObject();
        res.status(200).json({
          result: true,
          message: `Bienvenue ${restaurant.name} !`,
          restaurant: restaurantWhitoutPassword,
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ result: false, message: err.message });
    }
  },
);

// DELETE Supprimer un restaurant
router.delete("/delete/:restaurandId", async (req, res) => {
  try {
    const { restaurandId } = req.params;

    const foundRestaurant = await restaurants.findByIdAndDelete(restaurandId);

    if (foundRestaurant) {
      res.status(200).json({
        result: true,
        foundRestaurant,
        message: `Restaurant supprimé !`,
      });
    } else {
      res.status(401).json({
        result: false,
        message:
          "Nous n'avons pas pu supprimer votre restaurant, veuillez nous contacter directement.",
      });
    }
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

// PATCH Fermer un service
router.patch("/service/close-date/:restaurantId", async (req, res) => {
  const { serviceId, date } = req.body;

  const restaurant = await restaurants.findByIdAndUpdate(
    req.params.restaurantId,
    {
      $addToSet: {
        "services.$[s].closedDates": new Date(date),
      },
    },
    {
      arrayFilters: [{ "s._id": serviceId }],
      returnDocument: "after",
    },
  );

  res.json({
    result: true,
    services: restaurant.services,
    message: "Service fermé",
  });
});

// PATCH Ouvrir un service pour une date précise
router.patch("/service/open-date/:restaurantId", async (req, res) => {
  const { serviceId, date } = req.body;

  const restaurant = await restaurants.findByIdAndUpdate(
    req.params.restaurantId,
    {
      $pull: {
        "services.$[s].closedDates": new Date(date),
      },
    },
    {
      arrayFilters: [{ "s._id": serviceId }],
      returnDocument: "after",
    },
  );

  res.json({
    result: true,
    services: restaurant.services,
    message: "Service ouvert",
  });
});

// GET Obtenir toutes les informations du restaurant avec son siret
router.get("/:siret", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.insee.fr/api-sirene/3.11/siret/${req.params.siret}`,
      {
        headers: { "X-INSEE-Api-Key-Integration": process.env.SIRENE_API_KEY },
      },
    );

    const data = await response.json();

    if (data.header.statut !== 200) {
      res.json({
        result: false,
        message: response.header.message,
      });
    }

    const restaurant = {
      siret: data.etablissement.siret,
      businessCommercialName:
        data.etablissement.uniteLegale.denominationUniteLegale,
      businessAddress: {
        number:
          data.etablissement.adresseEtablissement.numeroVoieEtablissement || "",
        streetType:
          data.etablissement.adresseEtablissement.typeVoieEtablissement || "",
        streetName:
          data.etablissement.adresseEtablissement.libelleVoieEtablissement ||
          "",
        zipCode:
          data.etablissement.adresseEtablissement.codePostalEtablissement || "",
        city:
          data.etablissement.adresseEtablissement.libelleCommuneEtablissement ||
          "",
        coordonnee1:
          data.etablissement.adresseEtablissement
            .coordonneeLambertAbscisseEtablissement || "",
        coordonnee2:
          data.etablissement.adresseEtablissement
            .coordonneeLambertOrdonneeEtablissement || "",
      },
    };

    res.json({ result: true, restaurant });
  } catch (error) {
    res.json({ result: false, error: error.message });
  }
});

// GET Restaurant par slug
router.get("/reserver/:slug", async (req, res) => {
  try {
    const foundRestaurant = await restaurants.findOne({
      slug: req.params.slug,
    });

    if (foundRestaurant) {
      res.status(200).json({
        result: true,
        foundRestaurant,
        message: "Restaurant récupéré.",
      });
    } else {
      res
        .status(404)
        .json({ result: false, message: "Restaurant non trouvé." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ result: false, message: err.message });
  }
});

module.exports = router;
