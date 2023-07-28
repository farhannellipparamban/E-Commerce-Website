const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const admin = require("../models/adminModel");
const CatDB = require("../models/categoryModel");

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
    const categoryData = await CatDB.find({ blocked: false });

    res.render("dashboard", { Catdata: categoryData });
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
    const userData = await User.find({ is_admin: 0 });

    res.render("userList", { user: userData });
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

//order_details listing get
const orderDetails = async (req, res) => {
  try {
    // const orderData = await order.find();
    res.render("ordersList");
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
};
