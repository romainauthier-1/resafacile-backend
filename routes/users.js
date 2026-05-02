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
    body("name").notEmpty().withMessage("Le nom est requis").trim(),
    body("password").notEmpty().withMessage("Le mot de passe est requis"),
    //.isLength({ min: 6 }).withMessage("6 caractères minimum"),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, password, status } = req.body;

      const result = await User.findOne({ name: name.toLowerCase() });
      if (!result) {
        const hash = bcrypt.hashSync(password, 10);

        const newUser = new User({
          name: name.toLowerCase(),
          password: hash,
          token: uid2(32),
          status: status,
        });

        const savedUser = await newUser.save().select("-password");
        res.status(201).json({
          result: true,
          savedUser,
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
    body("name").notEmpty().withMessage("Le nom est requis").trim(),
    body("password").notEmpty().withMessage("Le mot de passe est requis"),
    //.isLength({ min: 6 }).withMessage("6 caractères minimum"),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, password } = req.body;

      const foundUser = await User.findOne({ name: name.toLowerCase() }).select(
        "-password",
      );

      if (foundUser && bcrypt.compareSync(password, foundUser.password)) {
        res.status(200).json({
          result: true,
          foundUser,
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
    );

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
