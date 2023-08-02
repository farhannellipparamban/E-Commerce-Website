const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    deliveryDetails: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
    },
    userName: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
    },
    product: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
    },
    subtotal: {
      type: Number,
    },
    status: {
      type: String,
    },
    paymentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("order", orderSchema);
