const express = require("express");
const rateLimit = require("express-rate-limit");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const webpush = require("web-push");
const mongoose = require("mongoose");

webpush.setVapidDetails(
  "mailto:romainauthier@outlook.com",
  process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.EXPO_PUBLIC_VAPID_PRIVATE_KEY,
);

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

const usersRouter = require("./routes/users");
const notifRouter = require("./routes/notifications");

const app = express();
require("./models/connection");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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

app.use("/users/signin", authLimiter);
app.use("/users/signup", authLimiter);
app.use("/users", usersRouter);
app.use("/notifications", notifRouter);

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
