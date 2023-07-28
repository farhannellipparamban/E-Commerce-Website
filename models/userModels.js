const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mob: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  is_admin: {
    type: Number,
    required: true,
  },
  is_verified: {
    type: Number,
    default: 0,
  },
  is_blocked: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema);
