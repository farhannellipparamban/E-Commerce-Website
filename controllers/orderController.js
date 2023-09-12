const dotenv = require('dotenv');
dotenv.config()
const User = require("../models/userModels");
const admin = require("../models/adminModel");
const productdb = require("../models/prodectModel");
const user_address = require("../models/addressModel");
const cart = require("../models/cartModel");
const order = require("../models/orderModel");
const coupon = require("../models/couponModel");
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: 'rzp_test_X5XhJ53T3zS8E9',
  key_secret: 'VgVrMNVmYEKH8VnfNvMrE1h2',
});

// placetheorder
const placeTheOrder = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ _id: req.session.user_id });
    const cartData = await cart.findOne({ user: userDetails._id });

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

    const status =
      payment === "COD" || payment == "wallet" ? "placed" : "pending";


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
    if (payment == "wallet") {
      await User.findByIdAndUpdate(
        { _id: req.session.user_id },
        {
          $inc: { wallet: -Total1 },
          $push: {
            walletHistory: {
              date: new Date(),
              amount: -Total1,
              description: `Buy product with wallet`,
            },
          },
        }
      );
    }

    if (status == "placed") {

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
    console.log(error.message);
    next(error);
  }
};

// verify Payment
const verifyPayment = async (req, res, next) => {
  try {
    const details = req.body;
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", 'VgVrMNVmYEKH8VnfNvMrE1h2');
    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    hmac = hmac.digest("hex");
    if (hmac == details.payment.razorpay_signature) {
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
    next(error);
  }
};

//order placing
const orderPlaced = async (req, res, next) => {
  try {
    const loadlogIn = req.session.user_id;
    const userd = await User.findOne({ _id: req.session.user_id });
    const orderData = await order
      .findOne({ user: req.session.user_id })
      .populate("product.productId");

    res.render("orderSuccess", { loadlogIn, user: userd.name, orderData });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//orderList
const orderlistLoad = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * 8;

    const loadlogIn = req.session.user_id;
    const userd = await User.findOne({ _id: req.session.user_id });
    const orders = await order
      .find({ user: userd._id })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(8);
    const totalOrders = await order.countDocuments({ user: userd._id });
    const totalPages = Math.ceil(totalOrders / 8);

    res.render("orderList", {
      loadlogIn: loadlogIn,
      user: userd.name,
      orders: orders,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//show order
const showorderLoad = async (req, res, next) => {
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
    next(error);
  }
};

//order canceling
const canceluserOrder = async (req, res, next) => {
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
          $push: {
            walletHistory: {
              date: new Date(),
              amount: total,
              description: `Refunded for Order cancel`,
            },
          },
        });
      }
      res.json({ remove: true });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//return user order
const returnOrder = async (req, res, next) => {
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
    next(error);
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
