const User = require("../models/userModels");
const admin = require("../models/adminModel");
const productdb = require("../models/prodectModel");
const user_address = require("../models/addressModel");
const cart = require("../models/cartModel");
const order = require("../models/orderModel");

//orderList
const orderlistLoad = async (req, res) => {
  try {
    const loadlogIn = req.session.user_id;
    const userd = await User.findOne({ _id: req.session.user_id });
    const orders = await order.find({ user: userd._id }).sort({ _id: -1 });
    res.render("orderList", { loadlogIn, user: userd.name, orders });
  } catch (error) {
    console.log(error.message);
  }
};

//show order
const showorderLoad = async (req, res) => {
  try {
    const userd = await User.findOne({ _id: req.session.user_id });
    const id = req.query.id;
    const loadlogIn = req.session.user_id;
    const orderData = await order
      .findById({ _id: id })
      .populate("product.productId");
    const product = orderData.product;
    res.render("orderlistShow", {
      loadlogIn,
      user: userd.name,
      product,
      orderData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//order canceling
const canceluserOrder = async (req, res) => {
  try {
    const id = req.body.id;
    const orderData = await order.findById({ _id: id });
    const wallet = orderData.orderWallet;
    const total = orderData.totalAmount + wallet - orderData.ordercoupon;

    const data = await order.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "canceled" } }
    );
    if (data) {
      if (orderData.paymentMethod === "COD") {
        await User.findByIdAndUpdate(orderData.user, {
          $inc: { wallet: wallet },
        });
      } else {
        await User.findByIdAndUpdate(orderData.user, {
          $inc: { wallet: total },
        });
      }
      res.json({ remove: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  orderlistLoad,
  showorderLoad,
  canceluserOrder,
};
