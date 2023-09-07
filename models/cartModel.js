const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const cartSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  product: [
    {
      productId: {
        type: ObjectId,
        ref: "product",
        required: true,
      },
      price: {
        type: Number,
        // required :true
      },
      quantity: {
        type: Number,
        default: 1,
      },
      total: {
        type: Number,
      },
    },
  ],
  grandTotal: {
    type: Number,
    default:0
  },
});

module.exports = mongoose.model("cart", cartSchema);
