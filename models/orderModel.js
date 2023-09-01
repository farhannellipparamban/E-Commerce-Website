const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    deliveryDetails: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref:"User"
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
    Date: {
      type: Date,
    },
    exprdate: {
      type: Date,
    },
    status: {
      type: String,
    },
    paymentId: {
      type: String,
    },
    orderWallet: {
      type: Number,
    },
    ordercoupon: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("order", orderSchema);
