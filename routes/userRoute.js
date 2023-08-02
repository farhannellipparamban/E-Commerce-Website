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
const cartController = require("../controllers/cartController")
const orderController = require("../controllers/orderController")

//home
user_route.get("/", userController.loadHome);

//register
user_route.get("/register", userAuth.isLogout, userController.loadRegister);
user_route.post("/register", userController.verifyUser);

// verify_from_login
user_route.get("/verify_from_login", userController.verifyFromLogin);

//forget
user_route.get("/forget", userAuth.isLogout, userController.forgetLoad);
user_route.post("/forget",userController.forgetSendEmail)

//reset
user_route.get("/resetPassword",userAuth.isLogout, userController.resetPassword);
user_route.post("/resetPassword",userAuth.isLogout,userController.resetpassVerify)

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
user_route.get("/cart",userAuth.isLogin,cartController.loadCart);
user_route.post("/addtocart",userAuth.isLogin,cartController.addtoCart)
user_route.get("/deleteCart",userAuth.isLogin,cartController.deleteCartitem)
user_route.post("/cartqntIncrease", userAuth.isLogin, cartController.cartquantity);
user_route.post("/cartqntincrease", userAuth.isLogin,cartController.totalproductPrice);

// product Checkout
user_route.get('/checkout', userAuth.isLogin, cartController.productCheckout);
user_route.post('/checkout', cartController.placeTheOrderCOD);
user_route.get("/orderplaced",userAuth.isLogin,cartController.orderPlaced)

//order list
user_route.get("/orderlist",userAuth.isLogin,orderController.orderlistLoad)
user_route.get("/ordershow",userAuth.isLogin,orderController.showorderLoad)
user_route.post("/cancelOrder",userAuth.isLogin,orderController.canceluserOrder)
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


user_route.get("/addAddresscheck",userAuth.isLogin,addressController.addressLoad)
user_route.get("/deleteAddressCheckout", addressController.deleteaddressCheckout);
user_route.post("/addAddresscheck",addressController.verifyAddresscheck)
user_route.get("/editAddresscheck", addressController.editAddress);
user_route.post('/editAddresscheck',addressController.posteditaddresscheck)



//confirmation
// user_route.get("/confirmation",userController.loadConfirmation)

//product details
user_route.get("/product_details", userController.productDetails);

module.exports = user_route;
