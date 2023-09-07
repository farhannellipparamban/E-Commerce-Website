const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const admin = require("../models/adminModel");
const CatDB = require("../models/categoryModel");
const order = require("../models/orderModel");
const productDB = require("../models/prodectModel");
const Banner = require("../models/bannerModel");
const dashboardHelper = require("../helpers/dashboardHelper");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//login get
const loadLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};

//verify login post
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const adminData = await admin.findOne({ email: email });
    if (adminData) {
      if (password === adminData.password) {
        req.session.admin_id = adminData._id;
        return res.redirect("/admin/dashboard");
      } else {
        return res.render("adminLogin", { error: "Invalid password" });
      }
    } else {
      return res.render("adminLogin", { error: "Admin not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

//dashboard get
const loadDashboard = async (req, res) => {
  try {


//=========================

    const userCount = await User.count();
    const products = await productDB.count();
    const categoryData = await CatDB.find({ blocked: false });
    const categoryCount = await CatDB.count();
    const ordersCount = await order.count();
    const orders = await order.find({});

    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(today.getDate() - 30);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    // const currentMonthStartDate = new Date(currentYear, currentMonth, 1, 0, 0, 0);

    const dailyOrders = orders.filter((order) => order.Date >= startOfToday);
    const weeklyOrders = orders.filter((order) => order.Date >= oneWeekAgo);
    const MonthlyOrders = orders.filter((order) => order.Date >= oneMonthAgo);
    const yearlyOrders = orders.filter((order) => order.Date >= oneYearAgo);

    const dailySalesData = dailyOrders.map((order) => order.totalAmount);
    const weeklySalesData = weeklyOrders.map((order) => order.totalAmount);
    const monthlySalesData = MonthlyOrders.map((order) => order.totalAmount);
    const yearlySalesData = yearlyOrders.map((order) => order.totalAmount);

    const totalDailyEarnings = dailyOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const totalWeeklyEarnings = weeklyOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const totalMonthlyEarnings = MonthlyOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const totalYearlyEarnings = yearlyOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const totalEarnings = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    //---------
    const promises = [
      dashboardHelper.totalRevenue(),
      dashboardHelper.paymentMethod(),
      dashboardHelper.categorySales(),
    ];
    //---------
    const results = await Promise.all(promises);
    const totalRevenue = results[0];
    const paymentMethod = results[1];
    const categorySales = results[2];


    //----------------
    let codPayAmount, onlinePayment, walletPayAmount;
    if (paymentMethod[0]._id === "COD") {
      codPayAmount = paymentMethod[0].amount;
    } else if (paymentMethod[0]._id === "online") {
      onlinePayment = paymentMethod[0].amount;
    } else if (paymentMethod[0]._id === "wallet") {
      walletPayAmount = paymentMethod[0].amount;
    }

    if (paymentMethod[1]._id === "COD") {
      codPayAmount = paymentMethod[1].amount;
    } else if (paymentMethod[1]._id === "online") {
      onlinePayment = paymentMethod[1].amount;
    } else if (paymentMethod[1]._id === "wallet") {
      walletPayAmount = paymentMethod[1].amount;
    }

    if (paymentMethod[2]._id === "COD") {
      codPayAmount = paymentMethod[2].amount;
    } else if (paymentMethod[2]._id === "online") {
      onlinePayment = paymentMethod[2].amount;
    } else if (paymentMethod[2]._id === "wallet") {
      walletPayAmount = paymentMethod[2].amount;
    }

    //---------
 
    //---------
    res.render("dashboard", {
      admin: req.session.admin_id,
      userCount: userCount,
      Catdata: categoryData,
      categoryCount: categoryCount,
      productCount: products,
      ordersCount: ordersCount,
      totalRevenue: totalRevenue,
      categorySales : categorySales, 
      codPayAmount: codPayAmount,
      onlinePayment: onlinePayment,
      walletPayAmount: walletPayAmount,
      totalEarnings,
      totalDailyEarnings,
      totalWeeklyEarnings,
      totalMonthlyEarnings,
      totalYearlyEarnings,
      dailySalesData,
      weeklySalesData,
      monthlySalesData,
      yearlySalesData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//logout get
const logout = async (req, res) => {
  try {
    req.session.admin_id = false;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

//user listing get
const userList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * 8;

    const userData = await User.find({ is_admin: 0 })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(8);
    const totalUsers = await User.countDocuments({});
    const totalPages = Math.ceil(totalUsers / 8);
    res.render("userList", {
      user: userData,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//user verification get
const veryfiUser = async (req, res) => {
  try {
    const id = req.query.id;

    const userData = await User.findById({ _id: id });
    if (userData.is_verified == 0) {
      await User.updateOne({ _id: id }, { $set: { is_verified: 1 } });
      res.redirect("/admin/userList");
    }
    if (userData.is_verified == 1) {
      await User.updateOne({ _id: id }, { $set: { is_verified: 0 } });
      res.redirect("/admin/userList");
    }
  } catch (error) {
    console.log(error.message);
  }
};
//user block get
const blockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findOne({ _id: id });
    if (userData.is_blocked === true) {
      res.redirect("/admin/userList");
    } else {
      await User.findByIdAndUpdate({ _id: id }, { $set: { is_blocked: true } });
      res.redirect("/admin/userList");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// unblock user get
const unblockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findOne({ _id: id });
    if (userData.is_blocked === false) {
      res.redirect("/admin/userList");
    } else {
      await User.findByIdAndUpdate(
        { _id: id },
        { $set: { is_blocked: false } }
      );
      res.redirect("/admin/userList");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//orderDetails listing get
const orderDetails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * 8;

    const orderData = await order.find().sort({ _id: -1 }).skip(skip).limit(8);

    const totalOrders = await order.countDocuments({});
    const totalPages = Math.ceil(totalOrders / 8);

    res.render("orderDetails", {
      orderData,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//order Status
const orderStatus = async (req, res) => {
  try {
    const id = req.query.id;
    const orderData = await order.findById({ _id: id });
    if (orderData.status === "pending") {
      await order.updateOne({ _id: id }, { $set: { status: "placed" } });
      res.redirect("/admin/orderDetails");
    }
    if (orderData.status === "placed") {
      await order.updateOne({ _id: id }, { $set: { status: "pending" } });
      res.redirect("/admin/orderDetails");
    } else {
      res.redirect("/admin/orderDetails");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//cancel order status
const orderCancelstatus = async (req, res) => {
  try {
    const id = req.query.id;
    const orderData = await order.findById({ _id: id });
    if (orderData) {
      await order.updateOne({ _id: id }, { $set: { status: "canceled" } });
      res.redirect("/admin/orderDetails");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const orderDeliverd = async (req, res) => {
  try {
    const id = req.query.id;
    const orderData = await order.findById({ _id: id });

    if (orderData.status === "placed") {
      await order.updateOne({ _id: id }, { $set: { status: "delivered" } });
      res.redirect("/admin/orderDetails");
    }
    if (orderData.status === "waiting for approval") {
      await order.updateOne(
        { _id: id },
        { $set: { status: "Return Approved" } }
      );

      const total = orderData.totalAmount + orderData.orderWallet;
      await User.findByIdAndUpdate(orderData.user, { $inc: { wallet: total } });
      res.redirect("/admin/orderDetails");
    } else {
      res.redirect("/admin/orderDetails");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//orderView
const orderView = async (req, res) => {
  try {
    const id = req.query.id;
    const orderData = await order
      .findById({ _id: id })
      .populate("product.productId");
    const Catdata = await CatDB.find({ is_blocked: false });
    const product = orderData.product;

    res.render("orderView", { orderData, product, Catdata });
  } catch (error) {
    console.log(error.message);
  }
};

// Banner list
const listBanner = async (req, res) => {
  try {
    const admin = req.session.admin_id;
    const BannerData = await Banner.find({});
    if (admin) {
      res.render("listBanner", { admin, BannerData });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//add banner get
const addBanner = async (req, res) => {
  try {
    const admin = req.session.admin_id;
    res.render("addBanner", { admin });
  } catch (error) {
    console.log(error.message);
  }
};

// add Banner post
const addBannerPage = async (req, res) => {
  try {
    const { bannerTitle, description } = req.body;
    const Images = req.file.filename;

    const bannerData = new Banner({
      bannerTitle,
      description,
      Images,
    });
    const saveBanner = await bannerData.save();
    if (saveBanner) {
      res.redirect("/admin/listBanner");
    } else {
      res.redirect("/admin/addBanner");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//edit banner page
const editBanner = async (req, res) => {
  try {
    const admin = req.session.admin_id;
    const id = req.query.id;
    const bannerData = await Banner.findById({ _id: id });

    if (bannerData) {
      res.render("editBanner", { admin: admin, bannerData: bannerData });
    } else {
      res.redirect("/admin/listBnaner");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//update Banner
const updateBanner = async (req, res) => {
  try {
    const id = req.query.id;
    const { description, bannerTitle } = req.body;
    let bannerData;

    if (req.file) {
      const Images = req.file.filename;
      bannerData = await Banner.findByIdAndUpdate(
        { _id: id },
        { $set: { bannerTitle, description, Images } }
      ).exec();
    } else {
      bannerData = await Banner.findByIdAndUpdate(
        { _id: id },
        { $set: { bannerTitle, description } }
      ).exec();
    }

    if (bannerData) {
      res.redirect("/admin/listBanner");
    } else {
      res.render("editBanner");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//delete Banner
const deleteBanner = async (req, res) => {
  try {
    const id = req.query.id;
    const bannerData = await Banner.findById({ _id: id });
    if (bannerData) {
      await Banner.deleteOne({ _id: id });
      res.redirect("/admin/listBanner");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//Sales Report
const SalesReport = async (req, res) => {
  try {
    const { seeAll, sortData, sortOrder } = req.query;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * 10;

    const sort = {};
    if (sortData) {
      sort[sortData] = sortOrder === "Ascending" ? 1 : -1;
    } else {
      sort.date = -1; // Default sorting by date in descending order
    }

    const orders = await order
      .find({})
      .populate("user")
      .sort(sort)
      .skip(skip)
      .limit(10);

    const totalOrders = await order.countDocuments({});
    const totalPages = Math.ceil(totalOrders / 10);

    res.render("salesReport", {
      orders: orders,
      sortData: sortData,
      sortOrder: sortOrder,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const datewiseSalesRp = async (req, res) => {
  try {
    const { seeAll, sortData, sortOrder } = req.query;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * 10;

    const sort = {};
    if (sortData) {
      sort[sortData] = sortOrder === "Ascending" ? 1 : -1;
    } else {
      sort.date = -1; // Default sorting by date in descending order
    }

    let fromDate = req.body.fromDate ? new Date(req.body.fromDate) : null;
    fromDate.setHours(0, 0, 0, 0);
    let toDate = req.body.toDate ? new Date(req.body.toDate) : null;
    toDate.setHours(23, 59, 59, 999);

    const currentDate = new Date();

    if (fromDate && toDate) {
      if (toDate < fromDate) {
        const temp = fromDate;
        fromDate = toDate;
        toDate = temp;
      }
    } else if (fromDate) {
      toDate = currentDate;
    } else if (toDate) {
      fromDate = currentDate;
    }

    var matchStage = {
      status: "delivered",
    };

    const totalAmount = await order.aggregate([
      {
        $match: {
          Date: { $gte: fromDate, $lte: toDate },
        },
      },
      { $unwind: "$product" },
      { $match: matchStage }, // This is where you would put your additional matching criteria if needed
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalSold = await order.aggregate([
      {
        $match: {
          Date: { $gte: fromDate, $lte: toDate },
        },
      },
      { $unwind: "$product" },
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: "$product.quantity" } } },
      { $project: { total: 1, _id: 0 } },
    ]);

    const orders = await order
      .find({ Date: { $gte: fromDate, $lte: toDate }, status: "delivered" })
      .populate("product.productId")
      .populate("user")
      .sort(sort)
      .skip(skip)
      .limit(10);

    const totalOrders = await order.countDocuments({});
    const totalPages = Math.ceil(totalOrders / 10);
    res.render("salesReport", {
      totalAmount,
      totalSold,
      orders,
      sortData: sortData,
      sortOrder: sortOrder,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  userList,
  veryfiUser,
  blockUser,
  unblockUser,
  orderDetails,
  orderStatus,
  orderCancelstatus,
  orderDeliverd,
  orderView,
  listBanner,
  addBanner,
  addBannerPage,
  editBanner,
  updateBanner,
  deleteBanner,
  SalesReport,
  datewiseSalesRp,
};
