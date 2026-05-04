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
router.get("/all/", async (req, res) => {
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
    body("siret").notEmpty().withMessage("Le SIRET est requis").trim(),
    body("name").notEmpty().withMessage("Le nom est requis").trim(),
    body("address").notEmpty().withMessage("L'adresse est requise").trim(),
    body("city").notEmpty().withMessage("La ville est requise").trim(),
    body("country").notEmpty().withMessage("Le pays est requis").trim(),
    body("email")
      .notEmpty()
      .withMessage("L'email est requis")
      .trim()
      .isEmail()
      .withMessage("Utilisez un format d'email valide : jean@mail.com"),
    body("phoneNumber")
      .notEmpty()
      .withMessage(
        "Nous avons besoin de votre numéro de téléphone pour confirmer votre réservation.",
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
        country,
        email,
        phoneNumber,
        openingDays,
        services,
      } = req.body;

      const restaurant = await restaurants.findOne({ siret });

      if (restaurant) {
        return res.status(400).json({
          result: false,
          message: "Votre SIRET existe déjà dans notre base de données !",
        });
      }

      const newRestaurant = new restaurants({
        siret,
        name,
        address,
        city,
        country,
        email: email.toLowerCase(),
        phoneNumber,
        openingDays,
        services,
      });

      const savedRestaurant = await newRestaurant.save();
      res.status(201).json({
        result: true,
        savedRestaurant,
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
        res.status(200).json({
          result: true,
          message: `Bienvenue ${restaurant.name} !`,
          restaurantId: restaurant._id,
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

  res.json({ result: true, restaurant });
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

  res.json({ result: true, restaurant });
});

module.exports = router;
