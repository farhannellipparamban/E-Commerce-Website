const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const admin = require("../models/adminModel");
const CatDB = require("../models/categoryModel");
const order = require("../models/orderModel");
const productDB = require("../models/prodectModel");
const Banner = require("../models/bannerModel")

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

//orderDetails listing get
const orderDetails = async (req, res) => {
  try {
    const orderData = await order.find();
    res.render("orderDetails", { orderData });
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
const listBanner = async(req,res)=>{
  try {
    const admin = req.session.admin_id;
    const BannerData = await Banner.find({});
    console.log(BannerData);
    if (admin) {
      res.render("listBanner",{admin,BannerData})

    }
  } catch (error) {
    console.log(error.message);
  }
} 

//add banner get 
const addBanner = async(req,res)=>{
  try {
    const admin =req.session.admin_id
    res.render("addBanner",{admin})
  } catch (error) {
    console.log(error.message);
  }
}

// add Banner post
const addBannerPage =async(req,res)=>{
  try {
    const {bannerTitle,description} = req.body
    const Images = req.file.filename;

    const bannerData = new Banner ({
      bannerTitle,
      description,
      Images,
    })
    const saveBanner = await bannerData.save()
    if (saveBanner) {
      res.redirect("/admin/listBanner")
    } else {
      res.redirect("/admin/addBanner")
    }

  } catch (error) {
    console.log(error.message);
  }
}

//edit banner page
const editBanner = async(req,res)=>{
  try {
    const admin = req.session.admin_id
    const id = req.query.id
    const bannerData = await Banner.findById({_id:id})
    
    if (bannerData) {
      res.render("editBanner",{admin:admin , bannerData:bannerData})
    } else {
      res.redirect("/admin/listBnaner")
    }
  } catch (error) {
    console.log(error.message);
  }
}

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
const deleteBanner = async(req,res)=>{
  try {
    const id = req.query.id
    const bannerData = await Banner.findById({_id:id})
    if(bannerData){
      await Banner.deleteOne({_id:id})
      res.redirect("/admin/listBanner")
    }
  } catch (error) {
    console.log(error.message);
  }
}

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
};
