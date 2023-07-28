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

//home
user_route.get("/", userController.loadHome);

//register
user_route.get("/register", userAuth.isLogout, userController.loadRegister);
user_route.post("/register", userController.verifyUser);

// verify_from_login
user_route.get("/verify_from_login", userController.verifyFromLogin);

//forget
user_route.get("/forget", userAuth.isLogout, userController.forgetLoad);

//shop
user_route.get("/shop", userController.loadShoping);

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
user_route.get("/cart", userController.loadCart);

// wishlist
user_route.get("/wishList", userController.loadWish);

//user_profile
user_route.get("/myacco", userAuth.isLogin, userController.myAcco);
user_route.post("/myacco", userController.profilesubmit);

//address controller
user_route.get("/addAddress", userAuth.isLogin, addressController.addressLoad);
user_route.post("/addAddress", addressController.verifyAddress);
user_route.get("/deleteAddress", addressController.deleteaddress);
user_route.get("/editAddress", addressController.editAddress);
user_route.post("/editAddress", addressController.updateAddress);

//product_checkout
// user_route.get("/checkout",userController.loadCheckout)

//confirmation
// user_route.get("/confirmation",userController.loadConfirmation)

//product details
user_route.get("/product_details", userController.productDetails);

module.exports = user_route;
