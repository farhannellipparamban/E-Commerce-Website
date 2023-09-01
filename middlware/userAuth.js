const User =require("../models/userModels")

// user login auth
const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      const userData = await User.findOne({_id:req.session.user_id})
      if (userData && !userData.is_blocked) {
        
        next();
      }else{
        res.render("login",{info:"Your Account Is Blocked!!.. Use Another Account "});
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// user logout auth
const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.redirect("/");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
};
