const mongoose = require("mongoose");
const {ObjectId} = require("mongodb")

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
      type: Number,
      required: true,
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
    review : [
      {
        user : {
          type:ObjectId,
          ref:"User"
        },
        review:{
           type:String,
         },
        rating:{
          type:Number
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("product", productSchema);
