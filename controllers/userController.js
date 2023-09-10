const User = require("../models/userModels");
const productdb = require("../models/prodectModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const user_address = require("../models/addressModel");
const order = require("../models/orderModel");
const CatDB = require("../models/categoryModel");
const randomstring = require("randomstring");
const coupon = require("../models/couponModel");
const Banner = require("../models/bannerModel");

const dotenv = require("dotenv");

dotenv.config();

let otp;
let email2;
let name2;

///bcrypt password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//for send mail

const sendVerifymail = async (name, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
    });
    const mailOption = {
      from: process.env.email,
      to: email,
      subject: "For OTP verification",
      html:
        "<div style='font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2'>" +
        "<div style='margin:50px auto;width:70%;padding:20px 0'>" +
        "<div style='border-bottom:1px solid #eee'>" +
        "<a href='' style='font-size:1.4em;color: #f30d0d;text-decoration:none;font-weight:600'>CLOC<a style='color: #f30d0d;'></a>KSY</a>" +
        "</div>" +
        "<p style='font-size:1.1em'>Hi,</p>" +
        "<p>Thank you for choosing Clocksy. Use the following OTP to complete your Sign Up procedures. OTP is valid for few minutes</p>" +
        "<h2 style='background:#f30d0d;margin: 0 auto;width: max-content;padding: 0 10px;color: white;border-radius: 4px;'>" +
        +otp +
        "</h2>" +
        "<p style='font-size:0.9em;'>Regards,<br />Clocksy</p>" +
        "<hr style='border:none;border-top:1px solid #eee' />" +
        "<div style='float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300'>" +
        "<p>Clocksy Eco</p>" +
        "<p>1600 Ocean Of Heaven</p>" +
        "<p>Pacific</p>" +
        "</div>" +
        "</div>" +
        "</div>",
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("email has been send to:", info.response);
        console.log(otp);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//otpLoad get
const otpVerify = async (req, res) => {
  try {
    res.render("otp_verification");
  } catch (error) {
    console.log(error.message);
  }
};

//otpValidation post
const otpValidation = async (req, res, next) => {
  try {
    const otpinput = req.body.otp;
    const email = req.body.email;

    if (otpinput == req.session.otp) {
      const userData = await User.findOneAndUpdate(
        { email: email2 },
        { $set: { is_verified: 1 } }
      );

      res.render("login", {
        userData,
        email2,
        message: "Your successfully registerd..!!!",
      });
    } else res.redirect("/otp");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//register page load get
const loadRegister = async (req, res, next) => {
  try {
    res.render("registration");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//register page insert user post
const verifyUser = async (req, res, next) => {
  try {
    const spassword = await securePassword(req.body.password);
    const email = req.body.email;
    const name = req.body.name;
    const alreyMail = await User.findOne({ email: email });
    email2 = email;
    name2 = name;

    if (alreyMail) {
      res.render("registration", { message: "EMAIL ALREADY EXIST " });
    } else {
      const data = new User({
        name: req.body.name,
        email: req.body.email,
        mob: req.body.mob,
        password: spassword,
        is_admin: 0,
        is_verified: 0,
        is_blocked: false,
      });

      const Udata = await data.save();

      if (Udata) {
        const otpGenarated = Math.floor(1000 + Math.random() * 9999);
        otp = otpGenarated;
        req.session.otp = otp;
        sendVerifymail(req.body.name, req.body.email, otpGenarated);
        res.render("otp_verification", { email });
      } else {
        res.render("registration", { alert: "registration not completed" });
      }
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//login page get
const loadLogin = async (req, res, next) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// Verify Login Post
const verifyLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (!userData.is_blocked) {
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (passwordMatch) {
          req.session.user_id = userData._id;
          return res.redirect("/")
        } else {
          return res.json({ error: "Incorrect password" });
        }
      } else {
        return res.json({ error: "Your account is blocked" });
      }
    } else {
      return res.json({ error: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//verifyuser email get
const verifyFromLogin = async (req, res, next) => {
  try {
    const email = req.query.email;
    email2 = email;
    const udata = await User.find({ email: email });
    const otpGenarated = Math.floor(1000 + Math.random() * 9999);
    sendVerifymail("User", email, otpGenarated);
    res.render("otp_verification");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const resetsendVerifymail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
    });

    const mailOptions = {
      from: process.env.email,
      to: email,
      subject: "Password Reset",
      html: `
        <html>
          <head>
            <style>
              /* Add your CSS styles here */
              body {
                font-family: Arial, sans-serif;
                background-color: #f2f3f8;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 670px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 3px;
                text-align: center;
                box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
              }
              h1 {
                color: #1e1e2d;
                font-weight: 500;
                margin: 0;
                font-size: 32px;
                font-family: 'Rubik', sans-serif;
              }
              p {
                color: #455056;
                font-size: 15px;
                line-height: 24px;
                margin: 0;
              }
              a.button {
                background: red;
                text-decoration: none !important;
                font-weight: 500;
                margin-top: 35px;
                color: #fff;
                text-transform: uppercase;
                font-size: 14px;
                padding: 10px 24px;
                display: inline-block;
                border-radius: 50px;
              }
            </style>
          </head>
          <body>
          <div style='border-bottom:1px solid #eee'>
        <a href='' style='font-size:1.4em;color: #f30d0d;text-decoration:none;font-weight:600'>CLOC<a style='color: #f30d0d;'></a>KSY</a>
        </div>
            <div class="container">
              <h1>You have requested to reset your password</h1>
              <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
              <p>We cannot simply send you your old password. A unique link to reset your password has been generated for you. To reset your password, click the following link and follow the instructions.</p>
              <a class="button" href="http://localhost:3000/resetPassword?token=${token}">Reset Password</a>
            </div>
          </body>
        </html>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("Email has been sent to:", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};


//reset password get
const resetPassword = async (req, res, next) => {
  try {
    const token = req.query.token;
    const userData = await User.findOne({ token: token });
    if (userData) {
      res.render("resetPassword", { email: userData.email });
    } else {
      res.render("404", { message: "Invalid Token" });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//reset password post
const resetpassVerify = async (req, res, next) => {
  try {
    const password = req.body.password;
    const email = req.body.email;
    console.log(email);
    const spassword = await securePassword(password);
    const updatedData = await User.findOneAndUpdate(
      { email: email },
      { $set: { password: spassword, token: "" } }
    );
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//forget password get

const forgetLoad = async (req, res, next) => {
  try {
    res.render("forgetPassword");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//forget post
const forgetSendEmail = async (req, res, next) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_verified == 0) {
        res.render("forgetPassword", { message: "Email Not Verified" });
      } else {
        const randomString = randomstring.generate();
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        const user = await User.findOne({ email: email });
        resetsendVerifymail("User", user.email, randomString);
        res.render("forgetPassword", {
          message: "Please check your Mail for Reset your password",
        });
      }
    } else {
      res.render("forgetPassword", { message: "Wrong Email Id" });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//home get
const loadHome = async (req, res, next) => {
  try {
    const BannerData = await Banner.find();
    const loadlogIn = req.session.user_id;
    const products = await productdb.find({ is_blocked: false });
    res.render("home", { loadlogIn, data: products, bannerData: BannerData });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//logout get
const userLogout = async (req, res, next) => {
  try {
    req.session.destroy();
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//shop get
const loadShoping = async (req, res, next) => {
  try {
    let page = req.query.page || 1;
    
    const limit = 6;
    const skip = (page - 1) * limit;

    let search = req.query.search || "";

    let category = req.query.category || "All";
    search = search.trim();
    const price = req.query.price;

    const categoryData = await CatDB.find({ is_blocked: false });
    let cat = categoryData.map((category) => category.name);

    let sort;
    category === "All" ? (category = [...cat]) : (category = req.query.category.split(","));
    req.query.price === "High" ? (sort = -1) : (sort = 1);
    let catId = [];

    for (let i = 0; i < categoryData.length; i++) {
      if (category.includes(categoryData[i].name) || category === "All") {
        catId.push(categoryData[i]._id);
      }
    }
//===============================================
    const searchQuery = req.query.search || "";

    const searchFilter = searchQuery.trim() ? { name: { $regex: new RegExp(searchQuery, "i") } } : {};

    const productData = await productdb.aggregate([
      {
        $match: {
          ...searchFilter,
          category: { $in: catId },
          is_blocked: false,
        },
      },
      { $sort: { price: sort } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const productCount = await productdb.countDocuments({
      name: { $regex: ".*" + search+".*" ,$options: "i" },
      is_blocked: false,
      category: { $in: catId },
    });
    
    const totalpages = Math.max(1, Math.ceil(productCount / limit));
    const userd = await User.findOne({ _id: req.session.user_id });
    const loadlogIn = req.session.user_id;
    if (req.session.user_id) {
      res.render("shop", {
        loadlogIn,
        product: productData,
        totalpages,
        page,
        categoryData: categoryData,
        price,
        category: category,
        search,
      });
    } else {
      res.render("shop", {
        loadlogIn,
        product: productData,
        totalpages,
        page,
        categoryData: categoryData,
        price,
        category: category,
        search,
        
      });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//single product details get
const productDetails = async (req, res, next) => {
  try {
    const loadlogIn = req.session.user_id;
    const productId = req.query.id;
    const product = await productdb
      .findById({ _id: productId })
      .populate("review.user").populate("category");

    res.render("product_details", { loadlogIn, data: product });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//review
const review = async (req, res, next) => {
  try {
    const id = req.body.id;
    const { review, rating } = req.body;
    const newReview = {
      user: req.session.user_id,
      review: review,
      rating: rating,
    };
    await productdb.findByIdAndUpdate(
      { _id: id },
      { $push: { review: newReview } }
    );
    res.redirect(`/product_details?id=${id}`);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//about get
const loadAbout = async (req, res, next) => {
  try {
    const loadlogIn = req.session.user_id;
    res.render("about", { loadlogIn });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//contact get
const loadContact = async (req, res, next) => {
  try {
    const loadlogIn = req.session.user_id;
    res.render("contact", { loadlogIn });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// myAcco get route
const myAcco = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * 6;

    const loadlogIn = req.session.user_id;
    const userAddress = await user_address.findOne({
      user: req.session.user_id,
    });
    const userData = await User.findOne({ _id: req.session.user_id });
    const totalOrders = await order.countDocuments();
    const totalPages = Math.ceil(totalOrders / 6);
    const orders = await order
      .find({})
      .sort({ _id: -1 })
      .skip(skip)
      .limit(6);


    const coupon1 = await coupon.find();

    if (userAddress && coupon1) {
      res.render("myacco", {
        loadlogIn,
        user: userData.name,
        userData: userData,
        userAddress: userAddress,
        orders: orders,
        coupon1,
        currentPage: page,
        totalPages: totalPages,
      });
    } else {
      res.render("myacco", {
        loadlogIn,
        user: userData.name,
        userAddress: userAddress,
        orders: orders,
        userData: userData,
        currentPage: page,
        totalPages: totalPages,
      });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// //profile post
const profilesubmit = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mobile;

    const alreyMail = await User.findOne({ email: email });
    if (alreyMail) {
      await User.updateOne(
        { _id: req.session.user_id },
        {
          $set: {
            name: name,
            mob: mobile,
          },
        }
      );
      res.redirect("/myacco");
    } else {
      const data = await User.updateOne(
        { _id: req.session.user_id },
        {
          $set: {
            name: name,
            email: email,
            mob: mobile,
          },
        }
      );
      console.log(data);
      res.redirect("/myacco");
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//Wallet History
const walletHistory = async (req, res, next) => {
  try {
    const loadlogIn = req.session.user_id;
    const user_id = req.session.user_id;
    const user = await User.findOne({ _id: user_id });
    res.render("walletHistory", { wallet: user.walletHistory, loadlogIn });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//wallet post
const walletAmount = async (req, res, next) => {
  try {
    const user = req.session.user_id;
    const wallet = req.body.wallet;
    const grandTotal = req.body.grandTotal;
    const subTotal = req.body.subTotal;
    const userd = await User.findOne({ _id: user });
    const totalwallet = userd.wallet;

    if (userd.wallet >= wallet) {
      const grandTotal = subTotal - wallet;
      res.json({ success: true, grandTotal, wallet, totalwallet });
    } else {
      res.json({ limit: true });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

module.exports = {
  loadRegister,
  loadShoping,
  loadHome,
  loadAbout,
  loadContact,
  loadLogin,
  productDetails,
  review,
  otpVerify,
  otpValidation,
  verifyUser,
  verifyLogin,
  forgetLoad,
  forgetSendEmail,
  resetPassword,
  resetpassVerify,
  verifyFromLogin,
  userLogout,
  myAcco,
  profilesubmit,
  walletHistory,
  walletAmount,
};
