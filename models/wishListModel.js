const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const WishlistSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  products: [
    {
      productId: {
        type: ObjectId,
        ref: "product",
        required: true,
      },
    },
  ],
});

const wishlistModel = mongoose.model("wishlist", WishlistSchema);

module.exports = wishlistModel;
