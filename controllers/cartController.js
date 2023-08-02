const User = require("../models/userModels");
const admin = require("../models/adminModel");
const productdb = require("../models/prodectModel");
const user_address = require("../models/addressModel");
const cart = require("../models/cartModel");
const order = require("../models/orderModel");

//cart get
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

// Add to cart
const addtoCart = async (req, res) => {
  try {
    const productId = req.body.id;
    const UserId = await User.findOne({ _id: req.session.user_id });
    //database checking
    const productData = await productdb.findById({ _id: productId });
    const Usercart = await cart.findOne({ user: UserId._id });

    if (Usercart) {
      //checking cart product available
      const productavilable = Usercart.product.findIndex(
        (product) => product.productId.toString() === productId
      );
      if (productavilable !== -1) {
        await cart.updateOne(
          { user: UserId, "product.productId": productId },
          { $inc: { "product.$.quantity": 1 } }
        );
        res.json({ success: true });
      } else {
        await cart.findOneAndUpdate(
          { user: req.session.user_id },
          {
            $push: {
              product: {
                productId: productId,
                price: productData.price,
              },
            },
          }
        );

        res.json({ success: true });
      }
    } else {
      const CartData = new cart({
        user: req.session.user_id,
        product: [
          {
            productId: productId,
            price: productData.price,
          },
        ],
      });

      const cartData = await CartData.save();
      if (cartData) {
        res.json({ success: true });
        res.redirect("/cart");
      } else {
        res.redirect("/");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//product quentity increase and decrease
const cartquantity = async (req, res) => {
  try {
    const proId = req.body.product;
    let count = req.body.count;
    let quantity = req.body.quantity;

    count = parseInt(count);
    quantity = parseInt(quantity);

    const productData = await productdb.findById(proId);

    if (count == -1 && quantity <= 1) {
      await cart.updateOne(
        { user: req.session.user_id },
        {
          $pull: {
            product: {
              productId: proId,
            },
          },
        }
      );
      res.json({ removeProduct: true });
    } else {
      await cart.updateOne(
        { _id: proId, "product.productId": proId },
        { $inc: { "product.$.quantity": count } }
      );
      res.json(true);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "An error occurred" });
  }
};

//total product price
const totalproductPrice = async (req, res) => {
  try {
    const userd = await User.findOne({ _id: req.session.user_id });

    let total = await cart.aggregate([
      {
        $match: {
          user: userd._id,
        },
      },
      {
        $unwind: "$product",
      },
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
    let Total = total[0].total;
    res.json({ success: true, Total });
  } catch (error) {
    console.log(error.message);
  }
};

//delete cart item
const deleteCartitem = async (req, res) => {
  try {
    let id = req.query.id;

    await cart.findOneAndUpdate(
      { "product.productId": id },
      { $pull: { product: { productId: id } } }
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
        });
      } else {
        res.render("checkout", {
          loadlogIn,
          product: data,
          Total,
          userd,
          user: userd.name,
          address: addressData,
        });
      }
    } else {
      res.render("checkout", {
        loadlogIn,
        product: data,
        userd,
        user: userd.name,
        Total,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// placetheorderCOD
const placeTheOrderCOD = async (req, res) => {
  try {
    const userd = await User.findOne({ _id: req.session.user_id });
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

    const Total1 = req.body.amount;
    const subtotal = req.body.total;

    const address = req.body.address;
    const payment = req.body.payment;
    const userDetails = await User.findOne({ _id: req.session.user_id });
    const cartData = await cart.findOne({ user: userDetails._id });
    const products = cartData.product;

    const status = payment === "COD" ? "placed" : "pending";

    const newOrder = new order({
      deliveryDetails: address,
      user: userDetails._id,
      userName: userDetails.name,
      paymentMethod: payment,
      product: products,
      totalAmount: Total1,
      subtotal: subtotal,
      status: status,
    });

    const saveOrder = await newOrder.save();
    if (status == "placed") {
      await cart.deleteOne({ user: userDetails._id });
      res.json({ codsuccess: true });
    } else {
      const orderid = saveOrder._id;
      const totalamount = saveOrder.totalAmount;
      var options = {
        amount: totalamount * 100,
        currency: "INR",
        receipt: "" + orderid,
      };
      instance.orders.create(options, function (err, order) {
        res.json({ order });
      });
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
    res.render("orderSuccess", { loadlogIn, user: userd.name });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadCart,
  addtoCart,
  deleteCartitem,
  cartquantity,
  productCheckout,
  placeTheOrderCOD,
  totalproductPrice,
  orderPlaced,
};
