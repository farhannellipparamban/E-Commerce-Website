const User = require("../models/userModels");
const CatDB = require("../models/categoryModel");
const productDB = require("../models/prodectModel");
const Cart = require("../models/cartModel");
const WishList = require("../models/wishListModel");
const session = require("express-session");
const mongoose = require("mongoose");

//--------------------------------------------------------------

//Load WishList page
const loadWishList = async (req, res) => {
  try {
    const loadlogIn = req.session.user_id;
    const userName = await User.findOne({ _id: req.session.user_id });
    const WishListData = await WishList.findOne({
      user: req.session.user_id,
    }).populate("products.productId");
    const products = WishListData.products;
    if (products.length > 0) {
      if (req.session.user_id) {
        const customer = true;
        res.render("wishList", { customer, userName, products, loadlogIn });
      } else {
        res.redirect("/");
      }
    } else {
      const customer = false;
      res.render("wishList", { userName, customer, loadlogIn, products });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//Add To WishList
const addTowishList = async (req, res) => {
  try {
    const proId = req.body.Id;
    const user = await User.findOne({ _id: req.session.user_id });
    const productData = await productDB.findOne({ _id: proId });
    const WishListData = await WishList.findOne({ user: req.session.user_id });

    if (WishListData) {
      const checkWishlist = await WishListData.products.findIndex(
        (wish) => wish.productId == proId
      );
      if (checkWishlist != -1) {
        res.json({ check: true });
      } else {
        await WishList.updateOne(
          { user: req.session.user_id },
          { $push: { products: { productId: proId } } }
        );
        res.json({ success: true });
      }
    } else {
      const wishList = new WishList({
        user: req.session.user_id,
        userName: user.name,
        products: [
          {
            productId: productData._id,
          },
        ],
      });
      const wish = await wishList.save();
      if (wish) {
        res.json({ success: true });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//remove from wishlist
const removeWishlist = async (req, res) => {
  try {
    const id = req.query.id;
    await WishList.updateOne(
      { user: req.session.user_id },
      { $pull: { products: { productId: id } } }
    );
    res.redirect("/wishList");
  } catch (error) {
    console.log(error.message);
  }
};

// wish product add to cart
const addFromWish = async (req, res) => {
  try {
    const productId = req.query.id;
    const userData = await User.findOne({ _id: req.session.user_id });
    const productData = await productDB.findOne({ _id: productId });
    if (req.session.user_id) {
      const userid = req.session.user_id;
      const cartData = await Cart.findOne({ user: userid });
      if (cartData) {
        const productExist = await cartData.product.findIndex(
          (product) => product.productId == productId
        );
        if (productExist != -1) {
          await Cart.updateOne(
            { user: userid, "product.productId": productId },
            { $inc: { "product.$.quantity": 1 } }
          );
          await WishList.updateOne(
            { user: userid },
            { $pull: { products: { productId: productId } } }
          );
          res.redirect("/cart");
        } else {
          await Cart.updateOne(
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
          await WishList.updateOne(
            { user: userid },
            { $pull: { products: { productId: productId } } }
          );
          res.redirect("/cart");
        }
      } else {
        const cart = new Cart({
          user: userData._id,
          userName: userData.name,
          product: [
            {
              productId: productId,
              price: productData.price,
            },
          ],
        });
        const cartData = await cart.save();
        if (cartData) {
          await WishList.updateOne(
            { user: userid },
            { $pull: { products: { productId: productId } } }
          );
          res.redirect("/cart");
        } else {
          res.redirect("/");
        }
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadWishList,
  addTowishList,
  removeWishlist,
  addFromWish,
};
