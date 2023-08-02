const mongoose = require("mongoose");

const useraddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },

  address: [
    {
      fname: {
        type: String,
        required: true,
      },
      sname: {
        type: String,
        required: true,
      },
      mobile: {
        type: Number,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      pin: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("user_address", useraddressSchema);
