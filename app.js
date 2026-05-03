const express = require("express");
const rateLimit = require("express-rate-limit");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // fenêtre de 10 minutes
  max: 10, // 10 tentatives max par IP
  message: {
    result: false,
    message: "Trop de tentatives, réessaie dans 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const bookingsRouter = require("./routes/bookings");
const restaurantsRouter = require("./routes/restaurants");

const app = express();
require("./models/connection");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:8081",
      "http://192.168.1.25:3000",
      "http://192.168.1.25:3001",
      "http://192.168.1.25:8081",
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/bookings/new", authLimiter);
app.use("/bookings", bookingsRouter);
app.use("/restaurants", restaurantsRouter);

app.get("/health", async (req, res) => {
  const state = mongoose.connection.readyState;
  // 0 = déconnecté, 1 = connecté, 2 = connecting, 3 = disconnecting
  const states = ["déconnecté", "connecté", "en cours...", "fermeture..."];

  try {
    await mongoose.connection.db.admin().ping();
    res.json({ db: "connecté ✅", ping: "OK" });
  } catch (err) {
    res
      .status(503)
      .json({ db: states[state], ping: "KO ❌", error: err.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    result: false,
    message: err.message || "Erreur interne du serveur",
  });
});

module.exports = app;
