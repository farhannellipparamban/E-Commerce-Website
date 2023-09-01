const express = require("express");
const admin_route = express();
const session = require("express-session");
const config = require("../config/config");
const upload = require("../config/multer");
const path = require("path");
const adminAuth = require("../middlware/adminAuth");

admin_route.use(
  session({ secret: "abcd", resave: false, saveUninitialized: false })
);

admin_route.set("views", "./views/admin");

//controllers
const adminController = require("../controllers/adminController");
const productController = require("../controllers/productController");
const catController = require("../controllers/categoryController");
const couponController = require("../controllers/couponController");

//login
admin_route.get("/", adminAuth.isLogout, adminController.loadLogin);
admin_route.post("/", adminController.verifyLogin);

//admin home
admin_route.get("/dashboard", adminController.loadDashboard);

//logout
admin_route.get("/logout", adminAuth.isLogin, adminController.logout);

//User Details
admin_route.get("/userList", adminAuth.isLogin, adminController.userList);
admin_route.get("/verify_user", adminAuth.isLogin, adminController.veryfiUser);
admin_route.get("/Block_user", adminAuth.isLogin, adminController.blockUser);
admin_route.get(
  "/Unblock_user",
  adminAuth.isLogin,
  adminController.unblockUser
);

// category page in category controller
admin_route.get(
  "/productCategory",
  adminAuth.isLogin,
  catController.categoryLoad
);
admin_route.get(
  "/add_category",
  adminAuth.isLogin,
  catController.add_categoryLoad
);
admin_route.post(
  "/add_category",
  adminAuth.isLogin,
  catController.insert_category
);
admin_route.get(
  "/edit_category",
  adminAuth.isLogin,
  catController.edit_catLoad
);
admin_route.post("/edit_category", catController.updatecategory);
admin_route.get("/catBlock", adminAuth.isLogin, catController.catBlock);
admin_route.get("/catUnblock", adminAuth.isLogin, catController.catUnblock);

// Products page in productContreoller
admin_route.get(
  "/productsList",
  adminAuth.isLogin,
  productController.productload
);
admin_route.get(
  "/addProduct",
  adminAuth.isLogin,
  productController.addProductload
);
admin_route.post(
  "/addProduct",
  adminAuth.isLogin,
  upload.upload.array("image", 5),
  productController.insertProduct
);
admin_route.get(
  "/edit_products",
  adminAuth.isLogin,
  upload.upload.array("image", 5),
  productController.editProduct
);
admin_route.post(
  "/edit_products",
  adminAuth.isLogin,
  upload.upload.array("image", 5),
  productController.updateProduct
);
admin_route.post(
  "/delete_image",
  adminAuth.isLogin,
  productController.postdelete_image
);
admin_route.get(
  "/productBlock",
  adminAuth.isLogin,
  productController.productBlock
);
admin_route.get(
  "/productUnblock",
  adminAuth.isLogin,
  productController.productUnblock
);

//order_details
admin_route.get(
  "/orderDetails",
  adminAuth.isLogin,
  adminController.orderDetails
);
admin_route.get("/orderStatus", adminAuth.isLogin, adminController.orderStatus);
admin_route.get(
  "/orderCancel",
  adminAuth.isLogin,
  adminController.orderCancelstatus
);
admin_route.get("/viewOrders", adminAuth.isLogin, adminController.orderView);
admin_route.get(
  "/orderDeliverd",
  adminAuth.isLogin,
  adminController.orderDeliverd
);

//coupons
admin_route.get("/coupon", adminAuth.isLogin, couponController.loadCoupon);
admin_route.get("/addcoupon", adminAuth.isLogin, couponController.addCoupon);
admin_route.post(
  "/addcoupon",
  adminAuth.isLogin,
  couponController.Addcouponpost
);
admin_route.get("/editcoupon", adminAuth.isLogin, couponController.editCoupon);
admin_route.post(
  "/editcoupon",
  adminAuth.isLogin,
  couponController.updateCoupon
);
admin_route.get(
  "/deletecoupon",
  adminAuth.isLogin,
  couponController.deleteCoupon
);

//Banner
admin_route.get("/listBanner",adminAuth.isLogin,adminController.listBanner)
admin_route.get("/addBanner",adminAuth.isLogin,adminController.addBanner)
admin_route.post("/addBanner",adminAuth.isLogin,upload.upload.single('image'),adminController.addBannerPage);
admin_route.get("/editBanner",adminAuth.isLogin,adminController.editBanner)
admin_route.post("/updateBanner",upload.upload.single('image'),adminController.updateBanner)
admin_route.get("/deleteBanner",adminAuth.isLogin,adminController.deleteBanner)

//Sales Report
admin_route.get("/SalesReport",adminAuth.isLogin,adminController.SalesReport)
admin_route.post("/salesReport",adminController.datewiseSalesRp)

module.exports = admin_route;
