var express = require("express");
var router = express.Router();
const bookings = require("../models/bookings");
const restaurants = require("../models/restaurants");
const { body, validationResult } = require("express-validator");
const sendSMS = require("./sms");
const capitalize = require("../modules/utils");

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
      )
      .trim()
      .replace(/\s+/g, "")
      .matches(/^\+33[67]\d{8}$/)
      .withMessage("Le numéro de téléphone doit être au format +33612345678"),
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

      const bookingDate = new Date(dateTime);
      const bookingDay = new Date(dateTime).toLocaleDateString("fr-FR", {
        weekday: "long",
      });
      const bookingMinutes =
        bookingDate.getHours() * 60 + bookingDate.getMinutes();

      if (!restaurant.openingDays.includes(bookingDay)) {
        return res.status(400).json({
          result: false,
          message: `Le restaurant est fermé le ${bookingDay}`,
        });
      }

      const bookingDateCheck = new Date(dateTime);
      bookingDateCheck.setHours(0, 0, 0, 0);

      const matchingService = restaurant.services.find((service) => {
        const isDayOK =
          service.dayOfWeek.length > 0
            ? service.dayOfWeek.includes(bookingDay)
            : false;

        const isHourOK =
          bookingMinutes >= service.startTime &&
          bookingMinutes <= service.endTime;

        const isDateClosed = service.closedDates.some((closedDate) => {
          const closedDateCheck = new Date(closedDate);
          closedDateCheck.setHours(0, 0, 0, 0);

          return bookingDateCheck.getTime() === closedDateCheck.getTime();
        });

        if (isDayOK && isHourOK && service.isOpen && !isDateClosed) {
          return true;
        }
      });

      if (matchingService) {
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
        await savedBooking.populate("restaurant", "name phoneNumber");

        const smsBody = `Bonjour ${capitalize(savedBooking.customer.firstName)} ${capitalize(savedBooking.customer.lastName)}, votre réservation pour ${savedBooking.nbPax} ${savedBooking.nbPax > 1 ? "personnes" : "personne"} le ${savedBooking.dateTime.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} à ${savedBooking.dateTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} est enregistrée. Merci et à bientôt, ${savedBooking.restaurant.name && capitalize(savedBooking.restaurant.name)}`;
        const restaurantSmsBody = `Bonjour ${savedBooking.restaurant.name && capitalize(savedBooking.restaurant.name)}, nouvelle réservation: ${capitalize(savedBooking.customer.firstName)} ${capitalize(savedBooking.customer.lastName)} | ${savedBooking.nbPax} pax | ${savedBooking.dateTime.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} à ${savedBooking.dateTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} ${savedBooking.occasion && `| Occasion: ${savedBooking.occasion}`}`;
        // const smsToCustomer = await sendSMS(
        //   savedBooking?.customer.phoneNumber,
        //   smsBody,
        // );
        // const smsToRestaurant = await sendSMS(
        //   savedBooking?.restaurant.phoneNumber,
        //   restaurantSmsBody,
        // );

        // if (smsToRestaurant.errorMessage || smsToCustomer.errorMessage) {
        //   console.error(
        //     "Erreur lors de l'envoi du SMS de confirmation",
        //     smsToRestaurant.errorMessage,
        //     smsToCustomer.errorMessage,
        //   );
        //   return res.status(500).json({
        //     result: false,
        //     message:
        //       "Erreur lors de la validation de votre réservation, veuillez réessayer.",
        //     smsToCustomer,
        //     smsToRestaurant,
        //   });
        // }

        // if (
        //   smsToCustomer.errorMessage === null &&
        //   smsToRestaurant.errorMessage === null
        // ) {
        res.status(201).json({
          result: true,
          savedBooking,
          message: "Réservation effectuée !",
        });
        // }
      } else {
        return res.status(400).json({
          result: false,
          message:
            "Il n'y a pas de disponibilité pour la date et l'heure choisies.",
        });
      }
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
