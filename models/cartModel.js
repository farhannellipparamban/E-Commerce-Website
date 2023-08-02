const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const cartSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: "User",
    require: true,
  },
  product: [
    {
      productId: {
        type: ObjectId,
        ref: "product",
        require: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      price: {
        type: Number,
        default: 0,
      },
    },
  ],
});

module.exports = mongoose.model("cart", cartSchema);
