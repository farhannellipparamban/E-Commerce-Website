const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  bannerTitle: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  Images: {
    type: String,
    required: true,
  },
  // bannerUrl: {
  //   type: String,
  //   required: true,
  // },
});

module.exports = mongoose.model("Banner", bannerSchema);
