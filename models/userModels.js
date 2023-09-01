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
  token: {
    type: String,
    default: " ",
  },
  wallet: {
    type: Number,
    default: 0,
  },
  walletHistory: [
    {
      date: {
        type: Date,
      },
      amount: {
        type: Number,
      },
      description: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
