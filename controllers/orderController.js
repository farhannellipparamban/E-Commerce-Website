const User = require("../models/userModels");
const admin = require("../models/adminModel");
const productdb = require("../models/prodectModel");
const user_address = require("../models/addressModel");
const cart = require("../models/cartModel");
const order = require("../models/orderModel");
const coupon = require("../models/couponModel");
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: process.env.Razorpay_Key_Id,
  key_secret: process.env.Razorpay_Secret_Key,
});

// placetheorder
const placeTheOrder = async (req, res) => {
  try {
    const userDetails = await User.findOne({ _id: req.session.user_id });
    const cartData = await cart.findOne({ user: userDetails._id });

    // Check if all the products in the cart have sufficient stock
    for (const cartProduct of cartData.product) {
      const product = await productdb.findOne({ _id: cartProduct.productId });
      if (cartProduct.quantity > product.stock) {
        res.json({
          success: false,
          message: `Not enough stock available for product: ${product.name}`,
        });
        return;
      }
    }
    const Total1 = req.body.amount;
    const subtotal = req.body.total;
    const wallet1 = req.body.wallet;
    const address = req.body.address;
    const payment = req.body.payment;
    const exprdate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const products = cartData.product;
    const couponamt = req.body.coupon;
    const grandTotal = subtotal - userDetails.wallet;
    const wallet = req.body.wallet;

    const status = payment === "COD" ? "placed" : "pending";

    // Deduct the ordered quantity from the product stock
    // for (const cartProduct of cartData.product) {
    //   const product = await productdb.findOne({ _id: cartProduct.productId });
    //   product.stock -= cartProduct.quantity;
    //   await product.save();
    // }

    // Create and save the order
    const newOrder = new order({
      deliveryDetails: address,
      user: userDetails._id,
      userName: userDetails.name,
      paymentMethod: payment,
      product: products,
      totalAmount: Total1,
      subtotal: subtotal,
      status: status,
      Date: Date.now(),
      exprdate: exprdate,
      orderWallet: wallet,
      ordercoupon: couponamt,
    });

    const saveOrder = await newOrder.save();

    if (status == "placed") {
      // const wallet = subtotal - Total1 - couponamt;

      // await User.updateOne(
      //   { _id: req.session.user_id },
      //   { $inc: { wallet: -wallet } }
      // );
      await cart.deleteOne({ user: userDetails._id });
      res.json({ codsuccess: true });
    } else {
      const order_id = saveOrder._id;
      const totalamount = saveOrder.totalAmount;

      var orders = await instance.orders.create({
        amount: totalamount * 100,
        currency: "INR",
        receipt: "" + order_id,
      });
      res.json({ orders });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occurred while placing the order",
    });
  }
};

// verify Payment
const verifyPayment = async (req, res) => {
  try {
    const details = req.body;
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    hmac = hmac.digest("hex");
    if (hmac == details.payment.razorpay_signature) {
      //await User.updateOne({_id:req.session.user_id},{$inc:{wallet:-wal}});
      await order.findByIdAndUpdate(details.order.receipt, {
        $set: { status: "placed" },
      });
      await order.findByIdAndUpdate(details.order.receipt, {
        $set: { paymentId: details.payment.razorpay_payment_id },
      });
      await cart.deleteOne({ user: req.session.user_id });
      return res.json({ success: true });
    } else {
      await order.findByIdAndRemove(details.order.receipt);
      return res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//order placing
const orderPlaced = async (req, res) => {
  try {
    const loadlogIn = req.session.user_id;
    const userd = await User.findOne({ _id: req.session.user_id });
    const orderData = await order
      .findOne({ user: req.session.user_id })
      .populate("product.productId");

    res.render("orderSuccess", { loadlogIn, user: userd.name, orderData });
  } catch (error) {
    console.log(error.message);
  }
};

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

//return user order
const returnOrder = async (req, res) => {
  try {
    const userd = await User.findOne({ _id: req.session.user_id });
    const id = req.body.id;
    const date = await order.findById({ _id: id });
    if (Date.now() > date.exprdate) {
      res.json({ datelimit: true });
    } else {
      await order.updateOne(
        { _id: id },
        { $set: { status: "waiting for approval" } }
      );
      res.json({ return: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  orderlistLoad,
  showorderLoad,
  canceluserOrder,
  returnOrder,
  placeTheOrder,
  verifyPayment,
  orderPlaced,
};
