const User = require("../models/userModels");
const productdb = require("../models/prodectModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const user_address = require("../models/addressModel");
const order = require("../models/orderModel");
const randomstring = require("randomstring");

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

//reset password send mail
const resetsendVerifymail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      securel: false,
      requireTLS: true,
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
    });
    const mailOption = {
      from: process.env.email,
      to: email,
      subject: "For Reset Password",
      html:
        "<p>hi " +
        name +
        ' ,please click here to<a href="http://localhost:3000/resetPassword?token=' +
        token +
        '">Reset</a> your password </p>',
    };
    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("email has been send to:", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//reset password get
const resetPassword = async (req, res) => {
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
  }
};

//reset password post
const resetpassVerify = async (req, res) => {
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
  }
};

//forget password get

const forgetLoad = async (req, res) => {
  try {
    res.render("forgetPassword");
  } catch (error) {
    console.log(error.message);
  }
};

//forget post
const forgetSendEmail = async (req, res) => {
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
    req.session.destroy();
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

// myAcco get route
const myAcco = async (req, res) => {
  try {
    const loadlogIn = req.session.user_id;
    const userAddress = await user_address.findOne({
      user: req.session.user_id,
    });
    const userData = await User.findOne({ _id: req.session.user_id });
    const orders = await order.find({ user: req.session.user_id });

    res.render("myacco", {
      loadlogIn,
      user: userData.name,
      userData: userData,
      userAddress: userAddress,
      orders: orders,
    });
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

const error404 = async (req, res) => {
  try {
    res.render("404");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  loadShoping,
  loadHome,
  loadAbout,
  loadContact,
  loadLogin,
  loadWish,
  // loadConfirmation,
  productDetails,
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
  error404,
};
