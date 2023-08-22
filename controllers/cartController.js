const User = require("../models/userModels");
const admin = require("../models/adminModel");
const productdb = require("../models/prodectModel");
const user_address = require("../models/addressModel");
const cart = require("../models/cartModel");
const order = require("../models/orderModel");
const coupon = require("../models/couponModel");
const { log } = require("console");
require("dotenv").config();

// cart get
const loadCart = async (req, res) => {
  try {
    const loadlogIn = req.session.user_id;
    const userd = await User.findOne({ _id: req.session.user_id });
    const id = req.session.user_id;
    const cartData = await cart
      .findOne({ user: req.session.user_id })
      .populate("product.productId");
    if (cartData) {
      const products = cartData.product;
      if (products.length > 0) {
        for (const product of products) {
          product.total = product.price * product.quantity;
        }
        const total = await cart.aggregate([
          { $match: { user: userd._id } },
          { $unwind: "$product" },
          {
            $project: {
              price: "$product.price",
              quantity: "$product.quantity",
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$price", "$quantity"] } },
            },
          },
        ]);

        const Total = total[0].total;
        const userID = userd._id;

        res.render("cart", {
          loadlogIn,
          user: userd.name,
          products: products,
          Total,
          userID,
        });
      } else {
        res.render("cart", {
          loadlogIn,
          user: userd.name,
          products: undefined,
        });
      }
    } else {
      res.render("cart", { loadlogIn, user: userd.name });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addtoCart = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const quantity = 1; // Change this to the desired initial quantity
    const productId = req.body.id;
    const cartdata = await cart.findOne({ user: userid });
    const productData = await productdb.findOne({ _id: productId });
    const total = quantity * productData.price;
    if (userid) {

    if (cartdata) {
      const existingProductIndex = cartdata.product.findIndex(
        (product) => product.productId.toString() === productId
      );

      if (existingProductIndex !== -1) {
        const existingProduct = cartdata.product[existingProductIndex];
        const updatedQuantity = existingProduct.quantity + quantity;
        if (updatedQuantity <= productData.stock) {
          cartdata.product[existingProductIndex].quantity = updatedQuantity;
          cartdata.product[existingProductIndex].total =
            updatedQuantity * productData.price;
          // cartdata.grandTotal += quantity * productData.price;
          const updatedCart = await cartdata.save();
          res.json({
            success: true,
            newQuantity: updatedQuantity,
            grandTotal: updatedCart.grandTotal,
          });
        } else {
          res.json({
            success: false,
            message: `The maximum quantity available for this product is ${productData.stock}. Please adjust your quantity.`,
          });
        }
      } else {
        cartdata.product.push({
          productId: productId,
          quantity: quantity,
          total: total,
          price: productData.price,
        });
        // cartdata.grandTotal += total;
        cartdata.count += 1;
        const updatedCart = await cartdata.save();
        res.json({
          success: true,
          newQuantity: quantity,
          grandTotal: updatedCart.grandTotal,
        });
      }
    } else {
      const NewCart = new cart({
        user: userid,
        product: [
          {
            productId: productId,
            quantity: quantity,
            total: total,
            price: productData.price,
          },
        ],
        grandTotal: total,
        count: 1,
      });

      const updatedCart = await NewCart.save();
      res.json({
        success: true,
        newQuantity: quantity,
        grandTotal: updatedCart.grandTotal,
      });
    }
  } else {
    res.redirect('/login');
  }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating quantity",
    });
  }
};

//quantity changing
const changes = async (req, res) => {
  try {
    const count = req.body.count;
    const productId = req.body.productId;

    const Cart = await cart.findOne({ user: req.session.user_id });

    const product = await productdb.findOne({ _id: productId });

    const cartProduct = Cart.product.find(
      (product) => product.productId.toString() === productId
    );

    if (count == 1) {
      if (cartProduct.quantity < product.stock) {
        cartProduct.quantity += 1;
        cartProduct.total = cartProduct.quantity * product.price;
        Cart.grandTotal += product.price;
      } else {
        res.json({
          success: false,
          message: `The maximum quantity available for this product is ${product.stock}. Please adjust your quantity.`,
        });
        return;
      }
    } else if (count == -1) {
      if (cartProduct.quantity > 1) {
        cartProduct.quantity -= 1;
        cartProduct.total = cartProduct.quantity * product.price;
        Cart.grandTotal -= product.price;
      } else {
        res.json({
          success: false,
          message: "Cannot decrement the quantity anymore",
        });
        return;
      }
    } else {
      res.json({ success: false, message: "Invalid count value" });
      return;
    }

    await Cart.save();

    const userd = await User.findOne({ _id: req.session.user_id });
    let total = 0;
    for (const cartProduct of Cart.product) {
      const product = await productdb.findOne({ _id: cartProduct.productId });
      total += cartProduct.quantity * product.price;
    }
    Cart.grandTotal = total;
    const updatedCart = await Cart.save();

    res.json({
      success: true,
      newQuantity: cartProduct.quantity,
      Total: updatedCart.Cart,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating quantity",
    });
  }
};

//total product price
const totalproductPrice = async (req, res) => {
  try {
    const userd = await User.findOne({ _id: req.session.user_id });

    const cartData = await cart.findOne({ user: userd._id });

    if (!cartData) {
      res.json({ success: true, Total: 0 });
      return;
    }

    let total = 0;
    for (const cartProduct of cartData.product) {
      const product = await productdb.findOne({ _id: cartProduct.productId });
      total += cartProduct.quantity * product.price;
    }

    cartData.grandTotal = total;
    await cartData.save();

    res.json({ success: true, Total: total });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error occurred while calculating total",
    });
  }
};

//delete item from the cart
const deletecartitem = async (req, res) => {
  try {
    const id = req.query.id;
    const userid = req.session.user_id;
    const productCart = await cart.findOne(
      { user: userid, "product.productId": id },
      { user: 1, product: { $elemMatch: { productId: id } } }
    );
    const cartProduct = productCart.product.find(
      (product) => product.productId.toString() == id
    );
    const total = cartProduct.total;
    await cart.findOneAndUpdate(
      { user: userid },
      {
        $pull: { product: { productId: id } },
        $inc: { grandTotal: -total, count: -1 },
      }
    );
    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};

//product checkout
const productCheckout = async (req, res) => {
  try {
    const loadlogIn = req.session.user_id;
    const coupons = await coupon.find();
    const address = await user_address.findOne({ user: req.session.user_id });
    const data = await productdb.find();
    const userd = await User.findOne({ _id: req.session.user_id });
    const cartData = await cart
      .findOne({ user: userd._id })
      .populate("product.productId");

    const total = await cart.aggregate([
      { $match: { user: userd._id } },

      { $unwind: "$product" },

      { $project: { price: "$product.price", quantity: "$product.quantity" } },

      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$price", "$quantity"] } },
        },
      },
    ]);

    const Total = total[0].total;

    if (address) {
      if (cartData.product.length > 0) {
        const addressData = address.address;
        const Total = total[0].total;
        const grandTotal = total[0].total;

        res.render("checkout", {
          loadlogIn,
          product: data,
          Total,
          userd,
          user: userd.name,
          address: addressData,
          grandTotal,
          coupons,
        });
      } else {
        res.render("checkout", {
          loadlogIn,
          product: data,
          Total,
          userd,
          user: userd.name,
          address: addressData,
          coupons,
        });
      }
    } else {
      res.render("checkout", {
        loadlogIn,
        product: data,
        userd,
        user: userd.name,
        Total,
        coupons,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadCart,
  addtoCart,
  deletecartitem,
  changes,
  productCheckout,
  totalproductPrice,
};
