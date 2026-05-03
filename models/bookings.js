const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: false },
    phoneNumber: { type: String, required: true },
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  dateTime: { type: Date, required: true },
  nbPax: { type: Number, required: true },
  occasion: { type: String },
});

const bookings = mongoose.model("Booking", bookingSchema);

module.exports = bookings;
