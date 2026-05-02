var express = require("express");
var router = express.Router();
const User = require("../models/users");
const uid2 = require("uid2");
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

// GET tous les users
router.get("/all", async (req, res) => {
  try {
    const allUsers = await User.find();

    if (allUsers.length > 0) {
      res.status(200).json({ result: true, allUsers });
    } else {
      res.status(404).json({ result: false, message: "Pas d'utilisateur.ice" });
    }
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

// POST inscription
router.post(
  "/signup",
  [
    body("firstName").notEmpty().withMessage("Le prénom est requis").trim(),
    body("lastName").notEmpty().withMessage("Le nom est requis").trim(),
    body("email")
      .notEmpty()
      .withMessage("L'email est requis")
      .trim()
      .isEmail()
      .withMessage("Utilisez un format d'email valide : jean@mail.com"),
    body("password").notEmpty().withMessage("Le mot de passe est requis"),
    //.isLength({ min: 6 }).withMessage("6 caractères minimum"),
  ],
  validate,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      const result = await User.findOne({ email: email.toLowerCase() });
      if (!result) {
        const hash = bcrypt.hashSync(password, 10);

        const newUser = new User({
          firstName: firstName.toLowerCase(),
          lastName: lastName.toLowerCase(),
          email: email.toLowerCase(),
          password: hash,
          token: uid2(32),
        });

        const savedUser = await newUser.save();
        const { password: _, ...userWithoutPassword } = savedUser.toObject();
        res.status(201).json({
          result: true,
          savedUser: userWithoutPassword,
          message: "Utilisateur.ice enregistré.e !",
        });
      } else {
        res.status(400).json({
          result: false,
          message: "Utilisateur.ice déjà existant.e !",
        });
      }
    } catch (err) {
      res.status(500).json({ result: false, message: err.message });
    }
  },
);

// POST connexion
router.post(
  "/signin",
  [
    body("email")
      .notEmpty()
      .withMessage("L'email est requis")
      .trim()
      .isEmail()
      .withMessage("Utilisez un format d'email valide : jean@mail.com"),
    body("password").notEmpty().withMessage("Le mot de passe est requis"),
    //.isLength({ min: 6 }).withMessage("6 caractères minimum"),
  ],
  validate,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      const foundUser = await User.findOne({
        email: email.toLowerCase(),
      });

      if (foundUser && bcrypt.compareSync(password, foundUser.password)) {
        const { password: _, ...userWithoutPassword } = foundUser.toObject();
        res.status(200).json({
          result: true,
          foundUser: userWithoutPassword,
          message: `Bienvenue ${foundUser.firstName[0].toUpperCase()}${foundUser.firstName.slice(1)} !`,
        });
      } else {
        res.status(401).json({
          result: false,
          message: "Nous n'avons pas pu vous identifier.",
        });
      }
    } catch (err) {
      res.status(500).json({ result: false, message: err.message });
    }
  },
);

// POST Souscription notifications
router.post("/subscribe", async (req, res) => {
  const { token, subscription } = req.body;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { token },
      { subscription },
      { new: true },
    ).select("-password");

    if (updatedUser) {
      res.status(200).json({
        result: true,
        message: "Notifications activées !",
        updatedUser,
      });
    } else {
      res
        .status(404)
        .json({ result: false, message: "Utilisateur.ice non trouvé.e" });
    }
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

module.exports = router;
