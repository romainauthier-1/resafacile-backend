const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  siret: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  openingDays: {
    type: [String],
    enum: [
      "lundi",
      "mardi",
      "mercredi",
      "jeudi",
      "vendredi",
      "samedi",
      "dimanche",
    ],
    required: true,
  },
  services: [
    {
      name: { type: String, required: true },
      startTime: { type: Number, required: true },
      endTime: { type: Number, required: true },
      gap: { type: Number, required: true },
      dayOfWeek: {
        type: [String],
        enum: [
          "lundi",
          "mardi",
          "mercredi",
          "jeudi",
          "vendredi",
          "samedi",
          "dimanche",
        ],
      },
      isOpen: { type: Boolean, default: true },
      closedDates: { type: [Date], default: [] },
    },
  ],
});

const restaurants = mongoose.model("Restaurant", restaurantSchema);

module.exports = restaurants;
