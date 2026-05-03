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

// GET toutes les réservations d'un restaurant
router.get("/all/:restaurantId", async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const allBookings = await bookings
      .find({ restaurant: restaurantId })
      .populate("restaurant", "name");

    if (allBookings.length > 0) {
      res
        .status(200)
        .json({ result: true, nbOfBookings: allBookings.length, allBookings });
    } else {
      res.status(404).json({
        result: false,
        message: "Pas de réservation pour ce restaurant.",
      });
    }
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

// POST Faire une réservation
router.post(
  "/new/:restaurantId",
  [
    body("firstName").notEmpty().withMessage("Le prénom est requis").trim(),
    body("lastName").notEmpty().withMessage("Le nom est requis").trim(),
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
    body("dateTime")
      .notEmpty()
      .withMessage("Merci d'indiquer la date et l'heure de votre venue.")
      .trim(),
    body("nbPax")
      .notEmpty()
      .withMessage("Merci d'indiquer le nombre de convives")
      .trim(),
  ],
  validate,
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        dateTime,
        nbPax,
        occasion,
      } = req.body;
      const { restaurantId } = req.params;

      if (new Date(dateTime) < new Date()) {
        return res.status(400).json({
          result: false,
          message:
            "La date et l'heure de la réservation ne peuvent pas être antérieures à la date actuelle.",
        });
      }

      const checkBooking = await bookings.findOne({
        customer: {
          firstName: firstName.toLowerCase(),
          lastName: lastName.toLowerCase(),
          email: email.toLowerCase(),
          phoneNumber,
        },
        dateTime: new Date(dateTime),
        restaurant: restaurantId,
      });

      if (checkBooking) {
        return res.status(400).json({
          result: false,
          message:
            "Une réservation existe déjà à ce nom pour la date choisie. Si vous souhaitez modifier ou annuler votre réservation, merci de nous contacter.",
        });
      }

      const restaurant = await restaurants.findById(restaurantId);

      if (!restaurant) {
        return res
          .status(404)
          .json({ result: false, message: "Restaurant non trouvé." });
      }

      const newBooking = new bookings({
        customer: {
          firstName: firstName.toLowerCase(),
          lastName: lastName.toLowerCase(),
          email: email.toLowerCase(),
          phoneNumber,
        },
        dateTime: new Date(dateTime),
        occasion,
        nbPax,
        restaurant: restaurantId,
      });

      const savedBooking = await newBooking.save();
      res.status(201).json({
        result: true,
        savedBooking,
        message: "Réservation effectuée !",
      });
    } catch (err) {
      res.status(500).json({ result: false, message: err.message });
    }
  },
);

// DELETE Annuler une réservation
router.delete("/cancel/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    const foundBooking = await bookings.findByIdAndDelete(bookingId);

    if (foundBooking) {
      res.status(200).json({
        result: true,
        foundBooking,
        message: `Réservation annulée !`,
      });
    } else {
      res.status(401).json({
        result: false,
        message:
          "Nous n'avons pas pu annuler votre réservation, veuillez nous contacter directement.",
      });
    }
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

// POST Modifier une réservation
router.put("/update/:bookingId", async (req, res) => {
  const { firstName, lastName, email, date, time, nbPax, occasion } = req.body;
  const { bookingId } = req.params;
  try {
    const updatedBooking = await bookings.findByIdAndUpdate(
      bookingId,
      {
        firstName: firstName.toLowerCase(),
        lastName: lastName.toLowerCase(),
        email: email.toLowerCase(),
        date,
        time,
        nbPax,
        occasion,
      },
      { returnDocument: "after" },
    );

    if (updatedBooking) {
      res.status(200).json({
        result: true,
        updatedBooking,
        message: "Réservation mise à jour !",
      });
    } else {
      res.status(404).json({
        result: false,
        message:
          "Réservation non modifiée, veuillez nous contacter directement.",
      });
    }
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

module.exports = router;
