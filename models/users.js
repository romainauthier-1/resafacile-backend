const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: String,
  subscription: { type: Object, default: null },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
