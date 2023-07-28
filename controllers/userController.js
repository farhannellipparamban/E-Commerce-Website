const User = require("../models/userModels");
const productdb = require("../models/prodectModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const user_address = require("../models/addressModel");

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
        user: "anufarhan111@gmail.com",
        pass: "nzpjxvviniwetzxw",
      },
    });
    const mailOption = {
      from: "anufarhan111@gmail.com",
      to: email,
      subject: "For OTP verification",
      html:
        "<p>Hi <h3>" +
        name +
        ',</h3><br><br>   Please click here to <a href="http://localhost:3000/otp"> verify </a> and enter the OTP : <b>' +
        otp +
        "</b> for your verification " +
        email +
        "</p>",
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("emai has been send to:", info.response);
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
const otpValidation = async (req, res) => {
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
  }
};

//register page load get
const loadRegister = async (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    console.log(error.message);
  }
};

//register page insert user post
const verifyUser = async (req, res) => {
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
        // Generate a random 4-digit OTP
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
  }
};

//login page get
const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

// Verify Login Post
const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_blocked === false) {
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (passwordMatch) {
          req.session.user_id = userData._id;
          // res.redirect("/");
          res.json({ status: true });
        } else {
          res.json({ IncPassword: true });
        }
      } else {
        res.json({ IsBlock: true });
      }
    } else {
      res.json({ invEmail: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//verifyuser email get
const verifyFromLogin = async (req, res) => {
  try {
    const email = req.query.email;
    email2 = email;
    const udata = await User.find({ email: email });
    const otpGenarated = Math.floor(1000 + Math.random() * 9999);
    sendVerifymail("User", email, otpGenarated);
    res.render("otp_verification");
  } catch (error) {
    console.log(error.message);
  }
};

//forget password

const forgetLoad = async (req, res) => {
  try {
    res.render("forgetPassword");
  } catch (error) {
    console.log(error.message);
  }
};

//home get
const loadHome = async (req, res) => {
  try {
    const loadlogIn = req.session.user_id;
    const products = await productdb.find({ is_blocked: false });
    res.render("home", { loadlogIn, data: products });
  } catch (error) {
    console.log(error.message);
  }
};

//logout get
const userLogout = async (req, res) => {
  try {
    req.session.user_id = false;
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

//shop get
const loadShoping = async (req, res) => {
  try {
    const loadlogIn = req.session.user_id;
    const products = await productdb.find({ is_blocked: false });
    res.render("shop", { loadlogIn, data: products });
  } catch (error) {
    console.log(error.message);
  }
};

//single product details get
const productDetails = async (req, res) => {
  try {
    const loadlogIn = req.session.user_id;
    const productId = req.query.id;
    const product = await productdb.findById(productId);
    res.render("product_details", { loadlogIn, data: product });
  } catch (error) {
    console.log(error.message);
  }
};

//about get
const loadAbout = async (req, res) => {
  try {
    const loadlogIn = req.session.user_id;
    res.render("about", { loadlogIn });
  } catch (error) {
    console.log(error.message);
  }
};

//contact get
const loadContact = async (req, res) => {
  try {
    const loadlogIn = req.session.user_id;
    res.render("contact", { loadlogIn });
  } catch (error) {
    console.log(error.message);
  }
};

//cart get
const loadCart = async (req, res) => {
  try {
    const loadlogIn = req.session.user_id;
    res.render("cart", { loadlogIn });
  } catch (error) {
    console.log(error.message);
  }
};

//profile get
const myAcco = async (req, res) => {
  try {
    const loadlogIn = req.session.user_id;
    const address = await user_address.findOne({ user: req.session.user_id });
    const userd = await User.findOne({ _id: req.session.user_id });
    const userData = await User.findOne({ _id: req.session.user_id });
    if (address) {
      res.render("myacco", {
        loadlogIn,
        user: userd.name,
        data: userData,
        address,
      });
    } else {
      res.render("myacco", { loadlogIn, user: userd.name, data: userData });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// //profile post
const profilesubmit = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mobile;

    if (
      name.trim().length == 0 ||
      email.trim().length == 0 ||
      mobile.trim().length == 0
    ) {
      res.redirect("/myacco");
    } else {
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
        console.log("hell0");
        console.log(data);
        res.redirect("/myacco");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//wishlist get
const loadWish = async (req, res) => {
  try {
    const loadlogIn = req.session.user_id;
    res.render("wishList", { loadlogIn });
  } catch (error) {
    console.log(error.message);
  }
};

//checkout get

// const loadCheckout =async(req,res)=>{
//     try{
//       const loadlogIn=req.session.user_id;
//         res.render("checkout",{loadlogIn})
//     }
//     catch(error){
//         console.log(error.message );
//     }
// }

//confirmation get

// const loadConfirmation =async(req,res)=>{
//     try{
//       const loadlogIn=req.session.user_id;
//         res.render("confirmation",{loadlogIn})
//     }
//     catch(error){
//         console.log(error.message );
//     }
// }

module.exports = {
  loadRegister,
  loadShoping,
  loadHome,
  loadAbout,
  loadContact,
  loadLogin,
  loadCart,
  loadWish,
  // loadCheckout,
  // loadConfirmation,
  productDetails,
  otpVerify,
  otpValidation,
  verifyUser,
  verifyLogin,
  forgetLoad,
  verifyFromLogin,
  userLogout,
  myAcco,
  profilesubmit,
};
