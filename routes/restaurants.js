var express = require("express");
var router = express.Router();
const bookings = require("../models/bookings");
const restaurants = require("../models/restaurants");
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
      res.status(200).json({ result: true, allRestaurants });
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

// DELETE Annuler une réservation
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

module.exports = router;
