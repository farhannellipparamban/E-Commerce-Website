const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    image: {
      type: Array,
    },
    category: {
      type: String,
      required: true,
      
    },
    stock: {
      type: String,
      required: true,
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
    // brand: {
    //     type: String,
    //     required: true,
    //   },
    //   gender: {
    //     type: String,
    //     required: true,
    //     enum: ['male', 'female', 'unisex'],
    //   },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("product", productSchema);
