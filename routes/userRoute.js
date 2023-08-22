const express = require("express");
const user_route = express();
const session = require("express-session");
const config = require("../config/config");
const userAuth = require("../middlware/userAuth");
const path = require("path");

user_route.use(
  session({ secret: "abcd", resave: false, saveUninitialized: false })
);

user_route.set("views", "./views/users");

//controllers
const userController = require("../controllers/userController");
const addressController = require("../controllers/addressController");
const cartController = require("../controllers/cartController");
const orderController = require("../controllers/orderController");
const couponController = require("../controllers/couponController");
const WishlistController = require("../controllers/wishListController");

//home
user_route.get("/", userController.loadHome);

//register
user_route.get("/register", userAuth.isLogout, userController.loadRegister);
user_route.post("/register", userController.verifyUser);

// verify_from_login
user_route.get("/verify_from_login", userController.verifyFromLogin);

//forget
user_route.get("/forget", userAuth.isLogout, userController.forgetLoad);
user_route.post("/forget", userController.forgetSendEmail);

//reset
user_route.get(
  "/resetPassword",
  userAuth.isLogout,
  userController.resetPassword
);
user_route.post(
  "/resetPassword",
  userAuth.isLogout,
  userController.resetpassVerify
);

//shop
user_route.get("/shop", userController.loadShoping);

//product details
user_route.get("/product_details", userController.productDetails);

//about
user_route.get("/about", userController.loadAbout);

//contact
user_route.get("/contact", userController.loadContact);

//login
user_route.get("/login", userAuth.isLogout, userController.loadLogin);
user_route.post("/login", userController.verifyLogin);

//otp
user_route.get("/otp", userController.otpVerify);
user_route.post("/otp", userController.otpValidation);

//logout
user_route.get("/logout", userAuth.isLogin, userController.userLogout);

//cart
user_route.get("/cart", userAuth.isLogin, cartController.loadCart);
user_route.post("/addtocart", userAuth.isLogin, cartController.addtoCart);
user_route.get("/deleteCart", userAuth.isLogin, cartController.deletecartitem);
user_route.post(
  "/changes",
  userAuth.isLogin,
  cartController.changes,
  cartController.totalproductPrice
);
// product Checkout
user_route.get("/checkout", userAuth.isLogin, cartController.productCheckout);
//order list
user_route.post("/checkout", orderController.placeTheOrder);
user_route.get("/orderplaced", userAuth.isLogin, orderController.orderPlaced);
user_route.post("/verifyPayment", orderController.verifyPayment);
user_route.get("/orderlist", userAuth.isLogin, orderController.orderlistLoad);
user_route.get("/ordershow", userAuth.isLogin, orderController.showorderLoad);
user_route.post(
  "/cancelOrder",
  userAuth.isLogin,
  orderController.canceluserOrder
);
user_route.post("/returnOrder", userAuth.isLogin, orderController.returnOrder);

//wallet
user_route.post("/wallet", userController.walletAmount);

// wishlist
user_route.get("/wishList", userAuth.isLogin, WishlistController.loadWishList);
user_route.post("/addToWishlist", WishlistController.addTowishList);
user_route.get(
  "/removeWishlist",
  userAuth.isLogin,
  WishlistController.removeWishlist
);
user_route.get(
  "/addFromWish",
  userAuth.isLogin,
  WishlistController.addFromWish
);

//user_profile
user_route.get("/myacco", userAuth.isLogin, userController.myAcco);
user_route.post("/myacco", userController.profilesubmit);

//coupon
user_route.post("/applyCoupon", couponController.applyCoupon);

//address controller
user_route.get("/addAddress", userAuth.isLogin, addressController.addressLoad);
user_route.post("/addAddress", addressController.verifyAddress);
user_route.get("/deleteAddress", addressController.deleteaddress);
user_route.get("/editAddress", addressController.editAddress);
user_route.post("/editAddress", addressController.updateAddress);

user_route.get(
  "/addAddresscheck",
  userAuth.isLogin,
  addressController.addressLoad
);
user_route.get(
  "/deleteAddressCheckout",
  addressController.deleteaddressCheckout
);
user_route.post("/addAddresscheck", addressController.verifyAddresscheck);
user_route.get("/editAddresscheck", addressController.editAddress);
user_route.post("/editAddresscheck", addressController.posteditaddresscheck);

module.exports = user_route;
