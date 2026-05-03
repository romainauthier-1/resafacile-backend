const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  siret: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
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
    },
  ],
});

const restaurants = mongoose.model("Restaurant", restaurantSchema);

module.exports = restaurants;
